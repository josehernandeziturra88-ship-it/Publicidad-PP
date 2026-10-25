import {FinanceError, SALES_START, validateFinance, validMonth, validId, todayChile, convertedQuantity, UNITS} from './finance-domain.mjs';
import {buildWallet} from './wallet-domain.mjs';
import {readInvoice} from './invoice-reader.mjs';

export const MAX_RECEIPT_BYTES = 1500000;
const MAX_RECEIPT_STORAGE = 100000000;
// Enforce account links inside the same database write, including the window
// between HTTP validation and a concurrent edit/deletion in another session.
const invalidAccount=`EXISTS(SELECT 1 FROM (
 SELECT json_extract(NEW.document,'$.accountId') AS ref WHERE NEW.kind='expense'
 UNION ALL SELECT json_extract(NEW.document,'$.toAccountId') WHERE NEW.kind='movement'
 UNION ALL SELECT json_extract(NEW.document,'$.fromAccountId') WHERE NEW.kind='movement'
 UNION ALL SELECT value FROM json_each(NEW.document,'$.accounts') WHERE NEW.kind='sale'
) r WHERE r.ref IS NOT NULL AND r.ref<>'' AND NOT EXISTS(SELECT 1 FROM finance_records a WHERE a.kind='account' AND a.id=r.ref AND a.deleted=0 AND json_extract(a.document,'$.openingDate')<=NEW.record_date AND (NEW.kind<>'sale' OR json_extract(a.document,'$.type')<>'credit')))`;
const schema = [
 `CREATE TABLE IF NOT EXISTS finance_records (kind TEXT NOT NULL, id TEXT NOT NULL, record_date TEXT NOT NULL, document TEXT NOT NULL, revision INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, mutation_id TEXT NOT NULL, PRIMARY KEY(kind,id))`,
 `CREATE INDEX IF NOT EXISTS finance_records_month ON finance_records(kind,deleted,record_date)`,
 `CREATE UNIQUE INDEX IF NOT EXISTS finance_receipt_once ON finance_records(json_extract(document,'$.receiptId')) WHERE kind='expense' AND deleted=0 AND json_extract(document,'$.receiptId')<>''`,
 `CREATE UNIQUE INDEX IF NOT EXISTS finance_invoice_once ON finance_records(lower(trim(json_extract(document,'$.supplier'))),lower(trim(json_extract(document,'$.number')))) WHERE kind='expense' AND deleted=0 AND json_extract(document,'$.number')<>''`,
 `CREATE TABLE IF NOT EXISTS finance_history (kind TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL, document TEXT NOT NULL, deleted INTEGER NOT NULL, changed_at TEXT NOT NULL, PRIMARY KEY(kind,id,revision))`,
 `CREATE TABLE IF NOT EXISTS finance_receipts (id TEXT PRIMARY KEY, mime TEXT NOT NULL, name TEXT NOT NULL, bytes BLOB NOT NULL, size INTEGER NOT NULL CHECK(size>0 AND size<=1500000), sha256 TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS finance_imports (source_key TEXT PRIMARY KEY, kind TEXT NOT NULL, id TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS finance_ocr (receipt_id TEXT PRIMARY KEY, document TEXT NOT NULL, created_at TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS finance_ai_usage (day TEXT PRIMARY KEY, count INTEGER NOT NULL)`,
 ...['INSERT','UPDATE'].map(event=>`CREATE TRIGGER IF NOT EXISTS finance_account_ref_${event.toLowerCase()} BEFORE ${event} ON finance_records WHEN NEW.deleted=0 AND NEW.kind IN ('expense','movement','sale') BEGIN SELECT CASE WHEN ${invalidAccount} THEN RAISE(ABORT,'FINANCE_ACCOUNT_REFERENCE') END; END`),
 `CREATE TRIGGER IF NOT EXISTS finance_account_protect BEFORE UPDATE ON finance_records WHEN OLD.kind='account' AND (NEW.deleted=1 OR json_extract(NEW.document,'$.type')<>json_extract(OLD.document,'$.type') OR json_extract(NEW.document,'$.openingDate')<>json_extract(OLD.document,'$.openingDate')) BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM finance_records r WHERE r.deleted=0 AND ((r.kind='expense' AND json_extract(r.document,'$.accountId')=OLD.id) OR (r.kind='movement' AND (json_extract(r.document,'$.fromAccountId')=OLD.id OR json_extract(r.document,'$.toAccountId')=OLD.id)) OR (r.kind='sale' AND EXISTS(SELECT 1 FROM json_each(r.document,'$.accounts') WHERE value=OLD.id)))) THEN RAISE(ABORT,'FINANCE_ACCOUNT_IN_USE') END; END`
];
const initializations = new WeakMap();
async function init(db) {
 if (!initializations.has(db)) initializations.set(db, db.batch(schema.map(sql => db.prepare(sql))).catch(e => { initializations.delete(db); throw e; }));
 await initializations.get(db);
}
const unpack = row => ({...JSON.parse(row.document), id: row.id, revision: row.revision, createdAt: row.created_at, updatedAt: row.updated_at});
const uuid = value => validId(value);
const parseRows = rows => rows.results.map(unpack);
async function readJSON(request, readLimited) {
 if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new FinanceError('Se esperaba contenido JSON.', 415);
 try { const value=JSON.parse(new TextDecoder().decode(await readLimited(request, 100000)));if(!value||typeof value!=='object'||Array.isArray(value))throw new FinanceError('Se esperaba un registro válido.');return value; }
 catch (e) { if (e.status) throw e; throw new FinanceError('El registro no tiene un formato válido.'); }
}
async function active(db, kind, id) { return db.prepare('SELECT * FROM finance_records WHERE kind=? AND id=? AND deleted=0').bind(kind,id).first(); }
async function validateReferences(db, kind, doc, id) {
 const checkIngredients=async items=>{
  const ids=[...new Set(items.map(p=>p.ingredientId).filter(Boolean))];if(!ids.length)return;
  const rows=await db.prepare(`SELECT id,document FROM finance_records WHERE kind='ingredient' AND deleted=0 AND id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all(),byId=new Map(rows.results.map(r=>[r.id,JSON.parse(r.document)]));
  for(const p of items)if(p.ingredientId&&!convertedQuantity(p.quantity,p.unit,byId.get(p.ingredientId)?.unit))throw new FinanceError('Revisa los insumos y las unidades vinculados a la compra o receta.');
 };
 const checkAccount=async(accountId,date,{allowCredit=true}={})=>{
  if(!accountId)return;
  const row=await active(db,'account',accountId);if(!row)throw new FinanceError('La cuenta seleccionada no está disponible.');
  const a=JSON.parse(row.document);if(date<a.openingDate)throw new FinanceError('La fecha del movimiento es anterior al saldo inicial de la cuenta.');
  if(!allowCredit&&a.type==='credit')throw new FinanceError('Asigna las ventas a una cuenta bancaria o efectivo, no a una tarjeta de crédito propia.');
 };
 if(kind==='sale')for(const key of ['cash','card','transfer','other'])await checkAccount(doc.accounts[key],doc.date,{allowCredit:false});
 if(kind==='movement'){await checkAccount(doc.toAccountId,doc.date);if(doc.type==='transfer')await checkAccount(doc.fromAccountId,doc.date);}
 if(kind==='account'){
  const previous=await active(db,kind,id);
  if(previous){const old=JSON.parse(previous.document);if(old.type!==doc.type||old.openingDate!==doc.openingDate){
   if(await accountUsed(db,id))throw new FinanceError('Esta cuenta ya tiene movimientos. Conserva su tipo y fecha inicial; crea otra cuenta si necesitas una estructura diferente.',409);
  }}
 }
 if (kind === 'expense') {
  await checkAccount(doc.accountId,doc.date);
  if (doc.receiptId && !await db.prepare('SELECT id FROM finance_receipts WHERE id=?').bind(doc.receiptId).first()) throw new FinanceError('El comprobante no está disponible. Vuelve a adjuntarlo.');
  // The same uploaded receipt or supplier/invoice number must not count twice.
  const duplicate = await db.prepare(`SELECT id FROM finance_records WHERE kind='expense' AND deleted=0 AND id<>? AND ((?<>'' AND json_extract(document,'$.receiptId')=?) OR (?<>'' AND lower(trim(json_extract(document,'$.supplier')))=lower(trim(?)) AND lower(trim(json_extract(document,'$.number')))=lower(trim(?)))) LIMIT 1`).bind(id, doc.receiptId, doc.receiptId, doc.number, doc.supplier, doc.number).first();
  if (duplicate) throw new FinanceError('Ese comprobante ya está asociado a otro gasto. Revisa el historial antes de registrarlo nuevamente.', 409);
  await checkIngredients(doc.lines);
 }
 if (kind === 'recipe') await checkIngredients(doc.parts);
 if (kind === 'ingredient') {
  const previous = await active(db, kind, id);
  if (previous && UNITS[JSON.parse(previous.document).unit].family !== UNITS[doc.unit].family) throw new FinanceError('Para cambiar entre peso, volumen o unidades, crea un insumo nuevo.');
 }
}
async function accountUsed(db,id){return db.prepare(`SELECT 1 AS found FROM finance_records WHERE deleted=0 AND ((kind='expense' AND json_extract(document,'$.accountId')=?) OR (kind='movement' AND (json_extract(document,'$.fromAccountId')=? OR json_extract(document,'$.toAccountId')=?)) OR (kind='sale' AND EXISTS(SELECT 1 FROM json_each(document,'$.accounts') WHERE value=?))) LIMIT 1`).bind(id,id,id,id).first();}
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
export async function financeRequest(request, db, {json, readLimited, imageMime,env=undefined}) {
 await init(db);
 const url = new URL(request.url), suffix = url.pathname.slice('/admin/api/finance'.length), method = request.method;
 if (suffix === '/snapshot' && method === 'GET') {
  const month = validMonth(url.searchParams.get('month'));
  const [sales, expenses, ingredients, recipes, purchases, storage, accounts] = await Promise.all([
   db.prepare("SELECT * FROM finance_records WHERE kind='sale' AND deleted=0 AND record_date LIKE ? ORDER BY record_date DESC").bind(month+'-%').all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='expense' AND deleted=0 AND record_date LIKE ? ORDER BY record_date DESC, created_at DESC").bind(month+'-%').all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='ingredient' AND deleted=0 ORDER BY json_extract(document,'$.name') COLLATE NOCASE").all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='recipe' AND deleted=0 ORDER BY json_extract(document,'$.name') COLLATE NOCASE").all(),
   db.prepare(`SELECT id,record_date,line,rank FROM (SELECT f.id,COALESCE(json_extract(f.document,'$.invoiceDate'),f.record_date) AS record_date,j.value AS line,DENSE_RANK() OVER (PARTITION BY json_extract(j.value,'$.ingredientId') ORDER BY COALESCE(json_extract(f.document,'$.invoiceDate'),f.record_date) DESC,f.updated_at DESC,f.id DESC) AS rank FROM finance_records f, json_each(f.document,'$.lines') j WHERE f.kind='expense' AND f.deleted=0 AND json_extract(j.value,'$.ingredientId')<>'' AND COALESCE(json_extract(j.value,'$.businessQuantity'),CASE WHEN json_extract(f.document,'$.scope')='personal' THEN 0 ELSE json_extract(j.value,'$.quantity') END)>0) WHERE rank<=20 ORDER BY rank`).all(),
   db.prepare('SELECT COUNT(*) AS count,COALESCE(SUM(size),0) AS bytes FROM finance_receipts').first(),
   db.prepare("SELECT * FROM finance_records WHERE kind='account' AND deleted=0 ORDER BY created_at").all()
  ]);
  const material = parseRows(ingredients), costs = {}, purchaseTotals = {},priceHistory={};
  for (const row of purchases.results) {
   const line = JSON.parse(row.line), ingredient = material.find(i => i.id === line.ingredientId);
   if (!ingredient) continue;
   const businessQuantity=line.businessQuantity??line.quantity,quantity = convertedQuantity(businessQuantity, line.unit, ingredient.unit);
   if (quantity) {
    const total = purchaseTotals[ingredient.id+':'+row.id] ??= {amount:0,quantity:0,id:ingredient.id,expenseId:row.id,date:row.record_date,rank:row.rank};total.amount+=line.amount*businessQuantity/line.quantity;total.quantity+=quantity;
   }
  }
  for(const p of Object.values(purchaseTotals)){const point={unitCost:p.amount/p.quantity,expenseId:p.expenseId,date:p.date};(priceHistory[p.id]??=[]).push(point);if(p.rank===1)costs[p.id]=point;}
  return json({startDate: SALES_START, today: todayChile(), month, sales: parseRows(sales), expenses: parseRows(expenses), ingredients: material, recipes: parseRows(recipes), costs,priceHistory,accounts:parseRows(accounts), storage: {...storage, maxBytes: MAX_RECEIPT_STORAGE}, ocrAvailable:Boolean(env?.AI?.run)});
 }
 if(suffix==='/wallet'&&method==='GET'){
  const month=validMonth(url.searchParams.get('month')),today=todayChile();
  const [accounts,records]=await Promise.all([db.prepare("SELECT * FROM finance_records WHERE kind='account' AND deleted=0 ORDER BY created_at").all(),db.prepare("SELECT * FROM finance_records WHERE kind IN ('sale','expense','movement') AND deleted=0 AND record_date<=? ORDER BY record_date,id").bind(today).all()]);
  const rows=records.results,kind=k=>rows.filter(r=>r.kind===k).map(unpack),sales=kind('sale'),expenses=kind('expense'),movements=kind('movement');
  return json({...buildWallet({accounts:parseRows(accounts),sales,expenses,movements},month,today),today,movements:movements.filter(m=>m.date.startsWith(month)),startDate:SALES_START});
 }
 if(suffix==='/import'&&method==='POST'){
  const payload=await readJSON(request,readLimited),id=uuid(payload.accountId),account=await active(db,'account',id);if(!account)throw new FinanceError('Selecciona una cuenta disponible.');
  const a=JSON.parse(account.document);if(!Array.isArray(payload.rows)||!payload.rows.length||payload.rows.length>10)throw new FinanceError('Importa entre 1 y 10 filas por lote.');
  const plans=[];
  for(const row of payload.rows){
   if(!row||!['income','expense'].includes(row.type)||typeof row.sourceKey!=='string'||!row.sourceKey.trim()||row.sourceKey.length>400)throw new FinanceError('Revisa las filas de importación.');
   const kind=row.type==='income'?'movement':'expense',document=kind==='movement'?validateFinance(kind,{type:'income',date:row.date,scope:row.scope,description:row.description,amount:row.amount,toAccountId:id,notes:'Importado desde CSV'}):validateFinance(kind,{date:row.date,supplier:row.description,category:row.category,total:row.amount,scope:row.scope,accountId:id,lines:[],notes:'Importado desde CSV'});
   if(document.date<a.openingDate)throw new FinanceError('Una fila es anterior al saldo inicial de la cuenta.');
   plans.push({kind,document,sourceKey:await digest(id+'|'+row.sourceKey),id:crypto.randomUUID(),mutation:crypto.randomUUID()});
  }
  const now=new Date().toISOString(),statements=[];
  for(const p of plans){
   statements.push(db.prepare('INSERT OR IGNORE INTO finance_imports(source_key,kind,id) VALUES(?,?,?)').bind(p.sourceKey,p.kind,p.id));
   statements.push(db.prepare('INSERT INTO finance_records(kind,id,record_date,document,revision,deleted,created_at,updated_at,mutation_id) SELECT ?,?,?,?,1,0,?,?,? FROM finance_imports WHERE source_key=? AND id=? RETURNING id').bind(p.kind,p.id,p.document.date,JSON.stringify(p.document),now,now,p.mutation,p.sourceKey,p.id));
   statements.push(db.prepare('INSERT INTO finance_history(kind,id,revision,document,deleted,changed_at) SELECT kind,id,revision,document,deleted,updated_at FROM finance_records WHERE kind=? AND id=? AND mutation_id=?').bind(p.kind,p.id,p.mutation));
  }
  let results;try{results=await db.batch(statements);}catch(e){if(/FINANCE_ACCOUNT_/.test(String(e.message)))throw new FinanceError('La cuenta cambió durante la importación. Actualiza los datos y revisa su fecha inicial antes de reintentar.',409);throw e;}
  const created=plans.reduce((sum,_,i)=>sum+(results[i*3+1].results?.length??0),0);return json({created,skipped:plans.length-created});
 }
 if(suffix==='/ocr'&&method==='POST'){
  const payload=await readJSON(request,readLimited);return json(await readInvoice(db,env,uuid(payload.receiptId)));
 }
 if (suffix === '/export' && method === 'GET') {
  const [records, history, receipts,imports] = await Promise.all([db.prepare('SELECT * FROM finance_records ORDER BY kind,record_date,id').all(), db.prepare('SELECT * FROM finance_history ORDER BY changed_at,kind,id,revision').all(), db.prepare('SELECT id,name,mime,size,sha256,created_at FROM finance_receipts ORDER BY created_at').all(),db.prepare('SELECT source_key,kind,id FROM finance_imports').all()]);
  return json({format: 'playero-finance-v2', exportedAt: new Date().toISOString(), startDate: SALES_START, records: records.results.map(r => ({...unpack(r),kind:r.kind,deleted:Boolean(r.deleted)})), history: history.results.map(r => ({...r,document:JSON.parse(r.document)})), receipts: receipts.results, imports:imports.results,notice: 'Esta copia contiene datos e historial, pero no las fotos o PDF. Descarga los comprobantes desde cada gasto y conserva un respaldo de D1.'},200,{'Content-Disposition':'attachment; filename="playero-finanzas.json"'});
 }
 if (suffix === '/receipts' && method === 'POST') {
  const bytes = await readLimited(request, MAX_RECEIPT_BYTES);
  let mime = imageMime(bytes);
  if (!mime && new TextDecoder().decode(bytes.slice(0,5)) === '%PDF-') mime = 'application/pdf';
  if (!mime || mime !== request.headers.get('Content-Type')?.split(';')[0]) throw new FinanceError('Sube un comprobante JPG, PNG, WebP, GIF o PDF válido.', 415);
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');
  const found = await db.prepare('SELECT id,name,mime,size FROM finance_receipts WHERE sha256=?').bind(sha256).first();
  if (found) return json(found);
  const id = crypto.randomUUID(), extension = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','application/pdf':'pdf'}[mime], name = `comprobante-${id}.${extension}`;
  const saved = await db.prepare('INSERT OR IGNORE INTO finance_receipts(id,mime,name,bytes,size,sha256,created_at) SELECT ?,?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(size),0) FROM finance_receipts)+?<=?').bind(id,mime,name,bytes,bytes.length,sha256,new Date().toISOString(),bytes.length,MAX_RECEIPT_STORAGE).run();
  if (!saved.meta.changes) {
   const duplicate = await db.prepare('SELECT id,name,mime,size FROM finance_receipts WHERE sha256=?').bind(sha256).first();
   if (duplicate) return json(duplicate);
   throw new FinanceError('El archivo de comprobantes llegó a 100 MB. Conserva tus respaldos y solicita ampliar el almacenamiento.', 409);
  }
  return json({id,name,mime,size:bytes.length},201);
 }
 const receipt = suffix.match(/^\/receipts\/([0-9a-f-]+)$/i);
 if (receipt && ['GET','HEAD'].includes(method)) {
  const row = await db.prepare('SELECT bytes,mime,name,size FROM finance_receipts WHERE id=?').bind(uuid(receipt[1])).first();
  if (!row) throw new FinanceError('Comprobante no encontrado.',404);
  const bytes = Array.isArray(row.bytes) ? Uint8Array.from(row.bytes) : row.bytes instanceof ArrayBuffer ? new Uint8Array(row.bytes) : new Uint8Array(row.bytes.buffer,row.bytes.byteOffset,row.bytes.byteLength);
  return new Response(method === 'HEAD' ? null : bytes, {headers:{'Content-Type':row.mime,'Content-Length':String(bytes.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; sandbox",'Content-Disposition':`${url.searchParams.has('download') || row.mime === 'application/pdf' ? 'attachment' : 'inline'}; filename="${row.name}"`}});
 }
 const record = suffix.match(/^\/(sale|expense|ingredient|recipe|account|movement)\/([^/]+)$/);
 if(record&&method==='GET'){const row=await active(db,record[1],record[2]);if(!row)throw new FinanceError('Registro no encontrado.',404);return json(unpack(row));}
 if (record && ['PUT','DELETE'].includes(method)) {
  const [,kind,id] = record;
  if (kind === 'sale') { if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) throw new FinanceError('Fecha inválida.'); } else uuid(id);
  const payload = await readJSON(request, readLimited), revision = payload.revision;
  if (!Number.isSafeInteger(revision) || revision < 0) throw new FinanceError('Versión inválida.');
  let doc;
  if (method === 'DELETE') {
   if(kind==='sale')throw new FinanceError('Corrige el cierre del día. Si no hubo ventas, guarda los importes en cero.');
   const row = await active(db,kind,id);
   if (!row) throw new FinanceError('Registro no encontrado.',404);
   doc = JSON.parse(row.document);
   if(kind==='account'&&await accountUsed(db,id))throw new FinanceError('Esta cuenta tiene movimientos vinculados. Conserva el registro para mantener sus saldos.',409);
   if (kind === 'ingredient') {
    const used = await db.prepare(`SELECT 1 AS found FROM finance_records f,json_each(f.document,CASE f.kind WHEN 'recipe' THEN '$.parts' ELSE '$.lines' END) j WHERE f.kind IN ('expense','recipe') AND f.deleted=0 AND json_extract(j.value,'$.ingredientId')=? LIMIT 1`).bind(id).first();
    if (used) throw new FinanceError('Este insumo está vinculado a compras o recetas. Conserva el registro para mantener sus costos.',409);
   }
  } else {
   doc = validateFinance(kind,payload.document);
   if (kind === 'sale' && doc.date !== id) throw new FinanceError('La fecha del cierre no coincide.');
   await validateReferences(db,kind,doc,id);
  }
  const now = new Date().toISOString(), mutation = crypto.randomUUID(), encoded = JSON.stringify(doc), date = doc.date ?? doc.openingDate ?? '', deleted = method === 'DELETE' ? 1 : 0;
  let results;
  try{results = await db.batch([
   db.prepare(`INSERT INTO finance_records(kind,id,record_date,document,revision,deleted,created_at,updated_at,mutation_id) SELECT ?,?,?,?,1,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM finance_records WHERE kind=? AND id=?) ON CONFLICT(kind,id) DO UPDATE SET record_date=excluded.record_date,document=excluded.document,revision=finance_records.revision+1,deleted=excluded.deleted,updated_at=excluded.updated_at,mutation_id=excluded.mutation_id WHERE finance_records.revision=? AND finance_records.deleted=0 RETURNING *`).bind(kind,id,date,encoded,deleted,now,now,mutation,revision,kind,id,revision),
   db.prepare('INSERT INTO finance_history(kind,id,revision,document,deleted,changed_at) SELECT kind,id,revision,document,deleted,updated_at FROM finance_records WHERE kind=? AND id=? AND mutation_id=?').bind(kind,id,mutation)
  ]);}catch(e){if(/FINANCE_ACCOUNT_/.test(String(e.message)))throw new FinanceError('La cuenta cambió o tiene movimientos vinculados. Actualiza los datos y revisa el registro.',409);if(/UNIQUE constraint failed/i.test(String(e.message)))throw new FinanceError('Ese comprobante ya está registrado. Revisa el historial de gastos.',409);throw e;}
  const row = results[0].results?.[0];
  if (!row) throw new FinanceError('Este registro cambió en otra sesión o ya existe. Recarga los datos y revísalo antes de volver a guardar.',409);
  return json({...unpack(row),deleted:Boolean(row.deleted)},revision === 0 ? 201 : 200);
 }
 throw new FinanceError('Acción no encontrada.',404);
}

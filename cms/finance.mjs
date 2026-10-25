import {FinanceError, SALES_START, validateFinance, validMonth, validId, todayChile, convertedQuantity, UNITS} from './finance-domain.mjs';

export const MAX_RECEIPT_BYTES = 1500000;
const MAX_RECEIPT_STORAGE = 100000000;
const schema = [
 `CREATE TABLE IF NOT EXISTS finance_records (kind TEXT NOT NULL, id TEXT NOT NULL, record_date TEXT NOT NULL, document TEXT NOT NULL, revision INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, mutation_id TEXT NOT NULL, PRIMARY KEY(kind,id))`,
 `CREATE INDEX IF NOT EXISTS finance_records_month ON finance_records(kind,deleted,record_date)`,
 `CREATE UNIQUE INDEX IF NOT EXISTS finance_receipt_once ON finance_records(json_extract(document,'$.receiptId')) WHERE kind='expense' AND deleted=0 AND json_extract(document,'$.receiptId')<>''`,
 `CREATE UNIQUE INDEX IF NOT EXISTS finance_invoice_once ON finance_records(lower(trim(json_extract(document,'$.supplier'))),lower(trim(json_extract(document,'$.number')))) WHERE kind='expense' AND deleted=0 AND json_extract(document,'$.number')<>''`,
 `CREATE TABLE IF NOT EXISTS finance_history (kind TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL, document TEXT NOT NULL, deleted INTEGER NOT NULL, changed_at TEXT NOT NULL, PRIMARY KEY(kind,id,revision))`,
 `CREATE TABLE IF NOT EXISTS finance_receipts (id TEXT PRIMARY KEY, mime TEXT NOT NULL, name TEXT NOT NULL, bytes BLOB NOT NULL, size INTEGER NOT NULL CHECK(size>0 AND size<=1500000), sha256 TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)`
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
 try { return JSON.parse(new TextDecoder().decode(await readLimited(request, 100000))); }
 catch (e) { if (e.status) throw e; throw new FinanceError('El registro no tiene un formato válido.'); }
}
async function active(db, kind, id) { return db.prepare('SELECT * FROM finance_records WHERE kind=? AND id=? AND deleted=0').bind(kind,id).first(); }
async function validateReferences(db, kind, doc, id) {
 if (kind === 'expense') {
  if (doc.receiptId && !await db.prepare('SELECT id FROM finance_receipts WHERE id=?').bind(doc.receiptId).first()) throw new FinanceError('El comprobante no está disponible. Vuelve a adjuntarlo.');
  // The same uploaded receipt or supplier/invoice number must not count twice.
  const duplicate = await db.prepare(`SELECT id FROM finance_records WHERE kind='expense' AND deleted=0 AND id<>? AND ((?<>'' AND json_extract(document,'$.receiptId')=?) OR (?<>'' AND lower(trim(json_extract(document,'$.supplier')))=lower(trim(?)) AND lower(trim(json_extract(document,'$.number')))=lower(trim(?)))) LIMIT 1`).bind(id, doc.receiptId, doc.receiptId, doc.number, doc.supplier, doc.number).first();
  if (duplicate) throw new FinanceError('Ese comprobante ya está asociado a otro gasto. Revisa el historial antes de registrarlo nuevamente.', 409);
  for (const line of doc.lines) if (line.ingredientId) {
   const row = await active(db, 'ingredient', line.ingredientId);
   if (!row || !convertedQuantity(line.quantity, line.unit, JSON.parse(row.document).unit)) throw new FinanceError('Revisa el insumo y la unidad vinculados a cada línea de compra.');
  }
 }
 if (kind === 'recipe') for (const part of doc.parts) {
  const row = await active(db, 'ingredient', part.ingredientId);
  if (!row || !convertedQuantity(part.quantity, part.unit, JSON.parse(row.document).unit)) throw new FinanceError('Revisa los insumos y las unidades de la receta.');
 }
 if (kind === 'ingredient') {
  const previous = await active(db, kind, id);
  if (previous && UNITS[JSON.parse(previous.document).unit].family !== UNITS[doc.unit].family) throw new FinanceError('Para cambiar entre peso, volumen o unidades, crea un insumo nuevo.');
 }
}
export async function financeRequest(request, db, {json, readLimited, imageMime}) {
 await init(db);
 const url = new URL(request.url), suffix = url.pathname.slice('/admin/api/finance'.length), method = request.method;
 if (suffix === '/snapshot' && method === 'GET') {
  const month = validMonth(url.searchParams.get('month'));
  const [sales, expenses, ingredients, recipes, purchases, storage] = await Promise.all([
   db.prepare("SELECT * FROM finance_records WHERE kind='sale' AND deleted=0 AND record_date LIKE ? ORDER BY record_date DESC").bind(month+'-%').all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='expense' AND deleted=0 AND record_date LIKE ? ORDER BY record_date DESC, created_at DESC").bind(month+'-%').all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='ingredient' AND deleted=0 ORDER BY json_extract(document,'$.name') COLLATE NOCASE").all(),
   db.prepare("SELECT * FROM finance_records WHERE kind='recipe' AND deleted=0 ORDER BY json_extract(document,'$.name') COLLATE NOCASE").all(),
   db.prepare(`SELECT id,record_date,line FROM (SELECT f.id,f.record_date,j.value AS line,DENSE_RANK() OVER (PARTITION BY json_extract(j.value,'$.ingredientId') ORDER BY f.record_date DESC,f.updated_at DESC,f.id DESC) AS rank FROM finance_records f, json_each(f.document,'$.lines') j WHERE f.kind='expense' AND f.deleted=0 AND json_extract(j.value,'$.ingredientId')<>'') WHERE rank=1`).all(),
   db.prepare('SELECT COUNT(*) AS count,COALESCE(SUM(size),0) AS bytes FROM finance_receipts').first()
  ]);
  const material = parseRows(ingredients), costs = {}, purchaseTotals = {};
  for (const row of purchases.results) {
   const line = JSON.parse(row.line), ingredient = material.find(i => i.id === line.ingredientId);
   if (!ingredient) continue;
   const quantity = convertedQuantity(line.quantity, line.unit, ingredient.unit);
   if (quantity) {
    const total = purchaseTotals[ingredient.id] ??= {amount:0,quantity:0};total.amount+=line.amount;total.quantity+=quantity;
    costs[ingredient.id] = {unitCost: total.amount / total.quantity, expenseId: row.id, date: row.record_date};
   }
  }
  return json({startDate: SALES_START, today: todayChile(), month, sales: parseRows(sales), expenses: parseRows(expenses), ingredients: material, recipes: parseRows(recipes), costs, storage: {...storage, maxBytes: MAX_RECEIPT_STORAGE}, manualReceipts: true});
 }
 if (suffix === '/export' && method === 'GET') {
  const [records, history, receipts] = await Promise.all([db.prepare('SELECT * FROM finance_records ORDER BY kind,record_date,id').all(), db.prepare('SELECT * FROM finance_history ORDER BY changed_at,kind,id,revision').all(), db.prepare('SELECT id,name,mime,size,sha256,created_at FROM finance_receipts ORDER BY created_at').all()]);
  return json({format: 'playero-finance-v1', exportedAt: new Date().toISOString(), startDate: SALES_START, records: records.results.map(r => ({...unpack(r),kind:r.kind,deleted:Boolean(r.deleted)})), history: history.results.map(r => ({...r,document:JSON.parse(r.document)})), receipts: receipts.results, notice: 'Esta copia contiene datos e historial, pero no las fotos o PDF. Descarga los comprobantes desde cada gasto y conserva un respaldo de D1.'},200,{'Content-Disposition':'attachment; filename="playero-finanzas.json"'});
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
 const record = suffix.match(/^\/(sale|expense|ingredient|recipe)\/([^/]+)$/);
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
   if (kind === 'ingredient') {
    const used = await db.prepare(`SELECT 1 AS found FROM finance_records f,json_each(f.document,CASE f.kind WHEN 'recipe' THEN '$.parts' ELSE '$.lines' END) j WHERE f.kind IN ('expense','recipe') AND f.deleted=0 AND json_extract(j.value,'$.ingredientId')=? LIMIT 1`).bind(id).first();
    if (used) throw new FinanceError('Este insumo está vinculado a compras o recetas. Conserva el registro para mantener sus costos.',409);
   }
  } else {
   doc = validateFinance(kind,payload.document);
   if (kind === 'sale' && doc.date !== id) throw new FinanceError('La fecha del cierre no coincide.');
   await validateReferences(db,kind,doc,id);
  }
  const now = new Date().toISOString(), mutation = crypto.randomUUID(), encoded = JSON.stringify(doc), date = doc.date ?? '', deleted = method === 'DELETE' ? 1 : 0;
  let results;
  try{results = await db.batch([
   db.prepare(`INSERT INTO finance_records(kind,id,record_date,document,revision,deleted,created_at,updated_at,mutation_id) SELECT ?,?,?,?,1,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM finance_records WHERE kind=? AND id=?) ON CONFLICT(kind,id) DO UPDATE SET record_date=excluded.record_date,document=excluded.document,revision=finance_records.revision+1,deleted=excluded.deleted,updated_at=excluded.updated_at,mutation_id=excluded.mutation_id WHERE finance_records.revision=? AND finance_records.deleted=0 RETURNING *`).bind(kind,id,date,encoded,deleted,now,now,mutation,revision,kind,id,revision),
   db.prepare('INSERT INTO finance_history(kind,id,revision,document,deleted,changed_at) SELECT kind,id,revision,document,deleted,updated_at FROM finance_records WHERE kind=? AND id=? AND mutation_id=?').bind(kind,id,mutation)
  ]);}catch(e){if(/UNIQUE constraint failed/i.test(String(e.message)))throw new FinanceError('Ese comprobante ya está registrado. Revisa el historial de gastos.',409);throw e;}
  const row = results[0].results?.[0];
  if (!row) throw new FinanceError('Este registro cambió en otra sesión o ya existe. Recarga los datos y revísalo antes de volver a guardar.',409);
  return json({...unpack(row),deleted:Boolean(row.deleted)},revision === 0 ? 201 : 200);
 }
 throw new FinanceError('Acción no encontrada.',404);
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorker} from '../cms/worker.mjs';
import {LocalD1} from '../scripts/d1-local.mjs';
import {testIdentity} from '../scripts/test-identity.mjs';
import {expenseSplit,distributeLineTotal,summarizeMonth,validateFinance} from '../cms/finance-domain.mjs';
import {paymentDate,parseStatement} from '../cms/wallet-domain.mjs';
import {INVOICE_MODEL,invoiceDraft} from '../cms/invoice-reader.mjs';

const origin='https://gestion.elpolloplayero.cl';
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64'));
async function fixture(t,extra={}){
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-05T16:00:00Z')});const identity=await testIdentity(),db=new LocalD1(),worker=createWorker({loadKeys:identity.loadKeys}),env={...identity.env,DB:db,...extra},token=await identity.token();t.after(()=>db.close());
 async function call(path,{method='GET',body,anonymous=false,headers={}}={}){const h=new Headers(headers);if(!anonymous)h.set('Cf-Access-Jwt-Assertion',token);if(!['GET','HEAD'].includes(method)&&!h.has('Origin'))h.set('Origin',origin);if(body!==undefined&&!(body instanceof Uint8Array)){h.set('Content-Type','application/json');body=JSON.stringify(body);}return worker.fetch(new Request(origin+'/admin/api/finance'+path,{method,headers:h,body}),env);}
 const put=(kind,id,document,revision=0)=>call('/'+kind+'/'+id,{method:'PUT',body:{revision,document}});
 async function save(kind,document){const id=crypto.randomUUID(),res=await put(kind,id,document);assert.equal(res.status,201,await res.clone().text());return res.json();}
 const account=(overrides={})=>save('account',{name:'Cuenta local',bank:'Banco de prueba',last4:'1234',scope:'business',type:'bank',openingDate:'2026-10-25',openingBalance:1000000,...overrides});
 const expense=(overrides={})=>({date:'2026-10-25',supplier:'Ariztía',category:'Ingredientes',number:'',total:70000,scope:'business',accountId:'',lines:[],...overrides});
 const get=async path=>{const res=await call(path);assert.equal(res.status,200,await res.clone().text());return res.json();};
 const snapshot=(month='2026-10')=>get('/snapshot?month='+month),wallet=(month='2026-10')=>get('/wallet?month='+month);
 const upload=async(bytes=png,mime='image/png')=>{const r=await call('/receipts',{method:'POST',headers:{'Content-Type':mime},body:bytes});assert.equal(r.status,201,await r.clone().text());return r.json();};
 return {db,env,call,put,save,account,expense,snapshot,wallet,upload};
}
test('El seguimiento acepta ventas desde hoy (25 de octubre) y conserva los cierres anteriores del módulo',async t=>{
 const f=await fixture(t),doc={date:'2026-10-25',cash:0,card:0,transfer:0,other:0};assert.equal((await f.put('sale',doc.date,doc)).status,201);assert.equal((await f.put('sale','2026-10-24',{...doc,date:'2026-10-24'})).status,400);
 const s=await f.snapshot(),total=summarizeMonth('2026-10',s.sales,[],s.today);assert.equal(s.startDate,'2026-10-25');assert.equal(total.recorded,1);assert.equal(total.missing,6);assert.equal(total.days[23].status,'before');
});
test('La cuenta guarda una imagen privada opcional, rechaza PDF/referencias inexistentes y permite quitarla sin cambiar saldos',async t=>{
 const f=await fixture(t),image=await f.upload(),a=await f.account({imageId:image.id,imageFit:'contain',imageScale:1.25,imageX:70,imageY:40,imageRotation:90});let w=await f.wallet();assert.equal(w.accounts[0].imageId,image.id);assert.equal(w.accounts[0].balance,1000000);assert.equal(w.accounts[0].imageScale,1.25);assert.equal(w.accounts[0].imageX,70);assert.equal(w.accounts[0].imageY,40);assert.equal(w.accounts[0].imageRotation,90);assert.equal(w.accounts[0].imageFit,'contain');for(const invalid of [{imageRotation:45},{imageScale:.5},{imageScale:3.01},{imageX:-1},{imageY:101},{imageFit:'stretch'}])assert.equal((await f.put('account',a.id,{...a,...invalid},1)).status,400);
 assert.equal((await f.call('/receipts/'+image.id,{anonymous:true})).status,401);const response=await f.call('/receipts/'+image.id);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),png);
 const pdf=await f.upload(new TextEncoder().encode('%PDF-1.4\n%%EOF'),'application/pdf');assert.equal((await f.put('account',a.id,{...a,imageId:pdf.id},1)).status,400);assert.equal((await f.put('account',a.id,{...a,imageId:crypto.randomUUID()},1)).status,400);
 assert.equal((await f.put('account',a.id,{...a,imageId:''},1)).status,200);w=await f.wallet();assert.equal(w.accounts[0].imageId,'');assert.equal(w.accounts[0].balance,1000000);assert.equal(w.ledger.length,0);
});
test('Una factura se reparte por cantidades entre local y casa; la compra personal no modifica costos del negocio',async t=>{
 const f=await fixture(t),potato=await f.save('ingredient',{name:'Papas',unit:'kg',unitCost:1500});
 const expense=await f.save('expense',f.expense({scope:'mixed',number:'A-1',lines:[{description:'Pollos',quantity:20,businessQuantity:20,unit:'kg',amount:50000,ingredientId:''},{description:'Papas',quantity:10,businessQuantity:8,unit:'kg',amount:12000,ingredientId:potato.id},{description:'Casa',quantity:1,businessQuantity:0,unit:'unidad',amount:8000,ingredientId:''}]}));
 assert.deepEqual(expenseSplit(expense),{business:59600,personal:10400});let data=await f.snapshot();assert.equal(data.costs[potato.id].unitCost,1200);assert.equal(summarizeMonth('2026-10',[],data.expenses,data.today).outflow,59600);
 const personal=await f.save('expense',f.expense({date:'2026-10-26',scope:'personal',total:9999,lines:[{description:'Papas de la casa',quantity:1,businessQuantity:0,unit:'kg',amount:9999,ingredientId:potato.id}]}));assert.equal(personal.lines[0].ingredientId,'');
 data=await f.snapshot();assert.equal(data.costs[potato.id].unitCost,1200);const wallet=await f.wallet();assert.equal(wallet.totals.business.expense,59600);assert.equal(wallet.totals.personal.expense,20399);assert.equal(wallet.totals.all.expense,79999);
 const bad=f.expense({total:100,lines:[{description:'Papas',quantity:1,businessQuantity:2,unit:'kg',amount:100}]});assert.equal((await f.put('expense',crypto.randomUUID(),bad)).status,400);assert.equal((await f.put('expense',crypto.randomUUID(),f.expense({scope:'mixed'}))).status,400);
 assert.deepEqual(distributeLineTotal([{amount:1000},{amount:2000}],3570),[1190,2380]);assert.deepEqual(distributeLineTotal([{amount:1},{amount:1},{amount:1}],5),[2,2,1]);
 // A deployed v1 expense has no allocation fields and stays fully business.
 assert.deepEqual(expenseSplit({total:12000,lines:[{amount:12000,quantity:10}]}),{business:12000,personal:0});
});
test('Las tarjetas registran deuda y cupo; pagarla cambia dos saldos y nunca vuelve a contar el gasto',async t=>{
 const f=await fixture(t),bank=await f.account(),credit=await f.account({name:'Crédito',type:'credit',openingBalance:200000,creditLimit:1000000,paymentDay:10,closingDay:25}),cash=await f.account({name:'Caja',type:'cash',openingBalance:0});
 await f.save('expense',f.expense({accountId:credit.id}));await f.save('expense',f.expense({supplier:'Casa',total:10000,scope:'personal',accountId:bank.id}));
 const payment=await f.save('movement',{type:'transfer',date:'2026-10-26',scope:'business',description:'Pago tarjeta',amount:50000,fromAccountId:bank.id,toAccountId:credit.id});
 await f.save('movement',{type:'income',date:'2026-10-26',scope:'personal',description:'Ingreso personal',amount:20000,toAccountId:bank.id});
 const sale={date:'2026-10-26',cash:5000,card:0,transfer:0,other:0,accounts:{cash:cash.id}};assert.equal((await f.put('sale',sale.date,sale)).status,201);
 let w=await f.wallet(),byId=id=>w.accounts.find(a=>a.id===id);assert.equal(byId(bank.id).balance,960000);assert.equal(byId(credit.id).balance,220000);assert.equal(byId(credit.id).available,780000);assert.equal(byId(cash.id).balance,5000);assert.equal(byId(credit.id).nextPayment,'2026-11-10');assert.equal(w.totals.business.expense,70000);assert.equal(w.totals.personal.expense,10000);assert.equal(w.totals.business.income,5000);assert.equal(w.totals.personal.income,20000);
 assert.equal((await f.put('movement',payment.id,{...payment,amount:60000},1)).status,200);assert.equal((await f.put('movement',payment.id,{...payment,amount:90000},1)).status,409);w=await f.wallet();assert.equal(byId(bank.id).balance,950000);assert.equal(byId(credit.id).balance,210000);assert.equal(w.totals.all.expense,80000);
 await f.save('movement',{type:'adjustment',date:'2026-10-27',scope:'business',description:'Corrección revisada',amount:1000,toAccountId:bank.id});w=await f.wallet();assert.equal(byId(bank.id).balance,951000);assert.equal(w.totals.all.income,25000);
 assert.equal((await f.put('sale','2026-10-27',{...sale,date:'2026-10-27',accounts:{cash:credit.id}})).status,400);
 assert.equal((await f.put('movement',crypto.randomUUID(),{type:'transfer',date:'2026-10-26',scope:'business',description:'No válida',amount:1,fromAccountId:bank.id,toAccountId:bank.id})).status,400);
 assert.equal((await f.call('/account/'+bank.id,{method:'DELETE',body:{revision:1}})).status,409);assert.equal((await f.put('account',bank.id,{...bank,type:'credit',creditLimit:1},1)).status,409);
 assert.equal((await f.put('expense',crypto.randomUUID(),f.expense({date:'2026-10-20',accountId:bank.id}))).status,400);
});
test('Los saldos respetan el mes, el día inicial y los meses cortos; ajustes y avances no son ingresos nuevos',async t=>{
 const f=await fixture(t),bank=await f.account({openingBalance:1000}),credit=await f.account({type:'credit',name:'TC',openingBalance:0,creditLimit:50000});await f.save('movement',{type:'transfer',date:'2026-10-25',scope:'business',description:'Avance',amount:500,fromAccountId:credit.id,toAccountId:bank.id});await f.save('expense',f.expense({date:'2026-11-02',total:100,accountId:bank.id}));
 let w=await f.wallet();assert.equal(w.accounts.find(a=>a.id===bank.id).balance,1500);assert.equal(w.accounts.find(a=>a.id===credit.id).balance,500);assert.equal(w.totals.all.income,0);assert.equal(w.totals.all.expense,0);
 w=await f.wallet('2026-11');assert.equal(w.accounts.find(a=>a.id===bank.id).balance,1400);assert.equal(w.totals.all.expense,100);
 const before=await f.wallet('2026-09');assert.ok(before.accounts.every(a=>a.balance===null));
 assert.equal(paymentDate(31,'2028-02-01'),'2028-02-29');assert.equal(paymentDate(31,'2026-02-28'),'2026-02-28');assert.equal(paymentDate(10,'2026-11-11'),'2026-12-10');
});
test('D1 protege los vínculos de cuentas incluso si otra sesión cambia datos después de validar el formulario',async t=>{
 const f=await fixture(t),a=await f.account(),e=await f.save('expense',f.expense({accountId:a.id}));
 await assert.rejects(f.db.prepare("UPDATE finance_records SET deleted=1 WHERE kind='account' AND id=?").bind(a.id).run(),/FINANCE_ACCOUNT_IN_USE/);
 await assert.rejects(f.db.prepare("UPDATE finance_records SET document=json_set(document,'$.openingDate','2026-10-26') WHERE kind='account' AND id=?").bind(a.id).run(),/FINANCE_ACCOUNT_IN_USE/);
 assert.equal((await f.call('/expense/'+e.id,{method:'DELETE',body:{revision:1}})).status,200);assert.equal((await f.call('/account/'+a.id,{method:'DELETE',body:{revision:1}})).status,200);
 await assert.rejects(f.db.prepare("UPDATE finance_records SET deleted=0 WHERE kind='expense' AND id=?").bind(e.id).run(),/FINANCE_ACCOUNT_REFERENCE/);
});
test('El CSV exige revisión, interpreta comillas y repeticiones, y los lotes se importan sin duplicarse',async t=>{
 const f=await fixture(t),a=await f.account();
 const rows=parseStatement('\ufefffecha;descripcion;monto;destino;categoria;tipo;referencia\r\n25/10/2026;"Compra; papas";-12000;negocio;Ingredientes;gasto;A-1\r\n2026-10-26;Otro ingreso;20000;personal;Otros;ingreso;A-2\r\n','2026-11-05');assert.equal(rows.length,2);assert.equal(rows[0].description,'Compra; papas');assert.equal(rows[0].amount,12000);assert.equal(rows[0].date,'2026-10-25');
 assert.throws(()=>parseStatement('fecha;descripcion;monto\n2026-10-25;Compra;12.000','2026-11-05'),/sin puntos/);
 assert.throws(()=>parseStatement('fecha;descripcion;monto\n2027-01-01;Compra;-1','2026-11-05'),/hoy/);
 const requests=await Promise.all([f.call('/import',{method:'POST',body:{accountId:a.id,rows}}),f.call('/import',{method:'POST',body:{accountId:a.id,rows}})]);for(const res of requests)assert.equal(res.status,200,await res.clone().text());const totals=await Promise.all(requests.map(r=>r.json()));assert.equal(totals.reduce((s,r)=>s+r.created,0),2);assert.equal(totals.reduce((s,r)=>s+r.skipped,0),2);
 const w=await f.wallet();assert.equal(w.accounts[0].balance,1008000);assert.equal(w.totals.business.expense,12000);assert.equal(w.totals.personal.income,20000);
 const backup=await(await f.call('/export')).json();assert.equal(backup.imports.length,2);assert.equal(backup.records.length,3);
 const bad=[...rows,{...rows[0],sourceKey:'bad',date:'2099-01-01'}];assert.equal((await f.call('/import',{method:'POST',body:{accountId:a.id,rows:bad}})).status,400);assert.equal((await f.wallet()).ledger.length,2);
 assert.equal((await f.call('/wallet?month=2026-10',{anonymous:true})).status,401);assert.equal((await f.call('/import',{method:'POST',body:{accountId:a.id,rows},headers:{Origin:'https://other.invalid'}})).status,403);
});
test('La lectura de facturas genera un borrador privado, se cachea y nunca registra un gasto automáticamente',async t=>{
 let calls=0,lastInput;const f=await fixture(t,{AI:{run:async(model,input)=>{calls++;assert.equal(model,INVOICE_MODEL);lastInput=input;return{response:JSON.stringify({supplier:'Ariztía',number:'F-123',date:'2026-10-25',total:12000,lines:[{description:'Papas',quantity:10,unit:'kg',amount:12000}]})};}}});const receipt=await f.upload();
 const read=()=>f.call('/ocr',{method:'POST',body:{receiptId:receipt.id}});let res=await read();assert.equal(res.status,200,await res.clone().text());const draft=await res.json();assert.equal(draft.reviewRequired,true);assert.equal(draft.lines[0].quantity,10);assert.match(lastInput.messages[0].content[1].image_url.url,/^data:image\/png;base64,/);assert.ok(!JSON.stringify(lastInput).includes('dueno@example.invalid'));
 res=await read();assert.equal((await res.json()).cached,true);assert.equal(calls,1);const snapshot=await f.snapshot();assert.equal(snapshot.expenses.length,0);assert.equal(snapshot.ocrAvailable,true);
 const anonymous=await f.call('/ocr',{method:'POST',anonymous:true,body:{receiptId:receipt.id}});assert.equal(anonymous.status,401);
 for(let i=0;i<9;i++){const receipt=await f.upload(new Uint8Array([...png,i]));assert.equal((await f.call('/ocr',{method:'POST',body:{receiptId:receipt.id}})).status,200);}const last=await f.upload(new Uint8Array([...png,99]));assert.equal((await f.call('/ocr',{method:'POST',body:{receiptId:last.id}})).status,429);assert.equal(calls,10);
});
test('Sin Workers AI hay entrada manual; PDF y lecturas ilegibles no crean costos ni exponen respuestas internas',async t=>{
 const f=await fixture(t),receipt=await f.upload();const res=await f.call('/ocr',{method:'POST',body:{receiptId:receipt.id}});assert.equal(res.status,503);assert.match((await res.json()).error,/Workers AI/);assert.equal((await f.snapshot()).ocrAvailable,false);
 f.env.AI={run:async()=>{throw Error('internal secret details');}};const failure=await f.call('/ocr',{method:'POST',body:{receiptId:receipt.id}});assert.equal(failure.status,503);assert.ok(!(await failure.text()).includes('internal secret'));
 const pdf=await f.upload(new TextEncoder().encode('%PDF-1.4\n%%EOF'),'application/pdf');assert.equal((await f.call('/ocr',{method:'POST',body:{receiptId:pdf.id}})).status,415);
 assert.throws(()=>invoiceDraft({response:'Not JSON'}),/interpretar/);const draft=invoiceDraft({response:'```json\n{"supplier":"<b>Texto</b>","total":"12.000","lines":[{"description":"Pollo","quantity":null,"amount":null}]}\n```'});assert.equal(draft.total,null);assert.equal(draft.lines[0].quantity,null);assert.equal(draft.supplier,'<b>Texto</b>');assert.equal((await f.snapshot()).expenses.length,0);
 assert.throws(()=>validateFinance('account',{name:'Cuenta',type:'bank',scope:'business',openingDate:'2026-10-25',openingBalance:0,last4:'12345678'}),/dígitos/);
});

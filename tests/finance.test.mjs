import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorker} from '../cms/worker.mjs';
import {LocalD1} from '../scripts/d1-local.mjs';
import {testIdentity} from '../scripts/test-identity.mjs';
import {SALES_START,todayChile,summarizeMonth,costRecipe,convertedQuantity,validateFinance,csvCell} from '../cms/finance-domain.mjs';

const origin='https://gestion.elpolloplayero.cl';
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64'));
async function fixture(t){
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-05T16:00:00Z')});
 const identity=await testIdentity(),db=new LocalD1(),worker=createWorker({loadKeys:identity.loadKeys,assets:{'/admin/finanzas.html':{body:'Private finance',type:'text/html'}}}),env={...identity.env,DB:db},token=await identity.token();t.after(()=>db.close());
 async function request(path,{method='GET',body,anonymous=false,headers={}}={}){const h=new Headers(headers);if(!anonymous)h.set('Cf-Access-Jwt-Assertion',token);if(body!==undefined&&!(body instanceof Uint8Array)){h.set('Content-Type','application/json');body=JSON.stringify(body);}if(!['GET','HEAD'].includes(method)&&!h.has('Origin'))h.set('Origin',origin);return worker.fetch(new Request(origin+path,{method,headers:h,body}),env);}
 const call=(path,options)=>request('/admin/api/finance'+path,options);
 const put=(kind,id,document,revision=0)=>call('/'+kind+'/'+id,{method:'PUT',body:{document,revision}});
 const snapshot=async(month='2026-11')=>{const res=await call('/snapshot?month='+month);assert.equal(res.status,200,await res.clone().text());return res.json();};
 const ingredient=async(name='Papas',unit='kg',unitCost=1500)=>{const id=crypto.randomUUID(),res=await put('ingredient',id,{name,unit,unitCost});assert.equal(res.status,201,await res.clone().text());return res.json();};
 const expense=(overrides={})=>({date:'2026-11-02',supplier:'Proveedor privado',number:'F-100',category:'Ingredientes',total:12000,notes:'',receiptId:'',lines:[],...overrides});
 return{...identity,db,worker,env,request,call,put,snapshot,ingredient,expense};
}
test('Finanzas comienza sin cifras inventadas, usa calendario chileno y distingue cero de un cierre pendiente',()=>{
 assert.equal(SALES_START,'2026-11-01');assert.equal(todayChile(new Date('2026-11-01T01:30:00Z')),'2026-10-31');
 const before=summarizeMonth('2026-11',[],[],'2026-10-25');assert.equal(before.missing,0);assert.equal(before.recorded,0);assert.ok(before.days.every(d=>d.status==='future'&&d.total===null));
 const after=summarizeMonth('2026-11',[{date:'2026-11-01',cash:0,card:0,transfer:0,other:0}],[],'2026-11-05');assert.equal(after.recorded,1);assert.equal(after.missing,4);assert.equal(after.days[0].total,0);assert.equal(after.days[1].total,null);assert.equal(after.days[5].status,'future');
 assert.equal(summarizeMonth('2028-02',[],[],'2028-03-01').days.length,29);
});
test('Todo el módulo y los comprobantes requieren sesión; ningún dato financiero aparece en la API pública',async t=>{
 const f=await fixture(t);
 for(const path of ['/admin/finanzas.html','/admin/api/finance/snapshot?month=2026-11','/admin/api/finance/export','/admin/api/finance/receipts/'+crypto.randomUUID()]){
  const res=await f.request(path,{anonymous:true});assert.equal(res.status,401);assert.equal(res.headers.get('Cache-Control'),'no-store');assert.equal(res.headers.get('Access-Control-Allow-Origin'),null);
 }
 const id=crypto.randomUUID();assert.equal((await f.put('expense',id,f.expense({supplier:'FACTURA-PRIVADA-XYZ'}))).status,201);
 const publicContent=await(await f.request('/api/content',{anonymous:true})).text();assert.ok(!publicContent.includes('FACTURA-PRIVADA-XYZ'));assert.ok(!publicContent.includes('financ'));
 for(const path of ['/api/finance/snapshot?month=2026-11','/finance/'+id])assert.equal((await f.request(path,{anonymous:true})).status,404);
 assert.equal((await f.call('/sale/2026-11-01',{method:'PUT',headers:{Origin:'https://attacker.invalid'},body:{revision:0,document:{date:'2026-11-01',cash:1,card:0,transfer:0,other:0}}})).status,403);
 assert.equal((await f.call('/receipts',{method:'POST',headers:{Origin:'null','Content-Type':'image/png'},body:png})).status,403);
});
test('Los cierres validan fechas/importes, cuentan cada día una sola vez y evitan sobreescrituras entre sesiones',async t=>{
 const f=await fixture(t),doc={date:'2026-11-01',cash:10000,card:20000,transfer:5000,other:1000,notes:'Cierre revisado'};
 const initial=await f.snapshot();assert.deepEqual(initial.sales,[]);assert.deepEqual(initial.expenses,[]);
 const pair=await Promise.all([f.put('sale',doc.date,doc),f.put('sale',doc.date,doc)]);assert.deepEqual(pair.map(r=>r.status).sort(),[201,409]);
 let data=await f.snapshot();assert.equal(data.sales.length,1);assert.equal(summarizeMonth('2026-11',data.sales,data.expenses,data.today).revenue,36000);
 assert.equal((await f.put('sale',doc.date,{...doc,cash:12000},1)).status,200);
 assert.equal((await f.put('sale',doc.date,{...doc,cash:999999},1)).status,409);
 for(const update of [{cash:-1},{cash:1.5},{cash:'1000'},{date:'2026-10-31'},{date:'2026-11-06'},{date:'2026-11-31'}]){const bad={...doc,...update};assert.equal((await f.put('sale',bad.date,bad)).status,400);}
 assert.equal((await f.put('sale','2026-11-03',{...doc,date:'2026-11-02'})).status,400);
 const zero={date:'2026-11-02',cash:0,card:0,transfer:0,other:0,notes:'Local cerrado'};assert.equal((await f.put('sale',zero.date,zero)).status,201);
 data=await f.snapshot();const total=summarizeMonth('2026-11',data.sales,[],data.today);assert.equal(total.revenue,38000);assert.equal(total.recorded,2);assert.equal(total.missing,3);
 assert.equal((await f.call('/sale/'+zero.date,{method:'DELETE',body:{revision:1}})).status,400);
 const history=await f.db.prepare("SELECT * FROM finance_history WHERE kind='sale' AND id=? ORDER BY revision").bind(doc.date).all();assert.equal(history.results.length,2);assert.equal(JSON.parse(history.results[0].document).cash,10000);
});
test('Los comprobantes son privados, conservan sus bytes y no pueden subirse ni contarse dos veces',async t=>{
 const f=await fixture(t),upload=()=>f.call('/receipts',{method:'POST',headers:{'Content-Type':'image/png'},body:png});
 const first=await upload();assert.equal(first.status,201);const receipt=await first.json();const second=await(await upload()).json();assert.equal(receipt.id,second.id);
 const response=await f.call('/receipts/'+receipt.id);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('Content-Type'),'image/png');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),png);
 const head=await f.call('/receipts/'+receipt.id,{method:'HEAD'});assert.equal(Number(head.headers.get('Content-Length')),png.length);assert.equal((await head.arrayBuffer()).byteLength,0);
 assert.equal((await f.request('/media/'+receipt.id,{anonymous:true})).status,404);
 const download=await f.call('/receipts/'+receipt.id+'?download=1');assert.match(download.headers.get('Content-Disposition'),/^attachment/);
 const pdf=new TextEncoder().encode('%PDF-1.4\nprivate invoice\n%%EOF');const pdfResponse=await f.call('/receipts',{method:'POST',headers:{'Content-Type':'application/pdf'},body:pdf});assert.equal(pdfResponse.status,201);const pdfId=(await pdfResponse.json()).id;assert.match((await f.call('/receipts/'+pdfId)).headers.get('Content-Disposition'),/^attachment/);
 const disguised=new TextEncoder().encode('<svg onload="alert(1)"></svg>');assert.equal((await f.call('/receipts',{method:'POST',headers:{'Content-Type':'image/png'},body:disguised})).status,415);
 assert.equal((await f.call('/receipts',{method:'POST',headers:{'Content-Type':'image/jpeg'},body:png})).status,415);
 assert.equal((await f.call('/receipts',{method:'POST',headers:{'Content-Type':'image/png'},body:new Uint8Array(1500001)})).status,413);
 const expense=f.expense({receiptId:receipt.id});assert.equal((await f.put('expense',crypto.randomUUID(),expense)).status,201);
 assert.equal((await f.put('expense',crypto.randomUUID(),{...expense,number:'OTHER'})).status,409);
 assert.equal((await f.put('expense',crypto.randomUUID(),{...expense,receiptId:'',supplier:' proveedor privado ',number:'f-100'})).status,409);
 const storage=(await f.snapshot()).storage;assert.equal(storage.count,2);assert.equal(storage.bytes,png.length+pdf.length);
});
test('Compras y recetas convierten unidades, incluyen merma y recalculan costos sin cambiar los precios públicos',async t=>{
 const f=await fixture(t),ingredient=await f.ingredient();
 const line={description:'Saco papas',ingredientId:ingredient.id,quantity:10,unit:'kg',amount:12000};
 const old=await f.put('expense',crypto.randomUUID(),f.expense({date:'2026-10-20',number:'OLD',total:20000,lines:[{...line,amount:20000}]}));assert.equal(old.status,201);
 const expenseId=crypto.randomUUID();assert.equal((await f.put('expense',expenseId,f.expense({lines:[line]}))).status,201);
 const recipe={name:'Porción de papas',portions:2,price:3500,overhead:100,parts:[{ingredientId:ingredient.id,quantity:540,unit:'g',waste:10}]},recipeId=crypto.randomUUID();assert.equal((await f.put('recipe',recipeId,recipe)).status,201);
 let data=await f.snapshot();assert.equal(data.costs[ingredient.id].unitCost,1200);const cost=costRecipe(recipe,data.ingredients,data.costs);assert.equal(cost.complete,true);assert.equal(cost.batchCost,820);assert.equal(cost.portionCost,410);assert.equal(cost.margin,3090);
 assert.equal(summarizeMonth(data.month,data.sales,data.expenses,data.today).outflow,12000);
 const otherMonth=await f.snapshot('2026-10');assert.equal(otherMonth.expenses.length,1);assert.equal(otherMonth.costs[ingredient.id].unitCost,1200);
 assert.equal((await f.put('expense',crypto.randomUUID(),f.expense({number:'WRONG',lines:[{...line,amount:100}]}))).status,400);
 assert.equal((await f.put('expense',crypto.randomUUID(),f.expense({number:'WRONG',lines:[{...line,unit:'l'}]}))).status,400);
 assert.equal((await f.put('recipe',crypto.randomUUID(),{...recipe,parts:[{...recipe.parts[0],unit:'unidad'}]})).status,400);
 assert.equal((await f.put('recipe',crypto.randomUUID(),{...recipe,parts:[null]})).status,400);
 assert.equal((await f.put('ingredient',ingredient.id,{name:'Papas',unit:'l',unitCost:20},1)).status,400);
 assert.equal((await f.call('/ingredient/'+ingredient.id,{method:'DELETE',body:{revision:1}})).status,409);
 assert.equal((await f.call('/expense/'+expenseId,{method:'DELETE',body:{revision:1}})).status,200);
 data=await f.snapshot();assert.equal(data.expenses.length,0);assert.equal(data.costs[ingredient.id].unitCost,2000);assert.equal(costRecipe(recipe,data.ingredients,data.costs).portionCost,650);
 const publicData=await(await f.request('/api/content',{anonymous:true})).json();assert.equal(publicData.document.menu[1].items[0].price,3500);assert.equal(publicData.revision,1);
 assert.equal(convertedQuantity(1,'kg','g'),1000);assert.equal(convertedQuantity(1,'l','ml'),1000);assert.equal(convertedQuantity(1,'kg','unidad'),null);
 assert.equal(costRecipe(recipe,[{...ingredient,unitCost:0}],{}).complete,false);
});
test('Anular conserva el historial, el export incluye todos los meses y los datos no contienen blobs públicos',async t=>{
 const f=await fixture(t),id=crypto.randomUUID();const res=await f.put('expense',id,f.expense());assert.equal(res.status,201);
 assert.equal((await f.put('expense',id,f.expense({total:15000}),1)).status,200);
 assert.equal((await f.call('/expense/'+id,{method:'DELETE',body:{revision:1}})).status,409);
 assert.equal((await f.call('/expense/'+id,{method:'DELETE',body:{revision:2}})).status,200);
 assert.equal((await f.snapshot()).expenses.length,0);
 const exportData=await(await f.call('/export')).json();assert.equal(exportData.format,'playero-finance-v1');assert.equal(exportData.records.length,1);assert.equal(exportData.records[0].deleted,true);assert.equal(exportData.history.length,3);assert.match(exportData.notice,/no las fotos/);
 assert.equal(csvCell('=HYPERLINK("evil")'),'"\'=HYPERLINK(""evil"")"');assert.equal(csvCell('  +SUM(1)'),'"\'  +SUM(1)"');assert.equal(csvCell(-10),'"-10"');
 for(const bad of [-1,NaN,Infinity,1.1])assert.throws(()=>validateFinance('sale',{date:'2026-11-01',cash:bad,card:0,transfer:0,other:0}));
});

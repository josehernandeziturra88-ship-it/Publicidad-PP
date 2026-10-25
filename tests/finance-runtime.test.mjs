import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {testIdentity} from '../scripts/test-identity.mjs';
import {todayChile} from '../cms/finance-domain.mjs';

test('El Worker real guarda comprobantes en D1 y calcula compras con JSON SQL y control de versiones',async()=>{
 const identity=await testIdentity(),token=await identity.token();
 const bundle=await build({stdin:{contents:`import {createWorker} from './cms/worker.mjs';export default createWorker({loadKeys:async()=>[${JSON.stringify(identity.publicKey)}]});`,resolveDir:fileURLToPath(new URL('../',import.meta.url)),sourcefile:'finance-runtime-test.mjs'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,compatibilityDate:'2026-10-24',script:bundle.outputFiles[0].text,bindings:identity.env,d1Databases:['DB'],cf:false,telemetry:{enabled:false}}));
 async function call(path,{method='GET',body,headers={}}={}){const h=new Headers({'Cf-Access-Jwt-Assertion':token,...headers});if(method!=='GET')h.set('Origin','https://gestion.example.invalid');if(body&&!(body instanceof Uint8Array)){h.set('Content-Type','application/json');body=JSON.stringify(body);}return mf.dispatchFetch('https://gestion.example.invalid/admin/api/finance'+path,{method,headers:h,body});}
 const put=(kind,id,document,revision=0)=>call('/'+kind+'/'+id,{method:'PUT',body:{revision,document}});
 try{
  const date=todayChile(),id=crypto.randomUUID(),expense=crypto.randomUUID();
  let response=await put('ingredient',id,{name:'Papas',unit:'kg',unitCost:1000});assert.equal(response.status,201,await response.clone().text());
  const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64'));
  response=await call('/receipts',{method:'POST',headers:{'Content-Type':'image/png'},body:png});assert.equal(response.status,201,await response.clone().text());const receipt=await response.json();
  response=await put('expense',expense,{date,supplier:'Compra de prueba',number:'RUNTIME-1',category:'Ingredientes',total:3400,notes:'',receiptId:receipt.id,lines:[{description:'Papas A',ingredientId:id,unit:'kg',quantity:1,amount:1000},{description:'Papas B',ingredientId:id,unit:'g',quantity:2000,amount:2400}]});assert.equal(response.status,201,await response.clone().text());
  response=await call('/snapshot?month='+date.slice(0,7));assert.equal(response.status,200,await response.clone().text());const snapshot=await response.json();assert.equal(snapshot.expenses.length,1);assert.ok(Math.abs(snapshot.costs[id].unitCost-3400/3)<.00001);
  response=await put('ingredient',id,{name:'Papas nuevas',unit:'kg',unitCost:1200},1);assert.equal(response.status,200,await response.clone().text());assert.equal((await put('ingredient',id,{name:'Incorrecto',unit:'kg',unitCost:50},1)).status,409);
  response=await call('/receipts/'+receipt.id);assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),png);
  const anon=await mf.dispatchFetch('https://gestion.example.invalid/admin/api/finance/receipts/'+receipt.id);assert.equal(anon.status,401);
  response=await call('/export');assert.equal(response.status,200,await response.clone().text());const backup=await response.json();assert.equal(backup.history.length,3);assert.equal(backup.receipts.length,1);
 }finally{await mf.dispose();}
});

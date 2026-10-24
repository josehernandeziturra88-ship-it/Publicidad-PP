import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {testIdentity} from '../scripts/test-identity.mjs';

test('El runtime de Workers consulta JWKS, valida el ingreso y rechaza redirecciones de las claves',async t=>{
 const identity=await testIdentity();let redirect=false,followed=0,requests=0;
 const server=createServer((req,res)=>{
  requests++;
  if(req.url==='/redirect-target'){followed++;res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({keys:[identity.publicKey]}));return}
  if(redirect){res.writeHead(302,{Location:'/redirect-target'});res.end();return}
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({keys:[identity.publicKey]}));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const mockOrigin='http://127.0.0.1:'+server.address().port;
 // Redirect only the test team's JWKS hostname to the local fixture. The
 // actual workerd fetch implementation still processes every fetch option.
 const bundle=await build({stdin:{contents:`
  import {createWorker} from './cms/worker.mjs';
  const runtimeFetch=globalThis.fetch.bind(globalThis);
  globalThis.fetch=(input,options)=>{
   const url=new URL(typeof input==='string'?input:input.url);
   if(url.origin!==${JSON.stringify('https://'+identity.env.ACCESS_TEAM_DOMAIN)})throw new Error('Unexpected test destination');
   return runtimeFetch(${JSON.stringify(mockOrigin)}+url.pathname,options);
  };
  export default createWorker({assets:{'/admin/index.html':{body:'Private runtime editor',type:'text/html'}}});
 `,resolveDir:fileURLToPath(new URL('../',import.meta.url)),sourcefile:'runtime-test.mjs'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
 async function runtime(){
  return new Miniflare(convertV4MiniflareOptions({modules:true,compatibilityDate:'2026-10-24',script:bundle.outputFiles[0].text,bindings:identity.env,cf:false,telemetry:{enabled:false}}));
 }
 const mf=await runtime();
 try{
  const anonymous=await mf.dispatchFetch('https://gestion.example.invalid/admin/');
  assert.equal(anonymous.status,401);assert.equal(requests,0);
  const response=await mf.dispatchFetch('https://gestion.example.invalid/admin/',{headers:{'Cf-Access-Jwt-Assertion':await identity.token()}});
  assert.equal(response.status,200,await response.clone().text());assert.equal(await response.text(),'Private runtime editor');assert.equal(requests,1);
 }finally{await mf.dispose()}
 redirect=true;
 const redirected=await runtime();
 try{
  const response=await redirected.dispatchFetch('https://gestion.example.invalid/admin/',{headers:{'Cf-Access-Jwt-Assertion':await identity.token()}});
  assert.equal(response.status,401);assert.equal((await response.json()).code,'KEYS_UNAVAILABLE');assert.equal(followed,0);
 }finally{await redirected.dispose()}
});

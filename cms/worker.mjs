import defaults from '../content/default.json' with {type:'json'};
import {validateDocument,MAX_IMAGE_BYTES,MAX_DOCUMENT_BYTES} from '../content/schema.js';
import {authenticate,AccessError} from './auth.mjs';
import {financeRequest} from './finance.mjs';
import {FinanceError} from './finance-domain.mjs';

const schema=[
 'CREATE TABLE IF NOT EXISTS site_content (id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS content_history (revision INTEGER PRIMARY KEY,document TEXT NOT NULL,updated_at TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY,mime TEXT NOT NULL,bytes BLOB NOT NULL,size INTEGER NOT NULL CHECK(size>0 AND size<=1500000),created_at TEXT NOT NULL)'
];
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://elpolloplayero.cl https://www.elpolloplayero.cl blob: data:; connect-src 'self'; frame-src https://elpolloplayero.cl; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});
async function readLimited(request,max){if(Number(request.headers.get('Content-Length'))>max)throw new HttpError(413,'El archivo es demasiado grande.');const reader=request.body?.getReader();if(!reader)return new Uint8Array();let chunks=[],size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,'El archivo es demasiado grande.');}chunks.push(value);}}finally{reader.releaseLock()}const result=new Uint8Array(size);let offset=0;for(const c of chunks){result.set(c,offset);offset+=c.length}return result;}
export function imageMime(bytes){const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));if(bytes.length<12)return null;if(bytes[0]===0x89&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return 'image/png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'image/webp';if(['GIF87a','GIF89a'].includes(ascii(0,6)))return 'image/gif';return null;}
function originHeaders(request,env){const origin=request.headers.get('Origin');if(!origin)return {};const primary=new URL(env.SITE_ORIGIN||'https://elpolloplayero.cl').origin;const allowed=new Set([primary,primary.replace('://','://www.')]);return allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};}
function mutationOrigin(request){const origin=request.headers.get('Origin');if(origin!==new URL(request.url).origin)throw new HttpError(403,'La publicación debe realizarse desde el panel.');}
export function createWorker({assets={},loadKeys=undefined}={}){
 const initialized=new WeakSet();
 async function init(db){if(!db)throw new HttpError(503,'El almacenamiento del panel aún no está configurado.');if(initialized.has(db))return;await db.batch(schema.map(s=>db.prepare(s)));await db.prepare('INSERT OR IGNORE INTO site_content(id,document,revision,updated_at) VALUES(1,?,1,?)').bind(JSON.stringify(validateDocument(defaults)),new Date().toISOString()).run();initialized.add(db);}
 async function read(db){const row=await db.prepare('SELECT document,revision,updated_at FROM site_content WHERE id=1').first();return {document:JSON.parse(row.document),revision:row.revision,updatedAt:row.updated_at};}
 return {async fetch(request,env){const url=new URL(request.url),path=url.pathname;try{
  if(path==='/health')return json({ok:true});
  if(path==='/api/content'){
   const cors=originHeaders(request,env);
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...security,...cors,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
   if(request.method!=='GET')throw new HttpError(405,'Método no permitido.');await init(env.DB);return json(await read(env.DB),200,cors);
  }
  if(path.startsWith('/media/')){
   if(request.method!=='GET'&&request.method!=='HEAD')throw new HttpError(405,'Método no permitido.');const id=path.slice(7);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(404,'Imagen no encontrada.');await init(env.DB);const row=await env.DB.prepare('SELECT bytes,mime,size FROM media WHERE id=?').bind(id).first();if(!row)throw new HttpError(404,'Imagen no encontrada.');const bytes=Array.isArray(row.bytes)?Uint8Array.from(row.bytes):row.bytes instanceof ArrayBuffer?new Uint8Array(row.bytes):ArrayBuffer.isView(row.bytes)?new Uint8Array(row.bytes.buffer,row.bytes.byteOffset,row.bytes.byteLength):null;if(!bytes)throw new HttpError(500,'No se pudo leer la imagen.');return new Response(request.method==='HEAD'?null:bytes,{headers:{...security,'Content-Type':row.mime,'Content-Length':String(bytes.byteLength),'Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'; sandbox",...originHeaders(request,env)}});
  }
  if(path==='/')return Response.redirect(url.origin+'/admin/',302);
  if(path==='/admin'||path.startsWith('/admin/')){
   let identity;try{identity=await authenticate(request,env,loadKeys)}catch(e){return json({error:e instanceof AccessError?e.message:'No se pudo validar la sesión. Vuelve a iniciar sesión.',code:e instanceof AccessError?e.code:'AUTH_FAILED'},401);}
   if(!path.startsWith('/admin/api/')){
    if(request.method!=='GET')throw new HttpError(405,'Método no permitido.');const key=(path==='/admin'||path==='/admin/')?'/admin/index.html':path;const asset=assets[key];if(!asset)throw new HttpError(404,'Página no encontrada.');return new Response(asset.body,{headers:{...security,'Content-Type':asset.type,'Cache-Control':'no-store','Content-Security-Policy':csp}});
   }
   await init(env.DB);
   if(path.startsWith('/admin/api/finance/')){
    if(!['GET','HEAD'].includes(request.method))mutationOrigin(request);
    return await financeRequest(request,env.DB,{json,readLimited,imageMime});
   }
   if(path==='/admin/api/session'&&request.method==='GET')return json({email:identity.email,siteOrigin:new URL(env.SITE_ORIGIN||'https://elpolloplayero.cl').origin});
   if(path==='/admin/api/content'){
    if(request.method==='GET')return json(await read(env.DB));
    if(request.method!=='PUT')throw new HttpError(405,'Método no permitido.');mutationOrigin(request);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'Se esperaba contenido JSON.');
    let payload;try{payload=JSON.parse(new TextDecoder().decode(await readLimited(request,MAX_DOCUMENT_BYTES+5000)))}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'El contenido no tiene un formato válido.');}
    if(!Number.isSafeInteger(payload.revision)||payload.revision<1)throw new HttpError(400,'Versión inválida.');
    let doc;try{doc=validateDocument(payload.document)}catch(e){throw new HttpError(400,e.message)}
    const refs=new Set([...Object.values(doc.images),...doc.promotions.map(p=>p.image)].filter(r=>r.startsWith('media/')));
    for(const ref of refs)if(!await env.DB.prepare('SELECT id FROM media WHERE id=?').bind(ref.slice(6)).first())throw new HttpError(400,'Una imagen no está disponible. Vuelve a subirla.');
    const now=new Date().toISOString();const results=await env.DB.batch([
     env.DB.prepare('INSERT OR IGNORE INTO content_history(revision,document,updated_at) SELECT revision,document,updated_at FROM site_content WHERE id=1 AND revision=?').bind(payload.revision),
     env.DB.prepare('UPDATE site_content SET document=?,revision=revision+1,updated_at=? WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(doc),now,payload.revision),
     env.DB.prepare('DELETE FROM content_history WHERE revision < (SELECT revision-20 FROM site_content WHERE id=1)')
    ]);
    if(!results[1].results?.length)throw new HttpError(409,'Hay cambios publicados desde otra sesión. Descarga una copia de tus cambios y vuelve a cargar la última versión antes de publicar.');
    return json({document:doc,revision:results[1].results[0].revision,updatedAt:now});
   }
   if(path==='/admin/api/media'&&request.method==='POST'){
    mutationOrigin(request);const bytes=await readLimited(request,MAX_IMAGE_BYTES),mime=imageMime(bytes);if(!mime||mime!==request.headers.get('Content-Type')?.split(';')[0])throw new HttpError(415,'Sube una imagen JPG, PNG, WebP o GIF válida.');
    const count=await env.DB.prepare('SELECT COUNT(*) AS count FROM media').first();if(count.count>=300)throw new HttpError(409,'La biblioteca llegó a 300 imágenes. Contacta al administrador técnico para liberar espacio.');
    const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO media(id,mime,bytes,size,created_at) VALUES(?,?,?,?,?)').bind(id,mime,bytes,bytes.length,new Date().toISOString()).run();return json({ref:'media/'+id},201);
   }
   throw new HttpError(404,'Acción no encontrada.');
  }
  throw new HttpError(404,'Página no encontrada.');
 }catch(e){const known=e instanceof HttpError||e instanceof FinanceError;return json({error:known?e.message:'No se pudo completar la operación. Inténtalo nuevamente.'},known?e.status:500);}}};
}

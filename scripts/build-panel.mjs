import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function buildAssets(){const assets={};for(const [name,file,type]of [['index.html','cms/ui/index.html','text/html; charset=utf-8'],['admin.css','cms/ui/admin.css','text/css; charset=utf-8'],['admin.js','cms/ui/admin.js','application/javascript; charset=utf-8'],['schema.js','content/schema.js','application/javascript; charset=utf-8'],['finanzas.html','cms/ui/finanzas.html','text/html; charset=utf-8'],['finanzas.css','cms/ui/finanzas.css','text/css; charset=utf-8'],['finanzas.js','cms/ui/finanzas.js','application/javascript; charset=utf-8'],['finance-domain.mjs','cms/finance-domain.mjs','application/javascript; charset=utf-8'],['wallet-domain.mjs','cms/wallet-domain.mjs','application/javascript; charset=utf-8'],['cuentas.html','cms/ui/cuentas.html','text/html; charset=utf-8'],['cuentas.css','cms/ui/cuentas.css','text/css; charset=utf-8'],['cuentas.js','cms/ui/cuentas.js','application/javascript; charset=utf-8']])assets['/admin/'+name]={body:await readFile(root+file,'utf8'),type};return assets;}
await writeFile(root+'cms/generated-assets.mjs','export default '+JSON.stringify(await buildAssets())+';\n');
await mkdir(root+'configurar',{recursive:true});
await build({entryPoints:[root+'cms/entry.mjs'],outfile:root+'configurar/playero-worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:false,legalComments:'none'});
console.log('Worker listo en configurar/playero-worker.js. No incluye claves ni correos autorizados.');

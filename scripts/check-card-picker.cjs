// Local QA: actually open the native chooser, instead of bypassing it with
// locator.setInputFiles(). Also exercise explicit fallback, drop and paste.
const {chromium}=require('playwright');
const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 for(const mode of ['native','fallback','alternative','drop','paste']){
  const context=await b.newContext({viewport:{width:mode==='native'?1440:390,height:900},isMobile:mode!=='native',hasTouch:mode!=='native'}),p=await context.newPage(),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
  await p.route('https://elpolloplayero.cl/assets/**',r=>r.fulfill({path:process.cwd()+decodeURIComponent(new URL(r.request().url()).pathname)}));
  if(mode==='fallback')await p.addInitScript(()=>{Object.defineProperty(HTMLInputElement.prototype,'showPicker',{value:undefined,configurable:true});window.createImageBitmap=undefined;});
  await p.goto('http://127.0.0.1:8790/admin/cuentas.html');await p.locator('#wallet').waitFor({state:'visible'});await p.getByRole('button',{name:'+ Nueva cuenta o tarjeta',exact:true}).click();const d=p.getByRole('dialog');await d.getByLabel('Nombre para identificarla',{exact:true}).fill('Prueba selector '+mode);
  if(['native','fallback','alternative'].includes(mode)){
   if(mode==='alternative')await d.getByText('Usar selector alternativo',{exact:true}).click();
   const opened=p.waitForEvent('filechooser');
   if(mode==='alternative')await d.getByLabel('Imagen de la cuenta o tarjeta',{exact:true}).click();else if(mode==='native')await d.getByRole('button',{name:'Elegir imagen',exact:true}).click();else await d.getByRole('button',{name:'Elegir imagen',exact:true}).tap();
   const chooser=await opened;await chooser.setFiles({name:'logo.png',mimeType:'image/png',buffer:bytes});
  }else{
   await p.getByRole('group',{name:'Arrastrar o pegar imagen',exact:true}).evaluate((target,{mode,bytes})=>{const transfer=new DataTransfer();transfer.items.add(new File([new Uint8Array(bytes)],'logo.png',{type:'image/png'}));target.dispatchEvent(mode==='paste'?new ClipboardEvent('paste',{clipboardData:transfer,bubbles:true,cancelable:true}):new DragEvent('drop',{dataTransfer:transfer,bubbles:true,cancelable:true}));},{mode,bytes:Array.from(bytes)});
  }
  await d.getByText('Imagen lista. Guarda la cuenta para aplicarla.',{exact:true}).waitFor();await d.getByRole('button',{name:'Guardar',exact:true}).click();await d.waitFor({state:'hidden'});const card=p.locator('.account-card').filter({has:p.getByRole('heading',{name:'Prueba selector '+mode,exact:true})});await card.scrollIntoViewIfNeeded();await card.locator('.account-art img').waitFor({state:'visible'});await p.reload();await card.scrollIntoViewIfNeeded();await card.locator('.account-art img').waitFor({state:'visible'});await p.waitForFunction(name=>[...document.querySelectorAll('.account-card')].find(n=>n.querySelector('h3')?.textContent===name)?.querySelector('.account-art img')?.naturalWidth>0,'Prueba selector '+mode);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Desbordamiento '+mode);if(errors.length)throw Error(errors.join('\n'));console.log('PASS '+mode);await context.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

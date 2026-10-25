// Run against a disposable local dev server fixed to 2026-11-03, never production.
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const origin='http://127.0.0.1:8789',browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://elpolloplayero.cl/assets/**',async route=>{try{await route.fulfill({path:process.cwd()+decodeURIComponent(new URL(route.request().url()).pathname)});}catch{await route.abort();}});
  await page.goto(origin+'/admin/');await page.locator('#editor').waitFor({state:'visible'});await page.getByRole('link',{name:'Compras y costos ↗'}).click();await page.locator('#finance').waitFor({state:'visible'});
  await page.locator('#month').fill('2026-11');await page.locator('#month').dispatchEvent('change');await page.waitForFunction(()=>document.querySelector('#month').value==='2026-11'&&!document.querySelector('#month').disabled);const dialog=page.getByRole('dialog');
  const nav=name=>page.getByRole('button',{name,exact:true}).click();
  async function save(){await dialog.getByRole('button',{name:'Guardar registro',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.locator('#finance.loading').waitFor({state:'hidden'});}
  await nav('Costos por producto');
  for(const [name,unit,cost]of [['Papas','kg','1500'],['Caja','unidad','150']]){
   await page.getByRole('button',{name:'+ Crear insumo',exact:true}).click();await dialog.getByLabel('Nombre del insumo',{exact:true}).fill(name);await dialog.getByLabel('Unidad de referencia',{exact:true}).selectOption(unit);await dialog.getByLabel('Costo manual por unidad de referencia ($)',{exact:true}).fill(cost);await save();
  }
  await page.getByRole('button',{name:'+ Crear receta',exact:true}).click();await dialog.getByLabel('Nombre del producto o combo',{exact:true}).fill('Porción de papas · EJEMPLO');await dialog.getByLabel('Precio de venta por porción ($)',{exact:true}).fill('3500');await dialog.getByLabel('Otros costos de toda la preparación ($)',{exact:true}).fill('100');
  const parts=dialog.locator('.line-item');await parts.first().getByLabel('Ingrediente o insumo',{exact:true}).selectOption({label:'Papas'});await parts.first().getByLabel('Cantidad útil para la preparación',{exact:true}).fill('300');await parts.first().getByLabel('Unidad de la receta',{exact:true}).selectOption('g');await dialog.getByRole('button',{name:'+ Agregar insumo',exact:true}).click();await parts.nth(1).getByLabel('Ingrediente o insumo',{exact:true}).selectOption({label:'Caja'});await parts.nth(1).getByLabel('Unidad de la receta',{exact:true}).selectOption('unidad');
  await dialog.locator('.form-summary>strong').filter({hasText:'$700'}).waitFor();await save();
  await nav('Gastos y facturas');await page.getByRole('button',{name:'+ Registrar gasto',exact:true}).click();await dialog.getByLabel('Fecha del pago o cargo',{exact:true}).fill('2026-11-02');await dialog.getByLabel('Proveedor o comercio',{exact:true}).fill('Proveedor · EJEMPLO');await dialog.getByLabel('Número de factura o boleta',{exact:true}).fill('TEST-1');await dialog.getByLabel('Total del comprobante ($)',{exact:true}).fill('12000');
  await dialog.getByLabel('Adjuntar foto o PDF',{exact:true}).setInputFiles({name:'factura-prueba.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});await dialog.getByRole('link',{name:'Descargar comprobante',exact:true}).waitFor();await dialog.getByRole('button',{name:'Guardar registro',exact:true}).waitFor({state:'visible'});
  await dialog.getByRole('button',{name:'+ Agregar línea',exact:true}).click();await dialog.getByLabel('Producto comprado',{exact:true}).fill('Papas');await dialog.getByLabel('Vincular a insumo del negocio',{exact:true}).selectOption({label:'Papas'});await dialog.getByLabel('Cantidad total comprada',{exact:true}).fill('10');await dialog.getByLabel('Unidad de compra',{exact:true}).selectOption('kg');await dialog.getByLabel('Importe final de la línea ($)',{exact:true}).fill('12000');await save();
  await nav('Costos por producto');await page.locator('#view-costs .card').filter({hasText:'Porción de papas · EJEMPLO'}).getByText('$610',{exact:true}).waitFor();
  await nav('Ventas diarias');await page.getByRole('button',{name:'1 nov 2026 · Sin registrar',exact:true}).click();await dialog.getByLabel('Efectivo ($)',{exact:true}).fill('30000');await dialog.getByLabel('Tarjeta ($)',{exact:true}).fill('50000');await dialog.getByLabel('Transferencia ($)',{exact:true}).fill('20000');await save();
  await page.getByRole('button',{name:'2 nov 2026 · Sin registrar',exact:true}).click();await dialog.getByLabel('Notas del cierre',{exact:true}).fill('Local cerrado · EJEMPLO');await save();
  await nav('Resumen');await page.locator('.metric').filter({hasText:'Ventas registradas'}).getByText('$100.000',{exact:true}).waitFor();await page.locator('.metric').filter({hasText:'Resultado registrado'}).getByText('$88.000',{exact:true}).waitFor();await page.locator('.metric').filter({hasText:'Días pendientes'}).getByText('1',{exact:true}).waitFor();
  await page.reload();await page.locator('#finance').waitFor({state:'visible'});await page.locator('.metric').filter({hasText:'Ventas registradas'}).getByText('$100.000',{exact:true}).waitFor();
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});
   for(const tab of ['Resumen','Ventas diarias','Gastos y facturas','Costos por producto']){await nav(tab);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Desbordamiento: '+tab+' '+width);}
   await page.getByRole('button',{name:'+ Crear receta',exact:true}).click();if(await dialog.evaluate(el=>el.scrollWidth>el.clientWidth))throw Error('Desbordamiento del formulario '+width);await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();
   await nav('Resumen');await page.screenshot({path:'.local/finanzas-'+width+'.png',fullPage:true});
  }
  let downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar mes para Excel',exact:true}).click();let download=await downloadPromise;await download.saveAs('.local/finanzas-prueba.csv');const csv=fs.readFileSync('.local/finanzas-prueba.csv','utf8');if(!csv.includes('"100000"')||!csv.includes('"Pendiente"')||!csv.includes('"Local cerrado · EJEMPLO"'))throw Error('CSV incompleto');
  downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Respaldar datos e historial',exact:true}).click();download=await downloadPromise;await download.saveAs('.local/finanzas-prueba.json');const backup=JSON.parse(fs.readFileSync('.local/finanzas-prueba.json','utf8'));if(backup.records.length!==6||backup.receipts.length!==1)throw Error('Respaldo incorrecto');
  await nav('Gastos y facturas');await page.getByRole('button',{name:'Ver / editar',exact:true}).click();downloadPromise=page.waitForEvent('download');await dialog.getByRole('link',{name:'Descargar comprobante',exact:true}).click();download=await downloadPromise;if(!download.suggestedFilename().endsWith('.png'))throw Error('Comprobante incorrecto');await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();
  await nav('Ventas diarias');await page.getByRole('button',{name:'1 nov 2026 · Registrado · editar',exact:true}).click();await dialog.getByLabel('Efectivo ($)',{exact:true}).fill('31000');await save();await nav('Resumen');await page.locator('.metric').filter({hasText:'Ventas registradas'}).getByText('$101.000',{exact:true}).waitFor();
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: navegación, insumos, receta, comprobante privado, gastos, actualización de costos, cierres, cero vs pendiente, persistencia, edición, CSV, JSON y descarga de comprobante; sin desbordamiento 390/1440.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

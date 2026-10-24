export const MAX_IMAGE_BYTES = 1500000;
export const MAX_DOCUMENT_BYTES = 180000;
export const money = n => '$' + Number(n).toLocaleString('es-CL');

function text(value, label, max = 400, empty = false) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) throw new Error(`${label}: revisa el texto.`);
  return value.trim();
}
function bool(v, label) { if (typeof v !== 'boolean') throw new Error(`${label}: valor inválido.`); return v; }
function price(v) { if (!Number.isSafeInteger(v) || v < 0 || v > 10000000) throw new Error('El precio debe ser un número entero entre 0 y 10.000.000.'); return v; }
function list(v, min, max, label) { if (!Array.isArray(v) || v.length < min || v.length > max) throw new Error(`${label}: cantidad inválida.`); return v; }
function id(v) { v = text(v, 'Identificador', 70); if (!/^[a-z][a-z0-9-]*$/.test(v)) throw new Error('Identificador inválido.'); return v; }
function unique(items) { if (new Set(items.map(i => i.id)).size !== items.length) throw new Error('Hay identificadores repetidos.'); return items; }
export function imageRef(value) {
  value = text(value, 'Imagen', 250);
  if (/^media\/[0-9a-f-]{36}$/i.test(value)) return value;
  let decoded; try { decoded = decodeURIComponent(value); } catch { throw new Error('Ruta de imagen inválida.'); }
  if (!decoded.startsWith('assets/') || decoded.includes('..') || /[?#\\<>\u0000]/u.test(decoded) || !/\.(png|jpe?g|webp|gif|svg)$/i.test(decoded)) throw new Error('Usa una imagen subida desde el panel o una imagen de la web.');
  return value;
}
export function imageURL(ref, apiOrigin, siteBase = 'https://elpolloplayero.cl/') {
  return new URL(imageRef(ref), ref.startsWith('media/') ? apiOrigin + '/' : siteBase).href;
}
export function validateDocument(input) {
  if (!input || input.schemaVersion !== 1) throw new Error('Formato de contenido no compatible.');
  const b = input.business, h = input.hero, t = input.texts;
  if (!b || !h || !t || !input.images) throw new Error('Faltan datos del sitio.');
  const business = {};
  for (const [key, max] of Object.entries({ name:100,address:180,area:160,locationDescription:400,hoursDays:120,seasonNote:180,visitTitle:150,visitAccent:150,instagramHeading:180,instagramDescription:400 })) business[key] = text(b[key], key, max, key === 'seasonNote');
  for (const key of ['opens','closes']) { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b[key])) throw new Error('Revisa las horas de apertura y cierre.'); business[key] = b[key]; }
  business.instagram = text(b.instagram, 'Usuario de Instagram', 40);
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(business.instagram)) throw new Error('Escribe el usuario de Instagram sin @.');
  business.whatsapp = text(b.whatsapp, 'Enlace de WhatsApp', 250);
  const wa = new URL(business.whatsapp);
  if (wa.protocol !== 'https:' || wa.hostname !== 'wa.me' || wa.username || wa.password || wa.port || !/^\/(message\/[a-zA-Z0-9]+|\d{8,16})\/?$/.test(wa.pathname)) throw new Error('El enlace debe ser de WhatsApp: https://wa.me/...');
  const hero = {};
  for (const key of ['line1','accent1','line2','accent2','button']) hero[key] = text(h[key], 'Portada: '+key, 120);
  hero.description = text(h.description, 'Descripción de portada', 650);
  const texts = {};
  for (const key of ['promotionsTitle','promotionsAccent','menuTitle','menuAccent','specialTitle','specialAccent','specialDescription','specialDetails','icecreamTitle','icecreamAccent','icecreamDescription','groceryTitle','groceryAccent','groceryDescription','locationTitle','locationAccent']) texts[key] = text(t[key], key, 900);
  const promotions = unique(list(input.promotions, 0, 30, 'Promociones').map(p => {
    const result = {id:id(p.id),name:text(p.name,'Nombre de promoción',100),label:text(p.label,'Etiqueta',130),description:text(p.description,'Descripción de promoción',450),price:price(p.price),visible:bool(p.visible,'Visibilidad'),available:bool(p.available,'Disponibilidad'),image:imageRef(p.image),crop:null};
    if (p.crop !== null) {
      if (typeof p.crop !== 'string' || !/^\d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)?$/.test(p.crop) || p.crop.split(' ').some(n=>Number(n)>4096) || p.crop.split(' ').slice(2).some(n=>Number(n)<=0)) throw new Error('Encuadre de imagen inválido.');
      result.crop=p.crop;
    }
    return result;
  }));
  const menu = unique(list(input.menu, 1, 16, 'Categorías').map(c=>({id:id(c.id),name:text(c.name,'Categoría',100),items:unique(list(c.items,0,50,'Productos').map(i=>({id:id(i.id),name:text(i.name,'Producto',150),price:price(i.price),visible:bool(i.visible,'Visibilidad'),available:bool(i.available,'Disponibilidad')})))})));
  if (!menu.some(c=>c.id==='jugos' && c.items.length>=2)) throw new Error('Conserva la categoría Jugos y sus dos precios (agua y leche).');
  const flavors=list(input.flavors,8,8,'Sabores').map(v=>text(v,'Sabor',60));
  const images={};
  for (const key of ['logo','hero','savory','icecream1','icecream2','map','grocery','blueExpress']) images[key]=imageRef(input.images[key]);
  const result={schemaVersion:1,business,hero,texts,promotions,menu,flavors,images};
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength>MAX_DOCUMENT_BYTES) throw new Error('El contenido excede el tamaño permitido.');
  return result;
}

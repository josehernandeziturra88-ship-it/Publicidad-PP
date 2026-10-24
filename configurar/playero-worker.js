// content/default.json
var default_default = {
  schemaVersion: 1,
  business: { name: "El Pollo Playero", address: "Av. Isidoro Dubornais 0665", area: "Quisco Norte \xB7 El Quisco", locationDescription: "Estamos en Quisco Norte, El Quisco, Regi\xF3n de Valpara\xEDso.", hoursDays: "Lunes a domingo", opens: "10:00", closes: "00:00", seasonNote: "Desde diciembre.", visitTitle: "Te esperamos", visitAccent: "en Quisco Norte.", instagramHeading: "S\xEDguenos en Instagram", instagramDescription: "Para que est\xE9s al tanto de futuras novedades.", instagram: "elpolloplayero__", whatsapp: "https://wa.me/message/WHQBDDPZZZSKD1" },
  hero: { line1: "\xA1El sabor de", accent1: "El Quisco", line2: "est\xE1 en", accent2: "El Pollo Playero!", description: "Pollo asado al espiedo, hecho para disfrutar los d\xEDas de playa, comer rico y compartir.", button: "Ver promociones" },
  texts: { promotionsTitle: "Nuestras", promotionsAccent: "promociones.", menuTitle: "Nuestro", menuAccent: "men\xFA.", specialTitle: "Para esos d\xEDas de", specialAccent: "buen antojo.", specialDescription: "Nuestra especialidad es el pollo asado. Tambi\xE9n tenemos comida r\xE1pida para cuando buscas algo rico y sin complicaciones.", specialDetails: "Elige entre nuestros combos de pollo asado, papas fritas, nuggets, salchipapas y empanadas fritas. Haz tu pedido directamente por WhatsApp.", icecreamTitle: "La carta de", icecreamAccent: "helados.", icecreamDescription: "Explora las variedades y consulta precios y disponibilidad por WhatsApp.", groceryTitle: "Mucho m\xE1s para", groceryAccent: "tu d\xEDa.", groceryDescription: "Recuerda que tambi\xE9n tenemos abarrotes, bebidas, \xFAtiles de aseo y mucho m\xE1s.", locationTitle: "Tu pr\xF3xima", locationAccent: "parada playera." },
  promotions: [
    { id: "combo-1", label: "COMBO 1 / POLLO ASADO", name: "Combo 1", description: "Pollo entero + papa grande + CC 1.5 lt", price: 23900, image: "assets/combo-1-sin-fondo.png", crop: null, visible: true, available: true },
    { id: "combo-2", label: "COMBO 2 / POLLO ASADO", name: "Combo 2", description: "\xBD pollo + papa mediana", price: 13900, image: "assets/platos-sin-fondo.png", crop: "565 170 465 380", visible: true, available: true },
    { id: "combo-3", label: "COMBO 3 / POLLO ASADO", name: "Combo 3", description: "\xBC de pollo + papas fritas", price: 6900, image: "assets/platos-sin-fondo.png", crop: "1040 170 496 380", visible: true, available: true },
    { id: "crispy", label: "01 / CRISPY", name: "Tutitos crispy", description: "5 tutitos crispy + papas fritas", price: 7900, image: "assets/platos-sin-fondo.png", crop: "0 565 515 390", visible: true, available: true },
    { id: "rebozados", label: "02 / REBOZADOS", name: "Tutitos rebozados", description: "6 tutitos asados + papas fritas", price: 6900, image: "assets/platos-sin-fondo.png", crop: "530 565 490 390", visible: true, available: true },
    { id: "filetitos", label: "03 / FILETITOS", name: "Filetitos de pollo", description: "6 filetitos + papas fritas", price: 6900, image: "assets/platos-sin-fondo.png", crop: "1045 565 491 390", visible: true, available: true }
  ],
  menu: [
    { id: "pollo", name: "Pollo", items: [{ id: "entero", name: "Pollo entero", price: 16900, visible: true, available: true }, { id: "medio", name: "\xBD pollo", price: 9900, visible: true, available: true }, { id: "cuarto", name: "\xBC pollo", price: 5900, visible: true, available: true }] },
    { id: "papas", name: "Papas fritas", items: [{ id: "chica", name: "Papa chica", price: 3500, visible: true, available: true }, { id: "mediana", name: "Papa mediana", price: 5500, visible: true, available: true }, { id: "grande", name: "Papa grande", price: 7500, visible: true, available: true }] },
    { id: "nuggets", name: "Nuggets", items: [{ id: "seis", name: "Nuggets \xD7 6", price: 3e3, visible: true, available: true }, { id: "doce", name: "Nuggets \xD7 12", price: 5e3, visible: true, available: true }, { id: "veinte", name: "Nuggets \xD7 20", price: 8e3, visible: true, available: true }] },
    { id: "salchipapas", name: "Salchipapas", items: [{ id: "chica", name: "Salchipapa chica", price: 4e3, visible: true, available: true }, { id: "mediana", name: "Salchipapa mediana", price: 6e3, visible: true, available: true }, { id: "grande", name: "Salchipapa grande", price: 8500, visible: true, available: true }] },
    { id: "empanadas", name: "Empanadas fritas", items: [{ id: "pollo", name: "Queso pollo choclo", price: 2700, visible: true, available: true }, { id: "champinon", name: "Queso champi\xF1\xF3n", price: 2500, visible: true, available: true }, { id: "napolitana", name: "Napolitana", price: 2500, visible: true, available: true }, { id: "queso", name: "Queso", price: 2500, visible: true, available: true }, { id: "camaron", name: "Queso camar\xF3n", price: 3600, visible: true, available: true }] },
    { id: "jugos", name: "Jugos naturales", items: [{ id: "agua", name: "Jugo en agua", price: 3e3, visible: true, available: true }, { id: "leche", name: "Jugo en leche", price: 3500, visible: true, available: true }] }
  ],
  flavors: ["Mango", "Frambuesa", "Durazno", "Mel\xF3n", "Pi\xF1a", "Frutilla", "Lim\xF3n", "Frutos del bosque"],
  images: { logo: "assets/1.PNG", hero: "assets/8.PNG", savory: "assets/pollo-savory-sin-fondo.png", icecream1: "assets/09A174EA-5D3D-463A-8479-89115A8CDD68.PNG", icecream2: "assets/959ED7FF-64EA-415B-8DD0-FEE0425EA964.PNG", map: "assets/3B40FF24-BAD5-4AFB-8466-F0CD05AB9723.JPG", grocery: "assets/banner-abarrotes-sin-vino.png", blueExpress: "assets/blue-express-logo.png" }
};

// content/schema.js
var MAX_IMAGE_BYTES = 15e5;
var MAX_DOCUMENT_BYTES = 18e4;
function text(value, label, max = 400, empty = false) {
  if (typeof value !== "string" || value.length > max || !empty && !value.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) throw new Error(`${label}: revisa el texto.`);
  return value.trim();
}
function bool(v, label) {
  if (typeof v !== "boolean") throw new Error(`${label}: valor inv\xE1lido.`);
  return v;
}
function price(v) {
  if (!Number.isSafeInteger(v) || v < 0 || v > 1e7) throw new Error("El precio debe ser un n\xFAmero entero entre 0 y 10.000.000.");
  return v;
}
function list(v, min, max, label) {
  if (!Array.isArray(v) || v.length < min || v.length > max) throw new Error(`${label}: cantidad inv\xE1lida.`);
  return v;
}
function id(v) {
  v = text(v, "Identificador", 70);
  if (!/^[a-z][a-z0-9-]*$/.test(v)) throw new Error("Identificador inv\xE1lido.");
  return v;
}
function unique(items) {
  if (new Set(items.map((i) => i.id)).size !== items.length) throw new Error("Hay identificadores repetidos.");
  return items;
}
function imageRef(value) {
  value = text(value, "Imagen", 250);
  if (/^media\/[0-9a-f-]{36}$/i.test(value)) return value;
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new Error("Ruta de imagen inv\xE1lida.");
  }
  if (!decoded.startsWith("assets/") || decoded.includes("..") || /[?#\\<>\u0000]/u.test(decoded) || !/\.(png|jpe?g|webp|gif|svg)$/i.test(decoded)) throw new Error("Usa una imagen subida desde el panel o una imagen de la web.");
  return value;
}
function validateDocument(input) {
  if (!input || input.schemaVersion !== 1) throw new Error("Formato de contenido no compatible.");
  const b = input.business, h = input.hero, t = input.texts;
  if (!b || !h || !t || !input.images) throw new Error("Faltan datos del sitio.");
  const business = {};
  for (const [key, max] of Object.entries({ name: 100, address: 180, area: 160, locationDescription: 400, hoursDays: 120, seasonNote: 180, visitTitle: 150, visitAccent: 150, instagramHeading: 180, instagramDescription: 400 })) business[key] = text(b[key], key, max, key === "seasonNote");
  for (const key of ["opens", "closes"]) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b[key])) throw new Error("Revisa las horas de apertura y cierre.");
    business[key] = b[key];
  }
  business.instagram = text(b.instagram, "Usuario de Instagram", 40);
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(business.instagram)) throw new Error("Escribe el usuario de Instagram sin @.");
  business.whatsapp = text(b.whatsapp, "Enlace de WhatsApp", 250);
  const wa = new URL(business.whatsapp);
  if (wa.protocol !== "https:" || wa.hostname !== "wa.me" || wa.username || wa.password || wa.port || !/^\/(message\/[a-zA-Z0-9]+|\d{8,16})\/?$/.test(wa.pathname)) throw new Error("El enlace debe ser de WhatsApp: https://wa.me/...");
  const hero = {};
  for (const key of ["line1", "accent1", "line2", "accent2", "button"]) hero[key] = text(h[key], "Portada: " + key, 120);
  hero.description = text(h.description, "Descripci\xF3n de portada", 650);
  const texts = {};
  for (const key of ["promotionsTitle", "promotionsAccent", "menuTitle", "menuAccent", "specialTitle", "specialAccent", "specialDescription", "specialDetails", "icecreamTitle", "icecreamAccent", "icecreamDescription", "groceryTitle", "groceryAccent", "groceryDescription", "locationTitle", "locationAccent"]) texts[key] = text(t[key], key, 900);
  const promotions = unique(list(input.promotions, 0, 30, "Promociones").map((p) => {
    const result2 = { id: id(p.id), name: text(p.name, "Nombre de promoci\xF3n", 100), label: text(p.label, "Etiqueta", 130), description: text(p.description, "Descripci\xF3n de promoci\xF3n", 450), price: price(p.price), visible: bool(p.visible, "Visibilidad"), available: bool(p.available, "Disponibilidad"), image: imageRef(p.image), crop: null };
    if (p.crop !== null) {
      if (typeof p.crop !== "string" || !/^\d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)?$/.test(p.crop) || p.crop.split(" ").some((n) => Number(n) > 4096) || p.crop.split(" ").slice(2).some((n) => Number(n) <= 0)) throw new Error("Encuadre de imagen inv\xE1lido.");
      result2.crop = p.crop;
    }
    return result2;
  }));
  const menu = unique(list(input.menu, 1, 16, "Categor\xEDas").map((c) => ({ id: id(c.id), name: text(c.name, "Categor\xEDa", 100), items: unique(list(c.items, 0, 50, "Productos").map((i) => ({ id: id(i.id), name: text(i.name, "Producto", 150), price: price(i.price), visible: bool(i.visible, "Visibilidad"), available: bool(i.available, "Disponibilidad") }))) })));
  if (!menu.some((c) => c.id === "jugos" && c.items.length >= 2)) throw new Error("Conserva la categor\xEDa Jugos y sus dos precios (agua y leche).");
  const flavors = list(input.flavors, 8, 8, "Sabores").map((v) => text(v, "Sabor", 60));
  const images = {};
  for (const key of ["logo", "hero", "savory", "icecream1", "icecream2", "map", "grocery", "blueExpress"]) images[key] = imageRef(input.images[key]);
  const result = { schemaVersion: 1, business, hero, texts, promotions, menu, flavors, images };
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength > MAX_DOCUMENT_BYTES) throw new Error("El contenido excede el tama\xF1o permitido.");
  return result;
}

// cms/auth.mjs
var cache = /* @__PURE__ */ new Map();
var decoder = new TextDecoder();
function decode64(s) {
  if (typeof s !== "string" || !/^[A-Za-z0-9_-]+$/.test(s)) throw new Error("Sesi\xF3n inv\xE1lida.");
  return Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - s.length % 4) % 4)), (c) => c.charCodeAt(0));
}
function accessIssuer(team) {
  if (typeof team !== "string") throw new Error("Falta configurar el acceso privado.");
  const url = new URL(team.startsWith("https://") ? team : "https://" + team);
  if (url.protocol !== "https:" || !/^[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/.test(url.hostname) || url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/") throw new Error("Configuraci\xF3n de acceso inv\xE1lida.");
  return url.origin;
}
async function remoteKeys(issuer, refresh = false) {
  const hit = cache.get(issuer);
  if (!refresh && hit && hit.until > Date.now()) return hit.keys;
  const response = await fetch(issuer + "/cdn-cgi/access/certs", { redirect: "error", signal: AbortSignal.timeout(7e3) });
  if (!response.ok) throw new Error("No se pudo verificar la sesi\xF3n.");
  const json2 = await response.json();
  if (!Array.isArray(json2.keys) || json2.keys.length > 20) throw new Error("No se pudo verificar la sesi\xF3n.");
  cache.set(issuer, { keys: json2.keys, until: Date.now() + 6e5 });
  return json2.keys;
}
async function authenticate(request, env, loadKeys = remoteKeys) {
  const issuer = accessIssuer(env.ACCESS_TEAM_DOMAIN);
  if (typeof env.ACCESS_AUD !== "string" || !env.ACCESS_AUD.trim() || typeof env.ADMIN_EMAILS !== "string" || !env.ADMIN_EMAILS.trim()) throw new Error("Falta configurar el acceso privado.");
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || token.length > 16e3) throw new Error("Inicia sesi\xF3n con tu correo autorizado.");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Sesi\xF3n inv\xE1lida.");
  const head = JSON.parse(decoder.decode(decode64(parts[0]))), claims = JSON.parse(decoder.decode(decode64(parts[1])));
  if (head.alg !== "RS256" || typeof head.kid !== "string" || head.kid.length > 200) throw new Error("Sesi\xF3n inv\xE1lida.");
  let keys = await loadKeys(issuer), key = keys.find((k) => k.kid === head.kid && k.kty === "RSA");
  if (!key) {
    keys = await loadKeys(issuer, true);
    key = keys.find((k) => k.kid === head.kid && k.kty === "RSA");
  }
  if (!key) throw new Error("Sesi\xF3n inv\xE1lida.");
  const cryptoKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, decode64(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]))) throw new Error("Sesi\xF3n inv\xE1lida.");
  const now = Math.floor(Date.now() / 1e3), aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== issuer || !aud.includes(env.ACCESS_AUD) || !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60 || claims.nbf !== void 0 && (!Number.isFinite(claims.nbf) || claims.nbf > now + 60)) throw new Error("Tu sesi\xF3n venci\xF3. Vuelve a iniciar sesi\xF3n.");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const allowed = env.ADMIN_EMAILS.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(email)) throw new Error("Este correo no tiene permiso para administrar la web.");
  return { email };
}

// cms/worker.mjs
var schema = [
  "CREATE TABLE IF NOT EXISTS site_content (id INTEGER PRIMARY KEY CHECK(id=1),document TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS content_history (revision INTEGER PRIMARY KEY,document TEXT NOT NULL,updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY,mime TEXT NOT NULL,bytes BLOB NOT NULL,size INTEGER NOT NULL CHECK(size>0 AND size<=1500000),created_at TEXT NOT NULL)"
];
var security = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY" };
var csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://elpolloplayero.cl https://www.elpolloplayero.cl blob: data:; connect-src 'self'; frame-src https://elpolloplayero.cl; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
var json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...security, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });
async function readLimited(request, max) {
  if (Number(request.headers.get("Content-Length")) > max) throw new HttpError(413, "El archivo es demasiado grande.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  let chunks = [], size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new HttpError(413, "El archivo es demasiado grande.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}
function imageMime(bytes) {
  const ascii = (a, b) => String.fromCharCode(...bytes.slice(a, b));
  if (bytes.length < 12) return null;
  if (bytes[0] === 137 && ascii(1, 4) === "PNG" && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (["GIF87a", "GIF89a"].includes(ascii(0, 6))) return "image/gif";
  return null;
}
function originHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  const primary = new URL(env.SITE_ORIGIN || "https://elpolloplayero.cl").origin;
  const allowed = /* @__PURE__ */ new Set([primary, primary.replace("://", "://www.")]);
  return allowed.has(origin) ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" } : {};
}
function mutationOrigin(request) {
  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) throw new HttpError(403, "La publicaci\xF3n debe realizarse desde el panel.");
}
function createWorker({ assets = {}, loadKeys = void 0 } = {}) {
  const initialized = /* @__PURE__ */ new WeakSet();
  async function init(db) {
    if (!db) throw new HttpError(503, "El almacenamiento del panel a\xFAn no est\xE1 configurado.");
    if (initialized.has(db)) return;
    await db.batch(schema.map((s) => db.prepare(s)));
    await db.prepare("INSERT OR IGNORE INTO site_content(id,document,revision,updated_at) VALUES(1,?,1,?)").bind(JSON.stringify(validateDocument(default_default)), (/* @__PURE__ */ new Date()).toISOString()).run();
    initialized.add(db);
  }
  async function read(db) {
    const row = await db.prepare("SELECT document,revision,updated_at FROM site_content WHERE id=1").first();
    return { document: JSON.parse(row.document), revision: row.revision, updatedAt: row.updated_at };
  }
  return { async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname;
    try {
      if (path === "/health") return json({ ok: true });
      if (path === "/api/content") {
        const cors = originHeaders(request, env);
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...security, ...cors, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
        if (request.method !== "GET") throw new HttpError(405, "M\xE9todo no permitido.");
        await init(env.DB);
        return json(await read(env.DB), 200, cors);
      }
      if (path.startsWith("/media/")) {
        if (request.method !== "GET" && request.method !== "HEAD") throw new HttpError(405, "M\xE9todo no permitido.");
        const id2 = path.slice(7);
        if (!/^[0-9a-f-]{36}$/i.test(id2)) throw new HttpError(404, "Imagen no encontrada.");
        await init(env.DB);
        const row = await env.DB.prepare("SELECT bytes,mime,size FROM media WHERE id=?").bind(id2).first();
        if (!row) throw new HttpError(404, "Imagen no encontrada.");
        const bytes = Array.isArray(row.bytes) ? Uint8Array.from(row.bytes) : row.bytes instanceof ArrayBuffer ? new Uint8Array(row.bytes) : ArrayBuffer.isView(row.bytes) ? new Uint8Array(row.bytes.buffer, row.bytes.byteOffset, row.bytes.byteLength) : null;
        if (!bytes) throw new HttpError(500, "No se pudo leer la imagen.");
        return new Response(request.method === "HEAD" ? null : bytes, { headers: { ...security, "Content-Type": row.mime, "Content-Length": String(bytes.byteLength), "Cache-Control": "public, max-age=31536000, immutable", "Content-Security-Policy": "default-src 'none'; sandbox", ...originHeaders(request, env) } });
      }
      if (path === "/") return Response.redirect(url.origin + "/admin/", 302);
      if (path === "/admin" || path.startsWith("/admin/")) {
        let identity;
        try {
          identity = await authenticate(request, env, loadKeys);
        } catch {
          throw new HttpError(401, "Inicia sesi\xF3n con tu correo autorizado. Si a\xFAn no aparece el inicio de sesi\xF3n, falta activar el acceso privado en Cloudflare.");
        }
        if (!path.startsWith("/admin/api/")) {
          if (request.method !== "GET") throw new HttpError(405, "M\xE9todo no permitido.");
          const key = path === "/admin" || path === "/admin/" ? "/admin/index.html" : path;
          const asset = assets[key];
          if (!asset) throw new HttpError(404, "P\xE1gina no encontrada.");
          return new Response(asset.body, { headers: { ...security, "Content-Type": asset.type, "Cache-Control": "no-store", "Content-Security-Policy": csp } });
        }
        await init(env.DB);
        if (path === "/admin/api/session" && request.method === "GET") return json({ email: identity.email, siteOrigin: new URL(env.SITE_ORIGIN || "https://elpolloplayero.cl").origin });
        if (path === "/admin/api/content") {
          if (request.method === "GET") return json(await read(env.DB));
          if (request.method !== "PUT") throw new HttpError(405, "M\xE9todo no permitido.");
          mutationOrigin(request);
          if (!request.headers.get("Content-Type")?.startsWith("application/json")) throw new HttpError(415, "Se esperaba contenido JSON.");
          let payload;
          try {
            payload = JSON.parse(new TextDecoder().decode(await readLimited(request, MAX_DOCUMENT_BYTES + 5e3)));
          } catch (e) {
            if (e instanceof HttpError) throw e;
            throw new HttpError(400, "El contenido no tiene un formato v\xE1lido.");
          }
          if (!Number.isSafeInteger(payload.revision) || payload.revision < 1) throw new HttpError(400, "Versi\xF3n inv\xE1lida.");
          let doc;
          try {
            doc = validateDocument(payload.document);
          } catch (e) {
            throw new HttpError(400, e.message);
          }
          const refs = new Set([...Object.values(doc.images), ...doc.promotions.map((p) => p.image)].filter((r) => r.startsWith("media/")));
          for (const ref of refs) if (!await env.DB.prepare("SELECT id FROM media WHERE id=?").bind(ref.slice(6)).first()) throw new HttpError(400, "Una imagen no est\xE1 disponible. Vuelve a subirla.");
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const results = await env.DB.batch([
            env.DB.prepare("INSERT OR IGNORE INTO content_history(revision,document,updated_at) SELECT revision,document,updated_at FROM site_content WHERE id=1 AND revision=?").bind(payload.revision),
            env.DB.prepare("UPDATE site_content SET document=?,revision=revision+1,updated_at=? WHERE id=1 AND revision=? RETURNING revision").bind(JSON.stringify(doc), now, payload.revision),
            env.DB.prepare("DELETE FROM content_history WHERE revision < (SELECT revision-20 FROM site_content WHERE id=1)")
          ]);
          if (!results[1].results?.length) throw new HttpError(409, "Hay cambios publicados desde otra sesi\xF3n. Descarga una copia de tus cambios y vuelve a cargar la \xFAltima versi\xF3n antes de publicar.");
          return json({ document: doc, revision: results[1].results[0].revision, updatedAt: now });
        }
        if (path === "/admin/api/media" && request.method === "POST") {
          mutationOrigin(request);
          const bytes = await readLimited(request, MAX_IMAGE_BYTES), mime = imageMime(bytes);
          if (!mime || mime !== request.headers.get("Content-Type")?.split(";")[0]) throw new HttpError(415, "Sube una imagen JPG, PNG, WebP o GIF v\xE1lida.");
          const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM media").first();
          if (count.count >= 300) throw new HttpError(409, "La biblioteca lleg\xF3 a 300 im\xE1genes. Contacta al administrador t\xE9cnico para liberar espacio.");
          const id2 = crypto.randomUUID();
          await env.DB.prepare("INSERT INTO media(id,mime,bytes,size,created_at) VALUES(?,?,?,?,?)").bind(id2, mime, bytes, bytes.length, (/* @__PURE__ */ new Date()).toISOString()).run();
          return json({ ref: "media/" + id2 }, 201);
        }
        throw new HttpError(404, "Acci\xF3n no encontrada.");
      }
      throw new HttpError(404, "P\xE1gina no encontrada.");
    } catch (e) {
      return json({ error: e instanceof HttpError ? e.message : "No se pudo completar la operaci\xF3n. Int\xE9ntalo nuevamente." }, e instanceof HttpError ? e.status : 500);
    }
  } };
}

// cms/generated-assets.mjs
var generated_assets_default = { "/admin/index.html": { "body": '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Administraci\xF3n \xB7 El Pollo Playero</title><link rel="stylesheet" href="/admin/admin.css"></head>\n<body><header class="topbar"><div class="brand"><span class="logo" aria-hidden="true"></span><div><strong>EL POLLO PLAYERO</strong><span>Administraci\xF3n</span></div></div><div class="account"><span id="account-email">Verificando acceso\u2026</span><a href="/cdn-cgi/access/logout">Salir</a></div></header>\n<main><section class="welcome"><div><p class="eyebrow">TU NEGOCIO, AL D\xCDA</p><h1>Administra tu p\xE1gina.</h1><p>Cambia lo que necesites. Revisa la vista previa y publica cuando est\xE9 listo.</p></div><a class="outline" id="view-site" href="https://elpolloplayero.cl" target="_blank" rel="noopener">Ver la web \u2197</a></section>\n<div id="loading" role="status">Cargando los datos de tu p\xE1gina\u2026</div><div id="fatal" class="notice error" role="alert" hidden></div>\n<div id="editor" hidden><nav class="tabs" aria-label="Secciones del panel"><button type="button" data-tab="menu" aria-current="page">Men\xFA</button><button type="button" data-tab="promotions">Promociones</button><button type="button" data-tab="images">Im\xE1genes</button><button type="button" data-tab="business">Textos y horarios</button></nav>\n<form id="content-form"><section id="tab-menu" class="tab-panel"></section><section id="tab-promotions" class="tab-panel" hidden></section><section id="tab-images" class="tab-panel" hidden></section><section id="tab-business" class="tab-panel" hidden></section></form>\n<div class="savebar"><div><strong id="save-state">Todo est\xE1 publicado</strong><span id="last-saved"></span></div><div class="save-actions"><button type="button" id="export" class="quiet">Descargar copia</button><button type="button" id="discard" class="quiet" disabled>Descartar cambios</button><button type="button" id="preview" class="outline">Vista previa \u2197</button><button type="button" id="publish" class="primary" disabled>Guardar y publicar</button></div></div><div id="message" class="notice" role="status" aria-live="polite" hidden></div></div>\n</main><script type="module" src="/admin/admin.js"><\/script></body></html>\n', "type": "text/html; charset=utf-8" }, "/admin/admin.css": { "body": ":root{color-scheme:dark;--bg:#080808;--card:#151515;--line:#34342e;--text:#fff6dc;--muted:#c7c3b5;--yellow:#ffe500;--red:#ef6363}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,sans-serif}button,input,textarea,select{font:inherit}button,a,input,textarea{touch-action:manipulation}a{color:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:default}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}[hidden]{display:none!important}.topbar{border-bottom:1px solid var(--line);padding:20px max(24px,calc((100vw - 1240px)/2));display:flex;justify-content:space-between;align-items:center;gap:20px}.brand{display:flex;align-items:center;gap:13px}.brand strong{display:block;font-size:15px;letter-spacing:.5px}.brand span:not(.logo){display:block;color:var(--muted);font-size:12px}.logo{display:block;width:52px;height:52px;flex-shrink:0;border-radius:50%;background:url('https://elpolloplayero.cl/assets/1.PNG') 12.794% 1.248%/473.684% 592.105%}.account{display:flex;gap:18px;align-items:center;font-size:12px;color:var(--muted)}main{max-width:1240px;margin:auto;padding:30px 24px 170px}.welcome{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:800;color:var(--yellow);margin:0 0 12px}h1{font-size:clamp(29px,4vw,43px);line-height:1.1;margin:0 0 12px;letter-spacing:-1.5px}.welcome p:not(.eyebrow){color:var(--muted);margin:0;max-width:650px}.primary,.outline,.quiet,.small-button{border-radius:9px;padding:12px 17px;border:1px solid var(--line);text-decoration:none;display:inline-flex;justify-content:center;align-items:center;font-weight:700;gap:8px;background:transparent;color:var(--text)}.primary{background:var(--yellow);border-color:var(--yellow);color:#080808}.outline{border-color:#6b6b56}.quiet{border:0;padding-left:10px;padding-right:10px;font-size:13px}.small-button{padding:8px 12px;font-size:12px}.tabs{display:flex;gap:8px;overflow-x:auto;padding:8px 0 18px;margin-bottom:20px}.tabs button{border:1px solid var(--line);border-radius:30px;padding:11px 21px;background:transparent;color:var(--muted);white-space:nowrap;font-weight:700}.tabs button[aria-current]{background:var(--yellow);border-color:var(--yellow);color:#080808}.section-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}.section-top h2{font-size:25px;letter-spacing:-.6px;margin:0}.help{color:var(--muted);font-size:13px;max-width:780px;margin:6px 0 20px}.cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{padding:24px;border:1px solid var(--line);background:var(--card);border-radius:16px;min-width:0}.card h3{font-size:20px;color:var(--yellow);margin:0 0 19px}.field{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;min-width:0}.field>span{font-size:13px;font-weight:650}.field small,.hint{font-size:12px;color:var(--muted)}input:not([type=checkbox]):not([type=file]),textarea{width:100%;border:1px solid #4b4b41;background:#0b0b0b;color:var(--text);border-radius:8px;padding:11px 12px;min-width:0}input[type=number]{font-variant-numeric:tabular-nums}textarea{resize:vertical;min-height:90px}input[type=file]{max-width:100%;font-size:12px}input[type=checkbox]{width:19px;height:19px;accent-color:var(--yellow);flex-shrink:0}.checks{display:flex;flex-wrap:wrap;gap:12px 20px;margin:10px 0 15px}.check{display:flex;align-items:center;gap:7px;font-size:12px}.product{padding:16px 0;border-top:1px solid var(--line)}.product-line{display:grid;grid-template-columns:minmax(0,1fr) 118px;gap:12px}.product .field{margin-bottom:5px}.product .checks{margin-bottom:2px}.remove{margin-left:auto;border:0;background:transparent;color:#eea4a4;font-size:12px;padding:4px}.image-box{height:185px;background:#090909;border:1px dashed #525245;border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:15px}.image-box img,.image-box svg{display:block;max-width:100%;height:100%;object-fit:contain}.image-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.image-actions .small-button{position:relative;overflow:hidden;cursor:pointer}.image-actions input[type=file]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}.savebar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:#161612f5;backdrop-filter:blur(12px);border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px max(24px,calc((100vw - 1240px)/2))}.savebar strong{font-size:13px;display:block}.savebar span{font-size:11px;color:var(--muted);display:block;margin-top:4px}.save-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.notice{padding:15px 18px;border:1px solid #557651;border-radius:10px;background:#142113;margin:18px 0}.notice.error{border-color:#9c4848;background:#2e1515}#message{position:fixed;bottom:110px;left:24px;right:24px;z-index:22;max-width:900px;margin:0 auto;box-shadow:0 10px 35px #0008}.wide{grid-column:1/-1}.time-fields{max-width:460px}.saved-label{color:#b5d9a5}@media(max-width:760px){.topbar{padding:15px 18px;align-items:flex-start}.brand strong{font-size:12px}.logo{width:42px;height:42px}.account{flex-direction:column;align-items:flex-end;gap:4px;max-width:48%;overflow-wrap:anywhere;font-size:10px}main{padding:24px 18px 240px}.welcome{align-items:flex-start}.welcome>.outline{font-size:11px;padding:9px;white-space:nowrap}.welcome p:not(.eyebrow){font-size:13px}.cards-grid{grid-template-columns:1fr}.card{padding:18px}.savebar{padding:13px 18px;flex-direction:column;align-items:stretch;gap:10px}.save-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.save-actions .quiet{font-size:11px;padding:7px 2px}.save-actions .primary,.save-actions .outline{font-size:12px;padding:12px 8px}.savebar>div:first-child{display:flex;justify-content:space-between;gap:10px}.savebar span{font-size:10px;margin-top:0;text-align:right}#message{bottom:165px;font-size:13px}.tabs button{padding:10px 15px;font-size:13px}.cols{grid-template-columns:1fr}.product-line{grid-template-columns:minmax(0,1fr) 105px}}\n\n.image-box .logo{width:140px;height:140px}\n", "type": "text/css; charset=utf-8" }, "/admin/admin.js": { "body": "import {validateDocument,imageURL,money,MAX_IMAGE_BYTES} from './schema.js';\nlet saved=null,draft=null,revision=0,dirty=false,busy=0,siteOrigin='https://elpolloplayero.cl',currentTab='menu',previewWindow=null;\nconst $=s=>document.querySelector(s),clone=v=>structuredClone(v);\nfunction el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}\nfunction tell(message,error=false){const box=$('#message');box.textContent=message;box.classList.toggle('error',error);box.hidden=false;}\nfunction changed(){dirty=true;updateState();}\nfunction updateState(){const disabled=busy>0;document.querySelectorAll('#content-form input,#content-form textarea,#content-form button').forEach(n=>n.disabled=disabled);$('#publish').disabled=disabled||!dirty;$('#discard').disabled=disabled||!dirty;$('#preview').disabled=disabled;$('#save-state').textContent=disabled?'Trabajando\u2026':dirty?'Tienes cambios sin publicar':'Todo est\xE1 publicado';$('#publish').textContent=disabled?'Procesando\u2026':'Guardar y publicar';}\nasync function api(path,options={}){let response;try{response=await fetch('/admin/api/'+path,{...options,cache:'no-store',redirect:'error'})}catch{throw new Error('No se pudo conectar. Comprueba tu conexi\xF3n; si tu sesi\xF3n venci\xF3, descarga una copia de los cambios y vuelve a entrar.')}let data;try{data=await response.json()}catch{throw new Error('Tu sesi\xF3n puede haber vencido. Descarga una copia de tus cambios y vuelve a entrar.')}if(!response.ok)throw new Error(data.error||'No se pudo completar la operaci\xF3n.');return data;}\nfunction field(parent,label,value,set,{type='text',max=400,hint,required=true}={}){const wrapper=el('label','field');wrapper.append(el('span',null,label));const input=el(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.value=value;if(['text','textarea','url'].includes(type))input.maxLength=max;input.required=required;if(type==='number'){input.min=0;input.max=10000000;input.step=1;}input.addEventListener('input',()=>{set(type==='number'?input.valueAsNumber:input.value);changed()});wrapper.append(input);if(hint)wrapper.append(el('small',null,hint));parent.append(wrapper);return input;}\nfunction check(parent,label,value,set){const wrapper=el('label','check'),input=el('input');input.type='checkbox';input.checked=value;input.addEventListener('change',()=>{set(input.checked);changed()});wrapper.append(input,document.createTextNode(label));parent.append(wrapper);}\nfunction button(label,action,cls='small-button'){const b=el('button',cls,label);b.type='button';b.addEventListener('click',action);return b;}\nfunction top(parent,title,help){const head=el('div','section-top');head.append(el('h2',null,title));parent.append(head);if(help)parent.append(el('p','help',help));return head;}\nfunction switchTab(tab){currentTab=tab;for(const b of document.querySelectorAll('[data-tab]')){if(b.dataset.tab===tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}for(const p of document.querySelectorAll('.tab-panel'))p.hidden=p.id!=='tab-'+tab;}\nfunction uid(prefix){return prefix+'-'+crypto.randomUUID().slice(0,8);}\nfunction showImage(box,ref,crop=null){box.replaceChildren();const src=imageURL(ref,location.origin,siteOrigin+'/');if(crop){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),img=document.createElementNS(ns,'image');svg.setAttribute('viewBox',crop);img.setAttribute('href',src);img.setAttribute('width','1536');img.setAttribute('height','1024');svg.append(img);box.append(svg)}else{const img=el('img');img.src=src;img.alt='Imagen actual';box.append(img)}}\nasync function prepareImage(file){if(!file||!/^image\\/(png|jpeg|webp|gif)$/.test(file.type))throw new Error('Elige una imagen JPG, PNG, WebP o GIF.');if(file.size>15000000)throw new Error('La imagen original debe pesar menos de 15 MB.');const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);for(const quality of [.9,.8,.65,.5]){const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',quality));if(blob&&blob.size<=MAX_IMAGE_BYTES)return blob;}throw new Error('La imagen sigue siendo demasiado grande. Elige una imagen m\xE1s peque\xF1a.');}finally{bitmap.close()}}\nfunction imageEditor(parent,ref,crop,onChange,{logo=false}={}){const box=el('div','image-box');if(logo&&ref==='assets/1.PNG')box.append(el('span','logo'));else showImage(box,ref,crop);parent.append(box);const actions=el('div','image-actions'),label=el('label','small-button','Cambiar imagen'),input=el('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';input.setAttribute('aria-label','Subir imagen');label.append(input);actions.append(label);const status=el('span','hint','');actions.append(status);parent.append(actions);input.addEventListener('change',async()=>{if(!input.files[0])return;busy++;updateState();input.disabled=true;status.textContent='Preparando imagen\u2026';try{const blob=await prepareImage(input.files[0]);status.textContent='Subiendo imagen\u2026';const result=await api('media',{method:'POST',headers:{'Content-Type':blob.type},body:blob});onChange(result.ref);showImage(box,result.ref);changed();status.textContent='Lista para publicar';}catch(e){tell(e.message,true);status.textContent='No se subi\xF3 la imagen';}finally{busy--;updateState();input.disabled=false;input.value='';}});}\nfunction renderMenu(){const target=$('#tab-menu');target.replaceChildren();top(target,'Men\xFA y precios','Los precios se ingresan en pesos chilenos, sin puntos ni s\xEDmbolo $. Puedes ocultar un producto o marcarlo como agotado.');const grid=el('div','cards-grid');for(const category of draft.menu){const card=el('section','card');field(card,'Categor\xEDa',category.name,v=>category.name=v,{max:100});for(const item of category.items){const row=el('div','product'),line=el('div','product-line');field(line,'Producto',item.name,v=>item.name=v,{max:150});field(line,'Precio ($)',item.price,v=>item.price=v,{type:'number'});row.append(line);const checks=el('div','checks');check(checks,'Mostrar',item.visible,v=>item.visible=v);check(checks,'Disponible',item.available,v=>item.available=v);row.append(checks);card.append(row);}card.append(button('+ Agregar producto',()=>{if(category.items.length>=50)return tell('Esta categor\xEDa admite hasta 50 productos.',true);category.items.push({id:uid('producto'),name:'Nuevo producto',price:0,visible:true,available:true});changed();renderMenu()}));grid.append(card)}const flavors=el('section','card wide');flavors.append(el('h3',null,'Sabores de jugos'));const cols=el('div','cols');draft.flavors.forEach((flavor,i)=>field(cols,'Sabor '+(i+1),flavor,v=>draft.flavors[i]=v,{max:60}));flavors.append(cols);grid.append(flavors);target.append(grid);}\nfunction renderPromotions(){const target=$('#tab-promotions');target.replaceChildren();const head=top(target,'Promociones','Actualiza el precio, la descripci\xF3n y la foto de cada promoci\xF3n.');head.append(button('+ Agregar promoci\xF3n',()=>{if(draft.promotions.length>=30)return tell('El panel admite hasta 30 promociones.',true);draft.promotions.push({id:uid('promo'),name:'Nueva promoci\xF3n',label:'PROMOCI\xD3N',description:'Describe lo que incluye.',price:0,visible:true,available:true,image:'assets/combo-1-sin-fondo.png',crop:null});changed();renderPromotions()}));const grid=el('div','cards-grid');for(const promo of draft.promotions){const card=el('section','card');imageEditor(card,promo.image,promo.crop,v=>{promo.image=v;promo.crop=null});field(card,'Nombre',promo.name,v=>promo.name=v,{max:100});field(card,'Etiqueta',promo.label,v=>promo.label=v,{max:130});field(card,'Descripci\xF3n',promo.description,v=>promo.description=v,{type:'textarea',max:450});field(card,'Precio ($)',promo.price,v=>promo.price=v,{type:'number'});const checks=el('div','checks');check(checks,'Mostrar promoci\xF3n',promo.visible,v=>promo.visible=v);check(checks,'Disponible',promo.available,v=>promo.available=v);card.append(checks);grid.append(card)}target.append(grid);}\nconst imageLabels={logo:['Logo del local','La nueva imagen reemplazar\xE1 los logos peque\xF1os de la p\xE1gina.'],hero:['Afiche de portada','Los precios o textos impresos dentro de una imagen se cambian reemplazando esa imagen. Si cambia el precio del Combo 1, revisa tambi\xE9n este afiche.'],savory:['Pollo y Savory','Para mantener el recorte, sube una imagen con fondo transparente.'],icecream1:['Carta de helados individuales','Reemplaza la carta completa cuando cambien sus productos.'],icecream2:['Carta de helados familiares','Reemplaza la carta completa cuando cambien sus productos.'],map:['Mapa de referencia','Se ver\xE1 peque\xF1o en la web y podr\xE1 ampliarse.'],grocery:['Banner de abarrotes','La imagen nueva reemplazar\xE1 la composici\xF3n completa de productos.'],blueExpress:['Logo de Blue Express','Conserva una imagen n\xEDtida y con fondo transparente.']};\nfunction renderImages(){const target=$('#tab-images');target.replaceChildren();top(target,'Im\xE1genes del sitio','Las fotos se preparan antes de subirlas para mantener buena calidad y cargar r\xE1pido. Las im\xE1genes con transparencia conservan su fondo transparente.');const grid=el('div','cards-grid');for(const [key,[label,hint]]of Object.entries(imageLabels)){const card=el('section','card');card.append(el('h3',null,label));imageEditor(card,draft.images[key],null,v=>draft.images[key]=v,{logo:key==='logo'});card.append(el('p','hint',hint));grid.append(card)}target.append(grid);}\nfunction renderBusiness(){const target=$('#tab-business');target.replaceChildren();top(target,'Textos y datos del local','Edita los horarios, la direcci\xF3n, los enlaces y los mensajes que aparecen en la p\xE1gina.');const grid=el('div','cards-grid'),business=el('section','card');business.append(el('h3',null,'Datos del local'));const labels={name:'Nombre del negocio',address:'Direcci\xF3n',area:'Sector y comuna',locationDescription:'Texto de ubicaci\xF3n',hoursDays:'D\xEDas de atenci\xF3n',seasonNote:'Nota del horario',visitTitle:'T\xEDtulo de la invitaci\xF3n',visitAccent:'Parte del t\xEDtulo en amarillo',instagramHeading:'T\xEDtulo de Instagram',instagramDescription:'Descripci\xF3n de Instagram',instagram:'Usuario de Instagram (sin @)',whatsapp:'Enlace de WhatsApp'};for(const [key,label]of Object.entries(labels))field(business,label,draft.business[key],v=>draft.business[key]=v,{type:['locationDescription','instagramDescription'].includes(key)?'textarea':key==='whatsapp'?'url':'text',max: key==='name'?100:key==='address'?180:key==='area'?160:key==='instagram'?30:key==='whatsapp'?250:400,required:key!=='seasonNote'});const times=el('div','cols time-fields');field(times,'Apertura',draft.business.opens,v=>draft.business.opens=v,{type:'time'});field(times,'Cierre',draft.business.closes,v=>draft.business.closes=v,{type:'time'});business.append(times);grid.append(business);const copy=el('section','card');copy.append(el('h3',null,'Portada y mensajes'));const heroLabels={line1:'Portada: primera l\xEDnea',accent1:'Portada: primera parte amarilla',line2:'Portada: segunda l\xEDnea',accent2:'Portada: segunda parte amarilla',description:'Descripci\xF3n de portada',button:'Texto del bot\xF3n de portada'};for(const [key,label]of Object.entries(heroLabels))field(copy,label,draft.hero[key],v=>draft.hero[key]=v,{type:key==='description'?'textarea':'text',max:key==='description'?650:120});const textLabels={promotionsTitle:'Promociones: t\xEDtulo',promotionsAccent:'Promociones: parte amarilla',menuTitle:'Men\xFA: t\xEDtulo',menuAccent:'Men\xFA: parte amarilla',specialTitle:'Especialidad: t\xEDtulo',specialAccent:'Especialidad: parte amarilla',specialDescription:'Descripci\xF3n de la especialidad',specialDetails:'Opciones de pedido',icecreamTitle:'Helados: t\xEDtulo',icecreamAccent:'Helados: parte amarilla',icecreamDescription:'Descripci\xF3n de helados',groceryTitle:'Abarrotes: t\xEDtulo',groceryAccent:'Abarrotes: parte amarilla',groceryDescription:'Descripci\xF3n de abarrotes',locationTitle:'Ubicaci\xF3n: t\xEDtulo',locationAccent:'Ubicaci\xF3n: parte amarilla'};for(const [key,label]of Object.entries(textLabels))field(copy,label,draft.texts[key],v=>draft.texts[key]=v,{type:/Description|Details/.test(key)?'textarea':'text',max:900});grid.append(copy);target.append(grid);}\nfunction renderAll(){renderMenu();renderPromotions();renderImages();renderBusiness();switchTab(currentTab);updateState();}\nfunction setPublished(data){saved=clone(data.document);draft=clone(data.document);revision=data.revision;dirty=false;$('#last-saved').textContent='\xDAltima publicaci\xF3n: '+new Date(data.updatedAt).toLocaleString('es-CL',{timeZone:'America/Santiago',dateStyle:'short',timeStyle:'short'});}\nfor(const button of document.querySelectorAll('[data-tab]'))button.addEventListener('click',()=>switchTab(button.dataset.tab));\n$('#content-form').addEventListener('submit',e=>e.preventDefault());\n$('#discard').addEventListener('click',()=>{draft=clone(saved);dirty=false;$('#message').hidden=true;renderAll()});\n$('#export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({revision,document:draft},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='el-pollo-playero-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});\n$('#publish').addEventListener('click',async()=>{let document;try{document=validateDocument(draft)}catch(e){return tell(e.message,true)}busy++;updateState();try{const data=await api('content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,document})});setPublished(data);tell('Cambios publicados. Ya est\xE1n disponibles en tu p\xE1gina.');renderAll()}catch(e){tell(e.message,true)}finally{busy--;updateState()}});\n$('#preview').addEventListener('click',()=>{try{validateDocument(draft)}catch(e){return tell(e.message,true)}previewWindow=window.open(siteOrigin+'/?preview=panel','playero-preview');if(!previewWindow)tell('Permite abrir la vista previa en una nueva pesta\xF1a.',true)});\nwindow.addEventListener('message',e=>{if(e.origin===siteOrigin&&e.source===previewWindow&&e.data?.type==='playero-ready')e.source.postMessage({type:'playero-preview',document:clone(draft)},siteOrigin)});\nwindow.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});\ntry{const session=await api('session');siteOrigin=session.siteOrigin||siteOrigin;$('#account-email').textContent=session.email;$('#view-site').href=siteOrigin;const data=await api('content');setPublished(data);renderAll();$('#loading').hidden=true;$('#editor').hidden=false;}catch(e){$('#loading').hidden=true;$('#fatal').textContent=e.message;$('#fatal').hidden=false;$('#account-email').textContent='Acceso no disponible';}\n", "type": "application/javascript; charset=utf-8" }, "/admin/schema.js": { "body": "export const MAX_IMAGE_BYTES = 1500000;\nexport const MAX_DOCUMENT_BYTES = 180000;\nexport const money = n => '$' + Number(n).toLocaleString('es-CL');\n\nfunction text(value, label, max = 400, empty = false) {\n  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim()) || /[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f]/u.test(value)) throw new Error(`${label}: revisa el texto.`);\n  return value.trim();\n}\nfunction bool(v, label) { if (typeof v !== 'boolean') throw new Error(`${label}: valor inv\xE1lido.`); return v; }\nfunction price(v) { if (!Number.isSafeInteger(v) || v < 0 || v > 10000000) throw new Error('El precio debe ser un n\xFAmero entero entre 0 y 10.000.000.'); return v; }\nfunction list(v, min, max, label) { if (!Array.isArray(v) || v.length < min || v.length > max) throw new Error(`${label}: cantidad inv\xE1lida.`); return v; }\nfunction id(v) { v = text(v, 'Identificador', 70); if (!/^[a-z][a-z0-9-]*$/.test(v)) throw new Error('Identificador inv\xE1lido.'); return v; }\nfunction unique(items) { if (new Set(items.map(i => i.id)).size !== items.length) throw new Error('Hay identificadores repetidos.'); return items; }\nexport function imageRef(value) {\n  value = text(value, 'Imagen', 250);\n  if (/^media\\/[0-9a-f-]{36}$/i.test(value)) return value;\n  let decoded; try { decoded = decodeURIComponent(value); } catch { throw new Error('Ruta de imagen inv\xE1lida.'); }\n  if (!decoded.startsWith('assets/') || decoded.includes('..') || /[?#\\\\<>\\u0000]/u.test(decoded) || !/\\.(png|jpe?g|webp|gif|svg)$/i.test(decoded)) throw new Error('Usa una imagen subida desde el panel o una imagen de la web.');\n  return value;\n}\nexport function imageURL(ref, apiOrigin, siteBase = 'https://elpolloplayero.cl/') {\n  return new URL(imageRef(ref), ref.startsWith('media/') ? apiOrigin + '/' : siteBase).href;\n}\nexport function validateDocument(input) {\n  if (!input || input.schemaVersion !== 1) throw new Error('Formato de contenido no compatible.');\n  const b = input.business, h = input.hero, t = input.texts;\n  if (!b || !h || !t || !input.images) throw new Error('Faltan datos del sitio.');\n  const business = {};\n  for (const [key, max] of Object.entries({ name:100,address:180,area:160,locationDescription:400,hoursDays:120,seasonNote:180,visitTitle:150,visitAccent:150,instagramHeading:180,instagramDescription:400 })) business[key] = text(b[key], key, max, key === 'seasonNote');\n  for (const key of ['opens','closes']) { if (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(b[key])) throw new Error('Revisa las horas de apertura y cierre.'); business[key] = b[key]; }\n  business.instagram = text(b.instagram, 'Usuario de Instagram', 40);\n  if (!/^[a-zA-Z0-9._]{1,30}$/.test(business.instagram)) throw new Error('Escribe el usuario de Instagram sin @.');\n  business.whatsapp = text(b.whatsapp, 'Enlace de WhatsApp', 250);\n  const wa = new URL(business.whatsapp);\n  if (wa.protocol !== 'https:' || wa.hostname !== 'wa.me' || wa.username || wa.password || wa.port || !/^\\/(message\\/[a-zA-Z0-9]+|\\d{8,16})\\/?$/.test(wa.pathname)) throw new Error('El enlace debe ser de WhatsApp: https://wa.me/...');\n  const hero = {};\n  for (const key of ['line1','accent1','line2','accent2','button']) hero[key] = text(h[key], 'Portada: '+key, 120);\n  hero.description = text(h.description, 'Descripci\xF3n de portada', 650);\n  const texts = {};\n  for (const key of ['promotionsTitle','promotionsAccent','menuTitle','menuAccent','specialTitle','specialAccent','specialDescription','specialDetails','icecreamTitle','icecreamAccent','icecreamDescription','groceryTitle','groceryAccent','groceryDescription','locationTitle','locationAccent']) texts[key] = text(t[key], key, 900);\n  const promotions = unique(list(input.promotions, 0, 30, 'Promociones').map(p => {\n    const result = {id:id(p.id),name:text(p.name,'Nombre de promoci\xF3n',100),label:text(p.label,'Etiqueta',130),description:text(p.description,'Descripci\xF3n de promoci\xF3n',450),price:price(p.price),visible:bool(p.visible,'Visibilidad'),available:bool(p.available,'Disponibilidad'),image:imageRef(p.image),crop:null};\n    if (p.crop !== null) {\n      if (typeof p.crop !== 'string' || !/^\\d+(?:\\.\\d+)? \\d+(?:\\.\\d+)? \\d+(?:\\.\\d+)? \\d+(?:\\.\\d+)?$/.test(p.crop) || p.crop.split(' ').some(n=>Number(n)>4096) || p.crop.split(' ').slice(2).some(n=>Number(n)<=0)) throw new Error('Encuadre de imagen inv\xE1lido.');\n      result.crop=p.crop;\n    }\n    return result;\n  }));\n  const menu = unique(list(input.menu, 1, 16, 'Categor\xEDas').map(c=>({id:id(c.id),name:text(c.name,'Categor\xEDa',100),items:unique(list(c.items,0,50,'Productos').map(i=>({id:id(i.id),name:text(i.name,'Producto',150),price:price(i.price),visible:bool(i.visible,'Visibilidad'),available:bool(i.available,'Disponibilidad')})))})));\n  if (!menu.some(c=>c.id==='jugos' && c.items.length>=2)) throw new Error('Conserva la categor\xEDa Jugos y sus dos precios (agua y leche).');\n  const flavors=list(input.flavors,8,8,'Sabores').map(v=>text(v,'Sabor',60));\n  const images={};\n  for (const key of ['logo','hero','savory','icecream1','icecream2','map','grocery','blueExpress']) images[key]=imageRef(input.images[key]);\n  const result={schemaVersion:1,business,hero,texts,promotions,menu,flavors,images};\n  if (new TextEncoder().encode(JSON.stringify(result)).byteLength>MAX_DOCUMENT_BYTES) throw new Error('El contenido excede el tama\xF1o permitido.');\n  return result;\n}\n", "type": "application/javascript; charset=utf-8" } };

// cms/entry.mjs
var entry_default = createWorker({ assets: generated_assets_default });
export {
  entry_default as default
};

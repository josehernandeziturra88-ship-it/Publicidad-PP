const cache = new Map();
const decoder = new TextDecoder();
function decode64(s) {
  if (typeof s!=='string' || !/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('Sesión inválida.');
  return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
}
export function accessIssuer(team) {
  if (typeof team !== 'string') throw new Error('Falta configurar el acceso privado.');
  const url=new URL(team.startsWith('https://')?team:'https://'+team);
  if (url.protocol!=='https:' || !/^[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/.test(url.hostname) || url.username || url.password || url.port || url.search || url.hash || url.pathname!=='/') throw new Error('Configuración de acceso inválida.');
  return url.origin;
}
async function remoteKeys(issuer, refresh=false) {
  const hit=cache.get(issuer);if(!refresh && hit && hit.until>Date.now()) return hit.keys;
  const response=await fetch(issuer+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('No se pudo verificar la sesión.');
  const json=await response.json();if(!Array.isArray(json.keys)||json.keys.length>20)throw new Error('No se pudo verificar la sesión.');
  cache.set(issuer,{keys:json.keys,until:Date.now()+600000});return json.keys;
}
export async function authenticate(request,env,loadKeys=remoteKeys) {
  const issuer=accessIssuer(env.ACCESS_TEAM_DOMAIN);
  if(typeof env.ACCESS_AUD!=='string'||!env.ACCESS_AUD.trim()||typeof env.ADMIN_EMAILS!=='string'||!env.ADMIN_EMAILS.trim())throw new Error('Falta configurar el acceso privado.');
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token||token.length>16000)throw new Error('Inicia sesión con tu correo autorizado.');
  const parts=token.split('.');if(parts.length!==3)throw new Error('Sesión inválida.');
  const head=JSON.parse(decoder.decode(decode64(parts[0]))),claims=JSON.parse(decoder.decode(decode64(parts[1])));
  if(head.alg!=='RS256'||typeof head.kid!=='string'||head.kid.length>200)throw new Error('Sesión inválida.');
  let keys=await loadKeys(issuer),key=keys.find(k=>k.kid===head.kid&&k.kty==='RSA');
  if(!key){keys=await loadKeys(issuer,true);key=keys.find(k=>k.kid===head.kid&&k.kty==='RSA');}
  if(!key)throw new Error('Sesión inválida.');
  const cryptoKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cryptoKey,decode64(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw new Error('Sesión inválida.');
  const now=Math.floor(Date.now()/1000),aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(claims.iss!==issuer||!aud.includes(env.ACCESS_AUD)||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60||(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>now+60)))throw new Error('Tu sesión venció. Vuelve a iniciar sesión.');
  const email=typeof claims.email==='string'?claims.email.toLowerCase():'';
  const allowed=env.ADMIN_EMAILS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  if(!allowed.includes(email))throw new Error('Este correo no tiene permiso para administrar la web.');
  return {email};
}

const cache = new Map();
const decoder = new TextDecoder();
export class AccessError extends Error {
  constructor(code,message) { super(message);this.code=code; }
}
const fail=(code,message)=>{throw new AccessError(code,message)};
function decode64(s) {
  if (typeof s!=='string' || !/^[A-Za-z0-9_-]+$/.test(s)) fail('TOKEN_FORMAT','Sesión inválida.');
  return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
}
export function accessIssuer(team) {
  if (typeof team !== 'string' || !team.trim()) fail('CONFIG_TEAM','Revisa ACCESS_TEAM_DOMAIN en el Worker.');
  team=team.trim();
  let url;try{url=new URL(team.startsWith('https://')?team:'https://'+team)}catch{fail('CONFIG_TEAM','Revisa ACCESS_TEAM_DOMAIN en el Worker.')}
  if (url.protocol!=='https:' || !/^[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/.test(url.hostname) || url.username || url.password || url.port || url.search || url.hash || url.pathname!=='/') fail('CONFIG_TEAM','Revisa ACCESS_TEAM_DOMAIN en el Worker.');
  return url.origin;
}
async function remoteKeys(issuer, refresh=false) {
  const hit=cache.get(issuer);if(!refresh && hit && hit.until>Date.now()) return hit.keys;
  // Workers only supports follow/manual. Reject redirects through the status
  // check instead of passing the unsupported redirect:'error' option.
  const response=await fetch(issuer+'/cdn-cgi/access/certs',{redirect:'manual',signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('No se pudo verificar la sesión.');
  const json=await response.json();if(!Array.isArray(json.keys)||json.keys.length>20)throw new Error('No se pudo verificar la sesión.');
  cache.set(issuer,{keys:json.keys,until:Date.now()+600000});return json.keys;
}
export async function authenticate(request,env,loadKeys=remoteKeys) {
  const issuer=accessIssuer(env.ACCESS_TEAM_DOMAIN);
  if(typeof env.ACCESS_AUD!=='string'||!env.ACCESS_AUD.trim())fail('CONFIG_AUD','Falta configurar ACCESS_AUD en el Worker.');
  const expectedAudience=env.ACCESS_AUD.trim();
  const allowed=typeof env.ADMIN_EMAILS==='string'?env.ADMIN_EMAILS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean):[];
  if(!allowed.length)fail('CONFIG_EMAILS','Falta configurar ADMIN_EMAILS en el Worker.');
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token)fail('NO_ASSERTION','Cloudflare no envió la sesión. Revisa el dominio y la ruta admin de la aplicación Access.');
  if(token.length>16000)fail('TOKEN_FORMAT','Sesión inválida.');
  const parts=token.split('.');if(parts.length!==3)fail('TOKEN_FORMAT','Sesión inválida.');
  let head,claims;
  try{head=JSON.parse(decoder.decode(decode64(parts[0])));claims=JSON.parse(decoder.decode(decode64(parts[1])))}catch{fail('TOKEN_FORMAT','Sesión inválida.')}
  if(!head||!claims||typeof head!=='object'||typeof claims!=='object')fail('TOKEN_FORMAT','Sesión inválida.');
  if(head.alg!=='RS256'||typeof head.kid!=='string'||head.kid.length>200)fail('TOKEN_SIGNATURE','La firma de la sesión no es válida.');
  let key;
  try{
    let keys=await loadKeys(issuer);key=keys.find(k=>k.kid===head.kid&&k.kty==='RSA');
    if(!key){keys=await loadKeys(issuer,true);key=keys.find(k=>k.kid===head.kid&&k.kty==='RSA')}
  }catch{fail('KEYS_UNAVAILABLE','No se pudieron consultar las claves públicas del equipo. Revisa ACCESS_TEAM_DOMAIN.')}
  if(!key)fail('TOKEN_KEY','La sesión no corresponde a las claves del equipo. Revisa ACCESS_TEAM_DOMAIN.');
  let verified=false;
  try{
    const cryptoKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cryptoKey,decode64(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  }catch{fail('TOKEN_SIGNATURE','La firma de la sesión no es válida.')}
  if(!verified)fail('TOKEN_SIGNATURE','La firma de la sesión no es válida.');
  const now=Math.floor(Date.now()/1000),aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(claims.iss!==issuer)fail('ISSUER_MISMATCH','El equipo de la sesión no coincide con ACCESS_TEAM_DOMAIN.');
  if(!aud.includes(expectedAudience))fail('AUDIENCE_MISMATCH','El identificador de la aplicación no coincide con ACCESS_AUD.');
  if(!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60||(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>now+60)))fail('TOKEN_TIME','La sesión venció o todavía no es válida. Vuelve a iniciar sesión.');
  const email=typeof claims.email==='string'?claims.email.toLowerCase():'';
  if(!allowed.includes(email))fail('EMAIL_NOT_ALLOWED','El correo usado para ingresar no está autorizado en ADMIN_EMAILS.');
  return {email};
}

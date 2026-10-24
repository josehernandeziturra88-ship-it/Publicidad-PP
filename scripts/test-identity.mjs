const encoder=new TextEncoder();
const b64=bytes=>Buffer.from(bytes).toString('base64url');
export async function testIdentity(email='dueno@example.invalid'){
 const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const publicKey=await crypto.subtle.exportKey('jwk',keys.publicKey);publicKey.kid='local-test-key';
 async function token(overrides={},headerOverrides={}){const now=Math.floor(Date.now()/1000),header={alg:'RS256',kid:'local-test-key',...headerOverrides},payload={iss:'https://playero-local.cloudflareaccess.com',aud:['playero-local-audience'],iat:now,exp:now+3600,email,...overrides},unsigned=b64(JSON.stringify(header))+'.'+b64(JSON.stringify(payload));return unsigned+'.'+b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,encoder.encode(unsigned)));}
 return {email,publicKey,token,loadKeys:async()=>[publicKey],env:{ACCESS_TEAM_DOMAIN:'playero-local.cloudflareaccess.com',ACCESS_AUD:'playero-local-audience',ADMIN_EMAILS:email}};
}

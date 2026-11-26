import {newToken,tokenHash,validToken,createSession,getSessionUser,readSession,revokeSession,sessionCookie,clearSessionCookie,sameOriginJson} from './session.js';
const ttl=600;
const emailOf=v=>typeof v==='string'?v.trim().toLowerCase():'';
const validEmail=v=>v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const cleanName=v=>typeof v==='string'?v.trim().replace(/\s+/g,' '):'';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'};
const reply=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
const generic={message:'Si tu correo está autorizado, recibirás un enlace de acceso.'};
export function pilotReady(env){return env.AUTH_MODE==='pilot'&&!!env.AUTH_DB&&!!env.AUTH_ALLOWED_EMAILS&&!!env.RESEND_API_KEY&&!!env.MAIL_FROM&&/^https:\/\/[^/]+$/.test(env.AUTH_ORIGIN||'')}
const allowed=(env,email)=>String(env.AUTH_ALLOWED_EMAILS||'').split(',').map(emailOf).includes(email);
async function body(request){
 if(!sameOriginJson(request))return null;
 const reader=request.body?.getReader();if(!reader)return null;
 let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return null}chunks.push(value)}
 const all=new Uint8Array(size);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.byteLength}
 try{const obj=JSON.parse(new TextDecoder().decode(all));return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:null}catch{return null}
}
async function sendMail(env,email,link){
 const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject:'Tu acceso a Saber Común',text:'Abrí este enlace para ingresar a Saber Común. Vence en 10 minutos y se puede usar una sola vez. Si no lo solicitaste, ignorá este mensaje.\n\n'+link})});
 if(!result.ok)throw Error('Email delivery failed');
}
export function createAuth({mail=sendMail,clock=()=>Math.floor(Date.now()/1000)}={}){
 return async function auth(request,env){
 const url=new URL(request.url),path=url.pathname,enabled=pilotReady(env)&&url.origin===env.AUTH_ORIGIN;
 if(path==='/api/auth/config'&&request.method==='GET')return reply({enabled});
 if(!enabled)return reply({error:'Acceso de prueba deshabilitado'},403);
 const db=env.AUTH_DB,now=clock();
 try{
 if(path==='/api/auth/me'&&request.method==='GET'){
 const user=await getSessionUser(db,readSession(request),now);return user&&allowed(env,user.email)?reply({user}):reply({user:null},401);
 }
 if(request.method!=='POST')return reply({error:'Método no permitido'},405,{Allow:'POST'});
 const data=await body(request);if(!data)return reply({error:'Solicitud inválida'},400);
 if(path==='/api/auth/request'){
 const email=emailOf(data.email);if(!validEmail(email))return reply({error:'Correo inválido'},400);
 if(!allowed(env,email))return reply(generic,202);
 const token=newToken(),hash=await tokenHash(token);
 const result=await db.prepare('INSERT INTO auth_challenges(email,token_hash,expires_at,issued_at) VALUES (?,?,?,?) ON CONFLICT(email) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at,issued_at=excluded.issued_at,consumed=0 WHERE auth_challenges.issued_at<=?').bind(email,hash,now+ttl,now,now-90).run();
 if(result.meta.changes===1){try{await mail(env,email,env.AUTH_ORIGIN+'/#access='+token)}catch{return reply({error:'No se pudo enviar el enlace. Intentá más tarde.'},503)}}
 return reply(generic,202);
 }
 if(path==='/api/auth/redeem'){
 if(!validToken(data.token))return reply({error:'Enlace inválido o vencido'},400);
 const hash=await tokenHash(data.token);
 const row=await db.prepare('UPDATE auth_challenges SET consumed=1 WHERE token_hash=? AND expires_at>? AND consumed=0 RETURNING email').bind(hash,now).first();
 if(!row||!allowed(env,row.email))return reply({error:'Enlace inválido o vencido'},400);
 // Correo verificado por posesión del enlace. No almacenar contraseña.
 await db.prepare("INSERT INTO users(id,name,email,password_hash,teacher) VALUES (?,?,?,'passwordless',0) ON CONFLICT(email) DO NOTHING").bind(crypto.randomUUID(),'Nuevo usuario',row.email).run();
 const user=await db.prepare('SELECT id,name,email,teacher FROM users WHERE email=?').bind(row.email).first();
 if(!user)throw Error('Account missing');
 await revokeSession(db,readSession(request));
 const token=await createSession(db,user.id,now);
 return reply({user},200,{'Set-Cookie':sessionCookie(token)});
 }
 if(path==='/api/auth/logout'){await revokeSession(db,readSession(request));return reply({ok:true},200,{'Set-Cookie':clearSessionCookie()})}
 if(path==='/api/auth/profile'){
 const user=await getSessionUser(db,readSession(request),now);if(!user||!allowed(env,user.email))return reply({error:'Iniciá sesión'},401);
 const name=cleanName(data.name);if(name.length<2||name.length>80||typeof data.teacher!=='boolean'||/[\u0000-\u001f\u007f]/.test(name))return reply({error:'Nombre o rol inválido'},400);
 await db.prepare('UPDATE users SET name=?,teacher=? WHERE id=?').bind(name,Number(data.teacher),user.id).run();
 return reply({user:{...user,name,teacher:Number(data.teacher)}});
 }
 return reply({error:'No encontrado'},404);
 }catch{return reply({error:'No se pudo completar la operación'},503)}
 };
}
export default createAuth();

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {SESSION_COOKIE, SESSION_TTL, newToken, tokenHash, readSession, sessionCookie, clearSessionCookie, sameOriginJson, createSession, getSessionUser, revokeSession} from '../src/session.js';
const request = headers => new Request('https://example.test/api/auth', {method:'POST',headers});
function setup(){
 const sql=new DatabaseSync(':memory:');
 sql.exec("CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT,email TEXT,password_hash TEXT,teacher INTEGER); CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,user_id TEXT,expires_at INTEGER); INSERT INTO users VALUES ('u','Test','test@example.test','private',1);");
 const db={prepare:q=>({bind:(...args)=>({run:async()=>sql.prepare(q).run(...args),first:async()=>sql.prepare(q).get(...args)})})};
 return {sql,db};
}
test('tokens random and only digest stored',async()=>{const a=newToken(),b=newToken();assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);assert.notEqual(await tokenHash(a),a);assert.equal(await tokenHash(a),await tokenHash(a));await assert.rejects(tokenHash('bad'))});
test('cookie is protected and rejects duplicate and malformed values',()=>{const a=newToken(),cookie=sessionCookie(a);for(const part of ['Secure','HttpOnly','SameSite=Lax','Path=/','Max-Age='+SESSION_TTL])assert.ok(cookie.includes(part));assert.ok(!cookie.includes('Domain='));assert.equal(readSession(request({Cookie:cookie.split(';')[0]})),a);assert.equal(readSession(request({Cookie:SESSION_COOKIE+'='+a+'; '+SESSION_COOKIE+'='+a})),null);assert.equal(readSession(request({Cookie:SESSION_COOKIE+'=bad'})),null);assert.match(clearSessionCookie(),/Max-Age=0/)});
test('mutation guard rejects missing and foreign origin and non-JSON',()=>{assert.equal(sameOriginJson(request({Origin:'https://example.test','Content-Type':'application/json; charset=utf-8'})),true);for(const h of [{},{Origin:'https://evil.test','Content-Type':'application/json'},{Origin:'https://example.test','Content-Type':'text/plain'}])assert.equal(sameOriginJson(request(h)),false)});
test('session lookup expires, hides password hash, and supports revocation',async()=>{const {sql,db}=setup();try{const token=await createSession(db,'u',100);const row=sql.prepare('SELECT * FROM sessions').get();assert.equal(row.token_hash,await tokenHash(token));assert.notEqual(row.token_hash,token);const user=await getSessionUser(db,token,101);assert.equal(user.id,'u');assert.equal(user.teacher,1);assert.equal(user.password_hash,undefined);assert.equal(await getSessionUser(db,token,100+SESSION_TTL),null);assert.equal(await getSessionUser(db,newToken(),101),null);await revokeSession(db,token);assert.equal(await getSessionUser(db,token,101),null)}finally{sql.close()}});

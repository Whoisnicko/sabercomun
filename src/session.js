export const SESSION_COOKIE = '__Host-sc_session';
export const SESSION_TTL = 7 * 24 * 60 * 60;
const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
export const validToken = token => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
export function newToken() { return hex(crypto.getRandomValues(new Uint8Array(32))); }
export async function tokenHash(token) {
  if (!validToken(token)) throw new TypeError('Invalid session token');
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
}
export function readSession(request) {
  const entries = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).filter(v => v.startsWith(SESSION_COOKIE + '='));
  if (entries.length !== 1) return null;
  const token = entries[0].slice(SESSION_COOKIE.length + 1);
  return validToken(token) ? token : null;
}
export function sessionCookie(token) {
  if (!validToken(token)) throw new TypeError('Invalid session token');
  return SESSION_COOKIE + '=' + token + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=' + SESSION_TTL;
}
export function clearSessionCookie() { return SESSION_COOKIE + '=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'; }
export function sameOriginJson(request) {
  return request.headers.get('Origin') === new URL(request.url).origin &&
    (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase() === 'application/json';
}
export async function createSession(db, userId, now = Math.floor(Date.now()/1000)) {
  const token = newToken();
  await db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await tokenHash(token),userId,now + SESSION_TTL).run();
  return token;
}
export async function getSessionUser(db, token, now = Math.floor(Date.now()/1000)) {
  if (!validToken(token)) return null;
  return await db.prepare('SELECT u.id,u.name,u.email,u.teacher FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await tokenHash(token),now).first() || null;
}
export async function revokeSession(db, token) {
  if (!validToken(token)) return;
  await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await tokenHash(token)).run();
}

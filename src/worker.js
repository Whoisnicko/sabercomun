const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
export default {
 async fetch(request,env) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);
  if (request.method !== "GET") return json({error:"Vista previa: operaciones deshabilitadas"},405);
  if (path === "/api/health") {
   try { await env.DB.prepare("SELECT 1 FROM courses LIMIT 1").first(); return json({version:"0.2.0",mode:"preview",database:"ready"}); }
   catch { return json({version:"0.2.0",mode:"preview",database:"not_initialized"},503); }
  }
  if (path === "/api/courses") {
   try {
    const data = await env.DB.prepare("SELECT c.id,c.title,c.category,c.description,c.starts_at,c.duration_minutes,c.live_price,c.recording_price,u.name AS instructor FROM courses c JOIN users u ON u.id=c.teacher_id WHERE c.published=1 ORDER BY c.created_at DESC LIMIT 100").all();
    return json({courses:data.results});
   } catch { return json({error:"Base de datos pendiente de inicializar"},503); }
  }
  return json({error:"No encontrado"},404);
 }
};

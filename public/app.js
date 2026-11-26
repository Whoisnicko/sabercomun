const sample=[
{id:"uber",title:"Empezá a trabajar en Uber desde cero",category:"Movilidad",description:"Documentación, gastos, seguros y primeros viajes en CABA.",instructor:"Instructor de ejemplo",duration_minutes:90,live_price:8000,recording_price:3000},
{id:"carpinteria",title:"Carpintería para principiantes",category:"Oficios",description:"Herramientas, materiales y tu primer proyecto en madera.",instructor:"Instructor de ejemplo",duration_minutes:120,live_price:12000,recording_price:5000},
{id:"plomeria",title:"Plomería básica del hogar",category:"Oficios",description:"Identificá problemas comunes y aprendé técnicas de mantenimiento.",instructor:"Instructor de ejemplo",duration_minutes:90,live_price:9000,recording_price:3500},
{id:"taxi",title:"El ABC del taxista en CABA",category:"Movilidad",description:"Qué averiguar sobre requisitos, trámites y operación diaria.",instructor:"Instructor de ejemplo",duration_minutes:75,live_price:7000,recording_price:2500},
{id:"electricidad",title:"Introducción a la electricidad domiciliaria",category:"Oficios",description:"Conceptos, prevención y límites del trabajo no profesional.",instructor:"Instructor de ejemplo",duration_minutes:90,live_price:10000,recording_price:4000},
{id:"excel",title:"Excel para organizar tu emprendimiento",category:"Tecnología",description:"Controlá ingresos y gastos con planillas simples.",instructor:"Instructor de ejemplo",duration_minutes:60,live_price:5000,recording_price:2000}];

const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
const price=v=>v===0?"Gratis":Number.isFinite(v)&&v>=0?new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(v):"No disponible";
const normalize=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const artMap=new Map([["uber","movilidad"],["taxi","movilidad"],["carpinteria","carpinteria"],["plomeria","plomeria"],["electricidad","electricidad"],["excel","tecnologia"]]);
const artFor=c=>"/art/"+(artMap.get(c.id)||({"Movilidad":"movilidad","Oficios":"carpinteria","Tecnología":"tecnologia"}[c.category]&&["Movilidad","Oficios","Tecnología"].includes(c.category)?{"Movilidad":"movilidad","Oficios":"carpinteria","Tecnología":"tecnologia"}[c.category]:"general"))+".svg";
let courses=sample,category="Todas",demo=true;
const amount=(c,m)=>m==="live"?c.live_price:m==="recording"?c.recording_price:Math.min(c.live_price,c.recording_price);
const available=v=>Number.isFinite(v)&&v>=0;
function prices(c){const p=el("div",undefined,"prices");for(const [label,value] of [["En vivo",c.live_price],["Grabación",c.recording_price]]){const d=el("div");d.append(el("small",label),el("strong",price(value)));p.append(d)}return p}
function image(c,cls){const img=el("img",undefined,cls);img.src=artFor(c);img.alt="";img.width=640;img.height=340;return img}
function show(title,description,c,isExample=demo){const d=$("detail"),heading=el("h2",title);heading.id="modal-title";d.replaceChildren(heading);if(c)d.append(image(c,"dialog-cover"),el("p",c.category+" · "+c.duration_minutes+" min · "+(c.instructor||"Instructor")+(isExample?" · Ejemplo":"")));d.append(el("p",description));if(c)d.append(prices(c));d.append(el("p","Vista previa: no se realizan reservas, registros ni pagos reales.","notice"));$("modal").showModal()}
function render(){
 const q=normalize($("search").value),mode=$("mode").value,sort=$("sort").value;
 let visible=courses.filter(c=>(category==="Todas"||c.category===category)&&normalize([c.title,c.description,c.category,c.instructor].join(" ")).includes(q)&&(mode==="all"||mode==="free"&&(c.live_price===0||c.recording_price===0)||mode==="live"&&available(c.live_price)||mode==="recording"&&available(c.recording_price)));
 if(sort==="price")visible.sort((a,b)=>amount(a,mode)-amount(b,mode));if(sort==="duration")visible.sort((a,b)=>a.duration_minutes-b.duration_minutes);
 $("count").textContent=visible.length+(visible.length===1?" clase":" clases")+(demo?" de ejemplo":"");
 $("reset").hidden=!(q||category!=="Todas"||mode!=="all"||sort!=="default");
 for(const b of document.querySelectorAll("[data-category]"))b.setAttribute("aria-pressed",String(b.dataset.category===category));
 const wrap=$("cards");wrap.replaceChildren();
 for(const c of visible){const article=el("article",undefined,"course"),cover=el("div",undefined,"cover"),content=el("div",undefined,"content"),button=el("button","Ver clase →");const img=image(c);img.loading="lazy";cover.append(img,el("span",c.category,"cover-label"));button.onclick=()=>show(c.title,c.description,c);content.append(el("div",c.duration_minutes+" min · "+(demo?"Clase de ejemplo":(c.instructor||"Instructor")),"meta"),el("h3",c.title),el("p",c.description),prices(c),button);article.append(cover,content);wrap.append(article)}
 if(!visible.length)wrap.append(el("p","No hay clases con estos filtros. Probá otra búsqueda o elegí todas las categorías.","empty"));
}
for(const b of document.querySelectorAll("[data-category]"))b.addEventListener("click",()=>{category=b.dataset.category;render()});
$("search").addEventListener("input",render);$("mode").addEventListener("change",render);$("sort").addEventListener("change",render);
$("reset").onclick=()=>{category="Todas";$("search").value="";$("mode").value="all";$("sort").value="default";render();$("search").focus()};
$("account").onclick=()=>show("Mi cuenta","Una sola cuenta para aprender y enseñar. El registro real está en desarrollo.");
$("teach").onclick=()=>show("Compartí lo que sabés","El panel profesional se habilitará cuando estén listas las cuentas y los permisos.");
$("featured").onclick=()=>{const c=sample.find(x=>x.id==="carpinteria");show(c.title,c.description,c,true)};
document.querySelector(".close").onclick=()=>$("modal").close();
render();
fetch("/api/courses").then(r=>r.ok?r.json():null).then(data=>{if(Array.isArray(data?.courses)&&data.courses.length){courses=data.courses;demo=false;$("status").textContent="Catálogo publicado";category="Todas";render()}}).catch(()=>{});

let authEnabled=false, currentUser=null;
async function callAuth(path,body){const r=await fetch('/api/auth/'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo completar la operación');return data}
function accountScreen(){
 const d=$('detail'),h=el('h2',currentUser?'Mi cuenta':'Ingresá a Saber Común');h.id='modal-title';d.replaceChildren(h);
 const status=el('p','','notice');status.setAttribute('role','status');status.hidden=true;
 const message=t=>{status.hidden=false;status.textContent=t};
 if(!currentUser){
 const form=el('form',undefined,'auth-form'),label=el('label','Correo electrónico'),input=el('input');input.type='email';input.required=true;input.autocomplete='email';label.append(input);
 const submit=el('button','Enviarme enlace','button primary');submit.type='submit';
 form.append(label,submit);d.append(el('p','Acceso de prueba. Usá el correo autorizado; no necesitás contraseña.'),form,status);
 form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{message((await callAuth('request',{email:input.value})).message)}catch(err){message(err.message)}finally{submit.disabled=false}};
 }else{
 const form=el('form',undefined,'auth-form'),label=el('label','Nombre visible'),input=el('input');input.value=currentUser.name;input.required=true;input.minLength=2;input.maxLength=80;label.append(input);
 const role=el('label',' Habilitar perfil profesional'),check=el('input');check.type='checkbox';check.checked=!!currentUser.teacher;role.prepend(check);
 const submit=el('button','Guardar perfil','button primary');submit.type='submit';form.append(label,role,submit);
 const logout=el('button','Cerrar sesión','button secondary');d.append(el('p',currentUser.email),form,logout,status);
 form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{currentUser=(await callAuth('profile',{name:input.value,teacher:check.checked})).user;message('Perfil actualizado.')}catch(err){message(err.message)}finally{submit.disabled=false}};
 logout.onclick=async()=>{try{await callAuth('logout',{});currentUser=null;accountScreen()}catch(err){message(err.message)}};
 }
 if(!$('modal').open)$('modal').showModal();
}
const fragment=new URLSearchParams(location.hash.slice(1));const access=fragment.get('access');if(access)history.replaceState(null,'',location.pathname+location.search);
fetch('/api/auth/config').then(r=>r.ok?r.json():null).then(async config=>{
 if(!config?.enabled)return;authEnabled=true;
 try{currentUser=(await callAuth('me')).user}catch{}
 $('account').onclick=accountScreen;$('teach').onclick=accountScreen;
 if(access){const d=$('detail'),h=el('h2','Confirmá tu acceso');h.id='modal-title';const b=el('button','Ingresar','button primary'),s=el('p','','notice');s.setAttribute('role','status');d.replaceChildren(h,el('p','El enlace es personal y vence en diez minutos.'),b,s);$('modal').showModal();b.onclick=async()=>{b.disabled=true;try{currentUser=(await callAuth('redeem',{token:access})).user;accountScreen()}catch(err){s.textContent=err.message;b.disabled=false}}}
}).catch(()=>{});

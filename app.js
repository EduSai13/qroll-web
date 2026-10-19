(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const db={classes:{},students:{},sessions:{},entries:{},meta:{schema:1}};
let idb,editing=null,current=null,cur="classes",dlgOk=null;
// storage: one IndexedDB record per collection, held in memory for instant reads
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open("qroll_v1",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const load=()=>new Promise(res=>{const tx=idb.transaction("kv"),st=tx.objectStore("kv");Object.keys(db).forEach(k=>{st.get(k).onsuccess=e=>{if(e.target.result)db[k]=e.target.result}});tx.oncomplete=res});
const save=k=>{try{idb.transaction("kv","readwrite").objectStore("kv").put(db[k],k)}catch(e){toast("Could not save. Free up space and try again.")}};
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
let tt;const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2200)};
const active=()=>Object.values(db.classes).filter(c=>c.status!=="archived").sort((a,b)=>a.createdAt<b.createdAt?-1:1);
const count=id=>Object.values(db.students).filter(s=>s.classId===id&&s.status!=="archived").length;
function go(v,push=true){cur=v;["classes","form","detail","dash","scan"].forEach(n=>$("#v-"+n).hidden=n!==v);
 const tab=["form","detail"].includes(v)?"classes":v;document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.nav===tab));
 if(push&&["form","detail"].includes(v))history.pushState({v},"");$("main").scrollTop=0}
function render(){const L=active();let total=0;
 $("#list").innerHTML=L.map((c,i)=>{const n=count(c.id);total+=n;return `<div class="class card"><div class="frame">${String(i+1).padStart(2,"0")}</div><div class="info"><small>${esc(c.code)}</small><b>${esc(c.name)}</b><small>${n} student${n===1?"":"s"}</small></div><button class="go" data-open="${c.id}" aria-label="Open ${esc(c.name)}"><svg viewBox="0 0 24 24"><use href="#i-go"/></svg></button></div>`}).join("");
 $("#empty").hidden=L.length>0;$("#glance").textContent=`${L.length} class${L.length===1?"":"es"} · ${total} student${total===1?"":"s"}`}
function showDetail(id){current=id;const c=db.classes[id];$("#dcode").textContent=c.code;$("#dname").textContent=c.name;const n=count(id);$("#dcount").textContent=`${n} student${n===1?"":"s"}`;go("detail")}
function form(id){editing=id;const c=id&&db.classes[id];$("#ftitle").textContent=id?"Edit Class":"Add Class";$("#save").textContent=id?"Save Changes":"Save Class";$("#code").value=c?c.code:"";$("#name").value=c?c.name:"";go("form")}
function submit(){const code=$("#code").value.trim(),name=$("#name").value.trim();
 if(!code)return toast("Class code is required.");if(!name)return toast("Class name is required.");
 if(active().some(c=>c.id!==editing&&c.code.toLowerCase()===code.toLowerCase()))return toast("That class code is already used.");
 if(editing){Object.assign(db.classes[editing],{code,name});save("classes");toast("Changes saved");render();back(()=>showDetail(editing))}
 else{const id=uid("C");db.classes[id]={id,code,name,status:"active",createdAt:new Date().toISOString()};save("classes");toast("Class saved");render();back()}}
// history: form/detail push one entry, so the Android back gesture returns to the list
function back(after){if(history.state&&history.state.v){addEventListener("popstate",()=>{go("classes",false);after&&after()},{once:true});history.back()}else{go("classes",false);after&&after()}}
function ask(msg,ok){$("#dmsg").textContent=msg;dlgOk=ok;$("#dlg").showModal()}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;
 if(t.dataset.open)showDetail(t.dataset.open);
 else if(t.dataset.nav){if(t.dataset.nav==="classes")render();go(t.dataset.nav,false)}
 else if(t.id==="add")form(null);else if(t.id==="save")submit();else if(t.id==="cancel")back();
 else if(t.id==="edit")form(current);else if(t.id==="back")back();
 else if(t.id==="remove")ask(`Remove ${db.classes[current].code} from your class list? Its students and attendance history are kept.`,()=>{db.classes[current].status="archived";save("classes");render();toast("Class removed");back()});
 else if(t.id==="dyes"){$("#dlg").close();dlgOk&&dlgOk();dlgOk=null}else if(t.id==="dno")$("#dlg").close()});
addEventListener("popstate",()=>{if(cur!=="classes")go("classes",false)});
(async()=>{try{idb=await open();await load();navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){toast("Storage unavailable: data will not be saved.")}
 render();go("classes",false);
 if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{})})();
})();

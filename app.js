(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const db={classes:{},students:{},sessions:{},entries:{},meta:{schema:1}},KEYS=Object.keys(db);
let idb,cur="classes",editC=null,curC=null,editS=null,dlgOk=null,sess=null,stream=null,last={t:"",at:0};
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open("qroll_v1",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const load=()=>new Promise(res=>{const tx=idb.transaction("kv"),st=tx.objectStore("kv");KEYS.forEach(k=>{st.get(k).onsuccess=e=>{if(e.target.result)db[k]=e.target.result}});tx.oncomplete=res});
const raw=k=>{try{idb.transaction("kv","readwrite").objectStore("kv").put(db[k],k)}catch(e){toast("Could not save. Free up space and try again.")}};
const save=k=>{mark(k);raw(k)};
// manual sync: every record carries updatedAt; deletions are remembered as tombstones so a merge can apply them
const hs=r=>{const{updatedAt:_,...x}=r;return JSON.stringify(x)};
function mark(k){if(k==="meta")return;const m=db.meta,H=m.h||(m.h={}),T=m.tomb||(m.tomb={});let ch=0;
 for(const id in db[k]){const r=db[k][id],h=hs(r),key=k+"/"+id;if(H[key]!==h){H[key]=h;r.updatedAt=Date.now();delete T[key];ch=1}}
 for(const key in H)if(key.startsWith(k+"/")&&!(key.slice(k.length+1) in db[k])){delete H[key];T[key]=Date.now();ch=1}
 if(ch)raw("meta")}
const syncFile=()=>({name:`qroll-sync-${today()}.json`,text:JSON.stringify({app:"QRoll",schema:1,exportedAt:new Date().toISOString(),data:{...db,meta:{schema:1}},tomb:db.meta.tomb||{}})});
function merge(j){const m=db.meta,H=m.h||(m.h={}),T=m.tomb||(m.tomb={});let up=0,rm=0;
 ["classes","students","sessions","entries"].forEach(k=>{const src=j.data[k]||{};for(const id in src){const r=src[id],key=k+"/"+id,l=db[k][id],u=r.updatedAt||0;
  if(!l&&(T[key]||0)>=u&&T[key])continue;if(!l||(l.updatedAt||0)<u){db[k][id]=r;H[key]=hs(r);delete T[key];up++}}});
 const rt=j.tomb||{};for(const key in rt){const p=key.indexOf("/"),k=key.slice(0,p),id=key.slice(p+1),l=db[k]&&db[k][id];
  if(l&&(l.updatedAt||0)<=rt[key]){delete db[k][id];delete H[key];rm++}if((T[key]||0)<rt[key])T[key]=rt[key]}
 KEYS.forEach(raw);if(sess)sess=db.sessions[sess.id]||null;R[cur]&&R[cur]();toast(`Merged: ${up} added or updated, ${rm} removed.`)}
const initials=n=>{const w=n.trim().split(/\s+/);return((w[0]||"")[0]+(w.length>1?w[w.length-1][0]:"")).toUpperCase()};
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
let tt;const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2400)};
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),nowT=()=>new Date().toTimeString().slice(0,8);
const addMin=(t,m)=>{const n=+t.slice(0,2)*60+ +t.slice(3,5)+m;return String(Math.floor(n/60)%24).padStart(2,"0")+":"+String(n%60).padStart(2,"0")};
const active=()=>Object.values(db.classes).filter(c=>c.status!=="archived").sort((a,b)=>a.createdAt<b.createdAt?-1:1);
const roster=id=>Object.values(db.students).filter(s=>s.classId===id&&s.status!=="archived").sort((a,b)=>a.name.localeCompare(b.name));
const pl=(n,w)=>`${n} ${w}${n===1?"":"s"}`;
const V=["classes","form","detail","sform","scan","dash"],R={classes:render,detail:renderD,dash:renderDash,scan:openScan};
const upOf=()=>({form:editC?"detail":"classes",detail:"classes",sform:"detail"})[cur];
function go(v,push=true){if(cur==="scan"&&v!=="scan")stop();cur=v;V.forEach(n=>$("#v-"+n).hidden=n!==v);
 const tab=["form","detail","sform"].includes(v)?"classes":v;$$("nav button").forEach(b=>{const on=b.dataset.nav===tab;b.classList.toggle("on",on);b.querySelector("img").src=`icons/${b.dataset.nav}_${on?"on":"off"}.png`});
 if(push&&upOf())history.pushState({v},"");R[v]&&R[v]();scrollTo(0,0)}
function back(){if(history.state&&history.state.v)history.back();else go(upOf()||"classes",false)}
function ask(msg,ok,yes="Remove"){$("#dmsg").textContent=msg;$("#dyes").textContent=yes;dlgOk=ok;$("#dlg").showModal()}
function render(){const L=active();let t=0;
 $("#list").innerHTML=L.map((c,i)=>{const n=roster(c.id).length;t+=n;return `<div class="class card" style="--i:${i}"><div class="frame">${String(i+1).padStart(2,"0")}</div><div class="info"><small>${esc(c.code)}</small><b>${esc(c.name)}</b><small>${pl(n,"student")}</small></div><button class="go" data-open="${c.id}" aria-label="Open ${esc(c.name)}"><img src="icons/go.png" alt=""></button></div>`}).join("");
 $("#empty").hidden=L.length>0;{const h=new Date().getHours();$("#hello").textContent=(h<12?"Good morning":h<18?"Good afternoon":"Good evening")+" · "+new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})}$("#glance").textContent=`${L.length} ${L.length===1?"class":"classes"} · ${pl(t,"student")}`}
function renderD(){const c=db.classes[curC];if(!c)return go("classes",false);$("#dcode").textContent=c.code;$("#dname").textContent=c.name;const all=roster(curC),q=$("#q").value.trim().toLowerCase(),L=all.filter(s=>(s.name+" "+s.number).toLowerCase().includes(q));
 $("#dcount").textContent=pl(all.length,"student");$("#semp").hidden=all.length>0;
 $("#slist").innerHTML=L.map((s,i)=>`<div class="stu card" style="--i:${i}"><div class="info"><b>${esc(s.name)}</b><small>${esc(s.number)}</small></div><button class="ib" data-qr="${s.id}" aria-label="QR code"><img src="icons/qr.png" alt=""></button><button class="ib" data-se="${s.id}" aria-label="Edit"><img src="icons/edit.png" alt=""></button><button class="ib" data-sr="${s.id}" aria-label="Remove"><img src="icons/del.png" alt=""></button></div>`).join("")}
function submitC(){const code=$("#code").value.trim(),name=$("#name").value.trim();
 if(!code)return toast("Class code is required.");if(!name)return toast("Class name is required.");
 if(active().some(c=>c.id!==editC&&c.code.toLowerCase()===code.toLowerCase()))return toast("That class code is already used.");
 if(editC){Object.assign(db.classes[editC],{code,name});toast("Changes saved")}else{const id=uid("C");db.classes[id]={id,code,name,status:"active",createdAt:new Date().toISOString()};toast("Class saved")}
 save("classes");back()}
function submitS(){const name=$("#sname").value.trim(),number=$("#snum").value.trim();
 if(!name)return toast("Full name is required.");if(!number)return toast("Student number is required.");
 if(roster(curC).some(s=>s.id!==editS&&s.number.toLowerCase()===number.toLowerCase()))return toast("That student number is already in this class.");
 if(editS){Object.assign(db.students[editS],{name,number});toast("Changes saved")}else{const id=uid("S");db.students[id]={id,classId:curC,name,number,status:"active",createdAt:new Date().toISOString()};toast("Student added")}
 save("students");back()}
// QR: payload is a versioned, permanent student ID, never the name or number
function qrPng(t){const q=qrcode(0,"M");q.addData(t);q.make();const n=q.getModuleCount(),m=4,s=Math.floor(512/(n+2*m)),z=(n+2*m)*s,c=document.createElement("canvas");c.width=c.height=z;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,z,z);x.fillStyle="#000";for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))x.fillRect((k+m)*s,(r+m)*s,s,s);return c.toDataURL("image/png")}
function showQR(id){const s=db.students[id],u=qrPng("QROLL1:"+id);$("#qimg").src=u;$("#qcap").textContent=`${s.name} · ${s.number}`;const a=$("#qdl");a.href=u;a.download=`${db.classes[s.classId].code}_${s.number}_${initials(s.name)}.png`.replace(/[^\w.\-]+/g,"_");$("#qd").showModal()}
// scanning
const startCam=async()=>{if(stream)return;try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});const v=$("#vid");v.srcObject=stream;await v.play();tick()}catch(e){stream=null;say("Camera unavailable. Allow camera access in your browser settings, then reopen Scan.","bad")}};
const stop=()=>{stream&&stream.getTracks().forEach(t=>t.stop());stream=null};
function tick(){if(!stream)return;const v=$("#vid");if(v.readyState>=2&&v.videoWidth){const c=$("#cv"),w=c.width=480,h=c.height=Math.round(480*v.videoHeight/v.videoWidth),x=c.getContext("2d",{willReadFrequently:true});x.drawImage(v,0,0,w,h);const r=jsQR(x.getImageData(0,0,w,h).data,w,h);if(r&&r.data)hit(r.data)}setTimeout(tick,150)}
function say(m,k){const r=$("#res");r.textContent=m;r.className="res "+(k||"");r.style.animation="none";r.offsetWidth;r.style.animation="";if(k==="ok"){const c=$(".cam");c.classList.remove("hit");c.offsetWidth;c.classList.add("hit")}}
const sEntries=()=>Object.values(db.entries).filter(e=>e.sessionId===sess.id);
function hit(t){if(t===last.t&&Date.now()-last.at<2500)return;last={t,at:Date.now()};
 const m=/^QROLL1:(S\w+)$/.exec(t);if(!m)return say("Invalid QR code: this is not a QRoll ID.","bad");
 const s=db.students[m[1]];if(!s)return say("Unknown QR code: no matching student on this device.","bad");
 if(s.classId!==sess.classId)return say(`${s.name} is not in this class.`,"bad");
 if(s.status==="archived")return say(`${s.name} was removed from the roster.`,"bad");
 const k=sess.id+":"+s.id,e=db.entries[k];if(e)return say(`Already recorded: ${s.name} (${e.status}, ${e.time.slice(0,5)}).`,"warn");
 const tm=nowT(),late=tm.slice(0,5)>addMin(sess.start,sess.grace);
 db.entries[k]={sessionId:sess.id,studentId:s.id,classId:s.classId,status:late?"Late":"Present",source:"scan",time:tm,note:""};save("entries");
 navigator.vibrate&&navigator.vibrate(60);say(`${s.name}: ${late?"Late":"Present"}`,"ok");progress()}
function progress(){const E=sEntries(),c=db.classes[sess.classId];$("#cnt").textContent=`FRAME ${String(E.length).padStart(2,"0")} / ${String(roster(sess.classId).length).padStart(2,"0")} recorded`;
 $("#sinfo").textContent=`${c.code} · ${sess.date} · starts ${sess.start}, Late after ${addMin(sess.start,sess.grace)}`;
 $("#recent").innerHTML=E.sort((a,b)=>a.time<b.time?1:-1).slice(0,5).map(e=>`<div class="card" style="margin-bottom:6px">${esc(db.students[e.studentId].name)} · ${e.status} · ${e.time.slice(0,5)}</div>`).join("")||"<p>No scans yet.</p>";
 $("#rlist").innerHTML=roster(sess.classId).map(s=>{const e=db.entries[sess.id+":"+s.id],v=e?e.status:"";return `<div class="rv"><span>${esc(s.name)}<small>${esc(s.number)}</small></span><select data-r="${s.id}">${["","Present","Late","Absent","Excused"].map(o=>`<option value="${o}"${o===v?" selected":""}>${o||"Not recorded"}</option>`).join("")}</select></div>`}).join("")}
function setStatus(id,v){const k=sess.id+":"+id,old=db.entries[k];
 if(!v)delete db.entries[k];else{const note=old?(prompt("Reason for this change (optional)")||""):"";db.entries[k]={sessionId:sess.id,studentId:id,classId:sess.classId,status:v,source:old?"correction":"manual",time:old?old.time:nowT(),note:note||(old?old.note:"")}}
 save("entries");progress()}
function openScan(){const L=active();$("#sclass").innerHTML=L.map(c=>`<option value="${c.id}">${esc(c.code)} · ${esc(c.name)}</option>`).join("");
 $("#sempty").hidden=L.length>0;$("#ssetup").hidden=!L.length||!!sess;$("#slive").hidden=!sess;if(sess){progress();startCam()}}
function begin(){const cid=$("#sclass").value;if(!roster(cid).length)return toast("Add students to this class first.");
 let s=Object.values(db.sessions).find(x=>x.classId===cid&&x.date===today()&&x.checkpoint==="Morning");
 if(!s){const id="X"+cid+"_"+today();s=db.sessions[id]={id,classId:cid,date:today(),checkpoint:"Morning",start:$("#sstart").value||"07:30",grace:Math.max(0,+$("#sgrace").value||0),state:"open"}}else s.state="open";
 save("sessions");sess=s;last={t:"",at:0};say("Point the camera at a student's QR code.");openScan()}
function closeSess(){const miss=roster(sess.classId).filter(s=>!db.entries[sess.id+":"+s.id]);
 ask(`Close this session? ${pl(miss.length,"student")} without a record will be marked Absent.`,()=>{miss.forEach(s=>db.entries[sess.id+":"+s.id]={sessionId:sess.id,studentId:s.id,classId:sess.classId,status:"Absent",source:"finalized",time:nowT(),note:""});sess.state="closed";save("entries");save("sessions");sess=null;toast("Session closed");go("dash",false)},"Close session")}
// dashboard: every number comes from saved entries of closed sessions
const cu=(el,to)=>{if(!el||to==null||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/700);el.textContent=Math.round(to*p)+"%";p<1&&requestAnimationFrame(f)})(t0)};
function renderDash(){const cs=new Set(Object.values(db.sessions).filter(s=>s.state==="closed").map(s=>s.id)),E=Object.values(db.entries).filter(e=>cs.has(e.sessionId));
 const rate=a=>{const p=a.filter(e=>e.status==="Present"||e.status==="Late").length,d=p+a.filter(e=>e.status==="Absent").length;return d?Math.round(p/d*100):null};
 if(!E.length){$("#dbody").innerHTML='<div class="card empty"><svg class="mas" viewBox="0 0 120 120" aria-hidden="true"><use href="#mascot"/></svg><br>No closed sessions yet. Finish a scanning session to see attendance here.</div>';return}
 const n=s=>E.filter(e=>e.status===s).length,bar=(l,r)=>`<div class="bar"><span>${esc(l)}</span><u><i style="--w:${r??0}%"></i></u><b>${r==null?"–":r+"%"}</b></div>`,dt=e=>db.sessions[e.sessionId].date;
 $("#dbody").innerHTML=`<div class="card bigtxt"><b>${rate(E)??"–"}%</b> overall attendance<small>Present ${n("Present")} · Late ${n("Late")} · Absent ${n("Absent")} · Excused ${n("Excused")}</small></div><h2>By class</h2>${active().map(c=>bar(c.code,rate(E.filter(e=>e.classId===c.id)))).join("")}<h2>Recent days</h2>${[...new Set(E.map(dt))].sort().slice(-7).map(d=>bar(d.slice(5),rate(E.filter(e=>dt(e)===d)))).join("")}`;cu($(".bigtxt b"),rate(E))}
// export and backup
const dl=(name,txt,type)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)};
const csv=rows=>"\ufeff"+rows.map(r=>r.map(v=>{v=String(v??"");if(/^[=+\-@]/.test(v))v="'"+v;return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(",")).join("\r\n");
const cl=id=>db.classes[id]||{code:"",name:""};
function exp(kind){let rows;if(kind==="s")rows=[["student_id","student_number","name","class_code","class_name","active"],...Object.values(db.students).map(s=>[s.id,s.number,s.name,cl(s.classId).code,cl(s.classId).name,s.status!=="archived"])];
 else rows=[["date","class_code","class_name","student_id","student_number","student_name","checkpoint","status","source","scan_time","note"],...Object.values(db.entries).map(e=>{const s=db.sessions[e.sessionId],t=db.students[e.studentId]||{};return [s.date,cl(e.classId).code,cl(e.classId).name,e.studentId,t.number,t.name,s.checkpoint,e.status,e.source,e.time,e.note]}).sort((a,b)=>a[0]<b[0]?-1:1)];
 if(rows.length<2)return toast("Nothing to export yet.");dl(`qroll-${kind==="s"?"students":"attendance"}-${today()}.csv`,csv(rows),"text/csv;charset=utf-8");toast("CSV downloaded")}
document.addEventListener("click",e=>{const t=e.target.closest("button"),d=t&&t.dataset,i=t&&t.id;if(!t)return;
 if(d.open){curC=d.open;go("detail")}else if(d.nav){go(d.nav,false)}
 else if(d.qr)showQR(d.qr);else if(d.se){editS=d.se;const s=db.students[editS];$("#sftitle").textContent="Edit Student";$("#ssave").textContent="Save Changes";$("#sname").value=s.name;$("#snum").value=s.number;go("sform")}
 else if(d.sr){const s=db.students[d.sr];ask(`Remove ${s.name} from this class? Attendance history is kept.`,()=>{s.status="archived";save("students");renderD();toast("Student removed")})}
 else if(i==="add"){editC=null;$("#ftitle").textContent="Add Class";$("#save").textContent="Save Class";$("#code").value=$("#name").value="";go("form")}
 else if(i==="edit"){editC=curC;const c=db.classes[curC];$("#ftitle").textContent="Edit Class";$("#save").textContent="Save Changes";$("#code").value=c.code;$("#name").value=c.name;go("form")}
 else if(i==="save")submitC();else if(i==="cancel"||i==="scancel"||i==="back")back();
 else if(i==="remove")ask(`Remove ${db.classes[curC].code} from your class list? Its students and attendance history are kept.`,()=>{db.classes[curC].status="archived";save("classes");toast("Class removed");back()});
 else if(i==="sadd"){editS=null;$("#sftitle").textContent="Add Student";$("#ssave").textContent="Save Student";$("#sname").value=$("#snum").value="";go("sform")}
 else if(i==="ssave")submitS();else if(i==="sbegin")begin();else if(i==="srev"){$("#rev").hidden=!$("#rev").hidden}else if(i==="sclose")closeSess();
 else if(i==="xs")exp("s");else if(i==="xa")exp("a");else if(i==="xb"){const f=syncFile();dl(f.name,f.text,"application/json");toast("Sync file saved")}else if(i==="xh"){const f=syncFile(),file=new File([f.text],f.name,{type:"application/json"});navigator.canShare&&navigator.canShare({files:[file]})?navigator.share({files:[file],title:f.name}).catch(()=>{}):(dl(f.name,f.text,"application/json"),toast("Sharing is not supported here. File saved instead."))}
 else if(i==="dyes"){$("#dlg").close();const f=dlgOk;dlgOk=null;f&&f()}else if(i==="dno")$("#dlg").close();else if(i==="qx")$("#qd").close();
 else if(i==="qsh")(async()=>{const n=$("#qdl").download,f=new File([await(await fetch($("#qimg").src)).blob()],n,{type:"image/png"});navigator.canShare&&navigator.canShare({files:[f]})?navigator.share({files:[f],title:n}).catch(()=>{}):toast("Sharing isn't supported here. Use Download PNG.")})()});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.r)return setStatus(t.dataset.r,t.value);if(t.id!=="rf"&&t.id!=="mf")return;const f=t.files[0],mode=t.id;t.value="";
 f&&f.text().then(x=>{let j;try{j=JSON.parse(x)}catch(_){}
  if(!j||j.app!=="QRoll"||!j.data||!["classes","students","sessions","entries"].every(k=>j.data[k]&&typeof j.data[k]==="object"))return toast("That file is not a valid QRoll file. Nothing was changed.");
  if(mode==="mf")return ask("Merge this file into the data on this device? Newer edits win and nothing is duplicated.",()=>merge(j),"Merge");
  ask("Replace all current data on this device with this file?",()=>{KEYS.filter(k=>k!=="meta").forEach(k=>{if(j.data[k])db[k]=j.data[k];save(k)});sess=null;toast("Backup restored");go("classes",false)},"Replace")})});
$("#q").addEventListener("input",renderD);
addEventListener("popstate",()=>{const u=upOf();if(u)go(u,false)});
(async()=>{try{idb=await open();await load();navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){toast("Storage unavailable: data will not be saved.")}
 KEYS.filter(k=>k!=="meta").forEach(mark);go("classes",false);if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{})})();
})();

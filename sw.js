const V="qroll-v1",F=["./","index.html","style.css","app.js","manifest.json","icon-192.png","icon-512.png","fonts/jost-latin-400-normal.woff2","fonts/jost-latin-600-normal.woff2","fonts/abril-fatface-latin-400-normal.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});

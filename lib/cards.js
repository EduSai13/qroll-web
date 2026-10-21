// QRoll printable cards, drawn in points on an A4 page (595.5 x 842.25). Palette colors only.
(function(g){
const C={cocoa:"#613627",bg:"#F2EDE8",cosy:"#B78C6E",cream:"#F5EADD"},W=595.5,H=842.25;
const AB='400 %px "Abril Fatface"',J4='400 %px Jost',J6='600 %px Jost';
const rr=(x,X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
const fnt=(x,f,s)=>{x.font=f.replace("%",s)};
const fit=(x,t,f,s,max,min=9)=>{while(s>min){fnt(x,f,s);if(x.measureText(t).width<=max)break;s-=.5}fnt(x,f,s);return s};
const spaced=(x,t,cx,y,gap)=>{const a=[...t],w=a.map(c=>x.measureText(c).width);let p=cx-(w.reduce((m,n)=>m+n,0)+gap*(a.length-1))/2;x.textAlign="left";a.forEach((c,i)=>{x.fillText(c,p,y);p+=w[i]+gap})};
const dots=(x,X,Y,cols,rows,gap,r)=>{x.fillStyle=C.cosy;for(let j=0;j<rows;j++){x.globalAlpha=Math.max(.12,.7-j*.08);for(let i=0;i<cols;i++){x.beginPath();x.arc(X+i*gap,Y+j*gap,r,0,7);x.fill()}}x.globalAlpha=1};
const corners=(x,cx,cy,half,arm,rad,lw)=>{x.strokeStyle=C.cocoa;x.lineWidth=lw;x.lineCap="round";[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([sx,sy])=>{x.save();x.translate(cx,cy);x.scale(sx,sy);x.beginPath();x.moveTo(-half,-half+arm);x.lineTo(-half,-half+rad);x.arcTo(-half,-half,-half+rad,-half,rad);x.lineTo(-half+arm,-half);x.stroke();x.restore()})};
const qr=(x,q,cx,cy,size)=>{const n=q.getModuleCount(),m=size/n;x.fillStyle=C.cocoa;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))x.fillRect(cx-size/2+c*m-.15,cy-size/2+r*m-.15,m+.3,m+.3)};
const logo=(x,im,cx,cy,box)=>{if(!im)return;const s=Math.min(box/im.width,box/im.height);x.drawImage(im,cx-im.width*s/2,cy-im.height*s/2,im.width*s,im.height*s)};
const lines=(x,L,y0,y1,xa,xb,xm)=>{x.strokeStyle=C.cocoa;x.lineWidth=1.5;x.lineCap="butt";x.beginPath();x.moveTo(xa,y0);x.lineTo(xb,y0);x.moveTo(xa,y1);x.lineTo(xb,y1);x.moveTo(xm,y0);x.lineTo(xm,y1);x.stroke()};
function idCard(x,o){x.fillStyle=C.bg;x.fillRect(0,0,W,H);dots(x,48,374,4,8,13,1.9);dots(x,505,374,4,8,13,1.9);
 x.fillStyle=C.cream;rr(x,226,16,152,152,38);x.fill();logo(x,o.logo,302,92,122);
 x.fillStyle=C.cocoa;x.textAlign="center";x.textBaseline="alphabetic";fit(x,o.name,AB,46,470,20);x.fillText(o.name,W/2,228);
 x.fillStyle=C.cream;rr(x,134,257,327,329,64);x.fill();corners(x,W/2,421.5,144,66,36,5);qr(x,o.q,W/2,421.5,206);
 lines(x,0,640,694,120,475,298);x.fillStyle=C.cocoa;x.textAlign="center";
 fnt(x,J4,14);x.fillText("Class",209,624);x.fillText("Student ID",387,624);
 x.textBaseline="middle";fit(x,o.cls,J6,17,150,10);x.fillText(o.cls,209,668);fit(x,o.num,J6,17,150,10);x.fillText(o.num,387,668);x.textBaseline="alphabetic";
 fnt(x,J4,14);x.fillText("Keep this with you at all times.",W/2,731);fnt(x,J6,17);spaced(x,"QROLL",W/2,798,5)}
function roster(x,o){x.fillStyle=C.bg;x.fillRect(0,0,W,H);dots(x,10,718,4,8,13,1.9);dots(x,548,738,4,8,13,1.9);
 x.fillStyle=C.cream;x.beginPath();x.arc(91,60,36,0,7);x.fill();logo(x,o.logo,91,60,54);
 lines(x,0,33,85,148,503,316);x.fillStyle=C.cocoa;x.textAlign="center";x.textBaseline="middle";fnt(x,J4,15);x.fillText("Class",232,59);fit(x,o.cls,J6,19,165,10);x.fillText(o.cls,410,59);
 o.list.forEach((s,i)=>{const cx=61.5+118*(i%5),cy=196.6+138*Math.floor(i/5);x.fillStyle=C.cream;rr(x,cx-47,cy-47,94,94,30);x.fill();corners(x,cx,cy,43,22,12,2.4);qr(x,s.q,cx,cy,62);
  x.fillStyle=C.cocoa;x.textBaseline="alphabetic";x.textAlign="center";const w=s.name.split(/\s+/);let a=s.name,b="";if(w.length>1){let best=1,d=1e9;for(let k=1;k<w.length;k++){const l1=w.slice(0,k).join(" ").length,l2=w.slice(k).join(" ").length,df=Math.abs(l1-l2);if(df<d){d=df;best=k}}a=w.slice(0,best).join(" ");b=w.slice(best).join(" ")}
  let sz=12.5;while(sz>6){fnt(x,AB,sz);if(Math.max(x.measureText(a).width,x.measureText(b).width)<=108)break;sz-=.5}x.fillText(a,cx,cy+68);if(b)x.fillText(b,cx,cy+68+sz+1.5)});
 x.fillStyle=C.cocoa;x.textBaseline="alphabetic";fnt(x,J6,16);spaced(x,"QROLL - CLASS ROSTER",W/2,810,6);if(o.pages>1){fnt(x,J4,11);x.textAlign="center";x.fillText(`Page ${o.page} of ${o.pages}`,W/2,829)}}
g.Cards={W,H,idCard,roster}})(typeof window!=="undefined"?window:globalThis);

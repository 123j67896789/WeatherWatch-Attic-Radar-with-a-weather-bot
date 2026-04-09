import{r as u}from"./index-C1hQBIyv.js";import{u as xe,l as ve,s as Ae}from"./App-DlE-ceXG.js";import"./analytics-DEGiAptQ.js";const Te=6378137,L=3,k=1500,me=1.9438844;function C(r,n,c){const o=r.createShader(n);if(!o)throw new Error("Failed to create shader.");if(r.shaderSource(o,c),r.compileShader(o),!r.getShaderParameter(o,r.COMPILE_STATUS)){const t=r.getShaderInfoLog(o);throw r.deleteShader(o),new Error(`Shader compile error: ${t}`)}return o}function ee(r,n,c){const o=r.createProgram();if(!o)throw new Error("Failed to create program.");if(r.attachShader(o,n),r.attachShader(o,c),r.linkProgram(o),!r.getProgramParameter(o,r.LINK_STATUS))throw new Error(`Program link error: ${r.getProgramInfoLog(o)}`);return o}function de(r){return r==="mercator"?`
      vec2 pixel = vec2(
        aPosition.x * uWorldSize - uPixelOrigin.x + uCanvasPad.x,
        aPosition.y * uWorldSize - uPixelOrigin.y + uCanvasPad.y
      );
    `:`
    vec2 pixel = uCenterPx + vec2(aPosition.x * uPxPerMeter, -aPosition.y * uPxPerMeter);
  `}function le(r,n){const c=C(r,r.VERTEX_SHADER,`
    attribute vec2 aPosition;
    attribute float aValue;
    uniform vec2  uCenterPx;
    uniform vec2  uViewSize;
    uniform float uPxPerMeter;
    uniform float uWorldSize;
    uniform vec2  uPixelOrigin;
    uniform vec2  uCanvasPad;
    varying float vValue;
    void main() {
      ${de(n)}
      vec2 clip = vec2(
        (pixel.x / uViewSize.x) * 2.0 - 1.0,
        1.0 - (pixel.y / uViewSize.y) * 2.0
      );
      gl_Position = vec4(clip, 0.0, 1.0);
      vValue = aValue;
    }
  `),o=C(r,r.FRAGMENT_SHADER,`
    precision highp float;
    varying float vValue;
    uniform sampler2D uPalette;
    uniform vec2  uValueRange;
    uniform float uValueScale;
    uniform float uOpacity;
    void main() {
      float scaledValue = vValue * uValueScale;
      float t = clamp((scaledValue - uValueRange.x) / (uValueRange.y - uValueRange.x), 0.0, 1.0);
      vec4 col = texture2D(uPalette, vec2(t, 0.0));
      if (col.a < 0.01) discard;
      gl_FragColor = vec4(col.rgb, col.a * uOpacity);
    }
  `),t=ee(r,c,o);return{prog:t,aPosition:r.getAttribLocation(t,"aPosition"),aValue:r.getAttribLocation(t,"aValue"),uCenterPx:r.getUniformLocation(t,"uCenterPx"),uViewSize:r.getUniformLocation(t,"uViewSize"),uPxPerMeter:r.getUniformLocation(t,"uPxPerMeter"),uWorldSize:r.getUniformLocation(t,"uWorldSize"),uPixelOrigin:r.getUniformLocation(t,"uPixelOrigin"),uCanvasPad:r.getUniformLocation(t,"uCanvasPad"),uOpacity:r.getUniformLocation(t,"uOpacity"),uPalette:r.getUniformLocation(t,"uPalette"),uValueRange:r.getUniformLocation(t,"uValueRange"),uValueScale:r.getUniformLocation(t,"uValueScale")}}function Re(r,n){const c=C(r,r.VERTEX_SHADER,`
    attribute vec2 aPosition;
    attribute vec4 aColor;
    uniform vec2  uCenterPx;
    uniform vec2  uViewSize;
    uniform float uPxPerMeter;
    uniform float uWorldSize;
    uniform vec2  uPixelOrigin;
    uniform vec2  uCanvasPad;
    varying vec4 vColor;
    void main() {
      ${de(n)}
      vec2 clip = vec2(
        (pixel.x / uViewSize.x) * 2.0 - 1.0,
        1.0 - (pixel.y / uViewSize.y) * 2.0
      );
      gl_Position = vec4(clip, 0.0, 1.0);
      vColor = aColor;
    }
  `),o=C(r,r.FRAGMENT_SHADER,`
    precision highp float;
    varying vec4 vColor;
    uniform float uOpacity;
    void main() {
      gl_FragColor = vec4(vColor.rgb, vColor.a * uOpacity);
    }
  `),t=ee(r,c,o);return{prog:t,aPosition:r.getAttribLocation(t,"aPosition"),aColor:r.getAttribLocation(t,"aColor"),uCenterPx:r.getUniformLocation(t,"uCenterPx"),uViewSize:r.getUniformLocation(t,"uViewSize"),uPxPerMeter:r.getUniformLocation(t,"uPxPerMeter"),uWorldSize:r.getUniformLocation(t,"uWorldSize"),uPixelOrigin:r.getUniformLocation(t,"uPixelOrigin"),uCanvasPad:r.getUniformLocation(t,"uCanvasPad"),uOpacity:r.getUniformLocation(t,"uOpacity")}}function pe(r){const n=C(r,r.VERTEX_SHADER,`
    attribute vec2 aPos;
    attribute vec2 aUv;
    varying vec2 vUv;
    void main() {
      vUv = aUv;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `),c=C(r,r.FRAGMENT_SHADER,`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform float uOpacity;
    void main() {
      vec4 col = texture2D(uTex, vUv);
      if (col.a < 0.01) discard;
      gl_FragColor = vec4(col.rgb, col.a * uOpacity);
    }
  `),o=ee(r,n,c);return{prog:o,aPos:r.getAttribLocation(o,"aPos"),aUv:r.getAttribLocation(o,"aUv"),uTex:r.getUniformLocation(o,"uTex"),uOpacity:r.getUniformLocation(o,"uOpacity")}}function be(r){const n=new Uint8Array(k*4),c=[...r.colors],o=[...r.values];r.rangeFold&&(c.push(r.rangeFold),o.push(999));const t={...r,colors:c,values:o},T=o[0],b=o[o.length-1];for(let E=0;E<k;E+=1){const h=T+(b-T)*E/(k-1),[F,S,P,x]=Ae(t,h),d=E*4;n[d]=F,n[d+1]=S,n[d+2]=P,n[d+3]=x??255}return{pixels:n,cmin:T,cmax:b}}function _e(r,n,c){r.bindTexture(r.TEXTURE_2D,n),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,k,1,0,r.RGBA,r.UNSIGNED_BYTE,c),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST)}function Pe(r,n,c,{centerX:o,centerY:t,targetW:T,targetH:b,pxPerMeter:E,worldSize:h,pixelOriginX:F,pixelOriginY:S,canvasPadX:P,canvasPadY:x}){r.uniform2f(n.uViewSize,T,b),c==="mercator"?(r.uniform1f(n.uWorldSize,h),r.uniform2f(n.uPixelOrigin,F,S),r.uniform2f(n.uCanvasPad,P,x),r.uniform2f(n.uCenterPx,0,0),r.uniform1f(n.uPxPerMeter,0)):(r.uniform2f(n.uCenterPx,o,t),r.uniform1f(n.uPxPerMeter,E),r.uniform1f(n.uWorldSize,0),r.uniform2f(n.uPixelOrigin,0,0),r.uniform2f(n.uCanvasPad,0,0))}function ye({frame:r,opacity:n=.95,scheme:c,pixelate:o=1}){const t=xe(),T=u.useRef(null),b=u.useRef(null),E=u.useRef(null),h=u.useRef(null),F=u.useRef(null),S=u.useRef(null),P=u.useRef(null),x=u.useRef(null),d=u.useRef(null),y=u.useRef(null),re=u.useRef(""),$=u.useRef({cmin:0,cmax:1}),w=u.useRef(0),te=u.useRef({padX:0,padY:0}),oe=u.useRef(null),m=u.useRef(null),g=u.useRef(null),_=u.useRef(null),K=u.useRef({w:0,h:0}),z=u.useRef(null),q=u.useRef(0),[X,Q]=u.useState(null);return u.useEffect(()=>{const i=new Worker(new URL("/assets/atticProjectionWorker-DtfLSQe-.js",import.meta.url),{type:"module"});return z.current=i,i.onmessage=e=>{const{id:a,projectedFrames:I}=e.data||{};if(a!==q.current)return;const U=I?.[0]?.positions;Q(U instanceof Float32Array?U:U?new Float32Array(U):null)},()=>{i.terminate(),z.current=null}},[]),u.useEffect(()=>{if(!r?.polarVertices?.length||!z.current){Q(r?.projectedPositions??null);return}q.current+=1,Q(null),z.current.postMessage({id:q.current,frames:[{index:0,centerLat:r.centerLat,centerLon:r.centerLon,polarVertices:r.polarVertices}]})},[r]),u.useEffect(()=>{const i=ve.DomUtil.create("canvas","rawRadarCanvas");i.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:300";const e=t.getPane?.("radar-data-pane")??t.getPanes?.().overlayPane??t.getPanes?.().mapPane??null;if(!e)return()=>{};e.appendChild(i),T.current=i,t.getContainer().style.overflow="visible";const a=i.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!1});return a?(b.current=a,E.current=le(a,"local"),h.current=le(a,"mercator"),F.current=Re(a,"local"),S.current=Re(a,"mercator"),oe.current=pe(a),P.current=a.createBuffer(),x.current=a.createBuffer(),d.current=a.createBuffer(),y.current=a.createTexture(),m.current=a.createBuffer(),g.current=a.createFramebuffer(),_.current=a.createTexture(),()=>{try{g.current&&a.deleteFramebuffer(g.current),_.current&&a.deleteTexture(_.current),m.current&&a.deleteBuffer(m.current),y.current&&a.deleteTexture(y.current),P.current&&a.deleteBuffer(P.current),x.current&&a.deleteBuffer(x.current),d.current&&a.deleteBuffer(d.current)}catch{}i.remove(),t.getContainer().style.overflow=""}):()=>{i.remove(),t.getContainer().style.overflow=""}},[t]),u.useEffect(()=>{const i=T.current,e=b.current,a=E.current,I=h.current,U=F.current,ne=S.current,l=oe.current;if(!i||!e||!a||!I||!U||!ne)return;const Ee=(R,f)=>{const p=g.current,v=_.current;!p||!v||K.current.w===R&&K.current.h===f||(e.bindTexture(e.TEXTURE_2D,v),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,R,f,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.bindFramebuffer(e.FRAMEBUFFER,p),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,v,0),K.current={w:R,h:f})},ie=!!(r?.values?.length&&r.values.length>0&&c),Z=!!r?.polarVertices?.length?X?.length?X:null:r?.vertices??null,W=X?.length?"mercator":"local",V=()=>{const R=t.getSize(),f=Math.max(1,window.devicePixelRatio||1),p=R.x*L,v=R.y*L,M=R.x*(L-1)/2,D=R.y*(L-1)/2;if(te.current={padX:M,padY:D},i.style.width=`${p}px`,i.style.height=`${v}px`,i.style.left=`${-M}px`,i.style.top=`${-D}px`,i.width=Math.floor(p*f),i.height=Math.floor(v*f),e.viewport(0,0,i.width,i.height),m.current&&(e.bindBuffer(e.ARRAY_BUFFER,m.current),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,-1,1,0,1,1,-1,1,0,1,1,1,1]),e.STATIC_DRAW)),!Z?.length){w.current=0;return}if(e.bindBuffer(e.ARRAY_BUFFER,P.current),e.bufferData(e.ARRAY_BUFFER,Z,e.STATIC_DRAW),ie&&r?.values){e.bindBuffer(e.ARRAY_BUFFER,x.current),e.bufferData(e.ARRAY_BUFFER,r.values,e.STATIC_DRAW);const G=c?.key??"";if(G!==re.current&&c&&y.current){re.current=G;const A=be(c);$.current={cmin:A.cmin,cmax:A.cmax},_e(e,y.current,A.pixels)}}else r?.colors?.length&&(e.bindBuffer(e.ARRAY_BUFFER,d.current),e.bufferData(e.ARRAY_BUFFER,r.colors,e.STATIC_DRAW));w.current=Z.length/2},ae=()=>{const R=t.getSize(),f=Math.max(1,window.devicePixelRatio||1);if((i.width!==Math.floor(R.x*L*f)||i.height!==Math.floor(R.y*L*f))&&V(),!w.current||!r)return;const p=t.latLngToLayerPoint([r.centerLat,r.centerLon]),{padX:v,padY:M}=te.current,D=256*2**t.getZoom(),G=D/(2*Math.PI*Te*Math.cos(r.centerLat*Math.PI/180));e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA);const A=o>1&&r.product==="reflectivity"&&!!(l&&m.current&&g.current&&_.current),H=A?Math.max(240,Math.floor(i.width/o)):i.width,j=A?Math.max(180,Math.floor(i.height/o)):i.height;A&&Ee(H,j);const O=H/i.width,J=j/i.height;A?(e.bindFramebuffer(e.FRAMEBUFFER,g.current),e.viewport(0,0,H,j)):(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,i.width,i.height)),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);const fe={centerX:(p.x+v)*f*O,centerY:(p.y+M)*f*J,targetW:H,targetH:j,pxPerMeter:G*f*O,worldSize:D*f*O,pixelOriginX:t.getPixelOrigin().x*f*O,pixelOriginY:t.getPixelOrigin().y*f*J,canvasPadX:v*f*O,canvasPadY:M*f*J};if(ie&&c){const s=W==="mercator"?I:a;e.useProgram(s.prog),Pe(e,s,W,fe),e.uniform1f(s.uOpacity,n),e.uniform1i(s.uPalette,0),e.uniform1f(s.uValueScale,r.product==="velocity"?me:1),e.uniform2f(s.uValueRange,$.current.cmin,$.current.cmax),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,y.current),e.bindBuffer(e.ARRAY_BUFFER,P.current),e.enableVertexAttribArray(s.aPosition),e.vertexAttribPointer(s.aPosition,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,x.current),e.enableVertexAttribArray(s.aValue),e.vertexAttribPointer(s.aValue,1,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLES,0,w.current),e.disableVertexAttribArray(s.aPosition),e.disableVertexAttribArray(s.aValue)}else if(r.colors?.length){const s=W==="mercator"?ne:U;e.useProgram(s.prog),Pe(e,s,W,fe),e.uniform1f(s.uOpacity,n),e.bindBuffer(e.ARRAY_BUFFER,P.current),e.enableVertexAttribArray(s.aPosition),e.vertexAttribPointer(s.aPosition,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,d.current),e.enableVertexAttribArray(s.aColor),e.vertexAttribPointer(s.aColor,4,e.UNSIGNED_BYTE,!0,0,0),e.drawArrays(e.TRIANGLES,0,w.current),e.disableVertexAttribArray(s.aPosition),e.disableVertexAttribArray(s.aColor)}A&&l&&m.current&&_.current&&(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,i.width,i.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(l.prog),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_.current),e.uniform1i(l.uTex,0),e.uniform1f(l.uOpacity,1),e.bindBuffer(e.ARRAY_BUFFER,m.current),e.enableVertexAttribArray(l.aPos),e.vertexAttribPointer(l.aPos,2,e.FLOAT,!1,16,0),e.enableVertexAttribArray(l.aUv),e.vertexAttribPointer(l.aUv,2,e.FLOAT,!1,16,8),e.drawArrays(e.TRIANGLES,0,6),e.disableVertexAttribArray(l.aPos),e.disableVertexAttribArray(l.aUv))};let B=0;const N=()=>{B||(B=requestAnimationFrame(()=>{B=0,ae()}))},Y=()=>N(),ue=()=>{V(),N()},ce=()=>{V(),N()},se=()=>{V(),N()};return V(),ae(),t.on("move",Y),t.on("zoom",Y),t.on("viewreset",ue),t.on("moveend",ce),t.on("resize",se),()=>{B&&cancelAnimationFrame(B),t.off("move",Y),t.off("zoom",Y),t.off("viewreset",ue),t.off("moveend",ce),t.off("resize",se)}},[r,t,n,o,X,c]),null}export{ye as default};

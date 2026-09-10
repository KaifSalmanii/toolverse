/* ============================================================
   ToolVerse — Image tools (100% client-side, canvas based)
   ============================================================ */
(() => {

/* helpers ------------------------------------------------ */
const imgName = (f, ext) => (f.name.replace(/\.[^.]+$/, "") || "image") + "." + ext;
const extFor = t => ({ "image/png":"png", "image/jpeg":"jpg", "image/webp":"webp" })[t] || "png";

function drawToCanvas(img, w, h, whiteBg){
  const c = document.createElement('canvas'); c.width = Math.max(1,Math.round(w)); c.height = Math.max(1,Math.round(h));
  const x = c.getContext('2d');
  if(whiteBg){ x.fillStyle = "#fff"; x.fillRect(0,0,c.width,c.height); }
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/* 1. IMAGE RESIZER --------------------------------------- */
registerTool("image-resizer", root => {
  let file=null, img=null, ratio=1;
  const origInfo = UI.el(`<div class="info-strip"></div>`);
  const out = UI.el(`<div></div>`);
  const wInp = UI.el(`<input type="number" min="1" max="20000" placeholder="Width">`);
  const hInp = UI.el(`<input type="number" min="1" max="20000" placeholder="Height">`);
  const lockCk = UI.el(`<label class="check"><input type="checkbox" checked> 🔗 Lock aspect ratio</label>`);
  const fmtSel = UI.el(`<select>
      <option value="auto">Same as original</option>
      <option value="image/jpeg">JPG</option>
      <option value="image/png">PNG</option>
      <option value="image/webp">WebP</option></select>`);
  const q = UI.slider("Quality (JPG/WebP)", {min:5,max:100,val:88,fmt:v=>v+"%"});
  root.append(
    UI.el(`<p class="muted small mb">Upload an image, choose the new size in pixels (or use quick % buttons), pick a format and download. Everything runs in your browser.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image here", icon:"🖼️", onFiles: onFile}),
    origInfo,
    UI.el(`<div class="grid-2 mt"><div class="field"><label>Width (px)</label></div><div class="field"><label>Height (px)</label></div></div>`)
  );
  const grid = root.querySelectorAll('.grid-2')[0];
  grid.children[0].appendChild(wInp); grid.children[1].appendChild(hInp);
  root.append(
    UI.el(`<div class="row mb">${[25,50,75,100].map(p=>`<button class="btn ghost sm" data-p="${p}">${p}%</button>`).join("")}${""}</div>`),
    lockCk,
    UI.el(`<div class="grid-2 mt"></div>`)
  );
  const g2 = root.querySelectorAll('.grid-2')[1];
  g2.append(UI.field("Output format",""), UI.field("Quality",""));
  g2.children[0].appendChild(fmtSel); g2.children[1].appendChild(q);
  const go = UI.el(`<button class="btn">📐 Resize Image</button>`);
  root.append(go, out);

  const locked = ()=>lockCk.querySelector('input').checked;
  async function onFile([f]){
    if(!f.type.startsWith("image/")) return UI.toast("Please choose an image file","err");
    file = f; try{ ({img} = await UI.loadImage(f)); }catch(e){ return UI.toast(e.message,"err"); }
    ratio = img.naturalWidth / img.naturalHeight;
    wInp.value = img.naturalWidth; hInp.value = img.naturalHeight;
    origInfo.innerHTML = "";
    origInfo.append(
      UI.el(`<span class="info-pill">📄 <b>${UI.esc(f.name)}</b></span>`),
      UI.el(`<span class="info-pill">Dimensions <b>${img.naturalWidth} × ${img.naturalHeight}px</b></span>`),
      UI.el(`<span class="info-pill">Size <b>${UI.fmtBytes(f.size)}</b></span>`),
      UI.el(`<span class="info-pill">Type <b>${UI.esc(f.type.split('/')[1]||"?").toUpperCase()}</b></span>`)
    );
    out.innerHTML = "";
  }
  wInp.addEventListener('input', ()=>{ if(locked() && img) hInp.value = Math.max(1, Math.round(+wInp.value / ratio)); });
  hInp.addEventListener('input', ()=>{ if(locked() && img) wInp.value = Math.max(1, Math.round(+hInp.value * ratio)); });
  root.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click', ()=>{
    if(!img) return UI.toast("Upload an image first","err");
    const p = +b.dataset.p/100;
    wInp.value = Math.max(1, Math.round(img.naturalWidth*p));
    hInp.value = Math.max(1, Math.round(img.naturalHeight*p));
  }));

  UI.busy(go, async ()=>{
    if(!img) return UI.toast("Upload an image first","err");
    const W = Math.max(1, Math.round(+wInp.value||1)), H = Math.max(1, Math.round(+hInp.value||1));
    let type = fmtSel.value === "auto" ? (file.type==="image/png"?"image/png": file.type==="image/webp"?"image/webp":"image/jpeg") : fmtSel.value;
    const canvas = drawToCanvas(img, W, H, type==="image/jpeg");
    const blob = await UI.canvasBlob(canvas, type, q.get()/100);
    const saved = file.size ? Math.round((1 - blob.size/file.size)*100) : 0;
    out.innerHTML = "";
    const rb = UI.el(`<div class="result-box"></div>`);
    const pf = UI.el(`<div class="preview-frame"></div>`);
    const pi = new Image(); pi.src = URL.createObjectURL(blob); pf.appendChild(pi);
    rb.append(pf, UI.kv([
      ["New dimensions", `${W} × ${H}px`],
      ["Original size", UI.fmtBytes(file.size)],
      ["New size", UI.fmtBytes(blob.size)],
      ["Change", `${saved>0? saved+"% smaller": saved===0 ? "same size": Math.abs(saved)+"% larger"}`, saved>=0?"good":""]
    ]));
    const row = UI.el(`<div class="row"></div>`);
    const dl = UI.el(`<button class="btn">⬇️ Download</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, imgName(file, extFor(type))));
    row.append(dl);
    rb.append(row); out.append(rb);
  });
});

/* 2. IMAGE COMPRESSOR ------------------------------------ */
registerTool("image-compressor", root => {
  let file=null, img=null, timer=null;
  const out = UI.el(`<div></div>`);
  const q = UI.slider("Compression quality", {min:5,max:100,val:70,fmt:v=>v+"%"});
  const fmtSel = UI.el(`<select>
      <option value="auto">Auto (WebP → smallest, JPG compatible)</option>
      <option value="image/jpeg">JPG (maximum compatibility)</option>
      <option value="image/webp">WebP (smallest size)</option></select>`);
  const fmtField = UI.field("Output format","");
  fmtField.appendChild(fmtSel);
  root.append(
    UI.el(`<p class="muted small mb">Drop a photo and get a much smaller file with a live size preview. Quality is fully under your control.</p>`),
    UI.dropzone({accept:"image/png,image/jpeg,image/webp", label:"Drop image(s) to compress", icon:"🗜️", onFiles: addFiles}),
    q, fmtField
  );
  const filesList = UI.el(`<div class="mt" style="display:flex;flex-direction:column;gap:9px"></div>`);
  root.append(filesList, out);

  let items = [];

  function pickType(){
    const v = fmtSel.value;
    if(v !== "auto") return v;
    return "image/webp";
  }
  async function addFiles(fs){
    for(const f of fs){
      if(!f.type.startsWith("image/")) { UI.toast(`${f.name}: not an image`,"err"); continue; }
      try{ const {img} = await UI.loadImage(f); items.push({file:f, img}); }
      catch(e){ UI.toast(e.message,"err"); }
    }
    render();
  }
  function render(){
    filesList.innerHTML = "";
    items.forEach((it,i)=>{
      const row = UI.fileRow("🖼️", it.file.name, `${it.img.naturalWidth}×${it.img.naturalHeight} · ${UI.fmtBytes(it.file.size)}`,
        `<button class="copy-btn" data-x="${i}">✕</button>`);
      row.querySelector('[data-x]').addEventListener('click', e=>{ items.splice(i,1); render(); });
      filesList.append(row);
    });
    schedule();
  }
  q.querySelector('input').addEventListener('input', schedule);
  fmtSel.addEventListener('change', schedule);
  function schedule(){ clearTimeout(timer); timer = setTimeout(run, 350); }

  async function run(){
    out.innerHTML = "";
    if(!items.length) return;
    const type = pickType(), qual = q.get()/100;
    let totIn=0, totOut=0;
    const results = [];
    for(const it of items){
      const c = drawToCanvas(it.img, it.img.naturalWidth, it.img.naturalHeight, type==="image/jpeg");
      const blob = await UI.canvasBlob(c, type, qual);
      totIn += it.file.size; totOut += blob.size;
      results.push({it, blob});
    }
    const saved = Math.max(0, Math.round((1 - totOut/totIn)*100));
    const rb = UI.el(`<div class="result-box"></div>`);
    rb.append(UI.el(`<div class="ok-banner">✅ Original ${UI.fmtBytes(totIn)} → Compressed ${UI.fmtBytes(totOut)} · <b>&nbsp;${saved}% saved</b></div>`));
    const rows = UI.el(`<div style="display:flex;flex-direction:column;gap:9px"></div>`);
    results.forEach(({it,blob})=>{
      const r = UI.fileRow("🗜️", imgName(it.file, extFor(type)),
        `${UI.fmtBytes(it.file.size)} → ${UI.fmtBytes(blob.size)} (${Math.max(0,Math.round((1-blob.size/it.file.size)*100))}% saved)`,
        `<button class="btn sm">⬇️ Download</button>`);
      r.querySelector('.btn').addEventListener('click', ()=>UI.download(blob, imgName(it.file, extFor(type))));
      rows.append(r);
    });
    rb.append(rows);
    if(results.length > 1){
      const zipBtn = UI.el(`<button class="btn ghost">📦 Download all as ZIP</button>`);
      zipBtn.addEventListener('click', async ()=>{
        zipBtn.disabled = true;
        const zip = new JSZip();
        results.forEach(({it,blob})=>zip.file(imgName(it.file, extFor(type)), blob));
        const b = await zip.generateAsync({type:"blob"});
        UI.download(b, "compressed-images.zip"); zipBtn.disabled = false;
      });
      rb.append(zipBtn);
    }
    out.append(rb);
  }
});

/* 3. IMAGE CONVERTER (batch) ------------------------------ */
registerTool("image-converter", root => {
  let items = [];
  const fmtSel = UI.el(`<select>
      <option value="image/png">PNG</option>
      <option value="image/jpeg" selected>JPG</option>
      <option value="image/webp">WebP</option></select>`);
  const out = UI.el(`<div></div>`);
  const list = UI.el(`<div class="mt" style="display:flex;flex-direction:column;gap:9px"></div>`);
  const go = UI.el(`<button class="btn mt">🔁 Convert All</button>`);
  root.append(
    UI.el(`<p class="muted small mb">Convert one or many images to another format. Batch conversion with one-click ZIP download.</p>`),
    UI.dropzone({accept:"image/*", multiple:true, label:"Drop images here", hint:"Multiple files supported", icon:"🔁"}),
    UI.field("Convert to",""),
    go, list, out
  );
  root.querySelector('.field').appendChild(fmtSel);
  const dz = root.querySelector('.dropzone');
  dz.addEventListener('drop', ()=>{});
  const dz2 = UI.dropzone({accept:"image/*", multiple:true, label:"Drop images here", icon:"🔁", onFiles: add});
  dz.replaceWith(dz2);

  async function add(fs){
    for(const f of fs){
      if(!f.type.startsWith("image/")) continue;
      try{ const {img} = await UI.loadImage(f); items.push({file:f, img}); }catch(e){ UI.toast(e.message,"err"); }
    }
    render();
  }
  function render(){
    list.innerHTML="";
    items.forEach((it,i)=>{
      const r = UI.fileRow("🖼️", it.file.name, UI.fmtBytes(it.file.size), `<button class="copy-btn" data-i="${i}">✕</button>`);
      r.querySelector('.copy-btn').addEventListener('click', ()=>{ items.splice(i,1); render(); });
      list.append(r);
    });
  }
  UI.busy(go, async ()=>{
    if(!items.length) return UI.toast("Add some images first","err");
    const type = fmtSel.value; const results=[];
    for(const it of items){
      const c = drawToCanvas(it.img, it.img.naturalWidth, it.img.naturalHeight, type==="image/jpeg");
      results.push({it, blob: await UI.canvasBlob(c, type, .92)});
    }
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    const rows = UI.el(`<div style="display:flex;flex-direction:column;gap:9px"></div>`);
    results.forEach(({it,blob})=>{
      const name = imgName(it.file, extFor(type));
      const r = UI.fileRow("✅", name, `${UI.fmtBytes(it.file.size)} → ${UI.fmtBytes(blob.size)}`, `<button class="btn sm">⬇️</button>`);
      r.querySelector('.btn').addEventListener('click', ()=>UI.download(blob,name));
      rows.append(r);
    });
    rb.append(rows);
    const zipBtn = UI.el(`<button class="btn ghost">📦 Download all as ZIP</button>`);
    zipBtn.addEventListener('click', async ()=>{
      zipBtn.disabled=true;
      const zip = new JSZip();
      results.forEach(({it,blob})=>zip.file(imgName(it.file, extFor(type)), blob));
      UI.download(await zip.generateAsync({type:"blob"}), "converted-images.zip");
      zipBtn.disabled=false;
    });
    rb.append(zipBtn); out.append(rb);
  });
});

/* 4. IMAGE CROPPER ---------------------------------------- */
registerTool("image-cropper", root => {
  let img=null, file=null, scale=1, ratio=null, sel=null;
  const wrap = UI.el(`<div class="crop-wrap" hidden><img alt=""><div class="crop-sel" hidden></div></div>`);
  const cimg = wrap.querySelector('img'), csel = wrap.querySelector('.crop-sel');
  const xi=UI.el(`<input type="number" min="0" value="0">`), yi=UI.el(`<input type="number" min="0" value="0">`),
        wi=UI.el(`<input type="number" min="1" value="0">`), hi=UI.el(`<input type="number" min="1" value="0">`);
  const out = UI.el(`<div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Drag on the image to select the crop area. Use ratio presets or type exact coordinates.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image to crop", icon:"✂️"}),
    wrap,
    UI.el(`<div class="row mt" id="ratioRow">
      <span class="small muted">Ratio:</span>
      ${["Free","1:1","4:3","16:9","3:4","9:16"].map((r,i)=>`<button class="btn ghost sm ${i===0?'on-r':''}" data-r="${r}">${r}</button>`).join("")}
    </div>`)
  );
  const dz = root.querySelector('.dropzone');
  const dz2 = UI.dropzone({accept:"image/*", label:"Drop an image to crop", icon:"✂️", onFiles: async ([f])=>{
    if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
    file=f; try{ ({img} = await UI.loadImage(f)); }catch(e){ return UI.toast(e.message,"err"); }
    cimg.src = img.src; wrap.hidden=false; out.innerHTML="";
    cimg.onload = ()=>{
      scale = img.naturalWidth / cimg.clientWidth;
      sel = {x:0,y:0,w:cimg.clientWidth,h:cimg.clientHeight};
      drawSel(); syncInputs();
    };
    if(cimg.complete) cimg.onload();
  }});
  dz.replaceWith(dz2);

  const g = UI.el(`<div class="grid-3 mt" style="grid-template-columns:repeat(4,1fr)">
      <div class="field"><label>X</label></div><div class="field"><label>Y</label></div>
      <div class="field"><label>Width</label></div><div class="field"><label>Height</label></div></div>`);
  g.children[0].appendChild(xi); g.children[1].appendChild(yi); g.children[2].appendChild(wi); g.children[3].appendChild(hi);
  const cropBtn = UI.el(`<button class="btn mt">✂️ Crop & Download</button>`);
  root.append(g, cropBtn, out);

  root.querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click', ()=>{
    root.querySelectorAll('[data-r]').forEach(x=>x.style.borderColor="");
    b.style.borderColor = "var(--primary)";
    ratio = b.dataset.r==="Free" ? null : b.dataset.r.split(":").map(Number);
  }));

  function drawSel(){
    if(!sel){ csel.hidden=true; return; }
    csel.hidden=false;
    csel.style.left = sel.x+"px"; csel.style.top = sel.y+"px";
    csel.style.width = sel.w+"px"; csel.style.height = sel.h+"px";
  }
  function syncInputs(){
    xi.value = Math.round(sel.x*scale); yi.value = Math.round(sel.y*scale);
    wi.value = Math.round(sel.w*scale); hi.value = Math.round(sel.h*scale);
  }
  [xi,yi,wi,hi].forEach(inp=>inp.addEventListener('change', ()=>{
    if(!img) return;
    sel = { x:+xi.value/scale, y:+yi.value/scale, w:+wi.value/scale, h:+hi.value/scale };
    clampSel(); drawSel(); syncInputs();
  }));
  function clampSel(){
    const W=cimg.clientWidth, H=cimg.clientHeight;
    sel.w = Math.min(sel.w, W-sel.x); sel.h = Math.min(sel.h, H-sel.y);
    sel.x = Math.max(0, Math.min(sel.x, W-1)); sel.y = Math.max(0, Math.min(sel.y, H-1));
    sel.w = Math.max(4, sel.w); sel.h = Math.max(4, sel.h);
  }
  let drag=null;
  wrap.addEventListener('pointerdown', e=>{
    if(!img) return;
    const r = cimg.getBoundingClientRect();
    drag = {x0:e.clientX-r.left, y0:e.clientY-r.top};
    sel = {x:drag.x0, y:drag.y0, w:0, h:0};
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', e=>{
    if(!drag) return;
    const r = cimg.getBoundingClientRect();
    let x1 = Math.max(0, Math.min(e.clientX-r.left, cimg.clientWidth));
    let y1 = Math.max(0, Math.min(e.clientY-r.top, cimg.clientHeight));
    let w = Math.abs(x1-drag.x0), h = Math.abs(y1-drag.y0);
    if(ratio){ h = w * ratio[1]/ratio[0]; if(drag.y0 > y1) {/*keep upward*/} }
    sel = { x: Math.min(drag.x0,x1), y: Math.min(drag.y0, ratio? drag.y0 : y1), w, h: ratio? h : Math.abs(y1-drag.y0) };
    if(ratio){ if(x1 < drag.x0) sel.x = drag.x0 - w; if(y1 < drag.y0) sel.y = drag.y0 - h; }
    clampSel(); drawSel(); syncInputs();
  });
  wrap.addEventListener('pointerup', ()=>drag=null);

  UI.busy(cropBtn, async ()=>{
    if(!img) return UI.toast("Upload an image first","err");
    const sx=+xi.value, sy=+yi.value, sw=+wi.value, sh=+hi.value;
    if(sw<1||sh<1) return UI.toast("Crop area is too small","err");
    const c = document.createElement('canvas'); c.width=sw; c.height=sh;
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await UI.canvasBlob(c, file.type==="image/png"?"image/png":"image/jpeg", .92);
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    const pf = UI.el(`<div class="preview-frame"></div>`); const pi=new Image(); pi.src=URL.createObjectURL(blob); pf.append(pi);
    const dl = UI.el(`<button class="btn">⬇️ Download Cropped Image</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, imgName(file, file.type==="image/png"?"png":"jpg")));
    rb.append(pf, UI.kv([["Cropped size", `${sw} × ${sh}px`],["File size", UI.fmtBytes(blob.size)]]), dl);
    out.append(rb);
  });
});

/* 5. ROTATE & FLIP ----------------------------------------- */
registerTool("rotate-flip", root => {
  let canvas=null, file=null;
  const prev = UI.el(`<div class="preview-frame mt" hidden></div>`);
  const dl = UI.el(`<button class="btn mt" hidden>⬇️ Download PNG</button>`);
  root.append(
    UI.el(`<p class="muted small mb">Fix sideways or upside-down photos. All operations are lossless previews until you download.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🔄"}),
    UI.el(`<div class="row mt">
      <button class="btn ghost" id="r1">⟲ 90° Left</button>
      <button class="btn ghost" id="r2">⟳ 90° Right</button>
      <button class="btn ghost" id="fh">↔️ Flip Horizontal</button>
      <button class="btn ghost" id="fv">↕️ Flip Vertical</button>
      <button class="btn ghost" id="rst">♻️ Reset</button></div>`),
    prev, dl
  );
  const dz = root.querySelector('.dropzone');
  let baseImg=null;
  const dz2 = UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🔄", onFiles: async ([f])=>{
    if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
    file=f; try{ ({img:baseImg} = await UI.loadImage(f)); }catch(e){ return UI.toast(e.message,"err"); }
    canvas = drawToCanvas(baseImg, baseImg.naturalWidth, baseImg.naturalHeight);
    show();
  }});
  dz.replaceWith(dz2);
  function show(){
    prev.hidden=false; dl.hidden=false; prev.innerHTML="";
    const im = new Image(); im.src = canvas.toDataURL(); prev.append(im);
  }
  function transform(fn){
    if(!canvas) return UI.toast("Upload an image first","err");
    fn(); show();
  }
  root.querySelector('#r1').addEventListener('click', ()=>transform(()=>{
    const c=document.createElement('canvas'); c.width=canvas.height; c.height=canvas.width;
    const x=c.getContext('2d'); x.translate(0,c.height); x.rotate(-Math.PI/2); x.drawImage(canvas,0,0); canvas=c;
  }));
  root.querySelector('#r2').addEventListener('click', ()=>transform(()=>{
    const c=document.createElement('canvas'); c.width=canvas.height; c.height=canvas.width;
    const x=c.getContext('2d'); x.translate(c.width,0); x.rotate(Math.PI/2); x.drawImage(canvas,0,0); canvas=c;
  }));
  root.querySelector('#fh').addEventListener('click', ()=>transform(()=>{
    const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height;
    const x=c.getContext('2d'); x.translate(c.width,0); x.scale(-1,1); x.drawImage(canvas,0,0); canvas=c;
  }));
  root.querySelector('#fv').addEventListener('click', ()=>transform(()=>{
    const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height;
    const x=c.getContext('2d'); x.translate(0,c.height); x.scale(1,-1); x.drawImage(canvas,0,0); canvas=c;
  }));
  root.querySelector('#rst').addEventListener('click', ()=>{
    if(!baseImg) return; canvas = drawToCanvas(baseImg, baseImg.naturalWidth, baseImg.naturalHeight); show();
  });
  UI.busy(dl, async ()=>{
    const blob = await UI.canvasBlob(canvas, "image/png");
    UI.download(blob, imgName(file, "png").replace(/\.png$/,"") + "-edited.png");
  });
});

/* 6. PHOTO FILTERS ------------------------------------------ */
registerTool("photo-filters", root => {
  let img=null, file=null;
  const prev = UI.el(`<canvas style="max-width:100%;max-height:400px;border-radius:10px" hidden></canvas>`);
  const out = UI.el(`<div></div>`);
  const S = {
    brightness: UI.slider("Brightness", {min:0,max:200,val:100,fmt:v=>v+"%"}),
    contrast:   UI.slider("Contrast",   {min:0,max:200,val:100,fmt:v=>v+"%"}),
    saturation: UI.slider("Saturation", {min:0,max:200,val:100,fmt:v=>v+"%"}),
    grayscale:  UI.slider("Grayscale",  {min:0,max:100,val:0,fmt:v=>v+"%"}),
    sepia:      UI.slider("Sepia",      {min:0,max:100,val:0,fmt:v=>v+"%"}),
    blur:       UI.slider("Blur",       {min:0,max:20,val:0,fmt:v=>v+"px"}),
    hue:        UI.slider("Hue rotate", {min:0,max:360,val:0,fmt:v=>v+"°"}),
  };
  root.append(
    UI.el(`<p class="muted small mb">Professional one-tap presets plus fine sliders. Live preview, PNG export.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop a photo", icon:"🎨"}),
    UI.el(`<div class="row mt" id="presets"></div>`)
  );
  const dz = root.querySelector('.dropzone');
  const dz2 = UI.dropzone({accept:"image/*", label:"Drop a photo", icon:"🎨", onFiles: async ([f])=>{
    if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
    file=f; try{ ({img} = await UI.loadImage(f)); }catch(e){ return UI.toast(e.message,"err"); }
    prev.hidden=false; apply();
  }});
  dz.replaceWith(dz2);
  Object.values(S).forEach(s=>{ root.append(s); s.querySelector('input').addEventListener('input', apply); });
  root.append(prev, out);

  const presets = {
    "Original": {brightness:100,contrast:100,saturation:100,grayscale:0,sepia:0,blur:0,hue:0},
    "B & W":    {brightness:105,contrast:115,saturation:100,grayscale:100,sepia:0,blur:0,hue:0},
    "Vintage":  {brightness:105,contrast:90,saturation:80,grayscale:0,sepia:45,blur:0,hue:0},
    "Warm":     {brightness:105,contrast:102,saturation:115,grayscale:0,sepia:18,blur:0,hue:350},
    "Cool":     {brightness:102,contrast:105,saturation:105,grayscale:0,sepia:0,blur:0,hue:200},
    "Pop":      {brightness:108,contrast:130,saturation:145,grayscale:0,sepia:0,blur:0,hue:0},
    "Soft":     {brightness:110,contrast:92,saturation:90,grayscale:0,sepia:8,blur:1,hue:0},
  };
  const pRow = root.querySelector('#presets');
  Object.entries(presets).forEach(([name,p],i)=>{
    const b = UI.el(`<button class="btn ghost sm">${name}</button>`);
    b.addEventListener('click', ()=>{ Object.entries(p).forEach(([k,v])=>S[k].set(v)); apply(); });
    pRow.append(b);
  });

  function apply(){
    if(!img) return;
    prev.width = img.naturalWidth; prev.height = img.naturalHeight;
    const x = prev.getContext('2d');
    x.filter = `brightness(${S.brightness.get()}%) contrast(${S.contrast.get()}%) saturate(${S.saturation.get()}%) grayscale(${S.grayscale.get()}%) sepia(${S.sepia.get()}%) blur(${S.blur.get()}px) hue-rotate(${S.hue.get()}deg)`;
    x.drawImage(img,0,0);
  }
  const dl = UI.el(`<button class="btn mt">⬇️ Download Filtered Image</button>`);
  dl.hidden = false;
  out.append(dl);
  UI.busy(dl, async ()=>{
    if(!img) return UI.toast("Upload a photo first","err");
    const blob = await UI.canvasBlob(prev, "image/png");
    UI.download(blob, imgName(file,"png").replace(/\.png$/,"")+"-filtered.png");
  });
});

/* 7. WATERMARK ---------------------------------------------- */
registerTool("image-watermark", root => {
  let img=null, file=null;
  const prev = UI.el(`<div class="preview-frame mt" hidden></div>`);
  const txt = UI.el(`<input type="text" value="© My Photo" maxlength="80">`);
  const size = UI.slider("Text size (relative)", {min:2,max:20,val:6,fmt:v=>v+"%"});
  const op = UI.slider("Opacity", {min:5,max:100,val:35,fmt:v=>v+"%"});
  const col = UI.el(`<input type="color" value="#ffffff" style="height:42px;padding:4px">`);
  const pos = UI.el(`<select>
      <option value="tile">Tiled (all over)</option>
      <option value="br" selected>Bottom right</option>
      <option value="bl">Bottom left</option>
      <option value="tr">Top right</option>
      <option value="tl">Top left</option>
      <option value="c">Center</option></select>`);
  const out = UI.el(`<div></div>`);
  const fTxt = UI.field("Watermark text",""); fTxt.appendChild(txt);
  const fPos = UI.field("Position",""); fPos.appendChild(pos);
  const fCol = UI.field("Text color",""); fCol.appendChild(col);
  root.append(
    UI.el(`<p class="muted small mb">Protect your photos with a text watermark — tiled across the image or placed in a corner.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image to watermark", icon:"💧", onFiles: async ([f])=>{
      if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
      file=f; try{ ({img} = await UI.loadImage(f)); }catch(e){ return UI.toast(e.message,"err"); }
      prev.hidden=false; apply();
    }}),
    fTxt, fPos, size, op, fCol, prev, out
  );
  [txt,pos,col].forEach(el=>el.addEventListener('input', apply));
  size.querySelector('input').addEventListener('input', apply);
  op.querySelector('input').addEventListener('input', apply);

  function apply(){
    if(!img) return;
    const c = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
    const x = c.getContext('2d');
    const fs = Math.max(12, Math.round(c.width * size.get()/100));
    x.font = `600 ${fs}px Inter, Arial, sans-serif`;
    x.globalAlpha = op.get()/100; x.fillStyle = col.value;
    x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 3;
    const t = txt.value || "©";
    if(pos.value === "tile"){
      x.textAlign="left"; x.textBaseline="middle";
      const stepX = Math.max(x.measureText(t).width*1.6, fs*6), stepY = fs*5;
      for(let yy=stepY/2; yy<c.height; yy+=stepY)
        for(let xx=-c.width*0.25; xx<c.width; xx+=stepX){
          x.save(); x.translate(xx,yy); x.rotate(-Math.PI/8); x.fillText(t,0,0); x.restore();
        }
    } else {
      const pad = fs*0.8;
      const posMap = { br:[c.width-pad,c.height-pad,"right","bottom"], bl:[pad,c.height-pad,"left","bottom"],
                       tr:[c.width-pad,pad,"right","top"], tl:[pad,pad,"left","top"], c:[c.width/2,c.height/2,"center","middle"] };
      const [px,py,al,bl] = posMap[pos.value];
      x.textAlign=al; x.textBaseline=bl; x.fillText(t,px,py);
    }
    prev.innerHTML=""; const im=new Image(); im.src=c.toDataURL(); prev.append(im);
    prev.dataset.ready="1"; prev._canvas=c;
  }
  const dl = UI.el(`<button class="btn mt">⬇️ Download Watermarked Image</button>`);
  out.append(dl);
  UI.busy(dl, async ()=>{
    if(!img) return UI.toast("Upload an image first","err");
    const blob = await UI.canvasBlob(prev._canvas, "image/png");
    UI.download(blob, imgName(file,"png").replace(/\.png$/,"")+"-watermarked.png");
  });
});

/* 8. IMAGE TO BASE64 ---------------------------------------- */
registerTool("image-to-base64", root => {
  const out = UI.el(`<div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Get a Base64 data URI you can paste straight into HTML, CSS or markdown.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🧬"}),
    out
  );
  const dz = root.querySelector('.dropzone');
  const dz2 = UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🧬", onFiles: ([f])=>{
    if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
    const rd = new FileReader();
    rd.onload = ()=>{
      const s = rd.result;
      out.innerHTML="";
      const rb = UI.el(`<div class="result-box"></div>`);
      rb.append(UI.kv([["File", UI.esc(f.name)],["Data URI length", s.length.toLocaleString()+" chars"]]));
      const ta = UI.el(`<textarea class="code" rows="7" readonly></textarea>`);
      ta.value = s; rb.append(ta);
      const row = UI.el(`<div class="row"></div>`);
      const cp = UI.el(`<button class="btn sm">📋 Copy Data URI</button>`);
      cp.addEventListener('click', ()=>UI.copy(s));
      const cpHtml = UI.el(`<button class="btn ghost sm">📋 Copy as &lt;img&gt; tag</button>`);
      cpHtml.addEventListener('click', ()=>UI.copy(`<img src="${s}" alt="">`));
      row.append(cp, cpHtml); rb.append(row);
      const pf = UI.el(`<div class="preview-frame"></div>`); const im=new Image(); im.src=s; pf.append(im);
      rb.append(pf); out.append(rb);
    };
    rd.readAsDataURL(f);
  }});
  dz.replaceWith(dz2);
});

/* 9. IMAGE COLOR PICKER -------------------------------------- */
registerTool("image-color-picker", root => {
  const cv = UI.el(`<canvas style="max-width:100%;max-height:420px;border-radius:10px;cursor:crosshair" hidden></canvas>`);
  const cur = UI.el(`<div class="row mt" hidden>
      <div class="swatch" id="curSw" style="width:64px;height:64px"></div>
      <div><b id="curHex" style="font-size:18px"></b><div class="small muted" id="curRgb"></div>
      <button class="copy-btn mt" id="cpHex">Copy HEX</button></div></div>`);
  const pal = UI.el(`<div class="mt"><b class="small">Your palette (click to copy)</b><div class="swatch-row mt" id="palRow"></div></div>`);
  const palette = [];
  root.append(
    UI.el(`<p class="muted small mb">Upload an image, then click/tap anywhere on it to extract the exact pixel color.</p>`),
    UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🎯"}),
    cv, cur, pal
  );
  const dz = root.querySelector('.dropzone');
  const dz2 = UI.dropzone({accept:"image/*", label:"Drop an image", icon:"🎯", onFiles: async ([f])=>{
    if(!f.type.startsWith("image/")) return UI.toast("Not an image","err");
    try{ const {img} = await UI.loadImage(f);
      cv.width=img.naturalWidth; cv.height=img.naturalHeight;
      cv.getContext('2d').drawImage(img,0,0); cv.hidden=false; cur.hidden=false;
    }catch(e){ UI.toast(e.message,"err"); }
  }});
  dz.replaceWith(dz2);
  cv.addEventListener('click', e=>{
    const r = cv.getBoundingClientRect();
    const x = Math.floor((e.clientX-r.left) * cv.width/r.width);
    const y = Math.floor((e.clientY-r.top) * cv.height/r.height);
    const [R,G,B] = cv.getContext('2d').getImageData(x,y,1,1).data;
    const hex = "#"+[R,G,B].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
    root.querySelector('#curSw').style.background = hex;
    root.querySelector('#curHex').textContent = hex;
    root.querySelector('#curRgb').textContent = `rgb(${R}, ${G}, ${B})`;
    root.querySelector('#cpHex').onclick = ()=>UI.copy(hex);
    if(!palette.includes(hex)){
      palette.push(hex);
      const sw = UI.el(`<div class="swatch" style="background:${hex}" title="${hex}"></div>`);
      sw.addEventListener('click', ()=>UI.copy(hex, hex+" copied ✓"));
      root.querySelector('#palRow').append(sw);
    }
  });
});

})();

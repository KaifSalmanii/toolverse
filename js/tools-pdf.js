/* ============================================================
   ToolVerse — PDF tools (pdf-lib, fully client-side)
   ============================================================ */
(() => {
const { PDFDocument, degrees } = PDFLib;
const readBytes = f => f.arrayBuffer();

/* parse "1-3,5,8-10" -> [0,1,2,4,7,8,9] (0-based) */
function parseRanges(str, max){
  const out = new Set();
  for(const part of String(str).split(",")){
    const p = part.trim(); if(!p) continue;
    if(p.includes("-")){
      const [a,b] = p.split("-").map(s=>parseInt(s,10));
      if(isNaN(a)||isNaN(b)) throw new Error(`Invalid range: "${p}"`);
      for(let i=Math.min(a,b); i<=Math.max(a,b); i++) if(i>=1&&i<=max) out.add(i-1);
    } else {
      const n = parseInt(p,10);
      if(isNaN(n)) throw new Error(`Invalid page: "${p}"`);
      if(n>=1&&n<=max) out.add(n-1);
    }
  }
  return [...out].sort((a,b)=>a-b);
}

const pageSizePts = {
  "image": null,
  "a4":   [595.28, 841.89],
  "letter":[612, 792],
};

/* 1. JPG / IMAGE TO PDF ------------------------------------- */
registerTool("jpg-to-pdf", root => {
  let items = [];
  const list = UI.el(`<div class="mt" style="display:flex;flex-direction:column;gap:9px"></div>`);
  const pageSel = UI.el(`<select>
      <option value="image" selected>Fit to image (original size)</option>
      <option value="a4">A4 page (fit with margin)</option>
      <option value="letter">US Letter (fit with margin)</option></select>`);
  const out = UI.el(`<div></div>`);
  const go = UI.el(`<button class="btn mt">📄 Create PDF</button>`);
  root.append(
    UI.el(`<p class="muted small mb">Combine JPG/PNG images into one PDF. Each image becomes a page — A4 pages or exact image size.</p>`),
    UI.dropzone({accept:"image/jpeg,image/png,image/webp", multiple:true, label:"Drop images (in page order)", icon:"🖼️"}),
    list, UI.field("Page size",""), go, out
  );
  root.querySelector('.field').appendChild(pageSel);
  const dz = root.querySelector('.dropzone');
  dz.replaceWith(UI.dropzone({accept:"image/jpeg,image/png,image/webp", multiple:true, label:"Drop images (in page order)", icon:"🖼️", onFiles: add}));

  async function add(fs){
    for(const f of fs){
      if(!/^image\/(jpeg|png|webp)$/.test(f.type)){ UI.toast(`${f.name}: only JPG/PNG/WebP`, "err"); continue; }
      items.push(f);
    }
    render();
  }
  function render(){
    list.innerHTML="";
    items.forEach((f,i)=>{
      const r = UI.fileRow("🖼️", f.name, `Page ${i+1} · ${UI.fmtBytes(f.size)}`,
        `<button class="copy-btn" data-a="up">↑</button> <button class="copy-btn" data-a="dn">↓</button> <button class="copy-btn" data-a="rm">✕</button>`);
      r.querySelector('[data-a=up]').onclick = ()=>{ if(i>0){ [items[i-1],items[i]]=[items[i],items[i-1]]; render(); } };
      r.querySelector('[data-a=dn]').onclick = ()=>{ if(i<items.length-1){ [items[i+1],items[i]]=[items[i],items[i+1]]; render(); } };
      r.querySelector('[data-a=rm]').onclick = ()=>{ items.splice(i,1); render(); };
      list.append(r);
    });
  }
  UI.busy(go, async ()=>{
    if(!items.length) return UI.toast("Add images first","err");
    const doc = await PDFDocument.create();
    const mode = pageSel.value;
    for(const f of items){
      const bytes = await readBytes(f);
      let img;
      try{ img = f.type==="image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes); }
      catch(e){ throw new Error(`Could not embed ${f.name} — try JPG or PNG`); }
      if(mode === "image"){
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, {x:0, y:0, width:img.width, height:img.height});
      } else {
        const [pw, ph] = pageSizePts[mode], m = 36;
        const s = Math.min((pw-2*m)/img.width, (ph-2*m)/img.height);
        const w = img.width*s, h = img.height*s;
        const page = doc.addPage([pw, ph]);
        page.drawImage(img, {x:(pw-w)/2, y:(ph-h)/2, width:w, height:h});
      }
    }
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:"application/pdf"});
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    rb.append(UI.el(`<div class="ok-banner">✅ PDF created — ${doc.getPageCount()} page(s), ${UI.fmtBytes(blob.size)}</div>`));
    const dl = UI.el(`<button class="btn">⬇️ Download PDF</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, "images.pdf"));
    rb.append(dl); out.append(rb);
  });
});

/* 2. MERGE PDF ---------------------------------------------- */
registerTool("merge-pdf", root => {
  let items = [];   // {file, bytes, pages}
  const list = UI.el(`<div class="mt" style="display:flex;flex-direction:column;gap:9px"></div>`);
  const go = UI.el(`<button class="btn mt">🧩 Merge PDFs</button>`);
  const out = UI.el(`<div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Combine multiple PDFs into a single file. Reorder with the ↑ ↓ buttons before merging.</p>`),
    UI.dropzone({accept:"application/pdf", multiple:true, label:"Drop PDF files", icon:"🧩"}),
    list, go, out
  );
  const dz = root.querySelector('.dropzone');
  dz.replaceWith(UI.dropzone({accept:"application/pdf", multiple:true, label:"Drop PDF files", icon:"🧩", onFiles: add}));

  async function add(fs){
    for(const f of fs){
      if(f.type!=="application/pdf" && !/\.pdf$/i.test(f.name)){ UI.toast(`${f.name}: not a PDF`,"err"); continue; }
      try{
        const bytes = await readBytes(f);
        const d = await PDFDocument.load(bytes, {ignoreEncryption:true});
        items.push({file:f, bytes, pages:d.getPageCount()});
      }catch(e){ UI.toast(`${f.name}: could not read this PDF`,"err"); }
    }
    render();
  }
  function render(){
    list.innerHTML="";
    items.forEach((it,i)=>{
      const r = UI.fileRow("📄", it.file.name, `${it.pages} pages · ${UI.fmtBytes(it.file.size)}`,
        `<button class="copy-btn" data-a="up">↑</button> <button class="copy-btn" data-a="dn">↓</button> <button class="copy-btn" data-a="rm">✕</button>`);
      r.querySelector('[data-a=up]').onclick = ()=>{ if(i>0){ [items[i-1],items[i]]=[items[i],items[i-1]]; render(); } };
      r.querySelector('[data-a=dn]').onclick = ()=>{ if(i<items.length-1){ [items[i+1],items[i]]=[items[i],items[i+1]]; render(); } };
      r.querySelector('[data-a=rm]').onclick = ()=>{ items.splice(i,1); render(); };
      list.append(r);
    });
  }
  UI.busy(go, async ()=>{
    if(items.length < 2) return UI.toast("Add at least 2 PDFs to merge","err");
    const outDoc = await PDFDocument.create();
    let total = 0;
    for(const it of items){
      const src = await PDFDocument.load(it.bytes, {ignoreEncryption:true});
      const pages = await outDoc.copyPages(src, src.getPageIndices());
      pages.forEach(p=>outDoc.addPage(p));
      total += pages.length;
    }
    const blob = new Blob([await outDoc.save()], {type:"application/pdf"});
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    rb.append(UI.el(`<div class="ok-banner">✅ Merged ${items.length} PDFs → ${total} pages · ${UI.fmtBytes(blob.size)}</div>`));
    const dl = UI.el(`<button class="btn">⬇️ Download Merged PDF</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, "merged.pdf"));
    rb.append(dl); out.append(rb);
  });
});

/* 3. SPLIT / EXTRACT PDF ------------------------------------- */
registerTool("split-pdf", root => {
  let bytes=null, pages=0, file=null;
  const info = UI.el(`<div class="info-strip"></div>`);
  const range = UI.el(`<input type="text" placeholder="e.g. 1-3, 5, 8-10">`);
  const every = UI.el(`<label class="check mt"><input type="checkbox"> Split EVERY page into its own PDF (downloads ZIP)</label>`);
  const go = UI.el(`<button class="btn mt">🪓 Extract Pages</button>`);
  const out = UI.el(`<div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Extract selected pages into a new PDF, or split the whole document into one PDF per page.</p>`),
    UI.dropzone({accept:"application/pdf", label:"Drop a PDF", icon:"🪓"}),
    info, UI.field("Pages to extract",""), every, go, out
  );
  root.querySelector('.field').appendChild(range);
  const dz = root.querySelector('.dropzone');
  dz.replaceWith(UI.dropzone({accept:"application/pdf", label:"Drop a PDF", icon:"🪓", onFiles: async ([f])=>{
    try{
      bytes = await readBytes(f);
      const d = await PDFDocument.load(bytes, {ignoreEncryption:true});
      pages = d.getPageCount(); file = f;
      info.innerHTML="";
      info.append(UI.el(`<span class="info-pill">📄 <b>${UI.esc(f.name)}</b></span>`),
                  UI.el(`<span class="info-pill">Pages <b>${pages}</b></span>`),
                  UI.el(`<span class="info-pill">Size <b>${UI.fmtBytes(f.size)}</b></span>`));
      range.value = `1-${pages}`; out.innerHTML="";
    }catch(e){ UI.toast("Could not read this PDF","err"); }
  }}));
  UI.busy(go, async ()=>{
    if(!bytes) return UI.toast("Upload a PDF first","err");
    const src = await PDFDocument.load(bytes, {ignoreEncryption:true});
    if(every.querySelector('input').checked){
      const zip = new JSZip();
      for(let i=0;i<pages;i++){
        const d = await PDFDocument.create();
        const [p] = await d.copyPages(src, [i]);
        d.addPage(p);
        zip.file(`page-${i+1}.pdf`, await d.save());
      }
      const blob = await zip.generateAsync({type:"blob"});
      out.innerHTML="";
      const rb = UI.el(`<div class="result-box"></div>`);
      rb.append(UI.el(`<div class="ok-banner">✅ ${pages} separate PDFs ready (${UI.fmtBytes(blob.size)})</div>`));
      const dl = UI.el(`<button class="btn">⬇️ Download ZIP</button>`);
      dl.addEventListener('click', ()=>UI.download(blob, "split-pages.zip"));
      rb.append(dl); out.append(rb);
      return;
    }
    const idx = parseRanges(range.value, pages);
    if(!idx.length) throw new Error("No valid pages in that range.");
    const d = await PDFDocument.create();
    const copied = await d.copyPages(src, idx);
    copied.forEach(p=>d.addPage(p));
    const blob = new Blob([await d.save()], {type:"application/pdf"});
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    rb.append(UI.el(`<div class="ok-banner">✅ Extracted ${idx.length} page(s) · ${UI.fmtBytes(blob.size)}</div>`));
    const dl = UI.el(`<button class="btn">⬇️ Download Extracted PDF</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, "extracted.pdf"));
    rb.append(dl); out.append(rb);
  });
});

/* 4. ROTATE PDF ---------------------------------------------- */
registerTool("rotate-pdf", root => {
  let bytes=null, pages=0, file=null;
  const info = UI.el(`<div class="info-strip"></div>`);
  const ang = UI.el(`<select><option value="90">90° clockwise</option><option value="180">180° (upside down)</option><option value="270">270° clockwise (90° left)</option></select>`);
  const which = UI.el(`<select>
      <option value="all" selected>All pages</option>
      <option value="odd">Odd pages only</option>
      <option value="even">Even pages only</option>
      <option value="custom">Custom range…</option></select>`);
  const range = UI.el(`<input type="text" placeholder="e.g. 1-3, 5" hidden>`);
  const go = UI.el(`<button class="btn mt">🔃 Rotate & Download</button>`);
  const out = UI.el(`<div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Fix scanned or sideways PDFs. Rotation is saved permanently into the file.</p>`),
    UI.dropzone({accept:"application/pdf", label:"Drop a PDF", icon:"🔃"}),
    info,
    UI.el(`<div class="grid-2"></div>`),
    range, go, out
  );
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Rotation",""), UI.field("Apply to",""));
  g.children[0].appendChild(ang); g.children[1].appendChild(which);
  which.addEventListener('change', ()=>range.hidden = which.value!=="custom");
  const dz = root.querySelector('.dropzone');
  dz.replaceWith(UI.dropzone({accept:"application/pdf", label:"Drop a PDF", icon:"🔃", onFiles: async ([f])=>{
    try{
      bytes = await readBytes(f);
      const d = await PDFDocument.load(bytes, {ignoreEncryption:true});
      pages = d.getPageCount(); file=f;
      info.innerHTML="";
      info.append(UI.el(`<span class="info-pill">📄 <b>${UI.esc(f.name)}</b></span>`),
                  UI.el(`<span class="info-pill">Pages <b>${pages}</b></span>`));
      out.innerHTML="";
    }catch(e){ UI.toast("Could not read this PDF","err"); }
  }}));
  UI.busy(go, async ()=>{
    if(!bytes) return UI.toast("Upload a PDF first","err");
    let idx;
    if(which.value==="all") idx = [...Array(pages).keys()];
    else if(which.value==="odd") idx = [...Array(pages).keys()].filter(i=>i%2===0);
    else if(which.value==="even") idx = [...Array(pages).keys()].filter(i=>i%2===1);
    else idx = parseRanges(range.value, pages);
    if(!idx.length) throw new Error("No pages selected.");
    const d = await PDFDocument.load(bytes, {ignoreEncryption:true});
    const rot = parseInt(ang.value,10);
    idx.forEach(i=>{
      const p = d.getPage(i);
      p.setRotation(degrees(((p.getRotation().angle||0) + rot) % 360));
    });
    const blob = new Blob([await d.save()], {type:"application/pdf"});
    out.innerHTML="";
    const rb = UI.el(`<div class="result-box"></div>`);
    rb.append(UI.el(`<div class="ok-banner">✅ Rotated ${idx.length} page(s) by ${rot}°</div>`));
    const dl = UI.el(`<button class="btn">⬇️ Download Rotated PDF</button>`);
    dl.addEventListener('click', ()=>UI.download(blob, "rotated.pdf"));
    rb.append(dl); out.append(rb);
  });
});

})();

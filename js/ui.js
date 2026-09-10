/* ============================================================
   ToolVerse — UI kit & shared helpers
   ============================================================ */

const TM = { mounts: {} };                 // tool mount functions
const registerTool = (slug, fn) => { TM.mounts[slug] = fn; };

const UI = {
  esc(s){ return String(s??"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },

  el(html){
    const t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  },

  fmtBytes(n){
    if(!isFinite(n)) return "—";
    if(n < 1024) return n + " B";
    if(n < 1048576) return (n/1024).toFixed(1) + " KB";
    if(n < 1073741824) return (n/1048576).toFixed(2) + " MB";
    return (n/1073741824).toFixed(2) + " GB";
  },

  toast(msg, type="ok"){
    const host = document.getElementById('toastHost');
    const t = UI.el(`<div class="toast ${type==='err'?'err':''}">${UI.esc(msg)}</div>`);
    host.appendChild(t);
    setTimeout(()=>{ t.style.opacity=0; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),320); }, 2400);
  },

  async copy(text, msg="Copied to clipboard ✓"){
    try{ await navigator.clipboard.writeText(text); UI.toast(msg); }
    catch(e){
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try{ document.execCommand('copy'); UI.toast(msg);}catch(_){ UI.toast("Copy failed","err"); }
      ta.remove();
    }
  },

  download(blob, name){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
  },

  loadImage(file){
    return new Promise((res, rej)=>{
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = ()=>res({img, url});
      img.onerror = ()=>{ URL.revokeObjectURL(url); rej(new Error("Could not read this image file.")); };
      img.src = url;
    });
  },

  canvasBlob(canvas, type="image/png", q){
    return new Promise((res, rej)=>canvas.toBlob(b=>b?res(b):rej(new Error("Export failed")), type, q));
  },

  /* Drag & drop + click + paste file zone */
  dropzone({accept="", multiple=false, label="Drop files here", hint="or click to browse", icon="📁", onFiles}){
    const dz = UI.el(`
      <div class="dropzone" tabindex="0" role="button" aria-label="Upload files">
        <div class="dz-icon">${icon}</div>
        <b>${UI.esc(label)}</b>
        <small>${UI.esc(hint)}${accept?` · ${UI.esc(accept)}`:""}</small>
        <input type="file" ${multiple?"multiple":""} ${accept?`accept="${UI.esc(accept)}"`:""}>
      </div>`);
    const inp = dz.querySelector('input');
    const handle = files => { if(files && files.length) onFiles(multiple ? [...files] : [files[0]]); };
    dz.addEventListener('click', ()=>inp.click());
    dz.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); inp.click(); }});
    inp.addEventListener('change', ()=>{ handle(inp.files); inp.value=""; });
    ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.add('over'); }));
    ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev, e=>{ e.preventDefault(); dz.classList.remove('over'); }));
    dz.addEventListener('drop', e=>handle(e.dataTransfer.files));
    return dz;
  },

  /* labelled range slider with live value */
  slider(label, {min=0,max=100,val=50,step=1, fmt=v=>v, onInput}){
    const w = UI.el(`<div class="field">
        <label>${UI.esc(label)}</label>
        <div class="range-row">
          <input type="range" min="${min}" max="${max}" step="${step}" value="${val}">
          <span class="range-val">${UI.esc(fmt(val))}</span>
        </div></div>`);
    const r = w.querySelector('input'), out = w.querySelector('.range-val');
    r.addEventListener('input', ()=>{ out.textContent = fmt(+r.value); if(onInput) onInput(+r.value); });
    w.get = ()=>+r.value; w.set = v=>{ r.value=v; out.textContent=fmt(v); };
    return w;
  },

  field(label, controlHtml){
    const f = UI.el(`<div class="field"><label>${UI.esc(label)}</label>${controlHtml}</div>`);
    return f;
  },

  /* Async button wrapper: shows spinner, catches errors */
  busy(btn, fn){
    btn.addEventListener('click', async ()=>{
      if(btn.disabled) return;
      const old = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Working…`;
      try{ await fn(); }
      catch(e){ console.error(e); UI.toast(e.message || "Something went wrong", "err"); }
      finally{ btn.disabled=false; btn.innerHTML = old; }
    });
  },

  kv(pairs){
    return UI.el(`<div>${pairs.map(([k,v,cls])=>`<div class="kv"><span>${UI.esc(k)}</span><b class="${cls||''}">${v}</b></div>`).join("")}</div>`);
  },

  fileRow(icon, name, sub, rightHtml=""){
    return UI.el(`<div class="file-row"><span class="fi">${icon}</span>
      <div class="fn"><b>${UI.esc(name)}</b><small>${UI.esc(sub)}</small></div>${rightHtml}</div>`);
  },
};

/* ---------- favourites & recents (localStorage) ---------- */
const Store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem("tv_"+k)) ?? d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("tv_"+k, JSON.stringify(v)); }catch(e){} },
  favs(){ return Store.get("favs", []); },
  toggleFav(slug){
    let f = Store.favs();
    f = f.includes(slug) ? f.filter(x=>x!==slug) : [slug, ...f];
    Store.set("favs", f); return f.includes(slug);
  },
  isFav(slug){ return Store.favs().includes(slug); },
  addRecent(slug){
    let r = Store.get("recent", []).filter(x=>x!==slug);
    r.unshift(slug); Store.set("recent", r.slice(0,10));
  },
  recent(){ return Store.get("recent", []); },
};
window.UI = UI; window.Store = Store; window.registerTool = registerTool;

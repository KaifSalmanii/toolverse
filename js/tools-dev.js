/* ============================================================
   ToolVerse — Developer tools
   ============================================================ */
(() => {

/* 1. JSON FORMATTER ----------------------------------------- */
registerTool("json-formatter", root => {
  const tin = UI.el(`<textarea class="code" rows="9" placeholder='{"paste":"your JSON here"}'></textarea>`);
  const out = UI.el(`<pre class="output-pre mt" hidden></pre>`);
  const errBox = UI.el(`<div class="err-banner mt" hidden></div>`);
  const ind = UI.el(`<select><option value="2" selected>2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select>`);
  root.append(
    UI.el(`<p class="muted small mb">Beautify, minify and validate JSON — with clear error messages when something is wrong.</p>`),
    tin,
    UI.el(`<div class="row mt mb"><span class="small muted">Indent:</span></div>`),
  );
  root.querySelector('.row').appendChild(ind);
  const btns = UI.el(`<div class="row mb">
      <button class="btn" id="fmt">✨ Format</button>
      <button class="btn ghost" id="min">🗜️ Minify</button>
      <button class="btn ghost" id="val">✅ Validate</button></div>`);
  root.append(btns, errBox, out);
  function parse(){
    errBox.hidden = true; out.hidden = true;
    try{ return JSON.parse(tin.value); }
    catch(e){ errBox.hidden=false; errBox.textContent = "❌ " + e.message; return undefined; }
  }
  root.querySelector('#fmt').addEventListener('click', ()=>{
    const v = parse(); if(v===undefined) return;
    const sp = ind.value==="tab" ? "\t" : +ind.value;
    out.hidden=false; out.textContent = JSON.stringify(v, null, sp);
    UI.toast("Formatted ✓");
  });
  root.querySelector('#min').addEventListener('click', ()=>{
    const v = parse(); if(v===undefined) return;
    out.hidden=false; out.textContent = JSON.stringify(v);
    UI.toast("Minified ✓");
  });
  root.querySelector('#val').addEventListener('click', ()=>{
    parse();
    if(errBox.hidden){ out.hidden=false; out.textContent="✅ Valid JSON!"; }
  });
  const cp = UI.el(`<button class="btn ghost sm mt">📋 Copy Output</button>`);
  cp.addEventListener('click', ()=>!out.hidden && out.textContent ? UI.copy(out.textContent) : UI.toast("Nothing to copy","err"));
  root.append(cp);
});

/* 2. BASE64 -------------------------------------------------- */
registerTool("base64", root => {
  const tin = UI.el(`<textarea rows="6" placeholder="Text to encode, or Base64 to decode…"></textarea>`);
  const out = UI.el(`<textarea rows="6" class="mt" readonly placeholder="Result…"></textarea>`);
  const seg = UI.el(`<div class="seg mb mt"><button class="on" data-m="enc">Encode →</button><button data-m="dec">← Decode</button></div>`);
  let mode="enc";
  root.append(UI.el(`<p class="muted small mb">Full Unicode support — emoji, Hindi, everything. Nothing leaves your browser.</p>`), tin, seg, out);
  seg.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); mode=b.dataset.m;
  }));
  const go = UI.el(`<button class="btn mt">${""}Convert</button>`);
  root.append(go);
  go.addEventListener('click', ()=>{
    try{
      if(mode==="enc"){
        const bytes = new TextEncoder().encode(tin.value);
        let bin=""; bytes.forEach(b=>bin+=String.fromCharCode(b));
        out.value = btoa(bin);
      } else {
        const bin = atob(tin.value.trim());
        out.value = new TextDecoder().decode(Uint8Array.from(bin, c=>c.charCodeAt(0)));
      }
    }catch(e){ UI.toast("That doesn't look like valid Base64","err"); }
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing yet","err"));
  root.append(cp);
});

/* 3. URL ENCODER ---------------------------------------------- */
registerTool("url-encode", root => {
  const tin = UI.el(`<textarea rows="5" placeholder="https://example.com/search?q=hello world&lang=hi"></textarea>`);
  const out = UI.el(`<textarea rows="5" class="mt" readonly placeholder="Result…"></textarea>`);
  const seg = UI.el(`<div class="seg mb mt"><button class="on" data-m="enc">Encode →</button><button data-m="dec">← Decode</button></div>`);
  let mode="enc";
  root.append(UI.el(`<p class="muted small mb">Percent-encode URLs and query strings, or decode them back to readable text.</p>`), tin, seg, out);
  seg.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); mode=b.dataset.m;
  }));
  const go = UI.el(`<button class="btn mt">Convert</button>`);
  root.append(go);
  go.addEventListener('click', ()=>{
    try{ out.value = mode==="enc" ? encodeURIComponent(tin.value) : decodeURIComponent(tin.value.replace(/\+/g,"%20")); }
    catch(e){ UI.toast("Could not decode — malformed escapes","err"); }
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing yet","err"));
  root.append(cp);
});

/* 4. HASH GENERATOR --------------------------------------------- */
registerTool("hash-generator", root => {
  const tin = UI.el(`<textarea rows="4" placeholder="Type or paste text…"></textarea>`);
  const rows = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Cryptographic SHA hashes via the browser's WebCrypto API. Great for checksums and integrity checks.</p>`), tin, rows);
  async function upd(){
    if(!tin.value){ rows.innerHTML=""; return; }
    const data = new TextEncoder().encode(tin.value);
    rows.innerHTML="";
    for(const algo of ["SHA-1","SHA-256","SHA-384","SHA-512"]){
      const buf = await crypto.subtle.digest(algo, data);
      const hex = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
      const r = UI.el(`<div class="kv"><span>${algo}</span><b style="font-family:monospace;font-size:11px">${hex}</b></div>`);
      r.querySelector('b').style.cursor="pointer";
      r.querySelector('b').title="Click to copy";
      r.querySelector('b').addEventListener('click', ()=>UI.copy(hex, algo+" hash copied ✓"));
      rows.append(r);
    }
  }
  let t; tin.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(upd, 200); });
});

/* 5. UUID GENERATOR ---------------------------------------------- */
registerTool("uuid-generator", root => {
  const n = UI.el(`<input type="number" min="1" max="1000" value="5">`);
  const up = UI.el(`<label class="check"><input type="checkbox"> UPPERCASE</label>`);
  const nd = UI.el(`<label class="check"><input type="checkbox"> Remove dashes</label>`);
  const out = UI.el(`<textarea class="code mt" rows="8" readonly></textarea>`);
  const g = UI.el(`<div class="grid-3"></div>`);
  root.append(UI.el(`<p class="muted small mb">Cryptographically random v4 UUIDs, generated with crypto.randomUUID().</p>`), g);
  g.append(UI.field("How many",""), UI.field("Options",""), UI.field("",""));
  g.children[0].appendChild(n);
  g.children[1].appendChild(up); g.children[2].appendChild(nd);
  const go = UI.el(`<button class="btn mt">🆔 Generate</button>`);
  root.append(go, out);
  function gen(){
    const count = Math.min(1000, Math.max(1, +n.value||1));
    let list = [...Array(count)].map(()=>crypto.randomUUID());
    if(nd.querySelector('input').checked) list = list.map(u=>u.replace(/-/g,""));
    if(up.querySelector('input').checked) list = list.map(u=>u.toUpperCase());
    out.value = list.join("\n");
  }
  go.addEventListener('click', gen); gen();
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy All</button>`);
  cp.addEventListener('click', ()=>UI.copy(out.value));
  root.append(cp);
});

/* 6. PASSWORD GENERATOR ------------------------------------------- */
const pwStrength = pw => {
  let pool = 0;
  if(/[a-z]/.test(pw)) pool+=26; if(/[A-Z]/.test(pw)) pool+=26;
  if(/[0-9]/.test(pw)) pool+=10; if(/[^a-zA-Z0-9]/.test(pw)) pool+=32;
  return pw.length * Math.log2(pool||1);
};
registerTool("password-generator", root => {
  const len = UI.slider("Length", {min:6,max:64,val:16,fmt:v=>v+" chars"});
  const opts = {
    upper: UI.el(`<label class="check"><input type="checkbox" checked> A–Z uppercase</label>`),
    lower: UI.el(`<label class="check"><input type="checkbox" checked> a–z lowercase</label>`),
    digit: UI.el(`<label class="check"><input type="checkbox" checked> 0–9 digits</label>`),
    sym:   UI.el(`<label class="check"><input type="checkbox" checked> !@#$ symbols</label>`),
    noamb: UI.el(`<label class="check"><input type="checkbox"> Exclude ambiguous (Il1O0)</label>`),
  };
  const out = UI.el(`<textarea class="code mt" rows="4" readonly style="font-size:16px"></textarea>`);
  const meter = UI.el(`<div class="mt"><div class="progress"><i></i></div><div class="small muted mt" id="pwNote"></div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Strong random passwords using crypto.getRandomValues — generated locally, never sent anywhere.</p>`),
    len, UI.el(`<div class="row mb"></div>`)
  );
  const orow = root.querySelector('.row');
  Object.values(opts).forEach(o=>orow.append(o));
  const go = UI.el(`<button class="btn">🔑 Generate Password</button>`);
  root.append(go, out, meter);
  function gen(){
    let chars = "";
    if(opts.upper.querySelector('input').checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(opts.lower.querySelector('input').checked) chars += "abcdefghijklmnopqrstuvwxyz";
    if(opts.digit.querySelector('input').checked) chars += "0123456789";
    if(opts.sym.querySelector('input').checked) chars += "!@#$%^&*()-_=+[]{};:,.<>?";
    if(opts.noamb.querySelector('input').checked) chars = chars.replace(/[Il1O0]/g,"");
    if(!chars) return UI.toast("Select at least one character set","err");
    const arr = new Uint32Array(len.get());
    crypto.getRandomValues(arr);
    out.value = [...arr].map(v=>chars[v % chars.length]).join("");
    const bits = pwStrength(out.value);
    const bar = meter.querySelector('i'); const note = meter.querySelector('#pwNote');
    const pct = Math.min(100, bits/128*100);
    bar.style.width = pct+"%";
    bar.style.background = bits<45 ? "var(--danger)" : bits<75 ? "var(--warn)" : "var(--success)";
    note.textContent = `Strength: ~${Math.round(bits)} bits of entropy — ${bits<45?"weak":bits<75?"fair":"strong"} ${bits>=100?"· practically uncrackable":""}`;
  }
  go.addEventListener('click', gen); gen();
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy Password</button>`);
  cp.addEventListener('click', ()=>UI.copy(out.value, "Password copied ✓"));
  root.append(cp);
});

/* 7. PASSWORD STRENGTH CHECKER -------------------------------------- */
registerTool("password-strength", root => {
  const tin = UI.el(`<input type="text" placeholder="Type a password to check…" autocomplete="off">`);
  const res = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Analyze a password's real strength (entropy) — checked 100% on your device, never uploaded.</p>`), tin, res);
  tin.addEventListener('input', ()=>{
    const pw = tin.value; res.innerHTML="";
    if(!pw) return;
    const bits = pwStrength(pw);
    const checks = [
      [pw.length>=12, "At least 12 characters"],
      [/[a-z]/.test(pw)&&/[A-Z]/.test(pw), "Mixed case letters"],
      [/[0-9]/.test(pw), "Contains numbers"],
      [/[^a-zA-Z0-9]/.test(pw), "Contains symbols"],
      [!/(.)\1{2,}/.test(pw), "No repeated runs (aaa)"],
      [/^[a-zA-Z0-9]+$/.test(pw)===false || pw.length>=16, "Not just letters/digits"],
    ];
    const label = bits<28?["Very weak","red"]:bits<45?["Weak","red"]:bits<60?["Fair","orange"]:bits<90?["Strong","green"]:["Very strong","green"];
    res.append(
      UI.el(`<div class="big-number">${Math.round(bits)} <span style="font-size:15px">bits</span> <span class="tag ${label[1]}">${label[0]}</span></div>`),
      UI.el(`<div class="progress mt"><i style="width:${Math.min(100,bits/128*100)}%;background:${bits<45?'var(--danger)':bits<75?'var(--warn)':'var(--success)'}"></i></div>`),
      UI.el(`<div class="mt">${checks.map(([ok,t])=>`<div class="small" style="margin:4px 0">${ok?"✅":"⬜"} ${t}</div>`).join("")}</div>`),
      UI.el(`<p class="small muted mt">Cracking time estimate: <b>${bits<30?"seconds to minutes":bits<45?"hours":bits<60?"months":bits<90?"thousands of years":"longer than the universe's age"}</b> (offline attack, 10B guesses/sec)</p>`)
    );
  });
});

/* 8. COLOR CONVERTER ----------------------------------------------- */
registerTool("color-converter", root => {
  const pick = UI.el(`<input type="color" value="#6366f1" style="height:56px;padding:4px;border-radius:12px">`);
  const hexIn = UI.el(`<input type="text" value="#6366f1" style="font-family:monospace">`);
  const outs = UI.el(`<div class="mt"></div>`);
  const sw = UI.el(`<div class="preview-frame mt" style="min-height:90px"><div id="swB" style="width:100%;height:90px;border-radius:10px;background:#6366f1"></div></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Pick or type any color — get HEX, RGB and HSL with one-click copy.</p>`),
    UI.el(`<div class="grid-2"></div>`)
  );
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Visual picker",""), UI.field("HEX value",""));
  g.children[0].appendChild(pick); g.children[1].appendChild(hexIn);
  root.append(sw, outs);
  function hexToRgb(hex){
    const m = hex.replace("#","").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return m ? [parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)] : null;
  }
  function rgbToHsl(r,g,b){
    r/=255;g/=255;b/=255;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
    if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
      h= mx===r?(g-b)/d+(g<b?6:0) : mx===g?(b-r)/d+2 : (r-g)/d+4; h*=60;}
    return [Math.round(h),Math.round(s*100),Math.round(l*100)];
  }
  function upd(hex){
    const rgb = hexToRgb(hex); if(!rgb) return;
    pick.value = hex;
    sw.querySelector('#swB').style.background = hex;
    const [h,s,l] = rgbToHsl(...rgb);
    outs.innerHTML="";
    const vals = [["HEX",hex.toUpperCase()],["RGB",`rgb(${rgb.join(", ")})`],["HSL",`hsl(${h}, ${s}%, ${l}%)`],
                  ["CSS",`color: ${hex.toUpperCase()};`]];
    vals.forEach(([k,v])=>{
      const r = UI.el(`<div class="kv"><span>${k}</span><b style="cursor:pointer" title="Click to copy">${UI.esc(v)}</b></div>`);
      r.querySelector('b').addEventListener('click', ()=>UI.copy(v, k+" copied ✓"));
      outs.append(r);
    });
  }
  pick.addEventListener('input', ()=>{ hexIn.value = pick.value; upd(pick.value); });
  hexIn.addEventListener('input', ()=>{
    let v = hexIn.value.trim(); if(!v.startsWith("#")) v="#"+v;
    if(/^#[0-9a-f]{6}$/i.test(v)) upd(v);
  });
  upd("#6366f1");
});

/* 9. REGEX TESTER --------------------------------------------------- */
registerTool("regex-tester", root => {
  const pat = UI.el(`<input type="text" class="code" placeholder="e.g. \\b\\w+@\\w+\\.\\w+\\b" style="font-family:monospace">`);
  const flg = UI.el(`<input type="text" class="code" value="g" placeholder="flags" style="width:90px;font-family:monospace">`);
  const tin = UI.el(`<textarea rows="6" placeholder="Test string… try: contact support@toolverse.app or sales@example.com"></textarea>`);
  const out = UI.el(`<div class="output-pre mt" hidden></div>`);
  const info = UI.el(`<div class="small muted mt"></div>`);
  const g = UI.el(`<div class="row mb"><div class="field" style="flex:1"><label>Pattern</label></div><div class="field" style="width:90px"><label>Flags</label></div></div>`);
  g.children[0].appendChild(pat); g.children[1].appendChild(flg);
  root.append(UI.el(`<p class="muted small mb">Live match highlighting and capture groups. No server needed.</p>`), g, tin, out, info);
  function run(){
    out.hidden=true; info.textContent="";
    if(!pat.value || !tin.value){ return; }
    try{
      const re = new RegExp(pat.value, flg.value.includes("g") ? flg.value : flg.value+"g");
      const matches = [...tin.value.matchAll(re)];
      if(!matches.length){ info.textContent = "No matches."; out.hidden=false; out.innerHTML = UI.esc(tin.value); return; }
      let html = "", last = 0;
      matches.forEach(m=>{
        if(m[0]===""){ info.textContent="⚠️ Empty-string match — showing count only."; return; }
        html += UI.esc(tin.value.slice(last, m.index)) + `<mark class="hl">${UI.esc(m[0])}</mark>`;
        last = m.index + m[0].length;
      });
      html += UI.esc(tin.value.slice(last));
      out.hidden=false; out.innerHTML = html;
      let gtxt = "";
      if(matches[0].length > 1) gtxt = " · Groups: " + matches.slice(0,5).map(m=>"[" + m.slice(1).map(x=>x??"∅").join(", ") + "]").join(" ");
      info.innerHTML = `✅ <b>${matches.length}</b> match${matches.length===1?"":"es"}${gtxt}`;
    }catch(e){ info.textContent = "❌ " + e.message; }
  }
  [pat,flg,tin].forEach(el=>el.addEventListener('input', run));
});

/* 10. TIMESTAMP CONVERTER -------------------------------------------- */
registerTool("timestamp-converter", root => {
  const now = UI.el(`<div class="info-strip"><span class="info-pill">🕐 Current Unix time <b id="nowTs">—</b></span></div>`);
  const t1 = UI.el(`<input type="text" placeholder="e.g. 1767205800 (seconds or milliseconds)">`);
  const r1 = UI.el(`<div class="mt"></div>`);
  const t2 = UI.el(`<input type="datetime-local" step="1">`);
  const r2 = UI.el(`<div class="mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Convert Unix epoch timestamps to human-readable dates and back — with a live clock.</p>`),
    now,
    UI.field("Unix timestamp → date",""), t1, r1,
    UI.field("Date → Unix timestamp",""), t2, r2
  );
  root.querySelectorAll('.field')[0].appendChild(UI.el(`<span></span>`));
  setInterval(()=>{ const b=now.querySelector('#nowTs'); if(b) b.textContent = Math.floor(Date.now()/1000); }, 1000);
  t1.addEventListener('input', ()=>{
    r1.innerHTML="";
    let v = parseInt(t1.value,10);
    if(isNaN(v)) return;
    if(String(Math.abs(v)).length <= 11) v *= 1000;   // seconds → ms
    const d = new Date(v);
    if(isNaN(d)) return;
    const rel = Math.round((Date.now()-v)/86400000);
    r1.append(UI.kv([
      ["Local", d.toLocaleString()],
      ["UTC", d.toUTCString()],
      ["ISO 8601", d.toISOString()],
      ["Relative", rel===0?"today": rel>0? rel+" days ago" : (-rel)+" days from now"]
    ]));
  });
  t2.addEventListener('input', ()=>{
    r2.innerHTML="";
    const d = new Date(t2.value);
    if(isNaN(d)) return;
    r2.append(UI.kv([
      ["Seconds", Math.floor(d.getTime()/1000)],
      ["Milliseconds", d.getTime()],
    ]));
  });
});

/* 11. HTML ESCAPE ----------------------------------------------------- */
registerTool("html-escape", root => {
  const tin = UI.el(`<textarea rows="6" class="code" placeholder='<a href="x">hi</a>'></textarea>`);
  const out = UI.el(`<textarea rows="6" class="code mt" readonly></textarea>`);
  const seg = UI.el(`<div class="seg mb mt"><button class="on" data-m="esc">Escape →</button><button data-m="un">← Unescape</button></div>`);
  let mode="esc";
  root.append(UI.el(`<p class="muted small mb">Escape HTML entities for safe display in code or web pages — or decode them back.</p>`), tin, seg, out);
  seg.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); mode=b.dataset.m;
  }));
  const go = UI.el(`<button class="btn mt">Convert</button>`);
  root.append(go);
  go.addEventListener('click', ()=>{
    if(mode==="esc"){
      out.value = tin.value.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    } else {
      const ta = document.createElement('textarea'); ta.innerHTML = tin.value; out.value = ta.value;
    }
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing yet","err"));
  root.append(cp);
});

})();

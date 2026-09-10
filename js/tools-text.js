/* ============================================================
   ToolVerse — Text tools
   ============================================================ */
(() => {

/* helper: textarea + output pattern */
function taTool(root, note, build){
  root.append(UI.el(`<p class="muted small mb">${note}</p>`));
  const tin = UI.el(`<textarea rows="7" placeholder="Type or paste your text here…"></textarea>`);
  root.append(tin);
  build(tin);
}

/* 1. WORD COUNTER ------------------------------------------- */
registerTool("word-counter", root => {
  const counts = UI.el(`<div class="info-strip"></div>`);
  taTool(root, "Live counting as you type — words, characters, sentences, paragraphs and reading time.", tin => {
    root.append(counts);
    const upd = () => {
      const s = tin.value;
      const words = (s.trim().match(/\S+/g)||[]).length;
      const sentences = (s.match(/[.!?…]+(\s|$)/g)||[]).length;
      const paras = s.split(/\n\s*\n/).filter(p=>p.trim()).length;
      const readMin = words ? Math.ceil(words/200) : 0;
      counts.innerHTML = "";
      counts.append(
        UI.el(`<span class="info-pill">Words <b>${words.toLocaleString()}</b></span>`),
        UI.el(`<span class="info-pill">Characters <b>${s.length.toLocaleString()}</b></span>`),
        UI.el(`<span class="info-pill">No spaces <b>${s.replace(/\s/g,"").length.toLocaleString()}</b></span>`),
        UI.el(`<span class="info-pill">Sentences <b>${sentences}</b></span>`),
        UI.el(`<span class="info-pill">Paragraphs <b>${paras}</b></span>`),
        UI.el(`<span class="info-pill">Reading time <b>~${readMin} min</b></span>`),
      );
    };
    tin.addEventListener('input', upd); upd();
  });
});

/* 2. CASE CONVERTER ------------------------------------------ */
registerTool("case-converter", root => {
  taTool(root, "Convert text between 10 different cases with one click.", tin => {
    const out = UI.el(`<textarea class="mt" rows="7" readonly placeholder="Result appears here…"></textarea>`);
    const btns = UI.el(`<div class="row mt mb"></div>`);
    const ops = {
      "UPPERCASE": s=>s.toUpperCase(),
      "lowercase": s=>s.toLowerCase(),
      "Title Case": s=>s.toLowerCase().replace(/(^|\s|[-("'“])(\p{L})/gu, (m,p,c)=>p+c.toUpperCase()),
      "Sentence case": s=>s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, m=>m.toUpperCase()),
      "camelCase": s=>s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g,(m,c)=>c.toUpperCase()).replace(/^[A-Z]/,c=>c.toLowerCase()),
      "snake_case": s=>s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),
      "kebab-case": s=>s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""),
      "aLtErNaTiNg": s=>[...s].map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join(""),
      "Inverse": s=>[...s].map(c=>c===c.toLowerCase()?c.toUpperCase():c.toLowerCase()).join(""),
    };
    Object.entries(ops).forEach(([name,fn])=>{
      const b = UI.el(`<button class="btn ghost sm">${name}</button>`);
      b.addEventListener('click', ()=>{ if(!tin.value) return UI.toast("Enter some text first","err"); out.value = fn(tin.value); });
      btns.append(b);
    });
    const cp = UI.el(`<button class="btn sm mt">📋 Copy Result</button>`);
    cp.addEventListener('click', ()=>out.value ? UI.copy(out.value) : UI.toast("Nothing to copy yet","err"));
    root.append(btns, out, cp);
  });
});

/* 3. LOREM IPSUM ---------------------------------------------- */
registerTool("lorem-ipsum", root => {
  const WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");
  const rand = n => WORDS[Math.floor(Math.random()*WORDS.length*n)%WORDS.length];
  const sentence = ()=>{ const n=8+Math.floor(Math.random()*9); let w=[...Array(n)].map(()=>rand()); w[0]=w[0][0].toUpperCase()+w[0].slice(1); return w.join(" ")+(Math.random()<.15?"?":"."); };
  const para = ()=>[...Array(4+Math.floor(Math.random()*3))].map(sentence).join(" ");

  root.append(UI.el(`<p class="muted small mb">Classic placeholder text for mockups, designs and layouts.</p>`));
  const type = UI.el(`<select><option value="p">Paragraphs</option><option value="s">Sentences</option><option value="w">Words</option></select>`);
  const count = UI.el(`<input type="number" min="1" max="100" value="3">`);
  const g = UI.el(`<div class="grid-2"></div>`);
  g.append(UI.field("Generate",""), UI.field("How many",""));
  g.children[0].appendChild(type); g.children[1].appendChild(count);
  const go = UI.el(`<button class="btn mt">📜 Generate</button>`);
  const out = UI.el(`<textarea class="mt" rows="10" readonly></textarea>`);
  root.append(g, go, out);
  go.addEventListener('click', ()=>{
    const n = Math.min(100, Math.max(1, +count.value||1));
    if(type.value==="p") out.value = [...Array(n)].map(para).join("\n\n");
    if(type.value==="s") out.value = [...Array(n)].map(sentence).join(" ");
    if(type.value==="w") out.value = [...Array(n)].map(()=>rand()).join(" ");
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Generate first","err"));
  root.append(cp);
});

/* 4. TEXT REPEATER --------------------------------------------- */
registerTool("text-repeater", root => {
  root.append(UI.el(`<p class="muted small mb">Repeat any text as many times as you want, with your choice of separator.</p>`));
  const tin = UI.el(`<input type="text" placeholder="Text to repeat…" value="Hello! ">`);
  const n = UI.el(`<input type="number" min="1" max="10000" value="10">`);
  const sep = UI.el(`<select><option value=" ">Space</option><option value="\n">New line</option><option value="">None</option><option value=", ">Comma</option></select>`);
  const g = UI.el(`<div class="grid-3"></div>`);
  root.append(UI.field("Text",""), g);
  root.querySelector('.field').appendChild(tin);
  g.append(UI.field("Times",""), UI.field("Separator",""));
  g.children[0].appendChild(n); g.children[1].appendChild(sep);
  const go = UI.el(`<button class="btn mt">🔁 Repeat</button>`);
  const out = UI.el(`<textarea class="mt" rows="8" readonly></textarea>`);
  root.append(go, out);
  go.addEventListener('click', ()=>{
    if(!tin.value) return UI.toast("Enter text to repeat","err");
    const times = Math.min(10000, Math.max(1, +n.value||1));
    out.value = [...Array(times)].map(()=>tin.value).join(sep.value);
    UI.toast(`Repeated ${times} times ✓`);
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing yet","err"));
  root.append(cp);
});

/* 5. LINE TOOLS -------------------------------------------------- */
registerTool("line-tools", root => {
  taTool(root, "One-click cleanup for lists: dedupe, sort, reverse, trim, shuffle.", tin => {
    const out = UI.el(`<textarea class="mt" rows="7" readonly placeholder="Result…"></textarea>`);
    const btns = UI.el(`<div class="row mt mb"></div>`);
    const L = ()=>tin.value.split("\n");
    const ops = {
      "Remove duplicates": l=>[...new Set(l)],
      "Sort A → Z": l=>[...l].sort((a,b)=>a.localeCompare(b)),
      "Sort Z → A": l=>[...l].sort((a,b)=>b.localeCompare(a)),
      "Reverse order": l=>[...l].reverse(),
      "Remove empty lines": l=>l.filter(x=>x.trim()!=="").map(x=>x.trim()),
      "Trim whitespace": l=>l.map(x=>x.trim()),
      "Shuffle": l=>{ const a=[...l]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; },
      "Number lines": l=>l.map((x,i)=>`${i+1}. ${x}`),
    };
    Object.entries(ops).forEach(([name,fn])=>{
      const b = UI.el(`<button class="btn ghost sm">${name}</button>`);
      b.addEventListener('click', ()=>{
        if(!tin.value) return UI.toast("Paste some lines first","err");
        const res = fn(L());
        out.value = res.join("\n");
        UI.toast(`${res.length} lines`);
      });
      btns.append(b);
    });
    const cp = UI.el(`<button class="btn sm mt">📋 Copy Result</button>`);
    cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing to copy","err"));
    root.append(btns, out, cp);
  });
});

/* 6. FIND & REPLACE ---------------------------------------------- */
registerTool("find-replace", root => {
  root.append(UI.el(`<p class="muted small mb">Find and replace text across any content — plain text or regular expressions.</p>`));
  const tin = UI.el(`<textarea rows="5" placeholder="Your text…"></textarea>`);
  const find = UI.el(`<input type="text" placeholder="Find…">`);
  const rep = UI.el(`<input type="text" placeholder="Replace with…">`);
  const rx = UI.el(`<label class="check"><input type="checkbox"> Regex</label>`);
  const ci = UI.el(`<label class="check"><input type="checkbox" checked> Ignore case</label>`);
  const g = UI.el(`<div class="grid-2 mt"></div>`);
  root.append(tin, g);
  g.append(UI.field("Find",""), UI.field("Replace with",""));
  g.children[0].appendChild(find); g.children[1].appendChild(rep);
  const opts = UI.el(`<div class="row mt mb"></div>`); opts.append(rx, ci);
  const go = UI.el(`<button class="btn">🔎 Replace All</button>`);
  const out = UI.el(`<textarea class="mt" rows="5" readonly placeholder="Result…"></textarea>`);
  const stat = UI.el(`<div class="small muted mt"></div>`);
  root.append(opts, go, out, stat);
  go.addEventListener('click', ()=>{
    if(!tin.value || find.value==="") return UI.toast("Enter text and a search term","err");
    try{
      const flags = "g" + (ci.querySelector('input').checked ? "i" : "");
      const pat = rx.querySelector('input').checked ? new RegExp(find.value, flags) : new RegExp(find.value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), flags);
      let n = 0;
      out.value = tin.value.replace(pat, ()=>{ n++; return rep.value; });
      stat.innerHTML = `✅ <b>${n}</b> replacement${n===1?"":"s"} made`;
    }catch(e){ UI.toast("Invalid pattern: "+e.message,"err"); }
  });
  const cp = UI.el(`<button class="btn ghost mt">📋 Copy Result</button>`);
  cp.addEventListener('click', ()=>out.value?UI.copy(out.value):UI.toast("Nothing yet","err"));
  root.append(cp);
});

/* 7. SLUG GENERATOR ----------------------------------------------- */
registerTool("slug-generator", root => {
  root.append(UI.el(`<p class="muted small mb">Turn titles into clean, SEO-friendly URL slugs.</p>`));
  const tin = UI.el(`<input type="text" placeholder="e.g. 10 Best Cafés in Agra! (2026 Guide)">`);
  const out = UI.el(`<div class="output-pre mt" style="min-height:44px"></div>`);
  root.append(UI.field("Your title",""), tin, out);
  const upd = ()=>{
    const s = tin.value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
    out.textContent = s || "—";
  };
  tin.addEventListener('input', upd); upd();
  const cp = UI.el(`<button class="btn sm mt">📋 Copy Slug</button>`);
  cp.addEventListener('click', ()=>out.textContent!=="—" ? UI.copy(out.textContent) : UI.toast("Type a title first","err"));
  root.append(cp);
});

})();

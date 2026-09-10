/* ============================================================
   ToolVerse — App shell, router & pages
   ============================================================ */
(() => {
const app = document.getElementById('app');

/* ---------------- THEME ---------------- */
const themeBtn = document.getElementById('themeToggle');
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t==="dark" ? "☀️" : "🌙";
  try{ localStorage.setItem("tv-theme", t); }catch(e){}
}
applyTheme(localStorage.getItem("tv-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener('click', ()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));

/* ---------------- NAV ---------------- */
const navCat = document.getElementById('navCatMenu');
CATEGORIES.forEach(c=>{
  navCat.append(UI.el(`<a href="#/cat/${c.id}"><span>${c.icon}</span>${c.name}</a>`));
});
navCat.append(UI.el(`<a href="#/all">🧰 All Tools →</a>`));
document.querySelector('.nav-drop-btn').addEventListener('click', e=>{
  e.stopPropagation(); document.querySelector('.nav-drop').classList.toggle('open');
});
document.addEventListener('click', ()=>document.querySelector('.nav-drop')?.classList.remove('open'));

/* mobile menu */
const menuBtn = document.getElementById('menuBtn'), mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', ()=>{
  mobileMenu.hidden = !mobileMenu.hidden;
  if(!mobileMenu.hidden){
    mobileMenu.innerHTML = `<div class="mm-head">Browse</div>
      <a href="#/">🏠 Home</a><a href="#/all">🧰 All Tools</a>` +
      CATEGORIES.map(c=>`<a href="#/cat/${c.id}">${c.icon} ${c.name}</a>`).join("") +
      `<div class="mm-head">Info</div><a href="#/about">About</a><a href="#/privacy">Privacy</a>`;
    mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>mobileMenu.hidden=true));
  }
});

/* ---------------- HEADER SEARCH ---------------- */
const hsInp = document.getElementById('headerSearchInput'), hsRes = document.getElementById('hsResults');
hsInp.addEventListener('input', ()=>{
  const q = hsInp.value.trim();
  if(q.length < 2){ hsRes.hidden = true; return; }
  const hits = REG.search(q, 8);
  hsRes.innerHTML = hits.length ? "" : `<div class="hs-item"><span class="muted small" style="padding:6px">No tools found for “${UI.esc(q)}”</span></div>`;
  hits.forEach(t=>{
    const it = UI.el(`<div class="hs-item" role="option">
      <span class="ti">${t.icon}</span>
      <span><b>${UI.esc(t.name)}</b><small>${UI.esc(REG.catName(t.cat))}${t.status==="soon"?" · Coming soon":""}</small></span></div>`);
    it.addEventListener('click', ()=>{ hsRes.hidden=true; hsInp.value=""; location.hash = "#/tool/"+t.slug; });
    hsRes.append(it);
  });
  hsRes.hidden = false;
});
hsInp.addEventListener('keydown', e=>{
  if(e.key==="Enter"){ hsRes.hidden=true; location.hash = "#/all?q=" + encodeURIComponent(hsInp.value.trim()); }
  if(e.key==="Escape") hsRes.hidden=true;
});
document.addEventListener('click', e=>{ if(!document.getElementById('headerSearch').contains(e.target)) hsRes.hidden=true; });
document.addEventListener('keydown', e=>{
  if(e.key==="/" && !/input|textarea|select/i.test(document.activeElement.tagName)){
    e.preventDefault();
    const h = document.getElementById('homeSearch');
    (h || hsInp).focus();
  }
});

/* ---------------- CARD RENDERERS ---------------- */
function toolCard(t, opts={}){
  const c = UI.el(`<div class="tool-card" role="link" tabindex="0">
    ${t.status==="soon" ? `<span class="badge-soon">Soon</span>` : opts.rank ? `<span class="pop-rank">#${opts.rank}</span>` : ""}
    <span class="tool-icon">${t.icon}</span>
    <b>${UI.esc(t.name)}</b>
    <small>${UI.esc(t.desc)}</small>
    <button class="fav-star ${Store.isFav(t.slug)?'on':''}" title="Favorite" aria-label="Favorite">⭐</button>
  </div>`);
  const open = ()=>{
    if(t.status==="soon"){ location.hash = "#/tool/"+t.slug; return; }
    location.hash = "#/tool/"+t.slug;
  };
  c.addEventListener('click', e=>{ if(e.target.classList.contains('fav-star')) return; open(); });
  c.addEventListener('keydown', e=>{ if(e.key==="Enter") open(); });
  c.querySelector('.fav-star').addEventListener('click', e=>{
    e.stopPropagation();
    const on = Store.toggleFav(t.slug);
    e.target.classList.toggle('on', on);
    UI.toast(on ? `${t.name} added to favorites ⭐` : "Removed from favorites");
  });
  return c;
}

function adCard(){
  const c = UI.el(`<div class="tool-card ad-slot ad-inline" style="cursor:default;justify-content:center">
    <span class="ad-label">Advertisement</span>
    <span class="ad-size">In-Feed Ad</span><span class="ad-note">js/ads.js</span></div>`);
  return c;
}

function toolGrid(tools, {adsEvery=12, rank=false}={}){
  const g = UI.el(`<div class="tool-grid"></div>`);
  tools.forEach((t,i)=>{
    g.append(toolCard(t, rank?{rank:i+1}:{}));
    if(adsEvery && (i+1)%adsEvery===0 && i !== tools.length-1) g.append(adCard());
  });
  return g;
}

/* ---------------- PAGE: HOME ---------------- */
function pageHome(){
  const live = REG.live();
  const popular = [...live].filter(t=>t.pop).sort((a,b)=>a.pop-b.pop);
  const favs = Store.favs().map(REG.get).filter(Boolean);
  const recent = Store.recent().map(REG.get).filter(Boolean);
  const soon = REG.soon();

  const v = UI.el(`<div>
    <section class="hero">
      <div class="wrap">
        <span class="hero-badge">⚡ ${live.length} working tools · 100% free · No signup</span>
        <h1>Every Tool You Need.<br><span class="grad">One Simple Website.</span></h1>
        <p class="sub">Resize &amp; compress images, merge PDFs, check your IP, generate QR codes, calculate EMI/GST and much more — every tool actually works, right in your browser.</p>
        <div class="hero-search">
          <span class="hs-icon">🔍</span>
          <input id="homeSearch" type="search" placeholder="Search ${live.length}+ tools…  e.g. “compress”, “ip”, “resize”" autocomplete="off">
          <button class="go">Search</button>
        </div>
        <div class="quick-chips">
          ${[["🖼️ Image Resizer","image-resizer"],["🗜️ Compressor","image-compressor"],["🌐 My IP","my-ip"],["📄 PDF Tools","cat/pdf"],["🔳 QR Code","qr-generator"],["🏦 EMI","emi-calculator"],["🧾 GST","gst-calculator"],["💻 Dev Tools","cat/dev"]].map(([l,s])=>
            `<button class="chip" data-go="${s.startsWith("cat/")?"#/cat/"+s.slice(4):"#/tool/"+s}">${l}</button>`).join("")}
        </div>
        <div class="hero-stats">
          <div class="stat"><b>${live.length}</b><span>Working Tools</span></div>
          <div class="stat"><b>${CATEGORIES.length}</b><span>Categories</span></div>
          <div class="stat"><b>100%</b><span>Free Forever</span></div>
          <div class="stat"><b>0</b><span>Files Uploaded</span></div>
        </div>
      </div>
    </section>
    <div class="wrap" id="homeAd1"></div>
  </div>`);

  v.querySelector('#homeAd1').append(ADS.slot('leaderboard'));

  /* popular */
  const pop = UI.el(`<section class="section wrap"><div class="section-head"><div><h2>🔥 Popular Tools</h2><p>The tools everyone uses every day</p></div><a class="see-all" href="#/all">See all →</a></div></section>`);
  pop.append(toolGrid(popular, {rank:true, adsEvery:0}));
  v.append(pop);

  /* recent + favs */
  if(recent.length || favs.length){
    const s = UI.el(`<section class="section wrap"><div class="section-head"><div><h2>⚡ Your Tools</h2><p>Recently used & favorites — saved on your device</p></div></div><div id="urGrid"></div></section>`);
    v.append(s);
    const list = [...new Set([...recent, ...favs])].slice(0,10);
    s.querySelector('#urGrid').append(toolGrid(list, {adsEvery:0}));
  }

  /* categories */
  const cats = UI.el(`<section class="section wrap"><div class="section-head"><div><h2>📚 Browse Categories</h2></div></div><div class="cat-grid"></div></section>`);
  CATEGORIES.forEach(c=>{
    const n = REG.byCat(c.id).filter(t=>t.status==="live").length;
    const cc = UI.el(`<a class="cat-card" href="#/cat/${c.id}">
      <span class="cat-ic" style="background:${c.grad}">${c.icon}</span>
      <span><b>${c.name}</b><span>${n} tools · ${UI.esc(c.desc.split(" ").slice(0,4).join(" "))}…</span></span></a>`);
    cats.querySelector('.cat-grid').append(cc);
  });
  v.append(cats);

  /* every category's live tools */
  CATEGORIES.forEach((c, ci)=>{
    const tools = REG.byCat(c.id).filter(t=>t.status==="live");
    if(!tools.length) return;
    const s = UI.el(`<section class="section wrap">
      <div class="section-head"><div><h2>${c.icon} ${c.name}</h2><p>${UI.esc(c.desc)}</p></div><a class="see-all" href="#/cat/${c.id}">View category →</a></div></section>`);
    s.append(toolGrid(tools, {adsEvery: ci===0 ? 8 : 0}));
    v.append(s);
  });

  /* coming soon */
  const sc = UI.el(`<section class="section wrap"><div class="section-head"><div><h2>🚧 Coming Soon</h2><p>On the roadmap — we only ship tools that truly work, so these are marked honestly</p></div></div></section>`);
  sc.append(toolGrid(soon, {adsEvery:0}));
  v.append(sc);

  const banWrap = UI.el(`<div class="wrap"></div>`);
  banWrap.append(ADS.slot('banner'));
  v.append(banWrap);

  /* why + faq */
  v.append(UI.el(`<section class="section wrap">
    <div class="section-head"><div><h2>💜 Why ToolVerse?</h2></div></div>
    <div class="feat-grid">
      <div class="feat"><span class="ic">🔒</span><b>Privacy first</b><p>Files are processed 100% inside your browser. Nothing is uploaded, stored or tracked.</p></div>
      <div class="feat"><span class="ic">⚡</span><b>Actually works</b><p>No fake buttons. Every listed tool is fully functional — the rest are honestly marked “Coming soon”.</p></div>
      <div class="feat"><span class="ic">🆓</span><b>Free, no login</b><p>All tools are free and need no account. Favorites & history are saved locally on your device.</p></div>
      <div class="feat"><span class="ic">📱</span><b>Works everywhere</b><p>Mobile, tablet or desktop — responsive design with dark mode included.</p></div>
    </div></section>`));

  v.append(UI.el(`<section class="section wrap faq">
    <div class="section-head"><div><h2>❓ FAQ</h2></div></div>
    <details><summary>Are my files uploaded to a server?</summary><p>No. Image, PDF, text and calculator tools run entirely in your browser using JavaScript. Your files never leave your device.</p></details>
    <details><summary>Do I need an account?</summary><p>No. Every tool works for guests. Your favorites and recent tools are saved in your browser's local storage.</p></details>
    <details><summary>Why do some tools say “Coming soon”?</summary><p>We refuse to show fake tools. Anything marked “Coming soon” is genuinely under development.</p></details>
    <details><summary>Can I advertise here?</summary><p>Yes — ad slots are available site-wide (leaderboard, in-feed and sidebar). Contact us via the About page.</p></details>
  </section>`));

  app.replaceChildren(v);
  document.title = "ToolVerse — 50+ Free Online Tools. One Simple Platform.";

  /* hero search wiring */
  const hs = document.getElementById('homeSearch');
  const goSearch = ()=>location.hash = "#/all?q=" + encodeURIComponent(hs.value.trim());
  hs.addEventListener('keydown', e=>{ if(e.key==="Enter") goSearch(); });
  v.querySelector('.hero-search .go').addEventListener('click', goSearch);
  v.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click', ()=>location.hash=b.dataset.go));
}

/* ---------------- PAGE: ALL TOOLS ---------------- */
function pageAll(q=""){
  const v = UI.el(`<div class="wrap">
    <div class="page-hero"><h1>All Tools</h1><p>Every tool on ToolVerse — working tools first, upcoming tools clearly labelled.</p></div>
    <div class="row mb" style="justify-content:center">
      <input type="search" id="allSearch" placeholder="Filter ${REG.live().length}+ tools…" value="${UI.esc(q)}" style="max-width:420px">
    </div>
    <div id="allGrid"></div>
  </div>`);
  app.replaceChildren(v);
  document.title = "All Tools — ToolVerse";
  const grid = v.querySelector('#allGrid'), inp = v.querySelector('#allSearch');
  function draw(){
    const term = inp.value.trim();
    grid.innerHTML = "";
    const live = term ? REG.search(term).filter(t=>t.status==="live") : REG.live();
    const soon = term ? REG.search(term).filter(t=>t.status==="soon") : REG.soon();
    if(!live.length && !soon.length){ grid.append(UI.el(`<div class="err-banner" style="max-width:520px;margin:30px auto">❌ No tools match “${UI.esc(term)}”. Try “compress”, “image”, “ip”…</div>`)); return; }
    if(live.length){
      grid.append(UI.el(`<h3 style="margin:18px 0 12px">✅ Working (${live.length})</h3>`), toolGrid(live));
    }
    if(soon.length && !term){
      grid.append(UI.el(`<h3 style="margin:26px 0 12px">🚧 Coming Soon (${soon.length})</h3>`), toolGrid(soon, {adsEvery:0}));
    } else if(soon.length){
      grid.append(UI.el(`<h3 style="margin:26px 0 12px">🚧 Coming Soon (${soon.length})</h3>`), toolGrid(soon, {adsEvery:0}));
    }
  }
  inp.addEventListener('input', draw);
  draw();
}

/* ---------------- PAGE: CATEGORY ---------------- */
function pageCat(id){
  const c = CATEGORIES.find(x=>x.id===id);
  if(!c){ location.hash = "#/"; return; }
  const live = REG.byCat(id).filter(t=>t.status==="live");
  const soon = REG.byCat(id).filter(t=>t.status==="soon");
  const v = UI.el(`<div class="wrap">
    <div class="crumbs"><a href="#/">Home</a> › <span>${c.name}</span></div>
    <div class="page-hero" style="padding-top:10px">
      <h1>${c.icon} ${c.name}</h1><p>${UI.esc(c.desc)}. All processing happens locally in your browser.</p>
    </div>
    <div id="catAd"></div>
    <div id="catGrid"></div>
  </div>`);
  v.querySelector('#catAd').append(ADS.slot('leaderboard'));
  const grid = v.querySelector('#catGrid');
  if(live.length) grid.append(toolGrid(live));
  if(soon.length){ grid.append(UI.el(`<h3 style="margin:26px 0 12px">🚧 Coming soon in ${c.name}</h3>`), toolGrid(soon,{adsEvery:0})); }
  if(!live.length && !soon.length) grid.append(UI.el(`<p class="muted">No tools here yet — check back soon!</p>`));
  app.replaceChildren(v);
  document.title = `${c.name} — ToolVerse`;
}

/* ---------------- PAGE: TOOL ---------------- */
const HOW_DEFAULT = [
  "Add your file or paste your text using the drop zone / input above.",
  "Adjust the options — everything updates with a live preview.",
  "Click the main action button and wait a second while it processes (fully on your device).",
  "Download the result, or copy it to your clipboard.",
];

function pageTool(slug){
  const t = REG.get(slug);
  if(!t){ location.hash = "#/"; return; }
  document.title = `${t.name} — Free Online Tool | ToolVerse`;

  const v = UI.el(`<div class="wrap">
    <div class="crumbs"><a href="#/">Home</a> › <a href="#/cat/${t.cat}">${UI.esc(REG.catName(t.cat))}</a> › <span>${UI.esc(t.name)}</span></div>
    <div class="tool-page">
      <div>
        <div class="tool-head">
          <span class="tool-icon">${t.icon}</span>
          <div>
            <h1>${UI.esc(t.name)}
              ${t.status==="live" ? `<span class="tag green">● Working</span>` : `<span class="tag orange">Coming Soon</span>`}
              <button class="star-btn ${Store.isFav(t.slug)?'on':''}" title="Add to favorites">⭐</button>
            </h1>
            <p>${UI.esc(t.desc)}</p>
          </div>
        </div>
        <div class="workspace" id="workspace"></div>
        <div id="toolBottomAd"></div>
        <div class="two-col">
          <div class="info-card"><h3>📖 How to use</h3><ol>${HOW_DEFAULT.map(s=>`<li>${s}</li>`).join("")}</ol></div>
          <div class="info-card"><h3>✨ Good to know</h3><ul>
            <li>100% free, no login required.</li>
            <li>Processed locally in your browser — nothing is uploaded.</li>
            <li>Works on mobile, tablet and desktop.</li>
            <li>Unlimited use, no watermarks added by us.</li>
          </ul></div>
        </div>
      </div>
      <aside class="ws-side">
        <div class="side-card" id="sideAd"></div>
        <div class="side-card">
          <h3>Related tools</h3>
          <div id="relList"></div>
        </div>
        <div class="side-card">
          <div class="privacy-note">🔒 <span><b>Privacy first:</b> this tool runs entirely in your browser. Your files & data never leave your device.</span></div>
        </div>
      </aside>
    </div>
  </div>`);

  app.replaceChildren(v);
  window.scrollTo(0,0);

  v.querySelector('#sideAd').append(ADS.slot('box'));
  v.querySelector('#toolBottomAd').append(ADS.slot('banner'));

  /* related */
  const rel = REG.byCat(t.cat).filter(x=>x.slug!==t.slug && x.status==="live").slice(0,5);
  const relList = v.querySelector('#relList');
  if(rel.length) rel.forEach(r=>relList.append(UI.el(`<a class="rt" href="#/tool/${r.slug}"><span>${r.icon}</span>${UI.esc(r.name)}</a>`)));
  else relList.innerHTML = `<a class="rt" href="#/all">🧰 Browse all tools</a>`;

  /* favorite */
  const star = v.querySelector('.star-btn');
  star.addEventListener('click', ()=>{
    const on = Store.toggleFav(t.slug);
    star.classList.toggle('on', on);
    UI.toast(on ? "Added to favorites ⭐" : "Removed from favorites");
  });

  const ws = v.querySelector('#workspace');
  if(t.status === "live" && TM.mounts[t.slug]){
    Store.addRecent(t.slug);
    try{ TM.mounts[t.slug](ws); }
    catch(e){ console.error(e); ws.append(UI.el(`<div class="err-banner">❌ This tool hit an error while loading. Please refresh the page.</div>`)); }
  } else {
    ws.innerHTML = "";
    ws.append(UI.el(`<div style="text-align:center;padding:36px 10px">
      <div style="font-size:52px">🚧</div>
      <h2 style="margin:12px 0 6px">${UI.esc(t.name)} is coming soon</h2>
      <p class="muted" style="max-width:420px;margin:0 auto">We only publish tools that truly work — this one is still under active development. Meanwhile, try one of the related tools in the sidebar.</p>
      <a class="btn mt" href="#/all">Explore working tools →</a>
    </div>`));
  }
}

/* ---------------- STATIC PAGES ---------------- */
function pageAbout(){
  app.replaceChildren(UI.el(`<div class="wrap">
    <div class="page-hero"><h1>About ToolVerse ⚡</h1><p>One website for every everyday tool — built for speed, privacy and honesty.</p></div>
    <div class="prose">
      <p>ToolVerse is an all-in-one tools platform. Image resizing & compression, PDF merging & splitting, live IP and network utilities, QR generation, calculators for Indian users (EMI, GST, SIP), developer utilities and much more.</p>
      <h2>Our rules</h2>
      <ul>
        <li><b>Everything works.</b> No fake buttons, no fake downloads — if it's listed as live, it functions.</li>
        <li><b>Privacy first.</b> Processing happens in your browser; files are not uploaded.</li>
        <li><b>Honest labels.</b> Tools still in development are clearly marked “Coming soon”.</li>
      </ul>
      <h2>Advertise with us</h2>
      <p>ToolVerse carries clearly-labelled ad placements (leaderboard, in-feed, sidebar). For sponsorship or ad inquiries, reach out via the footer contact.</p>
    </div></div>`));
  document.title = "About — ToolVerse";
}
function pagePrivacy(){
  app.replaceChildren(UI.el(`<div class="wrap">
    <div class="page-hero"><h1>Privacy Policy 🔒</h1><p>Short version: your files stay with you.</p></div>
    <div class="prose">
      <h2>File processing</h2>
      <p>All image, PDF, text, developer and calculator tools execute entirely client-side in your browser using JavaScript. Files are never uploaded to any server, never stored, and never shared.</p>
      <h2>Network tools</h2>
      <p>IP, DNS, ping and speed tools contact public services (ipify, ipwho.is, Google DNS-over-HTTPS, jsDelivr CDN) directly from your browser to produce real results. Only the query you enter is sent.</p>
      <h2>Local storage</h2>
      <p>Favorites, recently used tools and theme preference are saved in your browser's localStorage. Clearing site data removes them.</p>
      <h2>Advertising</h2>
      <p>The site contains ad slots for monetization. When enabled, ads are served by the ad provider (e.g. Google AdSense) under their own privacy policy. Ads are always clearly labelled “Advertisement”.</p>
      <h2>No accounts</h2>
      <p>ToolVerse currently requires no login and collects no personal data.</p>
    </div></div>`));
  document.title = "Privacy Policy — ToolVerse";
}

/* ---------------- FOOTER ---------------- */
(function(){
  document.getElementById('year').textContent = new Date().getFullYear();
  const fc = document.getElementById('fCats');
  CATEGORIES.slice(0,6).forEach(c=>fc.append(UI.el(`<a href="#/cat/${c.id}">${c.icon} ${c.name}</a>`)));
  const fp = document.getElementById('fPopular');
  REG.live().filter(t=>t.pop).sort((a,b)=>a.pop-b.pop).slice(0,6)
    .forEach(t=>fp.append(UI.el(`<a href="#/tool/${t.slug}">${t.icon} ${t.name}</a>`)));
  document.querySelectorAll('.f-col').forEach(col=>col.querySelectorAll('a').forEach(a=>{
    a.style.cssText="display:block;color:var(--muted);font-size:13.5px;padding:4px 0";
  }));
})();

/* ---------------- ROUTER ---------------- */
function route(){
  const hash = location.hash || "#/";
  const [path, qs] = hash.slice(2).split("?");
  const params = new URLSearchParams(qs || "");
  mobileMenu.hidden = true;

  if(path === "" ) pageHome();
  else if(path === "all") pageAll(params.get("q") || "");
  else if(path.startsWith("cat/")) pageCat(path.slice(4));
  else if(path.startsWith("tool/")) pageTool(path.slice(5));
  else if(path === "about") pageAbout();
  else if(path === "privacy") pagePrivacy();
  else pageHome();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', route);
route();

})();

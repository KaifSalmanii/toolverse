/* ============================================================
   ToolVerse — Network & IP tools (live, real results)
   ============================================================ */
(() => {

const getJSON = async (url, timeoutMs=12000) => {
  const ctl = new AbortController();
  const t = setTimeout(()=>ctl.abort(), timeoutMs);
  try{
    const r = await fetch(url, {signal: ctl.signal, headers: {"Accept":"application/json"}});
    if(!r.ok) throw new Error("Service returned " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
};

/* 1. MY IP --------------------------------------------------- */
registerTool("my-ip", root => {
  const box = UI.el(`<div class="result-box" style="text-align:center;padding:28px"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Your public IP address, detected live. Works with IPv4 and IPv6. Nothing is stored.</p>`),
    box
  );
  box.innerHTML = `<div class="spinner" style="border-color:rgba(99,102,241,.25);border-top-color:var(--primary);width:26px;height:26px;margin:0 auto"></div><p class="muted small mt">Detecting your IP…</p>`;
  (async ()=>{
    try{
      let ip;
      try{ ip = (await getJSON("https://api64.ipify.org?format=json")).ip; }
      catch(e){ ip = (await getJSON("https://api.ipify.org?format=json")).ip; }
      box.innerHTML = "";
      box.append(
        UI.el(`<div class="small muted">Your public IP address</div>`),
        UI.el(`<div class="big-number" style="font-family:monospace;letter-spacing:.01em">${UI.esc(ip)}</div>`),
        UI.el(`<div class="row" style="justify-content:center;margin-top:8px">
          <button class="btn sm" id="cpIp">📋 Copy IP</button>
          <button class="btn ghost sm" id="reIp">↻ Check again</button>
          <a class="btn ghost sm" href="#/tool/ip-lookup">📍 Lookup details →</a></div>`)
      );
      box.querySelector('#cpIp').addEventListener('click', ()=>UI.copy(ip, "IP copied ✓"));
      box.querySelector('#reIp').addEventListener('click', ()=>location.reload());
    }catch(e){
      box.innerHTML = "";
      box.append(UI.el(`<div class="err-banner">❌ Could not detect IP — check your internet connection or an ad-blocker may be blocking ipify.org.</div>`));
    }
  })();
});

/* 2. IP LOOKUP -------------------------------------------------- */
registerTool("ip-lookup", root => {
  const inp = UI.el(`<input type="text" placeholder="IP address (leave empty for your own)">`);
  const go = UI.el(`<button class="btn">📍 Lookup</button>`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Find the approximate location, ISP and network details of any public IP. Data from ipwho.is.</p>`),
    UI.el(`<div class="row mb"></div>`), out
  );
  const rw = root.querySelector('.row'); rw.style.flex="1";
  rw.append(inp); rw.appendChild(go);
  async function run(){
    out.innerHTML = `<div style="text-align:center;padding:20px"><span class="spinner" style="border-color:rgba(99,102,241,.25);border-top-color:var(--primary)"></span></div>`;
    try{
      const target = inp.value.trim();
      const d = await getJSON("https://ipwho.is/" + encodeURIComponent(target || ""));
      if(d.success === false) throw new Error(d.message || "Lookup failed — is this a valid public IP?");
      out.innerHTML = "";
      const rb = UI.el(`<div class="result-box"></div>`);
      rb.append(UI.el(`<div class="big-number" style="font-family:monospace;font-size:24px">${UI.esc(d.ip)}</div>`));
      const flag = d.country_code ? String.fromCodePoint(...[...d.country_code].map(c=>127397+c.charCodeAt(0))) : "🌐";
      rb.append(UI.kv([
        ["Location", `${flag} ${[d.city, d.region, d.country].filter(Boolean).join(", ")}`],
        ["Coordinates", d.latitude!=null ? `${d.latitude}, ${d.longitude}` : "—"],
        ["Timezone", d.timezone?.id || "—"],
        ["ISP", d.connection?.isp || "—"],
        ["Organisation", d.connection?.org || "—"],
        ["ASN", d.connection?.asn ? "AS"+d.connection.asn : "—"],
        ["Type", d.type || "—"],
      ]));
      if(d.latitude!=null){
        const map = UI.el(`<a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=10/${d.latitude}/${d.longitude}">🗺️ View on map</a>`);
        rb.append(map);
      }
      out.append(rb);
    }catch(e){
      out.innerHTML="";
      out.append(UI.el(`<div class="err-banner">❌ ${UI.esc(e.message)}</div>`));
    }
  }
  go.addEventListener('click', run);
  inp.addEventListener('keydown', e=>{ if(e.key==="Enter") run(); });
  run(); // auto-run for own IP
});

/* 3. DNS LOOKUP --------------------------------------------------- */
registerTool("dns-lookup", root => {
  const dom = UI.el(`<input type="text" placeholder="e.g. google.com" value="google.com">`);
  const typ = UI.el(`<select>${["A","AAAA","MX","TXT","NS","CNAME","SOA"].map(t=>`<option>${t}</option>`).join("")}</select>`);
  const go = UI.el(`<button class="btn">🗺️ Query DNS</button>`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Live DNS queries over secure DNS-over-HTTPS (Google Public DNS). No install needed.</p>`),
    UI.el(`<div class="grid-3"></div>`), out
  );
  const g = root.querySelector('.grid-3');
  g.append(UI.field("Domain",""), UI.field("Record type",""), UI.field("",""));
  g.children[0].appendChild(dom); g.children[1].appendChild(typ); g.children[2].appendChild(go);
  async function run(){
    const name = dom.value.trim().replace(/^https?:\/\//,"").replace(/\/.*$/,"");
    if(!name) return UI.toast("Enter a domain","err");
    out.innerHTML = `<div style="text-align:center;padding:20px"><span class="spinner" style="border-color:rgba(99,102,241,.25);border-top-color:var(--primary)"></span></div>`;
    try{
      const d = await getJSON(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${typ.value}`);
      out.innerHTML = "";
      const rb = UI.el(`<div class="result-box"></div>`);
      if(!d.Answer || !d.Answer.length){
        rb.append(UI.el(`<div class="err-banner">No ${typ.value} records found for ${UI.esc(name)} ${d.Status===3?"(NXDOMAIN — domain does not exist)":""}</div>`));
      } else {
        rb.append(UI.el(`<div class="ok-banner">✅ ${d.Answer.length} record(s) for ${UI.esc(name)}</div>`));
        d.Answer.forEach(a=>{
          rb.append(UI.el(`<div class="kv"><span>${UI.esc(a.name)} <span class="tag">${UI.esc(typ.value)}</span></span><b style="font-family:monospace;font-size:12px">${UI.esc(a.data)}</b></div>`));
        });
        rb.append(UI.el(`<div class="small muted">TTL & raw data from Google DNS-over-HTTPS</div>`));
      }
      out.append(rb);
    }catch(e){
      out.innerHTML="";
      out.append(UI.el(`<div class="err-banner">❌ Query failed: ${UI.esc(e.message)}</div>`));
    }
  }
  go.addEventListener('click', run);
  dom.addEventListener('keydown', e=>{ if(e.key==="Enter") run(); });
});

/* 4. PING / LATENCY ------------------------------------------------- */
registerTool("ping-test", root => {
  const targets = {
    "Google (favicon)": "https://www.google.com/favicon.ico",
    "Cloudflare": "https://www.cloudflare.com/favicon.ico",
    "jsDelivr CDN": "https://cdn.jsdelivr.net/npm/jquery/package.json",
    "Wikipedia": "https://en.wikipedia.org/favicon.ico",
  };
  const sel = UI.el(`<select>${Object.keys(targets).map(k=>`<option>${k}</option>`).join("")}<option>Custom URL…</option></select>`);
  const custom = UI.el(`<input type="url" placeholder="https://example.com" hidden style="margin-top:8px">`);
  const go = UI.el(`<button class="btn mt">📡 Run 8 Pings</button>`);
  const dots = UI.el(`<div class="ping-dots mt"></div>`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Browser-based HTTP latency test (ICMP isn't available in browsers). Measures real round-trip time to the server.</p>`),
    UI.field("Target server",""), custom, go, dots, out
  );
  root.querySelector('.field').appendChild(sel);
  sel.addEventListener('change', ()=>custom.hidden = sel.value!=="Custom URL…");
  UI.busy(go, async ()=>{
    const url = sel.value==="Custom URL…" ? custom.value.trim() : targets[sel.value];
    if(!url) return UI.toast("Enter a URL","err");
    dots.innerHTML=""; out.innerHTML="";
    const times=[], fails=[];
    for(let i=0;i<8;i++){
      const dot = UI.el(`<div class="ping-dot"></div>`); dots.append(dot);
      const t0 = performance.now();
      try{
        await fetch(url + (url.includes("?")?"&":"?") + "_=" + Date.now(), {mode:"no-cors", cache:"no-store"});
        const ms = performance.now()-t0;
        times.push(ms); dot.classList.add('ok'); dot.title = ms.toFixed(0)+" ms";
      }catch(e){ fails.push(i); dot.classList.add('fail'); }
      await new Promise(r=>setTimeout(r,120));
    }
    if(!times.length){ out.append(UI.el(`<div class="err-banner">❌ All pings failed — host unreachable or blocked by network.</div>`)); return; }
    const min=Math.min(...times), max=Math.max(...times), avg=times.reduce((a,b)=>a+b,0)/times.length;
    const jitter = times.length>1 ? times.slice(1).reduce((s,t,i)=>s+Math.abs(t-times[i]),0)/(times.length-1) : 0;
    out.append(
      UI.el(`<div class="big-number" style="font-size:30px">${avg.toFixed(0)} ms <span style="font-size:14px" class="muted">average</span></div>`),
      UI.kv([
        ["Sent / received", `${8} / ${times.length} (${(fails.length/8*100).toFixed(0)}% loss)`, fails.length?"":"good"],
        ["Min", min.toFixed(1)+" ms", "good"],
        ["Max", max.toFixed(1)+" ms"],
        ["Jitter", jitter.toFixed(1)+" ms"],
      ])
    );
  });
});

/* 5. SPEED TEST ------------------------------------------------------ */
registerTool("speed-test", root => {
  const FILES = [
    "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",       // ~0.5 MB
    "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",           // ~0.1 MB
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js",         // ~0.2 MB
    "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js",         // ~0.6 MB
  ];
  const go = UI.el(`<button class="btn">🚀 Start Speed Test</button>`);
  const prog = UI.el(`<div class="progress mt" hidden><i></i></div>`);
  const status = UI.el(`<div class="small muted mt"></div>`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Downloads real files from the jsDelivr CDN and measures throughput. Approximate, but a solid indicator of your connection.</p>`),
    go, prog, status, out
  );
  UI.busy(go, async ()=>{
    prog.hidden=false; out.innerHTML=""; status.textContent="Warming up…";
    const bar = prog.querySelector('i'); bar.style.width="0%";
    let totalBytes=0, totalMs=0;
    for(let i=0;i<FILES.length;i++){
      status.textContent = `Downloading test file ${i+1} of ${FILES.length}…`;
      bar.style.width = (i/FILES.length*100)+"%";
      const t0 = performance.now();
      try{
        const res = await fetch(FILES[i] + "?_cb=" + Date.now(), {cache:"no-store"});
        const blob = await res.blob();
        const ms = performance.now()-t0;
        totalBytes += blob.size; totalMs += ms;
      }catch(e){ /* skip failed file */ }
      bar.style.width = ((i+1)/FILES.length*100)+"%";
    }
    status.textContent="Done ✓";
    if(!totalMs){ out.append(UI.el(`<div class="err-banner">❌ Could not complete — check your connection.</div>`)); return; }
    const mbps = (totalBytes*8/1e6) / (totalMs/1000);
    const mbpsRound = mbps.toFixed(mbps<10?1:0);
    const grade = mbps>=100?["Excellent 🚀","green"]:mbps>=25?["Great — HD streaming, video calls","green"]:mbps>=10?["Good — streaming OK","orange"]:["Slow — pages may load slowly","red"];
    out.append(
      UI.el(`<div class="big-number" style="font-size:40px">${mbpsRound} <span style="font-size:18px">Mbps</span> <span class="tag ${grade[1]}">${grade[0]}</span></div>`),
      UI.kv([
        ["Download speed", `${mbpsRound} Mbps (${(totalBytes/1048576/(totalMs/1000)).toFixed(2)} MB/s)`],
        ["Data downloaded", UI.fmtBytes(totalBytes)],
        ["Time taken", (totalMs/1000).toFixed(1)+" s"],
        ["Server", "jsDelivr CDN (global edge)"],
      ])
    );
  });
});

})();

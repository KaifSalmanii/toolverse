/* ============================================================
   ToolVerse — QR code & random generators
   ============================================================ */
(() => {

/* 1. QR CODE GENERATOR -------------------------------------- */
registerTool("qr-generator", root => {
  const types = ["Link / Text","WiFi","UPI Payment","Email","Phone","SMS"];
  let type = "Link / Text";
  const seg = UI.el(`<div class="seg mb" style="overflow-x:auto"></div>`);
  const fields = UI.el(`<div class="mt"></div>`);
  const size = UI.slider("Size", {min:200,max:1000,val:400,step:50,fmt:v=>v+"px"});
  const ecl = UI.el(`<select><option value="L">L — Low (7%)</option><option value="M" selected>M — Medium (15%)</option><option value="Q">Q — Quartile (25%)</option><option value="H">H — High (30%, for logos)</option></select>`);
  const fg = UI.el(`<input type="color" value="#111827" style="height:42px;padding:4px">`);
  const bg = UI.el(`<input type="color" value="#ffffff" style="height:42px;padding:4px">`);
  const cv = UI.el(`<canvas class="mt" style="max-width:280px;border-radius:12px;border:1px solid var(--border)"></canvas>`);
  const note = UI.el(`<div class="small muted mt"></div>`);
  root.append(
    UI.el(`<p class="muted small mb">Generate QR codes for anything — links, WiFi passwords, UPI payments, contact actions. Custom colors, high error correction, instant PNG download.</p>`),
    seg, fields,
    UI.el(`<div class="grid-2"></div>`),
    size,
    UI.el(`<div class="grid-3"></div>`),
    UI.el(`<div style="text-align:center"></div>`),
    note
  );
  const g1 = root.querySelectorAll('.grid-2')[0];
  const g2 = root.querySelectorAll('.grid-3')[0];
  const eclF = UI.field("Error correction",""); eclF.appendChild(ecl);
  const fgF = UI.field("Code color",""); fgF.appendChild(fg);
  const bgF = UI.field("Background",""); bgF.appendChild(bg);
  g2.append(eclF, fgF, bgF);
  const cvWrap = root.querySelector('div[style*="text-align"]'); cvWrap.appendChild(cv);

  const F = {
    "Link / Text": [["text","Text or URL","https://toolverse.app"]],
    "WiFi": [["ssid","Network name (SSID)","MyWiFi"],["pass","Password",""],["enc","Security","WPA"]],
    "UPI Payment": [["vpa","UPI ID (VPA)","name@upi"],["pn","Payee name",""],["amt","Amount (optional)",""]],
    "Email": [["to","Email address",""],["sub","Subject",""],["body","Message",""]],
    "Phone": [["num","Phone number","+91"]],
    "SMS": [["num","Phone number","+91"],["msg","Message",""]],
  };
  types.forEach((t,i)=>{
    const b = UI.el(`<button class="${i===0?'on':''}">${t}</button>`);
    b.addEventListener('click', ()=>{
      type=t; seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); buildFields();
    });
    seg.append(b);
  });
  function buildFields(){
    fields.innerHTML="";
    F[type].forEach(([k,lbl,ph])=>{
      let inp;
      if(k==="enc") inp = UI.el(`<select><option>WPA</option><option>WEP</option><option>nopass</option></select>`);
      else inp = UI.el(`<input type="text" placeholder="${UI.esc(ph)}" data-k="${k}">`);
      inp.dataset.k = k;
      const f = UI.field(lbl,""); f.appendChild(inp); fields.append(f);
      inp.addEventListener('input', debRender);
    });
    render();
  }
  function payload(){
    const get = k => (fields.querySelector(`[data-k="${k}"]`)?.value || "").trim();
    switch(type){
      case "Link / Text": return get("text") || " ";
      case "WiFi": return `WIFI:T:${get("enc")==="nopass"?"nopass":get("enc")||"WPA"};S:${get("ssid")};P:${get("pass")};;`;
      case "UPI Payment": {
        let s = `upi://pay?pa=${encodeURIComponent(get("vpa"))}`;
        if(get("pn")) s += `&pn=${encodeURIComponent(get("pn"))}`;
        if(get("amt")) s += `&am=${encodeURIComponent(get("amt"))}&cu=INR`;
        return s;
      }
      case "Email": return `mailto:${get("to")}?subject=${encodeURIComponent(get("sub"))}&body=${encodeURIComponent(get("body"))}`;
      case "Phone": return `tel:${get("num")}`;
      case "SMS": return `smsto:${get("num")}:${get("msg")}`;
    }
  }
  let t; function debRender(){ clearTimeout(t); t=setTimeout(render, 300); }
  function render(){
    const data = payload();
    if(!data.trim() || data.trim()===" "){ note.textContent="Fill the fields above — the QR updates live."; drawEmpty(); return; }
    try{
      const qr = qrcode(0, ecl.value);
      qr.addData(data);
      qr.make();
      const n = qr.getModuleCount();
      const px = size.get();
      const margin = 4;
      const cell = Math.max(1, Math.floor(px / (n + margin*2)));
      const real = cell*(n+margin*2);
      cv.width = real; cv.height = real;
      const x = cv.getContext('2d');
      x.fillStyle = bg.value; x.fillRect(0,0,real,real);
      x.fillStyle = fg.value;
      for(let r=0;r<n;r++) for(let c=0;c<n;c++)
        if(qr.isDark(r,c)) x.fillRect((c+margin)*cell,(r+margin)*cell,cell,cell);
      note.textContent = `${n}×${n} modules · scans with any phone camera`;
    }catch(e){ note.textContent = "Content too long for a QR code — shorten it or lower error correction."; }
  }
  function drawEmpty(){
    cv.width=240; cv.height=240; const x=cv.getContext('2d');
    x.fillStyle = bg.value; x.fillRect(0,0,240,240);
    x.fillStyle = "#9aa3b8"; x.font="600 15px Inter, Arial"; x.textAlign="center";
    x.fillText("Your QR code appears here",120,125);
  }
  [ecl,fg,bg].forEach(el=>el.addEventListener('input', render));
  size.querySelector('input').addEventListener('input', debRender);
  const dl = UI.el(`<button class="btn mt">⬇️ Download PNG</button>`);
  cvWrap.appendChild(document.createElement('br'));
  cvWrap.appendChild(dl);
  dl.addEventListener('click', ()=>{
    cv.toBlob(b=>{ if(b && cv.width>240) UI.download(b, "qr-code.png"); else UI.toast("Generate a QR first","err"); });
  });
  buildFields();
});

/* 2. RANDOM NUMBER ------------------------------------------- */
registerTool("random-number", root => {
  const min = UI.el(`<input type="number" value="1">`);
  const max = UI.el(`<input type="number" value="100">`);
  const n = UI.el(`<input type="number" value="1" min="1" max="100">`);
  const uniq = UI.el(`<label class="check mt"><input type="checkbox"> No repeats (unique)</label>`);
  const out = UI.el(`<div class="mt" style="text-align:center"></div>`);
  root.append(UI.el(`<p class="muted small mb">Fair random numbers via crypto.getRandomValues — perfect for giveaways, games and decisions.</p>`),
    UI.el(`<div class="grid-3"></div>`), uniq, out);
  const g = root.querySelector('.grid-3');
  g.append(UI.field("From",""), UI.field("To",""), UI.field("How many",""));
  g.children[0].appendChild(min); g.children[1].appendChild(max); g.children[2].appendChild(n);
  const go = UI.el(`<button class="btn mt">🎯 Generate</button>`);
  root.append(go);
  go.addEventListener('click', ()=>{
    let a=Math.trunc(+min.value), b=Math.trunc(+max.value);
    if(a>b) [a,b]=[b,a];
    const count = Math.min(100, Math.max(1, +n.value||1));
    if(uniq.querySelector('input').checked && (b-a+1) < count) return UI.toast("Range too small for that many unique numbers","err");
    const got = new Set(), list=[];
    while(list.length<count){
      const span = b-a+1;
      const buf = new Uint32Array(1); 
      let v;
      do{ crypto.getRandomValues(buf); v = a + (buf[0] % span); } while(uniq.querySelector('input').checked && got.has(v));
      got.add(v); list.push(v);
    }
    out.innerHTML = list.length===1
      ? `<div class="big-number" style="font-size:56px">${list[0]}</div>`
      : `<div class="row" style="justify-content:center">${list.map(v=>`<span class="info-pill"><b style="font-size:16px">${v}</b></span>`).join("")}</div>`;
  });
});

/* 3. COIN FLIP ------------------------------------------------- */
registerTool("coin-flip", root => {
  let heads=0, tails=0;
  const coin = UI.el(`<div class="coin">🪙</div>`);
  const tall = UI.el(`<div class="row mb" style="justify-content:center"><span class="info-pill">Heads <b id="hC">0</b></span><span class="info-pill">Tails <b id="tC">0</b></span></div>`);
  const go = UI.el(`<button class="btn">🪙 Flip the Coin</button>`);
  root.append(UI.el(`<p class="muted small mb">A perfectly fair 50/50, powered by crypto randomness.</p>`),
    UI.el(`<div style="text-align:center"></div>`));
  const c = root.querySelector('div[style*="text-align"]');
  c.append(coin, tall, go);
  const reset = UI.el(`<button class="btn ghost mt">Reset tally</button>`);
  c.append(document.createElement('br'), reset);
  go.addEventListener('click', ()=>{
    if(coin.classList.contains('flip')) return;
    coin.classList.add('flip');
    setTimeout(()=>{
      const buf = new Uint32Array(1); crypto.getRandomValues(buf);
      const isH = buf[0] % 2 === 0;
      coin.textContent = isH ? "👑" : "🦅";
      coin.classList.remove('flip');
      isH ? heads++ : tails++;
      tall.querySelector('#hC').textContent = heads;
      tall.querySelector('#tC').textContent = tails;
      UI.toast(isH ? "It's HEADS! 👑" : "It's TAILS! 🦅");
    }, 900);
  });
  reset.addEventListener('click', ()=>{ heads=0; tails=0; tall.querySelector('#hC').textContent=0; tall.querySelector('#tC').textContent=0; coin.textContent="🪙"; });
});

/* 4. DICE ROLLER -------------------------------------------------- */
registerTool("dice-roller", root => {
  const FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];
  const cnt = UI.el(`<select>${[1,2,3,4,5,6].map(n=>`<option ${n===2?"selected":""}>${n}</option>`).join("")}</select>`);
  const row = UI.el(`<div class="dice-row"></div>`);
  const tot = UI.el(`<div style="text-align:center" class="big-number">—</div>`);
  const hist = UI.el(`<div class="small muted mt" style="text-align:center"></div>`);
  const history = [];
  root.append(UI.el(`<p class="muted small mb">Roll up to six dice. Totals and roll history included.</p>`),
    UI.field("Number of dice",""), row, tot, hist);
  root.querySelector('.field').appendChild(cnt);
  const go = UI.el(`<button class="btn mt">🎲 Roll!</button>`);
  root.append(go);
  go.addEventListener('click', ()=>{
    const n = +cnt.value;
    row.innerHTML="";
    const vals=[];
    for(let i=0;i<n;i++){
      const buf = new Uint32Array(1); crypto.getRandomValues(buf);
      const v = buf[0]%6 + 1; vals.push(v);
      const d = UI.el(`<div class="die roll">${FACES[v-1]}</div>`);
      row.append(d);
    }
    const sum = vals.reduce((a,b)=>a+b,0);
    tot.textContent = n>1 ? `${sum}` : `${sum} 🎯`;
    history.unshift(vals.join("+")+(n>1?`=${sum}`:""));
    hist.textContent = "History: " + history.slice(0,6).join("  ·  ");
  });
});

})();

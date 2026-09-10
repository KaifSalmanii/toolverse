/* ============================================================
   ToolVerse — Calculators (all formulas shown, editable inputs)
   ============================================================ */
(() => {
const INR = n => "₹" + Math.round(n).toLocaleString("en-IN");

/* 1. EMI --------------------------------------------------- */
registerTool("emi-calculator", root => {
  const P = UI.el(`<input type="number" value="1000000" min="1">`);
  const R = UI.el(`<input type="number" value="8.5" min="0" step="0.1">`);
  const Y = UI.el(`<input type="number" value="20" min="1" max="40">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Works for home, car and personal loans. Formula: EMI = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1)</p>`),
    UI.el(`<div class="grid-3"></div>`), out);
  const g = root.querySelector('.grid-3');
  g.append(UI.field("Loan amount (₹)",""), UI.field("Interest rate (% / year)",""), UI.field("Tenure (years)",""));
  g.children[0].appendChild(P); g.children[1].appendChild(R); g.children[2].appendChild(Y);
  function calc(){
    const p=+P.value, r=+R.value/1200, n=+Y.value*12;
    if(!(p>0&&n>0)) return out.innerHTML="";
    const emi = r===0 ? p/n : p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    const total = emi*n, interest = total-p;
    const pi = p/total*100;
    out.innerHTML="";
    out.append(
      UI.el(`<div class="big-number">${INR(emi)} <span style="font-size:14px" class="muted">/ month</span></div>`),
      UI.el(`<div class="split-bar mt"><i style="width:${pi}%;background:var(--primary)"></i><i style="width:${100-pi}%;background:#f59e0b"></i></div>
        <div class="legend"><span><i style="background:var(--primary)"></i>Principal ${INR(p)}</span><span><i style="background:#f59e0b"></i>Interest ${INR(interest)}</span></div>`),
      UI.kv([["Monthly EMI", INR(emi)],["Total interest", INR(interest)],["Total payment", INR(total)],["Number of installments", n]])
    );
  }
  [P,R,Y].forEach(i=>i.addEventListener('input', calc)); calc();
});

/* 2. GST ---------------------------------------------------- */
registerTool("gst-calculator", root => {
  const amt = UI.el(`<input type="number" value="10000" min="0">`);
  const rate = UI.el(`<select>${[0.25,3,5,12,18,28].map(r=>`<option ${r===18?"selected":""}>${r}</option>`).join("")}<option value="custom">Custom…</option></select>`);
  const custom = UI.el(`<input type="number" placeholder="Custom %" hidden style="margin-top:8px">`);
  const seg = UI.el(`<div class="seg mt"><button class="on" data-m="excl">GST Exclusive (add GST)</button><button data-m="incl">GST Inclusive (extract GST)</button></div>`);
  const out = UI.el(`<div class="mt"></div>`);
  let mode="excl";
  root.append(UI.el(`<p class="muted small mb">Indian GST with automatic CGST + SGST split (intra-state). Supports all standard slabs.</p>`),
    UI.el(`<div class="grid-2"></div>`), custom, seg, out);
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Amount (₹)",""), UI.field("GST rate",""));
  g.children[0].appendChild(amt); g.children[1].appendChild(rate);
  rate.addEventListener('change', ()=>custom.hidden = rate.value!=="custom");
  seg.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); mode=b.dataset.m; calc();
  }));
  function calc(){
    const a=+amt.value; const r= rate.value==="custom"? +custom.value : parseFloat(rate.value);
    if(!(a>0&&r>=0)) return out.innerHTML="";
    let base, gst, total;
    if(mode==="excl"){ base=a; gst=a*r/100; total=a+gst; }
    else { total=a; base=a*100/(100+r); gst=total-base; }
    out.innerHTML="";
    out.append(
      UI.el(`<div class="big-number">${INR(total)} <span style="font-size:14px" class="muted">total</span></div>`),
      UI.kv([
        ["Base amount", INR(base)],
        [`GST @ ${r}%`, INR(gst), "good"],
        ["CGST @ "+r/2+"%", INR(gst/2)],
        ["SGST @ "+r/2+"%", INR(gst/2)],
        ["Grand total", INR(total)],
      ])
    );
  }
  [amt,custom].forEach(i=>i.addEventListener('input', calc)); rate.addEventListener('change', calc); calc();
});

/* 3. SIP ------------------------------------------------------ */
registerTool("sip-calculator", root => {
  const M = UI.el(`<input type="number" value="5000" min="100">`);
  const R = UI.el(`<input type="number" value="12" min="0" step="0.5">`);
  const Y = UI.el(`<input type="number" value="10" min="1" max="50">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Estimate mutual-fund SIP maturity (monthly compounding). Estimates only — not guaranteed returns.</p>`),
    UI.el(`<div class="grid-3"></div>`), out);
  const g = root.querySelector('.grid-3');
  g.append(UI.field("Monthly investment (₹)",""), UI.field("Expected return (%/yr)",""), UI.field("Duration (years)",""));
  g.children[0].appendChild(M); g.children[1].appendChild(R); g.children[2].appendChild(Y);
  function calc(){
    const m=+M.value, i=+R.value/1200, n=+Y.value*12;
    if(!(m>0&&n>0)) return out.innerHTML="";
    const fv = i===0 ? m*n : m*((Math.pow(1+i,n)-1)/i)*(1+i);
    const inv = m*n;
    out.innerHTML="";
    out.append(
      UI.el(`<div class="big-number">${INR(fv)} <span style="font-size:14px" class="muted">estimated value</span></div>`),
      UI.el(`<div class="split-bar mt"><i style="width:${inv/fv*100}%;background:var(--primary)"></i><i style="width:${(1-inv/fv)*100}%;background:var(--success)"></i></div>
        <div class="legend"><span><i style="background:var(--primary)"></i>Invested ${INR(inv)}</span><span><i style="background:var(--success)"></i>Est. gains ${INR(fv-inv)}</span></div>`),
      UI.kv([["Invested", INR(inv)],["Estimated returns", INR(fv-inv), "good"],["Total value", INR(fv)]])
    );
  }
  [M,R,Y].forEach(i=>i.addEventListener('input', calc)); calc();
});

/* 4. BMI -------------------------------------------------------- */
registerTool("bmi-calculator", root => {
  const W = UI.el(`<input type="number" value="70" min="1">`);
  const H = UI.el(`<input type="number" value="170" min="50">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Body Mass Index with WHO categories and your healthy weight range.</p>`),
    UI.el(`<div class="grid-2"></div>`), out);
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Weight (kg)",""), UI.field("Height (cm)",""));
  g.children[0].appendChild(W); g.children[1].appendChild(H);
  function calc(){
    const w=+W.value, h=+H.value/100;
    if(!(w>0&&h>0)) return out.innerHTML="";
    const bmi = w/(h*h);
    const cat = bmi<18.5?["Underweight","orange"]:bmi<25?["Normal weight","green"]:bmi<30?["Overweight","orange"]:["Obese","red"];
    out.innerHTML="";
    out.append(
      UI.el(`<div class="big-number">${bmi.toFixed(1)} <span class="tag ${cat[1]}">${cat[0]}</span></div>`),
      UI.kv([
        ["BMI", bmi.toFixed(1)],
        ["Healthy range for your height", `${(18.5*h*h).toFixed(1)} – ${(24.9*h*h).toFixed(1)} kg`],
        ["Categories", "Under &lt;18.5 · Normal 18.5–24.9 · Over 25–29.9 · Obese 30+"],
      ])
    );
  }
  [W,H].forEach(i=>i.addEventListener('input', calc)); calc();
});

/* 5. AGE ---------------------------------------------------------- */
registerTool("age-calculator", root => {
  const today = new Date().toISOString().slice(0,10);
  const dob = UI.el(`<input type="date" max="${today}">`);
  const asof = UI.el(`<input type="date" value="${today}">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Exact age in years, months and days — plus total days and next birthday countdown.</p>`),
    UI.el(`<div class="grid-2"></div>`), out);
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Date of birth",""), UI.field("Age as of",""));
  g.children[0].appendChild(dob); g.children[1].appendChild(asof);
  function calc(){
    out.innerHTML="";
    const d = new Date(dob.value), a = new Date(asof.value);
    if(isNaN(d)||isNaN(a)||d>a) return;
    let y=a.getFullYear()-d.getFullYear(), m=a.getMonth()-d.getMonth(), dd=a.getDate()-d.getDate();
    if(dd<0){ m--; dd += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
    if(m<0){ y--; m+=12; }
    const days = Math.floor((a-d)/86400000);
    let nb = new Date(a.getFullYear(), d.getMonth(), d.getDate());
    if(nb <= a) nb = new Date(a.getFullYear()+1, d.getMonth(), d.getDate());
    const toBday = Math.ceil((nb-a)/86400000);
    const bornDay = d.toLocaleDateString("en-IN",{weekday:"long"});
    out.append(
      UI.el(`<div class="big-number">${y} yrs ${m} mo ${dd} days</div>`),
      UI.kv([
        ["Born on a", bornDay],
        ["Total days", days.toLocaleString()],
        ["Total weeks", Math.floor(days/7).toLocaleString()],
        ["Total months", y*12+m],
        ["Next birthday", `in ${toBday} day${toBday===1?"":"s"} 🎂`],
      ])
    );
  }
  [dob,asof].forEach(i=>i.addEventListener('input', calc));
});

/* 6. PERCENTAGE ------------------------------------------------------ */
registerTool("percentage-calculator", root => {
  root.append(UI.el(`<p class="muted small mb">Three most-used percentage calculations, answered instantly.</p>`));
  function block(title, inputs, fn){
    const c = UI.el(`<div class="info-card mb"><h3>${title}</h3></div>`);
    const g = UI.el(`<div class="grid-2"></div>`);
    inputs.forEach(([lbl, def])=>{
      const f = UI.field(lbl, ""); const i = UI.el(`<input type="number" value="${def}">`);
      f.appendChild(i); g.appendChild(f);
    });
    c.appendChild(g);
    const r = UI.el(`<div class="big-number mt" style="font-size:24px">—</div>`);
    c.appendChild(r);
    g.querySelectorAll('input').forEach(i=>i.addEventListener('input', ()=>{
      const vals = [...g.querySelectorAll('input')].map(x=>+x.value);
      if(vals.some(isNaN)) return;
      r.textContent = fn(...vals);
    }));
    root.appendChild(c);
  }
  block("What is X% of Y?", [["X (%)",20],["Y",1500]], (x,y)=> (x/100*y).toLocaleString("en-IN"));
  block("X is what % of Y?", [["X",300],["Y",1500]], (x,y)=> y? (x/y*100).toFixed(2)+"%" : "—");
  block("% change from X to Y", [["From",800],["To",1000]], (a,b)=>{
    if(!a) return "—"; const p=(b-a)/a*100;
    return `${p>=0?"+":""}${p.toFixed(2)}% ${p>=0?"increase 📈":"decrease 📉"}`;
  });
});

/* 7. DISCOUNT ---------------------------------------------------------- */
registerTool("discount-calculator", root => {
  const mrp = UI.el(`<input type="number" value="2499" min="0">`);
  const d1 = UI.el(`<input type="number" value="30" min="0" max="100">`);
  const d2 = UI.el(`<input type="number" value="10" min="0" max="100">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Stacked discounts supported (like “30% + 10% off”). See final price and total savings.</p>`),
    UI.el(`<div class="grid-3"></div>`), out);
  const g = root.querySelector('.grid-3');
  g.append(UI.field("MRP / Price (₹)",""), UI.field("Discount 1 (%)",""), UI.field("Discount 2 (%) optional",""));
  g.children[0].appendChild(mrp); g.children[1].appendChild(d1); g.children[2].appendChild(d2);
  function calc(){
    const m=+mrp.value||0, a=+d1.value||0, b=+d2.value||0;
    const after1 = m*(1-a/100), final = after1*(1-b/100);
    const eff = m? (1-final/m)*100 : 0;
    out.innerHTML="";
    out.append(
      UI.el(`<div class="big-number">${INR(final)} <span style="font-size:14px" class="muted">final price</span></div>`),
      UI.kv([["Original", INR(m)],["You save", INR(m-final), "good"],["Effective discount", eff.toFixed(1)+"%"]])
    );
  }
  [mrp,d1,d2].forEach(i=>i.addEventListener('input', calc)); calc();
});

/* 8. DATE DIFFERENCE ------------------------------------------------------ */
registerTool("date-difference", root => {
  const today = new Date().toISOString().slice(0,10);
  const a = UI.el(`<input type="date" value="${today}">`);
  const b = UI.el(`<input type="date">`);
  const out = UI.el(`<div class="mt"></div>`);
  root.append(UI.el(`<p class="muted small mb">Days, weeks, months and working days (Mon–Fri) between two dates.</p>`),
    UI.el(`<div class="grid-2"></div>`), out);
  const g = root.querySelector('.grid-2');
  g.append(UI.field("Start date",""), UI.field("End date",""));
  g.children[0].appendChild(a); g.children[1].appendChild(b);
  function calc(){
    out.innerHTML="";
    const d1=new Date(a.value), d2=new Date(b.value);
    if(isNaN(d1)||isNaN(d2)) return;
    let s=d1, e=d2; if(d2<d1){ [s,e]=[d2,d1]; }
    const days = Math.round((e-s)/86400000);
    let work=0;
    for(let d=new Date(s); d<e; d.setDate(d.getDate()+1)){ const w=d.getDay(); if(w!==0&&w!==6) work++; }
    let m=(e.getFullYear()-s.getFullYear())*12 + (e.getMonth()-s.getMonth());
    if(e.getDate()<s.getDate()) m--;
    out.append(
      UI.el(`<div class="big-number">${days.toLocaleString()} days</div>`),
      UI.kv([
        ["Weeks", (days/7).toFixed(1)],
        ["Months (approx)", m],
        ["Working days (Mon–Fri)", work.toLocaleString()],
        ["Weekend days", days-work],
      ])
    );
  }
  [a,b].forEach(i=>i.addEventListener('input', calc)); calc();
});

/* 9. UNIT CONVERTER ---------------------------------------------------------- */
const UNITS = {
  Length:{ m:1, km:1000, cm:0.01, mm:0.001, mile:1609.344, yard:0.9144, foot:0.3048, inch:0.0254 },
  Weight:{ kg:1, g:0.001, mg:1e-6, tonne:1000, lb:0.453592, oz:0.0283495 },
  Data:{ TB:1024, GB:1, MB:1/1024, KB:1/1048576, byte:1/1073741824, bit:1/8589934592 },
  Speed:{ "km/h":1, "m/s":3.6, mph:1.609344, knot:1.852 },
  Area:{ "sq m":1, "sq km":1e6, "sq ft":0.092903, acre:4046.86, hectare:10000 },
  Volume:{ litre:1, ml:0.001, "cubic m":1000, gallon:3.78541, "cup":0.236588 },
  Time:{ second:1, minute:60, hour:3600, day:86400, week:604800 },
};
registerTool("unit-converter", root => {
  const cats = ["Length","Weight","Temperature","Data","Speed","Area","Volume","Time"];
  let cat = "Length";
  const val = UI.el(`<input type="number" value="1">`);
  const from = UI.el(`<select></select>`), to = UI.el(`<select></select>`);
  const out = UI.el(`<div class="mt"></div>`);
  const seg = UI.el(`<div class="seg mb" style="overflow-x:auto"></div>`);
  root.append(UI.el(`<p class="muted small mb">8 categories, instant conversion, full conversion table.</p>`), seg,
    UI.el(`<div class="grid-3"></div>`), out);
  const g = root.querySelector('.grid-3');
  g.append(UI.field("Value",""), UI.field("From",""), UI.field("To",""));
  g.children[0].appendChild(val); g.children[1].appendChild(from); g.children[2].appendChild(to);
  cats.forEach((c,i)=>{
    const b = UI.el(`<button class="${i===0?'on':''}">${c}</button>`);
    b.addEventListener('click', ()=>{
      cat=c; seg.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); fill();
    });
    seg.append(b);
  });
  function unitsOf(){ return cat==="Temperature" ? ["Celsius","Fahrenheit","Kelvin"] : Object.keys(UNITS[cat]); }
  function convert(v, u1, u2){
    if(cat==="Temperature"){
      let c = u1==="Celsius"? v : u1==="Fahrenheit"? (v-32)*5/9 : v-273.15;
      return u2==="Celsius"? c : u2==="Fahrenheit"? c*9/5+32 : c+273.15;
    }
    return v * UNITS[cat][u1] / UNITS[cat][u2];
  }
  function fill(){
    const us = unitsOf();
    from.innerHTML = us.map(u=>`<option>${u}</option>`).join("");
    to.innerHTML = us.map(u=>`<option>${u}</option>`).join("");
    if(us.length>1) to.selectedIndex = 1;
    calc();
  }
  function fmt(n){ return Math.abs(n)>=1e9 || (Math.abs(n)<1e-6 && n!==0) ? n.toExponential(4) : +n.toPrecision(8)+"" ; }
  function calc(){
    const v = +val.value; if(isNaN(v)) return out.innerHTML="";
    const r = convert(v, from.value, to.value);
    out.innerHTML="";
    const rows = unitsOf().filter(u=>u!==from.value).map(u=>[`${fmt(convert(v, from.value, u))} ${u}`, ""].reverse());
    out.append(
      UI.el(`<div class="big-number" style="font-size:26px">${fmt(v)} ${from.value} = ${fmt(r)} ${to.value}</div>`),
      UI.el(`<div class="mt">${unitsOf().filter(u=>u!==from.value).map(u=>`<div class="kv"><span>${UI.esc(u)}</span><b>${fmt(convert(v, from.value, u))}</b></div>`).join("")}</div>`)
    );
  }
  [val,from,to].forEach(i=>i.addEventListener('input', calc));
  fill();
});

})();

/* ============================================================
   ToolVerse — Monetization (Ads) module
   ------------------------------------------------------------
   Ad slots are placed on: home hero (leaderboard), tool grids
   (inline cards), every tool page (sidebar box + bottom banner)
   and category pages.

   ▶ TO ENABLE GOOGLE ADSENSE:
   1. Set publisherId below  e.g. "ca-pub-1234567890123456"
   2. Add your AdSense <script> loader in index.html (commented there)
   3. Fill the slot ids below from your AdSense account.
   Until then, clearly-labelled placeholders render in every slot.
   ============================================================ */

const ADS = {
  publisherId: "",            // ← paste your ca-pub id here
  slots: {
    leaderboard: "",          // 970×90 / responsive
    box:         "",          // 300×250
    banner:      "",          // 728×90
    inline:      "",          // in-feed
  },
  real(kind){ return !!(ADS.publisherId && ADS.slots[kind]); },

  slot(kind, cls=""){
    const sizes = { leaderboard:"Responsive · 970×90", box:"300×250 Medium Rectangle",
                    banner:"728×90 Leaderboard", inline:"In-Feed Ad" };
    const node = UI.el(`<div class="ad-slot ad-${kind} ${cls}" aria-hidden="true">
        <span class="ad-label">Advertisement</span>
        <span class="ad-size">${sizes[kind]||""}</span>
        <span class="ad-note">Ad slot — connect Google AdSense in js/ads.js</span>
      </div>`);
    if(ADS.real(kind)){
      node.innerHTML = `<ins class="adsbygoogle" style="display:block"
        data-ad-client="${ADS.publisherId}" data-ad-slot="${ADS.slots[kind]}"
        data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
    }
    return node;
  },
};
window.ADS = ADS;

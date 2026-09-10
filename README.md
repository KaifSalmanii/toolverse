# ⚡ ToolVerse — All-in-One Online Tools

> **49 fully working tools. One simple website. 100% browser-based.**

ToolVerse is a premium, privacy-first tools platform — image resizer & compressor, PDF merge/split/rotate, live IP & network utilities, QR generator (UPI/WiFi/links), Indian calculators (EMI/GST/SIP), developer utilities and more. Every listed tool actually works; upcoming tools are honestly marked **"Coming soon"** — no fake buttons, ever.

## ✨ Highlights

- 🖼️ **Image suite** — Resizer, Compressor, Converter (batch + ZIP), Cropper (drag-select), Rotate/Flip, Filters, Watermark, Base64, Color Picker
- 📄 **PDF tools** — Merge, Split, Rotate, Images→PDF (via `pdf-lib`, fully client-side)
- 🌐 **Network & IP** — My IP, IP Geolocation, DNS-over-HTTPS Lookup, Ping/Latency, Speed Test
- 🔳 **QR Generator** — Link, Text, WiFi, **UPI**, Email, Phone, SMS with custom colors & PNG export
- 🧮 **Calculators** — EMI, GST (CGST/SGST split), SIP, BMI, Age, Percentage, Discount, Date diff, Unit converter
- 💻 **Developer tools** — JSON formatter, Base64, URL encode, SHA-1/256/384/512, UUID, Password generator & strength checker, Color converter, Regex tester, Timestamp converter, HTML escape
- ✍️ **Text tools** — Word counter, Case converter, Lorem ipsum, Line tools, Find & Replace, Slug generator
- 🎲 **Random** — Numbers, Coin flip, Dice roller

## 🎨 UI

Premium SaaS design — dark/light mode, instant global search (`/` shortcut), favorites & recent tools (localStorage), fully responsive, emoji icon system, zero heavy frameworks.

## 💰 Monetization

Ad slots are built in (leaderboard, in-feed, sidebar). To activate Google AdSense:

1. Put your publisher id in `js/ads.js` → `ADS.publisherId`
2. Fill the slot ids in `ADS.slots`
3. Uncomment the AdSense loader in `index.html`

Until then, clearly-labelled placeholders render in every slot.

## 🚀 Run locally

Any static server works:

```bash
node bin/server.js        # → http://localhost:8080
# or
python3 -m http.server 8080
```

No build step, no dependencies to install — vendor libraries (`pdf-lib`, `jszip`, `qrcode-generator`) are committed in `vendor/`.

## 🌍 Deploy (GitHub Pages / Netlify / Vercel)

The site is 100% static — just publish this folder:

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root
- **Netlify/Vercel:** drag & drop or import the repo with no build command

## 🧩 Add a new tool

1. Add metadata in `js/registry.js` (`TOOLS` array)
2. Add a mount function in any `js/tools-*.js`: `registerTool("my-slug", root => { ... })`
3. Done — search, categories, homepage, footer and related-tools all update automatically.

## 🔒 Privacy

All processing happens in the browser. Files are never uploaded, stored or tracked.

## 📁 Structure

```
index.html          App shell
css/styles.css      Design system (light + dark)
js/registry.js      Tool registry (single source of truth)
js/ui.js            UI kit & helpers
js/ads.js           Monetization config
js/app.js           Router & pages
js/tools-*.js       Tool implementations by category
vendor/             pdf-lib, jszip, qrcode-generator
server.js           Tiny static server (optional)
```

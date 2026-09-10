/* ============================================================
   ToolVerse — Tool Registry (single source of truth)
   Add a tool here + a mount function in js/tools-*.js and the
   whole site (search, categories, SEO, related tools) picks it up.
   ============================================================ */

const CATEGORIES = [
  { id:"image",   name:"Image Tools",        icon:"🖼️", grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", desc:"Resize, compress, convert, crop & enhance images" },
  { id:"pdf",     name:"PDF Tools",          icon:"📄", grad:"linear-gradient(135deg,#ef4444,#f97316)", desc:"Merge, split, rotate PDFs & turn images into PDF" },
  { id:"text",    name:"Text Tools",         icon:"✍️", grad:"linear-gradient(135deg,#06b6d4,#3b82f6)", desc:"Count, convert, clean and generate text" },
  { id:"dev",     name:"Developer Tools",    icon:"💻", grad:"linear-gradient(135deg,#10b981,#14b8a6)", desc:"JSON, hashing, Base64, regex, UUID & more" },
  { id:"calc",    name:"Calculators",        icon:"🧮", grad:"linear-gradient(135deg,#f59e0b,#f97316)", desc:"EMI, GST, BMI, SIP, age, percentage & units" },
  { id:"network", name:"Network & IP",       icon:"🌐", grad:"linear-gradient(135deg,#0ea5e9,#6366f1)", desc:"Live IP address, IP lookup, DNS, ping & speed test" },
  { id:"qr",      name:"QR Code Tools",      icon:"🔳", grad:"linear-gradient(135deg,#111827,#4b5563)", desc:"Generate QR codes for links, WiFi, UPI & more" },
  { id:"random",  name:"Random Generators",  icon:"🎲", grad:"linear-gradient(135deg,#ec4899,#8b5cf6)", desc:"Numbers, coin flips, dice & picks" },
];

/* status: live = fully working · soon = coming soon (never faked) */
const TOOLS = [
/* ---------- IMAGE ---------- */
{ slug:"image-resizer", name:"Image Resizer", cat:"image", icon:"📐", status:"live", pop:1,
  desc:"Resize any image to exact pixels or percentage — perfect for forms, websites and social media.",
  kw:"resize photo scale picture dimensions px width height" },
{ slug:"image-compressor", name:"Image Compressor", cat:"image", icon:"🗜️", status:"live", pop:2,
  desc:"Reduce image file size with a quality slider. See exact before/after KB and % saved.",
  kw:"compress picture reduce size kb mb optimize photo" },
{ slug:"image-converter", name:"Image Converter", cat:"image", icon:"🔁", status:"live", pop:3,
  desc:"Convert images between JPG, PNG and WebP — single file or full batch with ZIP download.",
  kw:"jpg to png webp convert format batch" },
{ slug:"image-cropper", name:"Image Cropper", cat:"image", icon:"✂️", status:"live",
  desc:"Crop images visually by dragging a selection, or enter exact coordinates. Ratio presets included.",
  kw:"crop cut photo ratio square 16:9" },
{ slug:"rotate-flip", name:"Rotate & Flip Image", cat:"image", icon:"🔄", status:"live",
  desc:"Rotate 90° either way or flip horizontally/vertically, with live preview.",
  kw:"rotate flip mirror image orientation" },
{ slug:"photo-filters", name:"Photo Filters & Adjust", cat:"image", icon:"🎨", status:"live",
  desc:"Brightness, contrast, saturation, B&W, sepia, blur and one-click filter presets.",
  kw:"filter brightness contrast edit photo black white vintage" },
{ slug:"image-watermark", name:"Image Watermark", cat:"image", icon:"💧", status:"live",
  desc:"Add a custom text watermark — corner or tiled — with size, color and opacity control.",
  kw:"watermark copyright text overlay protect" },
{ slug:"image-to-base64", name:"Image to Base64", cat:"image", icon:"🧬", status:"live",
  desc:"Convert an image into a Base64 data URI for embedding in HTML/CSS.",
  kw:"base64 data uri embed encode image" },
{ slug:"image-color-picker", name:"Image Color Picker", cat:"image", icon:"🎯", status:"live",
  desc:"Click anywhere on an image to extract exact HEX/RGB colors and build a palette.",
  kw:"color pick pixel hex rgb palette eyedropper" },
{ slug:"favicon-generator", name:"Favicon Generator", cat:"image", icon:"⭐", status:"soon",
  desc:"Generate favicon.ico and PNG icon sets from one image.", kw:"favicon ico icon site" },
{ slug:"background-remover", name:"Background Remover", cat:"image", icon:"🪄", status:"soon",
  desc:"AI-powered one-click background removal with transparent PNG export.", kw:"remove background transparent cutout" },

/* ---------- PDF ---------- */
{ slug:"jpg-to-pdf", name:"JPG to PDF", cat:"pdf", icon:"🖼️", status:"live", pop:4,
  desc:"Combine one or many images into a single PDF — A4/Letter or fit-to-image pages.",
  kw:"image to pdf jpg png pictures convert" },
{ slug:"merge-pdf", name:"Merge PDF", cat:"pdf", icon:"🧩", status:"live", pop:5,
  desc:"Combine multiple PDFs into one file. Reorder files before merging.",
  kw:"combine join pdf files together" },
{ slug:"split-pdf", name:"Split PDF", cat:"pdf", icon:"🪓", status:"live",
  desc:"Extract page ranges (e.g. 1-3, 5) or split every page into separate PDFs.",
  kw:"extract pages separate split pdf range" },
{ slug:"rotate-pdf", name:"Rotate PDF", cat:"pdf", icon:"🔃", status:"live",
  desc:"Rotate all, odd, even or selected pages of a PDF by 90/180/270°.",
  kw:"rotate pdf pages fix orientation upside down" },
{ slug:"compress-pdf", name:"Compress PDF", cat:"pdf", icon:"🗜️", status:"soon",
  desc:"Shrink PDF file size while keeping quality high.", kw:"reduce pdf size kb" },
{ slug:"pdf-to-jpg", name:"PDF to JPG", cat:"pdf", icon:"📸", status:"soon",
  desc:"Render each PDF page as a high-quality JPG image.", kw:"pdf to image convert pages" },
{ slug:"protect-pdf", name:"Protect PDF", cat:"pdf", icon:"🔒", status:"soon",
  desc:"Add password protection to your PDF files.", kw:"password encrypt pdf secure" },
{ slug:"pdf-watermark", name:"PDF Watermark", cat:"pdf", icon:"💧", status:"soon",
  desc:"Stamp text watermarks across every PDF page.", kw:"watermark stamp pdf" },

/* ---------- TEXT ---------- */
{ slug:"word-counter", name:"Word Counter", cat:"text", icon:"🔢", status:"live",
  desc:"Live count of words, characters, sentences, paragraphs and reading time.",
  kw:"count words characters sentences reading time essay" },
{ slug:"case-converter", name:"Case Converter", cat:"text", icon:"🔠", status:"live",
  desc:"UPPER, lower, Title, Sentence, camelCase, snake_case and kebab-case in one click.",
  kw:"uppercase lowercase title camel snake kebab caps" },
{ slug:"lorem-ipsum", name:"Lorem Ipsum Generator", cat:"text", icon:"📜", status:"live",
  desc:"Generate placeholder paragraphs, sentences or words for designs and mockups.",
  kw:"dummy text placeholder filler generate" },
{ slug:"text-repeater", name:"Text Repeater", cat:"text", icon:"🔁", status:"live",
  desc:"Repeat any text N times with your choice of separator.",
  kw:"repeat text copy paste multiple times" },
{ slug:"line-tools", name:"Line Tools", cat:"text", icon:"📃", status:"live",
  desc:"Remove duplicates, sort, reverse, trim or shuffle lines of text.",
  kw:"sort lines remove duplicates reverse list dedupe" },
{ slug:"find-replace", name:"Find & Replace", cat:"text", icon:"🔎", status:"live",
  desc:"Search and replace text with optional regex and case sensitivity.",
  kw:"find replace search regex substitute" },
{ slug:"slug-generator", name:"Slug Generator", cat:"text", icon:"🐌", status:"live",
  desc:"Turn any title into a clean, SEO-friendly URL slug.",
  kw:"url slug seo permalink hyphen" },

/* ---------- DEVELOPER ---------- */
{ slug:"json-formatter", name:"JSON Formatter", cat:"dev", icon:"🧾", status:"live",
  desc:"Format, minify and validate JSON with clear error messages.",
  kw:"json beautify pretty print validate minify api" },
{ slug:"base64", name:"Base64 Encoder / Decoder", cat:"dev", icon:"🔣", status:"live",
  desc:"Encode/decode Base64 with full Unicode support.",
  kw:"base64 encode decode btoa atob" },
{ slug:"url-encode", name:"URL Encoder / Decoder", cat:"dev", icon:"🔗", status:"live",
  desc:"Percent-encode or decode URLs and query components.",
  kw:"url encode decode percent uri escape" },
{ slug:"hash-generator", name:"Hash Generator", cat:"dev", icon:"#️⃣", status:"live",
  desc:"Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes instantly.",
  kw:"sha256 sha1 sha512 checksum digest hash" },
{ slug:"uuid-generator", name:"UUID Generator", cat:"dev", icon:"🆔", status:"live",
  desc:"Generate v4 UUIDs in bulk, with uppercase / no-dash options.",
  kw:"uuid guid v4 unique id generate" },
{ slug:"password-generator", name:"Password Generator", cat:"dev", icon:"🔑", status:"live", pop:8,
  desc:"Strong random passwords with length, character sets and strength meter.",
  kw:"password strong random secure create" },
{ slug:"password-strength", name:"Password Strength Checker", cat:"dev", icon:"🛡️", status:"live",
  desc:"Check password entropy and get actionable improvement tips — locally, never uploaded.",
  kw:"password strength check entropy secure" },
{ slug:"color-converter", name:"Color Converter", cat:"dev", icon:"🌈", status:"live",
  desc:"Convert colors between HEX, RGB and HSL with a visual picker.",
  kw:"hex rgb hsl color picker convert css" },
{ slug:"regex-tester", name:"Regex Tester", cat:"dev", icon:"🧪", status:"live",
  desc:"Test regular expressions with live match highlighting and capture groups.",
  kw:"regex regular expression test match pattern" },
{ slug:"timestamp-converter", name:"Timestamp Converter", cat:"dev", icon:"⏱️", status:"live",
  desc:"Convert Unix timestamps to human dates and back, with live clock.",
  kw:"unix epoch timestamp date convert" },
{ slug:"html-escape", name:"HTML Escape / Unescape", cat:"dev", icon:"🧱", status:"live",
  desc:"Escape HTML entities for safe display, or decode them back.",
  kw:"html entities escape encode decode" },
{ slug:"jwt-decoder", name:"JWT Decoder", cat:"dev", icon:"🎟️", status:"soon",
  desc:"Decode JWT header & payload locally.", kw:"jwt token decode" },

/* ---------- CALCULATORS ---------- */
{ slug:"emi-calculator", name:"EMI Calculator", cat:"calc", icon:"🏦", status:"live", pop:6,
  desc:"Monthly EMI, total interest and total payment for any loan — with visual breakdown.",
  kw:"emi loan home car personal interest monthly india" },
{ slug:"gst-calculator", name:"GST Calculator", cat:"calc", icon:"🧾", status:"live", pop:7,
  desc:"GST inclusive/exclusive with CGST + SGST split for all Indian slabs.",
  kw:"gst tax india cgst sgst inclusive exclusive 18" },
{ slug:"sip-calculator", name:"SIP Calculator", cat:"calc", icon:"📈", status:"live",
  desc:"Estimate mutual-fund SIP returns — invested vs. estimated value.",
  kw:"sip mutual fund investment returns compound" },
{ slug:"bmi-calculator", name:"BMI Calculator", cat:"calc", icon:"⚖️", status:"live",
  desc:"Body Mass Index with WHO category and healthy weight range.",
  kw:"bmi body mass index weight health" },
{ slug:"age-calculator", name:"Age Calculator", cat:"calc", icon:"🎂", status:"live",
  desc:"Exact age in years, months, days — plus next birthday countdown.",
  kw:"age dob birthday how old date" },
{ slug:"percentage-calculator", name:"Percentage Calculator", cat:"calc", icon:"％", status:"live",
  desc:"X% of Y, X is what % of Y, and percentage change — all modes.",
  kw:"percent of number change increase discount" },
{ slug:"discount-calculator", name:"Discount Calculator", cat:"calc", icon:"🏷️", status:"live",
  desc:"Final price after discount, with savings amount and effective %.",
  kw:"discount sale price mrp offer savings" },
{ slug:"date-difference", name:"Date Difference", cat:"calc", icon:"📅", status:"live",
  desc:"Days, weeks, months and working days between any two dates.",
  kw:"date diff days between duration working days" },
{ slug:"unit-converter", name:"Unit Converter", cat:"calc", icon:"📏", status:"live",
  desc:"Length, weight, temperature, data, speed, area and volume conversions.",
  kw:"unit convert km miles kg lb celsius fahrenheit gb mb" },
{ slug:"currency-converter", name:"Currency Converter", cat:"calc", icon:"💱", status:"soon",
  desc:"Live currency conversion with up-to-date rates.", kw:"usd inr currency exchange rate" },

/* ---------- NETWORK ---------- */
{ slug:"my-ip", name:"My IP Address", cat:"network", icon:"🌍", status:"live", pop:9,
  desc:"See your public IP address instantly, with one-click copy. IPv4/IPv6 supported.",
  kw:"what is my ip address public ipv4 ipv6" },
{ slug:"ip-lookup", name:"IP Lookup / Geolocation", cat:"network", icon:"📍", status:"live", pop:10,
  desc:"Find location, ISP, ASN and timezone for any IP address.",
  kw:"ip location geolocation trace whois isp country" },
{ slug:"dns-lookup", name:"DNS Lookup", cat:"network", icon:"🗺️", status:"live",
  desc:"Query live DNS records (A, AAAA, MX, TXT, NS, CNAME) over secure DNS-over-HTTPS.",
  kw:"dns records a mx txt ns lookup domain" },
{ slug:"ping-test", name:"Ping / Latency Test", cat:"network", icon:"📡", status:"live",
  desc:"Measure HTTP latency to popular servers — min, average, max and packet loss.",
  kw:"ping latency ms test server response time" },
{ slug:"speed-test", name:"Internet Speed Test", cat:"network", icon:"🚀", status:"live",
  desc:"Estimate your download speed by timing real CDN downloads. No plugins needed.",
  kw:"internet speed test download mbps broadband" },
{ slug:"port-scanner", name:"Port Scanner", cat:"network", icon:"🔌", status:"soon",
  desc:"Check common open ports on a host.", kw:"port scan open tcp" },

/* ---------- QR ---------- */
{ slug:"qr-generator", name:"QR Code Generator", cat:"qr", icon:"🔳", status:"live", pop:11,
  desc:"QR codes for links, text, WiFi, UPI, email, phone & SMS — custom colors, PNG download.",
  kw:"qr code generate upi wifi link url scan" },
{ slug:"qr-scanner", name:"QR Scanner", cat:"qr", icon:"📷", status:"soon",
  desc:"Scan QR codes using your camera.", kw:"scan qr camera read" },
{ slug:"barcode-generator", name:"Barcode Generator", cat:"qr", icon:"🏷️", status:"soon",
  desc:"Generate Code-128 / EAN barcodes.", kw:"barcode ean code128 label" },

/* ---------- RANDOM ---------- */
{ slug:"random-number", name:"Random Number Generator", cat:"random", icon:"🔢", status:"live",
  desc:"Random numbers between any range — single or bulk, unique optional.",
  kw:"random number pick draw lottery between" },
{ slug:"coin-flip", name:"Coin Flip", cat:"random", icon:"🪙", status:"live",
  desc:"Flip a fair coin with animation and running tally.",
  kw:"coin toss heads tails flip" },
{ slug:"dice-roller", name:"Dice Roller", cat:"random", icon:"🎲", status:"live",
  desc:"Roll up to six dice, see totals and roll history.",
  kw:"dice roll d6 board game random" },
{ slug:"wheel-spinner", name:"Wheel Spinner", cat:"random", icon:"🎡", status:"soon",
  desc:"Spin a custom wheel to pick a random option.", kw:"wheel spin pick name random" },

/* ---------- COMING SOON (honest roadmap) ---------- */
{ slug:"video-compressor", name:"Video Compressor", cat:"video", icon:"🎬", status:"soon", desc:"Compress MP4/MOV videos.", kw:"video compress mp4" },
{ slug:"video-trimmer", name:"Video Trimmer", cat:"video", icon:"✂️", status:"soon", desc:"Cut video clips precisely.", kw:"cut trim video clip" },
{ slug:"video-to-mp3", name:"Video to MP3", cat:"audio", icon:"🎵", status:"soon", desc:"Extract audio from video.", kw:"mp3 audio extract video" },
{ slug:"audio-cutter", name:"Audio Cutter", cat:"audio", icon:"🎧", status:"soon", desc:"Trim MP3/WAV files.", kw:"cut audio ringtone mp3" },
{ slug:"ocr-tool", name:"OCR — Image to Text", cat:"ocr", icon:"🔤", status:"soon", desc:"Extract text from images & scans.", kw:"ocr text scan extract" },
{ slug:"passport-photo", name:"Passport Photo Maker", cat:"photo", icon:"🛂", status:"soon", desc:"Passport/visa size photos with print sheets.", kw:"passport photo visa size aadhaar" },
{ slug:"ai-writer", name:"AI Text Generator", cat:"ai", icon:"🤖", status:"soon", desc:"Write anything with AI.", kw:"ai write generator gpt" },
{ slug:"ai-summarizer", name:"AI Summarizer", cat:"ai", icon:"📝", status:"soon", desc:"Summarize long text with AI.", kw:"summarize ai tldr" },
{ slug:"signature-maker", name:"Signature Maker", cat:"doc", icon:"✒️", status:"soon", desc:"Draw & download your signature.", kw:"signature draw sign" },
{ slug:"invoice-generator", name:"Invoice Generator", cat:"business", icon:"🧾", status:"soon", desc:"Professional GST invoices.", kw:"invoice bill gst business" },
{ slug:"meme-generator", name:"Meme Generator", cat:"social", icon:"😂", status:"soon", desc:"Classic top/bottom text memes.", kw:"meme funny caption" },
{ slug:"yt-thumbnail", name:"YouTube Thumbnail Maker", cat:"social", icon:"▶️", status:"soon", desc:"1280×720 thumbnails.", kw:"youtube thumbnail banner" },
{ slug:"meta-generator", name:"Meta Tag Generator", cat:"seo", icon:"🏷️", status:"soon", desc:"SEO meta & OpenGraph tags.", kw:"seo meta og tags" },
];

/* category meta for soon-only categories */
const SOON_CATS = {
  video:"🎬 Video Tools", audio:"🎧 Audio Tools", ocr:"🔤 OCR", photo:"🛂 Photo Studio",
  ai:"🤖 AI Tools", doc:"📝 Documents", business:"💼 Business", social:"📱 Social Media", seo:"📈 SEO",
};

const REG = {
  live: () => TOOLS.filter(t=>t.status==="live"),
  soon: () => TOOLS.filter(t=>t.status==="soon"),
  byCat: (id) => TOOLS.filter(t=>t.cat===id),
  get: (slug) => TOOLS.find(t=>t.slug===slug),
  catName: (id) => (CATEGORIES.find(c=>c.id===id)||{}).name || SOON_CATS[id] || id,
  catIcon: (id) => (CATEGORIES.find(c=>c.id===id)||{}).icon || "🧰",
  search: (q, limit=50) => {
    if(!q) return [];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return TOOLS.map(t=>{
      const hay = (t.name+" "+t.desc+" "+t.kw+" "+REG.catName(t.cat)).toLowerCase();
      let score = 0;
      for(const w of terms){
        if(!hay.includes(w)) return null;
        if(t.name.toLowerCase().includes(w)) score+=3;
        if(t.name.toLowerCase().startsWith(w)) score+=2;
        score+=1;
      }
      if(t.status==="live") score+=1.5;
      return {t, score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.t);
  },
};
window.REG = REG;

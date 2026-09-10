const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/'||p==='')p='/index.html';
  const f=path.join(__dirname,p);
  if(!f.startsWith(__dirname)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(f,(e,d)=>{
    if(e){ // SPA fallback to index
      fs.readFile(path.join(__dirname,'index.html'),(e2,d2)=>{ if(e2){res.writeHead(404);res.end('404');} else {res.writeHead(200,{'Content-Type':'text/html'});res.end(d2);} });
      return;
    }
    res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(d);
  });
}).listen(8080,'0.0.0.0',()=>console.log('ToolVerse running on http://0.0.0.0:8080'));

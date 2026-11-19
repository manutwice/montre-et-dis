// Montre et dis : sert la page sur http://localhost:4777, liste les dossiers de projets et y enregistre les retours.
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const HOME=os.homedir(),HTML=path.join(__dirname,'montre-et-dis.html');
const SKIP=new Set(['appdata','contacts','favorites','links','music','videos','searches','saved games','pictures','downloads','documents','desktop','onedrive','intelgraphicsprofiles','3d objects']);
// Dossiers qui contiennent tes projets. Pour en changer : crée projets.txt (un chemin par ligne).
function roots(){let r=[HOME,path.join(HOME,'NodyBrush'),path.join(HOME,'Documents')];
  try{const t=fs.readFileSync(path.join(__dirname,'projets.txt'),'utf8').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&x[0]!='#');if(t.length)r=t}catch(e){}return r}
function projects(){const out=[],seen=new Set();
  for(const r of roots()){let L=[];try{L=fs.readdirSync(r,{withFileTypes:true})}catch(e){continue}
    for(const d of L){const n=d.name.toLowerCase();if(!d.isDirectory()||d.name[0]=='.'||n=='node_modules')continue;
      if(path.resolve(r)==path.resolve(HOME)&&(SKIP.has(n)||n.startsWith('quarantaine')))continue;
      const full=path.join(r,d.name);if(seen.has(full))continue;seen.add(full);
      const rel=path.relative(HOME,full);out.push({name:rel.startsWith('..')?full:rel,path:full})}}
  return out.sort((a,b)=>a.name.localeCompare(b.name,'fr'))}
http.createServer((req,res)=>{
  const send=(c,t,b)=>{res.writeHead(c,{'Content-Type':t});res.end(b)};
  if(req.method=='GET'&&req.url=='/projects')return send(200,'application/json',JSON.stringify(projects()));
  if(req.method=='POST'&&req.url=='/save'){
    if(req.headers['x-md']!='1')return send(403,'text/plain','refuse');
    const b=[];req.on('data',c=>b.push(c));
    req.on('end',()=>{try{const j=JSON.parse(Buffer.concat(b)),p=projects().find(x=>x.path==j.dir);if(!p)return send(400,'text/plain','projet inconnu');
      const z=n=>String(n).padStart(2,'0'),d=new Date(),stamp=`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}_${z(d.getHours())}-${z(d.getMinutes())}-${z(d.getSeconds())}`;
      const out=path.join(p.path,'retours',stamp);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'prompt.md'),j.prompt);
      for(const im of j.images)fs.writeFileSync(path.join(out,path.basename(im.name)),Buffer.from(im.data,'base64'));
      send(200,'application/json',JSON.stringify({where:'retours/'+stamp,full:out}))}catch(e){send(500,'text/plain',String(e.message))}});return}
  fs.readFile(HTML,(err,data)=>send(err?404:200,'text/html; charset=utf-8',err?'montre-et-dis.html introuvable':data));
}).on('error',e=>{if(e.code=='EADDRINUSE')console.log('Déjà lancé.');else console.log(e.message);process.exit(0)})
  .listen(4777,'127.0.0.1',()=>console.log('Montre et dis : http://localhost:4777  (Ctrl+C pour arreter)'));

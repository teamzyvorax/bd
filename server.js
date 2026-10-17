const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors({ origin: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(__dirname, { index: false }));

function slugify(value) {
  return String(value || 'beautiful').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 60) || 'beautiful';
}

function sendBirthdayPage(res, slug) {
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const safeSlug = JSON.stringify(slug);
  const bridge = `<script>
window.__birthdaySlug=${safeSlug};
try{if(location.pathname!=='/'&&location.search===''){history.replaceState({},'',location.pathname+'?name='+encodeURIComponent(${safeSlug}));}}catch(e){}
document.addEventListener('DOMContentLoaded',function(){
  try{
    const key='bdSlugData:'+${safeSlug};
    const data=JSON.parse(localStorage.getItem(key)||'null');
    if(data){
      if(data.age){const a=document.getElementById('ageInput');if(a)a.value=data.age;const line=document.getElementById('ageLine');if(line)line.textContent='Celebrating '+data.age+' wonderful years ✨';}
      if(data.date){const d=document.getElementById('dateInput');if(d)d.value=data.date;if(typeof startCountdown==='function')startCountdown(data.date);}
      if(data.photo&&data.photo.length<180000){const p=document.getElementById('heroPhoto'),f=document.getElementById('photoFrame');if(p)p.src=data.photo;if(f)f.classList.remove('hidden');window.currentPhoto=data.photo;}
    }
    if(location.pathname!=='/'&&location.search)history.replaceState({},'',location.pathname);

    const form=document.getElementById('setupForm');
    if(form)form.addEventListener('submit',function(e){
      e.preventDefault();e.stopImmediatePropagation();
      const name=(document.getElementById('nameInput')?.value||'Beautiful').trim();
      const age=(document.getElementById('ageInput')?.value||'').trim();
      const date=document.getElementById('dateInput')?.value||'';
      const photo=window.currentPhoto&&window.currentPhoto.length<180000?window.currentPhoto:'';
      const slug=slugify(name);
      localStorage.setItem('bdSlugData:'+slug,JSON.stringify({name,age,date,photo}));
      location.href='/'+slug;
    },true);

    const share=document.getElementById('shareBtn');
    if(share)share.addEventListener('click',async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      const name=(document.getElementById('name')?.textContent||'Beautiful').trim();
      const age=(document.getElementById('ageInput')?.value||'').trim();
      const date=document.getElementById('dateInput')?.value||'';
      const slug=slugify(name);
      localStorage.setItem('bdSlugData:'+slug,JSON.stringify({name,age,date,photo:window.currentPhoto||''}));
      const url=location.origin+'/'+slug;
      try{if(navigator.share)await navigator.share({title:'A Birthday Surprise 💖',text:'Happy Birthday, '+name+'! 🎂💖',url});else{await navigator.clipboard.writeText(url);share.textContent='Link Copied! 💌';setTimeout(()=>share.textContent='Share 💌',1800)}}catch(err){}
    },true);
  }catch(e){}
});
</script>`;
  html = html.replace('</head>', bridge + '</head>');
  res.type('html').send(html);
}

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/:name', (req, res, next) => {
  const name = String(req.params.name || '');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,59}$/.test(name)) return next();
  sendBirthdayPage(res, name);
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => file.mimetype && file.mimetype.startsWith('audio/') ? cb(null, true) : cb(new Error('Only audio files are allowed.'))
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'zyvora-birthday-music' }));
app.post('/api/music', upload.single('music'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No music file uploaded.' });
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ ok: true, title: req.body.title || req.file.originalname, filename: req.file.filename, url: `${base}/uploads/${encodeURIComponent(req.file.filename)}` });
});
app.use((err, _req, res, _next) => res.status(400).json({ error: err.message || 'Upload failed.' }));
app.listen(PORT, () => console.log(`Zyvora Birthday Music API running on port ${PORT}`));

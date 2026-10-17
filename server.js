const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const PROFILE_DIR = path.join(UPLOAD_DIR, 'profiles');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PROFILE_DIR, { recursive: true });

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(__dirname, { index: false }));

function slugify(value) {
  return String(value || 'beautiful').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 60) || 'beautiful';
}
function profilePath(slug) { return path.join(PROFILE_DIR, `${slug}.json`); }
function readProfile(slug) {
  try { return JSON.parse(fs.readFileSync(profilePath(slug), 'utf8')); } catch (_) { return null; }
}
function saveProfile(data) {
  const slug = slugify(data.name);
  const clean = {
    name: String(data.name || 'Beautiful').slice(0, 100),
    age: String(data.age || '').slice(0, 10),
    date: String(data.date || '').slice(0, 20),
    photo: typeof data.photo === 'string' && data.photo.length < 2500000 ? data.photo : ''
  };
  fs.writeFileSync(profilePath(slug), JSON.stringify(clean));
  return { slug, ...clean };
}

app.post('/api/birthday', (req, res) => {
  try {
    if (!req.body || !req.body.name) return res.status(400).json({ error: 'Name is required.' });
    res.json({ ok: true, profile: saveProfile(req.body) });
  } catch (e) { res.status(500).json({ error: 'Could not save birthday.' }); }
});

app.get('/api/birthday/:name', (req, res) => {
  const slug = slugify(req.params.name);
  const profile = readProfile(slug);
  if (!profile) return res.status(404).json({ error: 'Birthday not found.' });
  res.json({ ok: true, profile });
});

function sendBirthdayPage(res, slug) {
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const safeSlug = JSON.stringify(slug);
  const bridge = `<script>
window.__birthdaySlug=${safeSlug};
(function(){
  async function loadProfile(){
    try{
      const r=await fetch('/api/birthday/'+encodeURIComponent(${safeSlug}));
      if(!r.ok)return;
      const j=await r.json(),d=j.profile||{};
      const n=document.getElementById('nameInput'),a=document.getElementById('ageInput'),dt=document.getElementById('dateInput'),p=document.getElementById('heroPhoto'),f=document.getElementById('photoFrame');
      if(n)n.value=d.name||${safeSlug}; if(a)a.value=d.age||''; if(dt)dt.value=d.date||'';
      if(d.photo&&d.photo.length<2500000){if(p)p.src=d.photo;if(f)f.classList.remove('hidden');window.currentPhoto=d.photo;}
      if(typeof showBirthday==='function')showBirthday();
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',function(){
    const form=document.getElementById('setupForm');
    if(form)form.addEventListener('submit',async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      const name=(document.getElementById('nameInput')?.value||'Beautiful').trim();
      const age=(document.getElementById('ageInput')?.value||'').trim();
      const date=document.getElementById('dateInput')?.value||'';
      const photo=window.currentPhoto&&window.currentPhoto.length<2500000?window.currentPhoto:'';
      try{const r=await fetch('/api/birthday',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,age,date,photo})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Save failed');location.href='/'+j.profile.slug;}catch(err){alert('Birthday save failed. Please try again.');}
    },true);
    const share=document.getElementById('shareBtn');
    if(share)share.addEventListener('click',async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      const name=(document.getElementById('name')?.textContent||'Beautiful').trim();
      const age=(document.getElementById('ageInput')?.value||'').trim();
      const date=document.getElementById('dateInput')?.value||'';
      const photo=window.currentPhoto&&window.currentPhoto.length<2500000?window.currentPhoto:'';
      try{const r=await fetch('/api/birthday',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,age,date,photo})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Save failed');const url=location.origin+'/'+j.profile.slug;if(navigator.share)await navigator.share({title:'A Birthday Surprise 💖',text:'Happy Birthday, '+name+'! 🎂💖',url});else{await navigator.clipboard.writeText(url);share.textContent='Link Copied! 💌';setTimeout(()=>share.textContent='Share 💌',1800)}}catch(err){alert('Could not create share link.');}
    },true);
    if(location.pathname!=='/'&&location.pathname!=='/'+${safeSlug})return;
    if(location.pathname==='/'&&location.search){
      const q=new URLSearchParams(location.search),name=q.get('name');
      if(name){
        const a=document.getElementById('ageInput'),dt=document.getElementById('dateInput'),n=document.getElementById('nameInput');if(n)n.value=name;if(a)a.value=q.get('age')||'';if(dt)dt.value=q.get('date')||'';
        try{const photo=q.get('photo');if(photo&&photo.length<2500000){window.currentPhoto=photo;const p=document.getElementById('heroPhoto'),f=document.getElementById('photoFrame');if(p)p.src=photo;if(f)f.classList.remove('hidden')}}catch(e){}
      }
    } else loadProfile();
  },false);
})();
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

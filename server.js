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

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Zyvora Birthday Music API',
    status: 'online',
    health: '/api/health',
    upload: 'POST /api/music'
  });
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
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files are allowed.'));
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'zyvora-birthday-music' }));

app.post('/api/music', upload.single('music'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No music file uploaded.' });
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    ok: true,
    title: req.body.title || req.file.originalname,
    filename: req.file.filename,
    url: `${base}/uploads/${encodeURIComponent(req.file.filename)}`
  });
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Upload failed.' });
});

app.listen(PORT, () => console.log(`Zyvora Birthday Music API running on port ${PORT}`));

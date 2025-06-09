// GorillaFilms Node.js/Express backend
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOADS = path.join(__dirname, 'uploads');
const MOVIES_JSON = path.join(__dirname, 'movies.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.ensureDirSync(UPLOADS);
    cb(null, UPLOADS);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + uuidv4() + ext);
  }
});
const upload = multer({ storage });

// Helper: Load/save movies
function loadMovies() {
  if (!fs.existsSync(MOVIES_JSON)) return [];
  return JSON.parse(fs.readFileSync(MOVIES_JSON, 'utf8'));
}
function saveMovies(movies) {
  fs.writeFileSync(MOVIES_JSON, JSON.stringify(movies, null, 2));
}

// Helper: Get client IP (for voting)
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
}

// API: Get all movies
app.get('/api/movies', (req, res) => {
  const movies = loadMovies();
  res.json(movies);
});

// API: Upload movie (admin only)
app.post('/api/upload', upload.fields([
  { name: 'movieFile', maxCount: 1 },
  { name: 'thumbnailFile', maxCount: 1 }
]), (req, res) => {
  // Simple admin check (password in body or header)
  const adminPass = req.body.adminPassword || req.headers['x-admin-password'];
  if (adminPass !== 'gorillatag123') return res.status(403).json({ error: 'Admin only' });

  const { title, movieLink } = req.body;
  if (!title || (!movieLink && !req.files['movieFile'])) {
    return res.status(400).json({ error: 'Title and movie required' });
  }
  const id = uuidv4();
  let url = movieLink || '';
  let isBlob = false;
  if (req.files['movieFile']) {
    url = '/uploads/' + req.files['movieFile'][0].filename;
    isBlob = true;
  }
  let thumbnail = '';
  if (req.files['thumbnailFile']) {
    thumbnail = '/uploads/' + req.files['thumbnailFile'][0].filename;
  }
  const movie = {
    id,
    title,
    url,
    thumbnail,
    isBlob,
    likes: 0,
    dislikes: 0,
    voters: [],
    uploaded: Date.now()
  };
  const movies = loadMovies();
  movies.push(movie);
  saveMovies(movies);
  res.json({ success: true, movie });
});

// API: Vote (like/dislike)
app.post('/api/vote', (req, res) => {
  const { id, type } = req.body;
  if (!id || !['like', 'dislike'].includes(type)) return res.status(400).json({ error: 'Invalid vote' });
  const ip = getClientIp(req);
  const movies = loadMovies();
  const movie = movies.find(m => m.id === id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  if (!movie.voters) movie.voters = [];
  if (movie.voters.includes(ip)) return res.status(400).json({ error: 'Already voted' });
  if (type === 'like') movie.likes = (movie.likes || 0) + 1;
  else movie.dislikes = (movie.dislikes || 0) + 1;
  movie.voters.push(ip);
  saveMovies(movies);
  res.json({ success: true });
});

// API: Delete movie (admin only)
app.delete('/api/movie/:id', (req, res) => {
  const adminPass = req.headers['x-admin-password'];
  if (adminPass !== 'gorillatag123') return res.status(403).json({ error: 'Admin only' });
  const { id } = req.params;
  let movies = loadMovies();
  const idx = movies.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  // Delete files if present
  const movie = movies[idx];
  if (movie.url && movie.url.startsWith('/uploads/')) {
    fs.remove(path.join(UPLOADS, path.basename(movie.url))).catch(()=>{});
  }
  if (movie.thumbnail && movie.thumbnail.startsWith('/uploads/')) {
    fs.remove(path.join(UPLOADS, path.basename(movie.thumbnail))).catch(()=>{});
  }
  movies.splice(idx, 1);
  saveMovies(movies);
  res.json({ success: true });
});

// Serve frontend from public/
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log('GorillaFilms backend running on port', PORT);
});

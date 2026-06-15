const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const LIVEAVATAR_KEY = process.env.LIVEAVATAR_KEY;
const AVATAR_ID = '513fd1b7-7ef9-466d-9af2-344e51eeb833';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', avatar: AVATAR_ID });
});

app.post('/api/session', (req, res) => {
  const body = JSON.stringify({ avatar_id: AVATAR_ID, mode: 'LITE' });
  const options = {
    hostname: 'api.heygen.com',
    path: '/v1/streaming.new',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': LIVEAVATAR_KEY }
  };
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => res.json(JSON.parse(data)));
  });
  request.on('error', err => res.status(500).json({ error: err.message }));
  request.write(body);
  request.end();
});

app.get('/api/hist

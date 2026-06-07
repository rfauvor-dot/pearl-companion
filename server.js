const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const LIVEAVATAR_KEY = process.env.LIVEAVATAR_KEY;
const AVATAR_ID = '513fd1b7-7ef9-466d-9af2-344e51eeb833';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', avatar: AVATAR_ID });
});

// Get LiveAvatar session token
app.post('/api/session', (req, res) => {
  const body = JSON.stringify({
    avatarId: AVATAR_ID,
    version: 'v2'
});
  const options = {
    hostname: 'api.liveavatar.com',
  path: '/v1/sessions/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
     'X-API-KEY': LIVEAVATAR_KEY,
      'Content-Length': Buffer.byteLength(body)
    }
  };
  const r = https.request(options, (response) => {
    let d = '';
    response.on('data', (c) => { d += c; });
    response.on('end', () => { res.status(response.statusCode).send(d); });
  });
  r.on('error', (e) => { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

// Chat with Claude
app.post('/api/chat', (req, res) => {
  const body = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  const r = https.request(options, (response) => {
    let d = '';
    response.on('data', (c) => { d += c; });
    response.on('end', () => { res.status(response.statusCode).send(d); });
  });
  r.on('error', (e) => { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Pearl on port ' + PORT));

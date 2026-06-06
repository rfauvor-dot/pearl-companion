const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', voice: VOICE_ID });
});

app.post('/api/chat', function(req, res) {
  var body = JSON.stringify(req.body);
  var options = {
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
  var r = https.request(options, function(response) {
    var d = '';
    response.on('data', function(c) { d += c; });
    response.on('end', function() { res.status(response.statusCode).send(d); });
  });
  r.on('error', function(e) { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

app.post('/api/speak', async function(req, res) {
  try {
    const text = req.body && req.body.text;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
  const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', voice: VOICE_ID });
});

app.post('/api/chat', function(req, res) {
  var body = JSON.stringify(req.body);
  var options = {
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
  var r = https.request(options, function(response) {
    var d = '';
    response.on('data', function(c) { d += c; });
    response.on('end', function() { res.status(response.statusCode).send(d); });
  });
  r.on('error', function(e) { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

app.post('/api/speak', async function(req, res) {
  try {
    const text = req.body && req.body.text;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
    const client = new ElevenLabsClient({ apiKey: ELEVENLABS_KEY });
    const audio = await client.textToSpeech.convert(VOICE_ID, {
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.85 }
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    res.send(Buffer.concat(chunks));
  } catch(e) {
    console.error('ElevenLabs SDK error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log('Pearl on port ' + PORT); });
const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', voice: VOICE_ID });
});

app.post('/api/chat', function(req, res) {
  var body = JSON.stringify(req.body);
  var options = {
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
  var r = https.request(options, function(response) {
    var d = '';
    response.on('data', function(c) { d += c; });
    response.on('end', function() { res.status(response.statusCode).send(d); });
  });
  r.on('error', function(e) { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

app.post('/api/speak', async function(req, res) {
  try {
    const text = req.body && req.body.text;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
    const client = new ElevenLabsCl

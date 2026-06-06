const express = require('express');
const path = require('path');
const https = require('https');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', voice: VOICE_ID });
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

// Text to Speech
app.post('/api/speak', async (req, res) => {
  try {
    const text = req.body && req.body.text;
    if (!text) return res.status(400).json({ error: 'No text provided' });

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
  } catch (e) {
    console.error('ElevenLabs error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Pearl on port ' + PORT));

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const ELEVENLABS_KEY = 'sk_bbb62f6c22eaaac24f4914a75c78a430ff2bb31b92d4c0d5';
const ANTHROPIC_KEY = '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';
const VOICE_ID = 'IF80qTXCV4IDY5D4masP';

app.post('/api/chat', async (req, res) => {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/speak', (req, res) => {
  const { text } = req.body;
  const https = require('https');
  const postData = JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.85 }
  });
  const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/text-to-speech/' + VOICE_ID,
    method: 'POST',
    headers: {
      'xi-a

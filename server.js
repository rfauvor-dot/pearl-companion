const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = 'sk_50b038fbd937872b9fcde55c9e2d43201ea877456de93ea7';
const ANTHROPIC_KEY = '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';
const VOICE_ID = 'IF80qTXCV4IDY5D4masP';

app.post('/api/chat', async (req, res) => {
  try {
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

app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.90,
          style: 0.65,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pearl running on port ${PORT}`));

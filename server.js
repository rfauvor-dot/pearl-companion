const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Read from environment variables OR use hardcoded fallback
const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY || 'sk_50b038fbd937872b9fcde55c9e2d43201ea877456de93ea7';
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY || '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';
const VOICE_ID = process.env.VOICE_ID || 'IF80qTXCV4IDY5D4masP';

console.log('Starting Pearl server...');
console.log('ElevenLabs key present:', !!ELEVENLABS_KEY);
console.log('Anthropic key present:', !!ANTHROPIC_KEY);
console.log('Voice ID:', VOICE_ID);

// Claude API proxy
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Chat request received');
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
    console.log('Chat response status:', response.status);
    res.json(data);
  } catch(e) {
    console.error('Chat error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ElevenLabs voice proxy
app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('Speak request for text length:', text?.length);
    console.log('Using voice ID:', VOICE_ID);
    console.log('Using ElevenLabs key:', ELEVENLABS_KEY?.substring(0, 10) + '...');

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
    console.log('Calling ElevenLabs URL:', url);

    const response = await fetch(url, {
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

    console.log('ElevenLabs response status:', response.status);

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error body:', err);
      return res.status(response.status).send(err);
    }

    const buffer = await response.buffer();
    console.log('Audio buffer size:', buffer.length);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch(e) {
    console.error('Speak error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pearl running on port ${PORT}`));

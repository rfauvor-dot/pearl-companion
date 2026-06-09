const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
app.use(express.json());
app.use(express.static('public'));

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

app.get('/api/history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Conversations?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const history = JSON.parse(data[data.length - 1].message_history);
      res.json({ history });
    } else {
      res.json({ history: [] });
    }
  } catch (err) {
    res.json({ history: [] });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [], userId = 'default' } = req.body;
  const messages = [...history, { role: 'user', content: message }];
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: 'You are Pearl, a warm and caring AI companion for adults 50 and older. You remember your conversations and build on them over time.',
        messages
      })
    });
    const data = await response.json();
    const reply = data.content[0].text;
    const updatedHistory = [...messages, { role: 'assistant', content: reply }];
    await fetch(`${SUPABASE_URL}/rest/v1/Conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ user_id: userId, message_history: JSON.stringify(updatedHistory) })
    });
    res.json({ reply, history: updatedHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Pearl running on port 3000'));

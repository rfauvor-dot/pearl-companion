const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const ELEVENLABS_KEY = 'sk_2fefbd1ee01a26b4ff836ab433e76d598376bfdd8028f0a2';
const ANTHROPIC_KEY = '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';
const VOICE_ID = 'IF80qTXCV4IDY5D4masP';

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

app.post('/api/speak', function(req, res) {
  var text = req.body.text;
  var body = JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.85 }
  });
  var options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/text-to-speech/' + VOICE_ID,
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  var r = https.request(options, function(response) {
    console.log('ElevenLabs status:', response.statusCode);
    if (response.statusCode === 200) {
      res.setHeader('Content-Type', 'audio/mpeg');
      response.pipe(res);
    } else {
      var d = '';
      response.on('data', function(c) { d += c; });
      response.on('end', function() { res.status(response.statusCode).send(d); });
    }
  });
  r.on('error', function(e) { res.status(500).json({ error: e.message }); });
  r.write(body);
  r.end();
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log('Pearl on port ' + PORT); });

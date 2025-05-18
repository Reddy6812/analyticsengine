const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(cors());
app.use(express.json());

// Sample feed data
const sampleFeed = [
  { id: '1', content: 'Article 1' },
  { id: '2', content: 'Article 2' },
  { id: '3', content: 'Article 3' }
];

// Endpoint to get feed data
app.get('/feed', (req, res) => {
  res.json(sampleFeed);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const pubsub = new PubSub();
const topicName = process.env.TOPIC_NAME || 'engagement-topic';

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Publish to Pub/Sub
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'interaction') {
        const dataBuffer = Buffer.from(JSON.stringify(parsed));
        pubsub.topic(topicName).publish(dataBuffer);
      }
    } catch (err) {
      console.error('Publish error:', err);
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 
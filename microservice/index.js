const express = require('express');
const cors = require('cors');
const { PubSub } = require('@google-cloud/pubsub');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const subscriptionName = process.env.SUBSCRIPTION_NAME || 'engagement-sub';
const pubsub = new PubSub();
const metrics = {};

async function listenForMessages() {
  const subscription = pubsub.subscription(subscriptionName);
  subscription.on('message', message => {
    try {
      const data = JSON.parse(message.data.toString());
      console.log('Message received:', data);
      const key = data.itemId;
      metrics[key] = (metrics[key] || 0) + 1;
      message.ack();
    } catch (err) {
      console.error('Message handling error:', err);
    }
  });
  subscription.on('error', err => console.error(err));
}

listenForMessages().catch(console.error);

// Endpoint to get aggregated metrics
app.get('/metrics', (req, res) => {
  res.json(metrics);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Microservice listening on port ${PORT}`);
}); 
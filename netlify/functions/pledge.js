// Netlify serverless function — a real shared pledge counter,
// stored server-side using Netlify Blobs (so every visitor sees the same total).

const { getStore } = require('@netlify/blobs');

const BASE_COUNT = 10;

exports.handler = async function (event) {
  const store = getStore('pledges');

  if (event.httpMethod === 'GET') {
    const current = await store.get('count', { type: 'json' });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: current ?? BASE_COUNT })
    };
  }

  if (event.httpMethod === 'POST') {
    const current = await store.get('count', { type: 'json' });
    const newCount = (current ?? BASE_COUNT) + 1;
    await store.setJSON('count', newCount);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: newCount })
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};

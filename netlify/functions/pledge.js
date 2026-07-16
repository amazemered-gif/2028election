// Netlify serverless function — a real shared pledge counter,
// stored server-side using Netlify Blobs (so every visitor sees the same total).
//
// siteID and token are passed explicitly because automatic environment
// context isn't always available — set these in Netlify:
// Site settings → Environment variables:
//   NETLIFY_SITE_ID     = your site's ID (Site settings → General → Site details)
//   NETLIFY_BLOBS_TOKEN = a personal access token (User settings → Applications → New access token)

const { getStore } = require('@netlify/blobs');

const BASE_COUNT = 10;

function getPledgeStore() {
  return getStore({
    name: 'pledges',
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_BLOBS_TOKEN
  });
}

exports.handler = async function (event) {
  if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_BLOBS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing NETLIFY_SITE_ID or NETLIFY_BLOBS_TOKEN environment variable' })
    };
  }

  const store = getPledgeStore();

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


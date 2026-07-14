// Netlify serverless function — proxies requests to the Google Distance Matrix API.
// The real API key lives only here, as a server-side environment variable
// (set in Netlify: Site settings → Environment variables → GOOGLE_MAPS_API_KEY).
// It is never sent to, or visible in, the browser.

exports.handler = async function (event) {
  const { origin, destinations, mode } = event.queryStringParameters || {};

  if (!origin || !destinations || !mode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters: origin, destinations, mode' })
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing GOOGLE_MAPS_API_KEY environment variable' })
    };
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinations)}&mode=${encodeURIComponent(mode)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to reach Google Maps API' })
    };
  }
};

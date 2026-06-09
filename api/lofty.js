// Vercel serverless function — proxies Lofty CRM API calls
// Deployed at: /api/lofty
// Usage: /api/lofty?path=/api/lead/v1.0/leads&limit=100

export default async function handler(req, res) {
  // Allow your dashboard to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Lofty-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path, ...queryParams } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Get token from header or query
  const token = req.headers['x-lofty-token'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing Lofty API token' });
  }

  // Build Lofty URL with any remaining query params
  const qs = new URLSearchParams(queryParams).toString();
  const loftyUrl = `https://api.lofty.com${path}${qs ? '?' + qs : ''}`;

  try {
    const loftyRes = await fetch(loftyUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    const data = await loftyRes.json();
    return res.status(loftyRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

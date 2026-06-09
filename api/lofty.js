// Vercel serverless function — proxies Lofty CRM API calls
// Deployed at: /api/lofty

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Lofty-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...queryParams } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path parameter' });

  // Accept token from x-lofty-token header
  const token = req.headers['x-lofty-token'] || '';
  if (!token) return res.status(401).json({ error: 'Missing Lofty API token' });

  const qs = new URLSearchParams(queryParams).toString();
  const loftyUrl = `https://api.lofty.com${path}${qs ? '?' + qs : ''}`;

  try {
    const loftyRes = await fetch(loftyUrl, {
      method: req.method,
      headers: {
        'Authorization': `token ${token}`,
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

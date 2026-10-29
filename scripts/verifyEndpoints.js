const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5050${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verify() {
  const endpoints = [
    '/api/leads',
    '/api/notices',
    '/api/library/books',
    '/api/transport/vehicles',
    '/api/complaints',
    '/api/live-classes',
    '/api/surveys',
    '/api/hpc/stats',
    '/api/compliance/overview',
    '/api/chat-moderation/conversations'
  ];

  for (const ep of endpoints) {
    try {
      const res = await get(ep);
      console.log(`${ep}: status=${res.status}, success=${res.body?.success}, count=${res.body?.count ?? res.body?.data?.length ?? res.body?.total ?? 'N/A'}`);
    } catch (e) {
      console.log(`${ep}: ERROR - ${e.message}`);
    }
  }
}

verify();

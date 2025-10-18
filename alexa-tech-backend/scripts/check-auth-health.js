// Quick backend health and auth check
// Usage:
//   API_URL=http://localhost:3004/api node scripts/check-auth-health.js
//   AUTH_EMAIL=admin@alexatech.com AUTH_PASSWORD=admin123 npm run check:auth
//   node scripts/check-auth-health.js --email=admin@alexatech.com --password=admin123

const DEFAULT_API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function checkHealth(baseUrl) {
  const url = `${baseUrl}/health`;
  const res = await fetch(url);
  const json = await res.json();
  const ok = res.ok && json?.success === true && json?.data?.status === 'healthy';
  console.log('HEALTH:', ok ? 'OK' : 'FAIL', '|', json?.message || res.statusText);
  if (!ok) throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
}

function getCredentials() {
  // parse CLI args: --email=..., --password=...
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter(a => a.startsWith('--'))
      .map(a => {
        const [k, v] = a.replace(/^--/, '').split('=');
        return [k, v];
      })
  );
  const email = args.email || process.env.AUTH_EMAIL || 'admin@alexatech.com';
  const password = args.password || process.env.AUTH_PASSWORD || 'admin123';
  return { email, password };
}

async function checkLogin(baseUrl) {
  const url = `${baseUrl}/auth/login`;
  const body = getCredentials();
  console.log('USER:', body.email);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log('LOGIN:', json?.success ? 'OK' : 'FAIL', '|', json?.message || res.statusText);
  if (!json?.success) throw new Error(`Login failed: ${json?.message || res.statusText}`);
}

async function main() {
  const baseUrl = DEFAULT_API_URL.replace(/\/$/, '');
  console.log('API_URL:', baseUrl);
  try {
    await checkHealth(baseUrl);
    await checkLogin(baseUrl);
    console.log('CHECK: COMPLETED');
  } catch (err) {
    console.error('CHECK: FAILED', '-', err.message);
    process.exitCode = 1;
  }
}

main();
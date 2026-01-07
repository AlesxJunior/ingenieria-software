const https = require('https');

const apiKey = 'AIzaSyDJA3e8_IiwBRs2zuX3BkWuHYr-mZ-PW08';

// Probar con diferentes versiones de API y modelos
const tests = [
  { version: 'v1beta', model: 'gemini-pro' },
  { version: 'v1', model: 'gemini-pro' },
  { version: 'v1beta', model: 'gemini-1.5-flash' },
  { version: 'v1', model: 'gemini-1.5-flash' },
];

async function testAPI(version, model) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: 'Hola' }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/${version}/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(body);
            const text = json.candidates[0].content.parts[0].text;
            console.log(`✅ ${version}/${model} - FUNCIONA!`);
            console.log(`   Respuesta: ${text.substring(0, 50)}...`);
            resolve({ success: true, version, model });
          } catch (e) {
            console.log(`⚠️  ${version}/${model} - Respuesta sin formato esperado`);
            resolve({ success: false, version, model });
          }
        } else {
          console.log(`❌ ${version}/${model} - Status ${res.statusCode}: ${body.substring(0, 100)}`);
          resolve({ success: false, version, model });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${version}/${model} - Error: ${e.message}`);
      resolve({ success: false, version, model });
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Probando API key con diferentes combinaciones...\n');
  
  for (const test of tests) {
    const result = await testAPI(test.version, test.model);
    if (result.success) {
      console.log(`\n🎯 ENCONTRADO: Usar ${result.version}/${result.model}\n`);
      break;
    }
    console.log('');
  }
}

runTests();

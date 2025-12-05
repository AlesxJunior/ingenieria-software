const https = require('https');

const apiKey = 'AIzaSyDJA3e8_IiwBRs2zuX3BkWuHYr-mZ-PW08';

function listModels() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models?key=${apiKey}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(body);
            console.log('✅ Modelos disponibles:\n');
            if (json.models && json.models.length > 0) {
              json.models.forEach((model, idx) => {
                console.log(`${idx + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
              });
            } else {
              console.log('No se encontraron modelos disponibles.');
            }
            resolve(json);
          } catch (e) {
            console.log('❌ Error parseando respuesta:', e.message);
            console.log('Body:', body);
            resolve(null);
          }
        } else {
          console.log(`❌ Error ${res.statusCode}:`);
          console.log(body);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Error de red:', e.message);
      resolve(null);
    });

    req.end();
  });
}

console.log('🔍 Listando modelos disponibles con tu API key...\n');
listModels();

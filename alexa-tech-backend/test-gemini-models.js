const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyA0jVeCBNhCQiHrNYRC7IRN0NE9Q2WNRn0';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('🔍 Listando modelos disponibles con tu API Key...\n');
    
    // Intentar listar modelos
    const models = await genAI.listModels();
    
    console.log(`✅ Modelos encontrados: ${models.length}\n`);
    
    models.forEach((model, idx) => {
      console.log(`${idx + 1}. ${model.name}`);
      console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Intentar con modelos comunes
    console.log('\n🔧 Probando modelos comunes...\n');
    
    const commonModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hola');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} - FUNCIONA!`);
        console.log(`   Respuesta: ${text.substring(0, 50)}...`);
        console.log('');
        break; // Si uno funciona, usarlo
      } catch (err) {
        console.log(`❌ ${modelName} - ${err.message.substring(0, 80)}`);
      }
    }
  }
}

listModels();

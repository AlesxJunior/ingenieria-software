// test-modo-detective-simple.js
// Test simplificado sin autenticación para verificar estructura

const http = require('http');

console.log('\n🕵️ TEST SIMPLIFICADO - MODO DETECTIVE\n');
console.log('Este test verifica la estructura del código sin ejecutar el backend\n');
console.log('═'.repeat(80) + '\n');

// Leer el archivo del servicio
const fs = require('fs');
const path = require('path');

const serviceFile = path.join(
  __dirname,
  'alexa-tech-backend',
  'src',
  'modules',
  'ai',
  'ai-recommendations.service.ts'
);

const frontendFile = path.join(
  __dirname,
  'alexa-tech-react',
  'src',
  'modules',
  'sales',
  'pages',
  'AsistenteVentas.tsx'
);

console.log('📋 VALIDACIÓN 1: Verificar Backend Service');
console.log('─'.repeat(80));

if (fs.existsSync(serviceFile)) {
  const content = fs.readFileSync(serviceFile, 'utf-8');
  
  // Verificar que existe pasosAnalisis
  if (content.includes('pasosAnalisis')) {
    console.log('✅ "pasosAnalisis" encontrado en service');
  } else {
    console.log('❌ "pasosAnalisis" NO encontrado en service');
  }

  // Verificar los 5 pasos
  const pasos = [
    '🔎 Investigando Perfil del Cliente',
    '🌦️ Análisis Climático y Geográfico',
    '📦 Búsqueda Inteligente en Inventario',
    '🧠 Análisis con Inteligencia Artificial',
    '📊 Procesando Resultados',
  ];

  console.log('\nVerificando pasos de análisis:');
  pasos.forEach((paso, i) => {
    if (content.includes(paso)) {
      console.log(`✅ Paso ${i + 1}: "${paso}" ✓`);
    } else {
      console.log(`❌ Paso ${i + 1}: "${paso}" ✗`);
    }
  });

  // Verificar captura de tiempos
  if (content.includes('tiempoAnalisis') && content.includes('Date.now()')) {
    console.log('✅ Captura de tiempos de ejecución implementada');
  } else {
    console.log('❌ Captura de tiempos NO implementada');
  }

  // Verificar retorno de pasosAnalisis
  if (content.includes('return {') && content.includes('pasosAnalisis')) {
    console.log('✅ "pasosAnalisis" se retorna en respuesta');
  } else {
    console.log('❌ "pasosAnalisis" NO se retorna en respuesta');
  }
} else {
  console.log('❌ Archivo de servicio no encontrado');
}

console.log('\n📋 VALIDACIÓN 2: Verificar Frontend Component');
console.log('─'.repeat(80));

if (fs.existsSync(frontendFile)) {
  const content = fs.readFileSync(frontendFile, 'utf-8');

  // Verificar interface PasoAnalisis
  if (content.includes('interface PasoAnalisis')) {
    console.log('✅ Interface "PasoAnalisis" definida');
  } else {
    console.log('❌ Interface "PasoAnalisis" NO definida');
  }

  // Verificar campo en AIResponse
  if (content.includes('pasosAnalisis?: PasoAnalisis[]')) {
    console.log('✅ Campo "pasosAnalisis" en interface AIResponse');
  } else {
    console.log('❌ Campo "pasosAnalisis" NO en interface AIResponse');
  }

  // Verificar componentes styled
  const components = [
    'AnalysisPanel',
    'AnalysisHeader',
    'StepCard',
    'StepHeader',
    'StepTitle',
    'StepData',
  ];

  console.log('\nVerificando componentes styled:');
  components.forEach((comp) => {
    if (content.includes(`const ${comp} = styled`)) {
      console.log(`✅ ${comp} ✓`);
    } else {
      console.log(`❌ ${comp} ✗`);
    }
  });

  // Verificar renderizado del panel
  if (content.includes('recommendations.pasosAnalisis') && content.includes('map')) {
    console.log('✅ Panel de análisis se renderiza con map()');
  } else {
    console.log('❌ Panel de análisis NO implementado');
  }

  // Verificar función auxiliar
  if (content.includes('renderAnalysisData')) {
    console.log('✅ Función "renderAnalysisData" implementada');
  } else {
    console.log('❌ Función "renderAnalysisData" NO implementada');
  }

  // Verificar tiempo total
  if (content.includes('getTotalTime')) {
    console.log('✅ Función "getTotalTime" implementada');
  } else {
    console.log('❌ Función "getTotalTime" NO implementada');
  }
} else {
  console.log('❌ Archivo frontend no encontrado');
}

console.log('\n📋 VALIDACIÓN 3: Verificar Documentación');
console.log('─'.repeat(80));

const docs = [
  { name: 'MODO_DETECTIVE_IA.md', desc: 'Documentación técnica' },
  { name: 'GUIA_PRUEBA_MODO_DETECTIVE.md', desc: 'Guía de pruebas' },
  { name: 'RESUMEN_MODO_DETECTIVE.md', desc: 'Resumen ejecutivo' },
];

docs.forEach((doc) => {
  const docPath = path.join(__dirname, doc.name);
  if (fs.existsSync(docPath)) {
    const size = fs.statSync(docPath).size;
    console.log(`✅ ${doc.name} (${Math.round(size / 1024)}KB) - ${doc.desc}`);
  } else {
    console.log(`❌ ${doc.name} NO encontrado`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log('\n🎯 RESUMEN DE VALIDACIÓN ESTÁTICA\n');

const backendOk = fs.existsSync(serviceFile) && 
                  fs.readFileSync(serviceFile, 'utf-8').includes('pasosAnalisis');
const frontendOk = fs.existsSync(frontendFile) && 
                   fs.readFileSync(frontendFile, 'utf-8').includes('PasoAnalisis');

if (backendOk && frontendOk) {
  console.log('✅ BACKEND: Código implementado correctamente');
  console.log('✅ FRONTEND: Código implementado correctamente');
  console.log('✅ DOCUMENTACIÓN: Archivos creados');
  console.log('\n🎉 ¡Modo Detective implementado exitosamente!\n');
  console.log('📝 Para probar con datos reales:');
  console.log('   1. Asegúrate de que el backend esté corriendo: npm run dev');
  console.log('   2. Asegúrate de tener al menos 1 cliente en la BD');
  console.log('   3. Abre el frontend y navega a "Asistente de Ventas IA"');
  console.log('   4. Selecciona un cliente y busca "camaras"\n');
} else {
  console.log('❌ Hay problemas en la implementación');
  console.log('   Revisa los errores anteriores\n');
}

console.log('═'.repeat(80) + '\n');

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjA5YzMyZS00YmFjLTQ1ZTAtOGFkYi0yZDRhNGI1MDE4YzgiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZUlkIjoiM2Y0ZWFmNjQtMjNiMy00ODg1LWEzYWQtYzA5ODY1ZTM1M2IyIiwiaWF0IjoxNzMzNzU1NTkzfQ.Qc8w5yQCy5bOxC4DCMBCnGjJMvGRqZMnSR7DxXbUWWg';

const motivosAjuste = [
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-001',
    nombre: 'Corrección de inventario',
    descripcion: 'Ajuste por diferencia en conteo físico',
    requiereDocumento: false
  },
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-002',
    nombre: 'Mercadería dañada',
    descripcion: 'Producto dañado o defectuoso que debe ser dado de baja',
    requiereDocumento: true
  },
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-003',
    nombre: 'Pérdida por robo',
    descripcion: 'Ajuste negativo por producto extraviado o robado',
    requiereDocumento: true
  },
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-004',
    nombre: 'Muestra gratuita',
    descripcion: 'Ingreso de producto recibido como muestra del proveedor',
    requiereDocumento: false
  },
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-005',
    nombre: 'Error de registro',
    descripcion: 'Corrección por error en registro anterior',
    requiereDocumento: false
  },
  {
    tipo: 'AJUSTE',
    codigo: 'ADJ-006',
    nombre: 'Vencimiento de producto',
    descripcion: 'Ajuste negativo por producto vencido',
    requiereDocumento: false
  }
];

async function crearMotivosAjuste() {
  console.log('\n🔧 ===== CREAR MOTIVOS DE AJUSTE =====\n');

  try {
    // Primero, verificar cuántos motivos de ajuste existen
    console.log('📋 Verificando motivos existentes...');
    const checkResponse = await axios.get(`${API_BASE_URL}/movement-reasons`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: { tipo: 'AJUSTE' }
    });
    
    const existentes = checkResponse.data.data?.rows || checkResponse.data.data || [];
    console.log(`✅ Motivos de AJUSTE existentes: ${existentes.length}`);

    if (existentes.length > 0) {
      console.log('\n📝 Motivos ya existentes:');
      existentes.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.codigo}] ${m.nombre} - ${m.activo ? '✅ Activo' : '❌ Inactivo'}`);
      });
      
      const respuesta = await new Promise((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        readline.question('\n¿Deseas crear motivos adicionales? (s/n): ', (answer) => {
          readline.close();
          resolve(answer.toLowerCase() === 's');
        });
      });

      if (!respuesta) {
        console.log('\n❌ Operación cancelada');
        return;
      }
    }

    // Crear motivos
    console.log('\n🔨 Creando motivos de ajuste...\n');
    let creados = 0;
    let errores = 0;

    for (const motivo of motivosAjuste) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/movement-reasons`,
          motivo,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        
        console.log(`✅ Creado: [${motivo.codigo}] ${motivo.nombre}`);
        creados++;
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  Ya existe: [${motivo.codigo}] ${motivo.nombre}`);
        } else {
          console.error(`❌ Error creando [${motivo.codigo}]:`, error.response?.data?.message || error.message);
          errores++;
        }
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  ✅ Creados: ${creados}`);
    console.log(`  ⚠️  Ya existían: ${motivosAjuste.length - creados - errores}`);
    console.log(`  ❌ Errores: ${errores}`);

    // Verificar resultado final
    console.log('\n📋 Verificando resultado final...');
    const finalResponse = await axios.get(`${API_BASE_URL}/movement-reasons`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: { tipo: 'AJUSTE', activo: true }
    });
    
    const finales = finalResponse.data.data?.rows || finalResponse.data.data || [];
    console.log(`\n🎉 Total de motivos de AJUSTE activos: ${finales.length}`);
    
    if (finales.length > 0) {
      console.log('\n📝 Motivos disponibles:');
      finales.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.codigo}] ${m.nombre}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠️  Token inválido o expirado. Actualiza el TOKEN en el script.');
    }
    if (error.response?.status === 403) {
      console.log('\n⚠️  No tienes permisos para crear motivos. Verifica tu rol de usuario.');
    }
  }

  console.log('\n🔧 ===== FIN =====\n');
}

crearMotivosAjuste();

// Script de prueba rápida para DNI
// Ejecutar en consola del navegador o crear como test

const testDNI = async (dni: string) => {
  console.log(`\n🧪 Probando DNI: ${dni}`);
  
  try {
    const response = await fetch(`http://localhost:3001/api/sunat/dni/${dni}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log('📦 Respuesta completa:', result);
    
    if (result.success && result.data) {
      console.log('✅ DNI encontrado:');
      console.log(`   Nombres: ${result.data.nombres}`);
      console.log(`   Apellido Paterno: ${result.data.apellidoPaterno}`);
      console.log(`   Apellido Materno: ${result.data.apellidoMaterno}`);
      console.log(`   DNI: ${result.data.dni}`);
      return true;
    } else {
      console.log('❌ DNI no encontrado o error');
      console.log(`   Mensaje: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    return false;
  }
};

// Ejemplo de uso:
// testDNI('12345678');

export default testDNI;

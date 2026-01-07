import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductDescriptions() {
  console.log('🔄 Actualizando descripciones de productos...\n');
  
  try {
    const updates = [];
    
    // Cámara FUN
    updates.push(await prisma.product.update({
      where: { codigo: 'FUN-001' },
      data: {
        descripcion: 'Cámara de vigilancia básica ideal para uso interior en comercios y oficinas. Sensor de imagen de alta sensibilidad que captura video claro durante el día. Perfecta para monitoreo de puntos de venta, mostradores y áreas comunes. Diseño discreto que se integra con cualquier ambiente. Compatible con sistemas DVR estándar. Rango de operación: 10-40°C. NOTA: No incluye visión nocturna ni resistencia al agua - uso exclusivo en interiores secos.'
      }
    }));
    console.log('✅ Cámara FUN actualizada');
    
    // Cámara HILOOK THC C120
    updates.push(await prisma.product.update({
      where: { codigo: 'FUN-002' },
      data: {
        descripcion: 'Cámara de seguridad compacta diseñada para espacios reducidos en interiores. Ofrece una solución económica de vigilancia para pequeños negocios como bodegas, kioscos y tiendas familiares. Sensor básico con buena claridad durante el día. Instalación sencilla con soporte incluido. Ideal para presupuestos ajustados. Rango de operación: 10-35°C. ADVERTENCIA: No cuenta con certificación IP - no usar en exteriores o zonas húmedas. No tiene visión nocturna infrarroja.'
      }
    }));
    console.log('✅ Cámara HILOOK THC C120 actualizada');
    
    // Cable UTP Cat 6
    updates.push(await prisma.product.update({
      where: { codigo: 'CBL-UTP-002' },
      data: {
        descripcion: 'Cable de red UTP Categoría 6 certificado para instalaciones exteriores permanentes. Cubierta robusta resistente a rayos UV, lluvia y temperaturas extremas (-40°C a +70°C). Ideal para interconectar cámaras IP exteriores, access points en postes y enlaces entre edificios. Bobina de 305 metros color negro. Especificaciones: 23AWG, 4 pares trenzados, certificación TIA/EIA-568-B. Soporta velocidades Gigabit Ethernet (1000 Mbps) hasta 100 metros. PERFECTO PARA COSTA: Resistente a humedad salina y corrosión. Compatible con PoE y PoE+ para alimentar dispositivos remotos.'
      }
    }));
    console.log('✅ Cable UTP Cat 6 actualizado');
    
    // Conectores RJ45
    updates.push(await prisma.product.update({
      where: { codigo: 'CONN-RJ45' },
      data: {
        descripcion: 'Conectores RJ45 profesionales para cable UTP Cat 5e/6. Pack de 100 unidades con guía de inserción para cables de 8 hilos. Contactos chapados en oro para mejor conductividad y resistencia a la corrosión. Ideal para terminación de cables de red en instalaciones de CCTV, redes LAN y sistemas PoE. Diseño de 3 puntas para conexión confiable. Compatible con cable UTP/STP. APLICACIONES: Cámaras IP, computadoras, switches, routers. Fácil instalación con pinza ponchadora estándar.'
      }
    }));
    console.log('✅ Conectores RJ45 actualizados');
    
    // Fuente 12V 10A
    updates.push(await prisma.product.update({
      where: { codigo: 'FTE-12V-10A' },
      data: {
        descripcion: 'Fuente de poder centralizada 12V DC 10 Amperios (120W) ideal para alimentar múltiples cámaras de seguridad desde un punto central. Incluye 8 salidas independientes con protección individual por fusible. Entrada: 100-240V AC (universal). Protecciones: sobrecarga, cortocircuito y sobrecalentamiento. Ventilador interno para operación continua 24/7. Instalación en rack o pared. APLICACIONES: Sistemas CCTV de 4-8 cámaras (consumo 1-2A por cámara), iluminación LED 12V, cerraduras electromagnéticas. Certificaciones: CE, FCC. Eficiencia 85%. Cable de entrada 1.5m incluido.'
      }
    }));
    console.log('✅ Fuente 12V 10A actualizada');
    
    // Disco WD Purple
    updates.push(await prisma.product.update({
      where: { codigo: 'ACC-HDD-002' },
      data: {
        descripcion: 'Disco duro WD Purple 4TB optimizado específicamente para videovigilancia 24/7. Tecnología AllFrame que reduce pérdida de frames y mejora reproducción de video. Soporta hasta 64 cámaras HD simultáneas. Velocidad: 5400 RPM, Interfaz: SATA III 6Gb/s, Cache: 64MB. Carga de trabajo anual: 180TB/año. MTBF: 1 millón de horas. Operación silenciosa y bajo consumo (5.3W activo). Rango de temperatura: 0-65°C. Compatible con DVR/NVR de todas las marcas (Hikvision, Dahua, etc). Garantía 3 años. IDEAL PARA: Grabación continua de 4-8 cámaras 1080p durante 30-45 días.'
      }
    }));
    console.log('✅ Disco WD Purple actualizado');
    
    // Monitor LED 24"
    updates.push(await prisma.product.update({
      where: { codigo: 'MON-LED-002' },
      data: {
        descripcion: 'Monitor LED 24 pulgadas (1920x1080 Full HD) con panel TN de respuesta rápida (5ms). Dual entrada: HDMI + VGA para máxima compatibilidad. Brillo: 250 cd/m², Contraste: 1000:1. Ángulo de visión: 170°/160°. Incluye soporte VESA 100x100mm. APLICACIONES: Monitor de DVR/NVR para sistemas de seguridad, estaciones de trabajo, oficinas. Alimentación: 100-240V. Consumo: 25W. Botones de control frontal. INCLUYE: Cable HDMI, cable VGA, cable de poder, base con pie. Garantía 1 año. Perfecto para visualización de cámaras de seguridad en tiempo real.'
      }
    }));
    console.log('✅ Monitor LED 24" actualizado');
    
    console.log(`\n✅ TOTAL: ${updates.length} productos actualizados con éxito\n`);
    
    // Estadísticas
    const conDescripcion = await prisma.product.count({
      where: { descripcion: { not: null } }
    });
    
    const sinDescripcion = await prisma.product.count({
      where: { descripcion: null }
    });
    
    console.log('📊 ESTADÍSTICAS:');
    console.log(`   Productos CON descripción: ${conDescripcion}`);
    console.log(`   Productos SIN descripción: ${sinDescripcion}\n`);
    
    console.log('🎉 ¡Actualización completada! Ahora la IA podrá hacer mejores recomendaciones.');
    
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('❌ Error: Uno o más códigos de producto no existen en la base de datos.');
      console.error('   Verifica que los productos existan con esos códigos exactos.');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
updateProductDescriptions();

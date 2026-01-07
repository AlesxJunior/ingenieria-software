import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCamerasDescriptions() {
  console.log('🔄 Actualizando descripciones de cámaras IP...\n');
  
  const updates = [];

  try {
    // CAM-HIK-001 - Cámara IP Hikvision DS-2CD1023G2-IU 2MP (Entrada gama - Audio integrado)
    console.log('Actualizando Hikvision DS-2CD1023G2-IU 2MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-HIK-001' },
      data: {
        descripcion: 'Cámara IP bullet 2MP (1920×1080) con MICRÓFONO INCORPORADO para captura de audio y video simultáneamente. Ideal para negocios que necesitan grabación de conversaciones: tiendas, recepción, cajeros. Visión nocturna infrarroja hasta 30 metros. Compresión H.265+ para ahorrar ancho de banda. Protección IP67 resistente a lluvia y polvo - apta para EXTERIORES. Alimentación PoE (802.3af) o 12V DC. Rango temperatura: -30°C a +60°C. Aplicaciones: comercios urbanos, oficinas con área exterior, estacionamientos cubiertos. VENTAJA CLAVE: Audio integrado sin necesidad de micrófono externo.'
      }
    }));
    console.log('✅ Hikvision DS-2CD1023G2-IU 2MP actualizada\n');

    // CAM-HIK-002 - Cámara IP Hikvision DS-2CD1043G2-I 4MP (Entrada gama - Mayor resolución)
    console.log('Actualizando Hikvision DS-2CD1043G2-I 4MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-HIK-002' },
      data: {
        descripcion: 'Cámara IP bullet 4MP (2688×1520) con MAYOR RESOLUCIÓN para identificación precisa de rostros y placas vehiculares. Sensor progresivo 1/3" con excelente captura de detalles. Visión nocturna IR hasta 30 metros con Smart IR que previene sobreexposición. Compresión H.265+ reduce almacenamiento en 50%. Protección IP67 para instalación exterior permanente. Alimentación PoE o 12V DC. Rango: -30°C a +60°C. PERFECTO PARA: entradas de edificios, estacionamientos donde se requiere leer placas, zonas que necesitan evidencia detallada. SIN audio integrado - enfocada en calidad de imagen.'
      }
    }));
    console.log('✅ Hikvision DS-2CD1043G2-I 4MP actualizada\n');

    // CAM-DAH-001 - Cámara IP Dahua IPC-HFW1230S 2MP (Económica Dahua)
    console.log('Actualizando Dahua IPC-HFW1230S 2MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-DAH-001' },
      data: {
        descripcion: 'Cámara IP bullet Dahua 2MP (1920×1080) ECONÓMICA ideal para proyectos con presupuesto ajustado sin sacrificar calidad. Sensor 1/2.9" Starlight con buena sensibilidad en baja luz. Visión nocturna IR hasta 30 metros. Compresión H.265 eficiente. Protección IP67 para clima adverso. WDR (120dB) compensa contraluz en puertas y ventanas. Alimentación PoE (802.3af) o 12V DC. Rango: -30°C a +60°C. IDEAL PARA: pequeñas empresas, viviendas, negocios familiares que buscan balance precio-calidad. Compatible con ONVIF para integración con cualquier NVR.'
      }
    }));
    console.log('✅ Dahua IPC-HFW1230S 2MP actualizada\n');

    // CAM-DAH-002 - Cámara IP Dahua IPC-HDW1230T 2MP Domo (Diseño discreto)
    console.log('Actualizando Dahua IPC-HDW1230T 2MP Domo...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-DAH-002' },
      data: {
        descripcion: 'Cámara IP tipo DOMO 2MP (1920×1080) con diseño discreto y elegante para interiores comerciales. Formato compacto que se mimetiza en techos blancos - perfecto para oficinas, clínicas, boutiques donde la estética importa. Visión nocturna IR hasta 30 metros. Sensor Starlight para ambientes con poca iluminación. Compresión H.265 ahorra espacio. Protección IP67 permite instalación exterior cubierto. Micrófono INTERNO opcional. Alimentación PoE o 12V DC. Rango: -30°C a +60°C. DIFERENCIA CON BULLET: Menor visibilidad, ángulo de visión más natural para espacios interiores. Ideal: recepción, pasillos, salas de espera.'
      }
    }));
    console.log('✅ Dahua IPC-HDW1230T 2MP Domo actualizada\n');

    // CAM-TPL-001 - Cámara WiFi TP-Link Tapo C200 (WiFi giratorio interior)
    console.log('Actualizando TP-Link Tapo C200...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-TPL-001' },
      data: {
        descripcion: 'Cámara WiFi INTELIGENTE 1080P con movimiento PAN/TILT (360° horizontal, 114° vertical) controlado desde smartphone. Diseño moderno para INTERIORES: hogares, oficinas pequeñas, consultorios. FUNCIONES SMART: detección de movimiento con notificaciones push, audio bidireccional para hablar remotamente, visión nocturna hasta 9 metros. Almacenamiento en microSD hasta 128GB (no incluida). Configuración en 5 minutos vía app Tapo. WiFi 2.4GHz. VENTAJA: No requiere cableado de red, perfecta para espacios donde no hay infraestructura. LIMITACIÓN: Solo interior, rango temperatura 0-40°C. Uso: vigilancia de bebés, mascotas, pequeños negocios.'
      }
    }));
    console.log('✅ TP-Link Tapo C200 actualizada\n');

    // CAM-TPL-002 - Cámara WiFi TP-Link Tapo C310 (WiFi exterior)
    console.log('Actualizando TP-Link Tapo C310...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-TPL-002' },
      data: {
        descripcion: 'Cámara WiFi EXTERIOR 3MP (2304×1296) con protección IP66 resistente a lluvia, polvo y sol directo. Versión mejorada de Tapo para instalación en fachadas, patios, cocheras. Visión nocturna infrarroja hasta 30 metros. Detección inteligente de personas con notificaciones instantáneas (reduce falsas alarmas por animales/sombras). Audio bidireccional integrado. Compresión H.264. Almacenamiento microSD hasta 256GB o Tapo Cloud. WiFi 2.4GHz de largo alcance. Rango: -20°C a +45°C. DIFERENCIA CON C200: IP66 para clima, no tiene movimiento pan/tilt (posición fija). PERFECTO PARA: viviendas, pequeños comercios SIN cableado de red disponible.'
      }
    }));
    console.log('✅ TP-Link Tapo C310 actualizada\n');

    // CAM-EZV-001 - Cámara WiFi Ezviz C6N 1080p (WiFi giratorio económico)
    console.log('Actualizando Ezviz C6N 1080p...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-EZV-001' },
      data: {
        descripcion: 'Cámara WiFi giratoria 1080P con rotación 360° horizontal y 96° vertical - ALTERNATIVA ECONÓMICA a Tapo C200. Diseño minimalista blanco para interiores modernos. Detección inteligente de movimiento humano con seguimiento automático (sigue personas en movimiento). Audio bidireccional nítido. Visión nocturna hasta 10 metros. Almacenamiento: microSD hasta 256GB o Ezviz CloudPlay. App Ezviz con interfaz intuitiva. WiFi 2.4GHz. Compatible con Alexa/Google Assistant. Rango: 0-45°C solo interior. VENTAJA: Precio menor, buen rendimiento básico. USO: hogares, apartamentos, pequeñas oficinas que priorizan costo sobre marca.'
      }
    }));
    console.log('✅ Ezviz C6N 1080p actualizada\n');

    // CAM-HIK-003 - Cámara IP Hikvision DS-2CD2T43G2-2I 4MP (Gama alta con IA)
    console.log('Actualizando Hikvision DS-2CD2T43G2-2I 4MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-HIK-003' },
      data: {
        descripcion: 'Cámara IP bullet PROFESIONAL 4MP (2688×1520) con INTELIGENCIA ARTIFICIAL AcuSense de Hikvision. Detecta SOLO personas y vehículos ignorando animales, lluvia, hojas - reduce falsas alarmas en 95%. Tecnología DarkFighter para color en condiciones de casi total oscuridad. WDR 120dB para escenas con mucho contraste (entradas con luz solar directa). Visión nocturna IR hasta 60 metros. Compresión H.265+ ultra eficiente. Protección IP67 + IK10 antivandalismo. Alimentación PoE+ o 12V DC. Rango: -40°C a +60°C. APLICACIONES CRÍTICAS: perímetros industriales, almacenes, zonas de alto riesgo. DIFERENCIA: IA integrada, no necesita NVR costoso para filtrado inteligente.'
      }
    }));
    console.log('✅ Hikvision DS-2CD2T43G2-2I 4MP actualizada\n');

    // CAM-DAH-003 - Cámara IP Dahua IPC-HFW5442E-ZE 4MP (Gama alta varifocal)
    console.log('Actualizando Dahua IPC-HFW5442E-ZE 4MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-DAH-003' },
      data: {
        descripcion: 'Cámara IP bullet PROFESIONAL 4MP (2688×1520) con lente VARIFOCAL MOTORIZADO 2.7-13.5mm ajustable remotamente - NO requiere ir al sitio para enfocar. Sensor Starlight+ captura color con apenas 0.002 lux (noche casi completa). Tecnología SMD 3.0 de Dahua diferencia humanos/vehículos con precisión. WDR Real 120dB para contraluz extremo. Visión nocturna IR hasta 60 metros. Compresión H.265+ con bitrate variable inteligente. Protección IP67 + IK10 antivandálica. Alimentación PoE+ o 24V AC/DC. Rango: -40°C a +60°C. IDEAL PARA: proyectos grandes donde se necesita flexibilidad de zoom, instalaciones donde el acceso físico es difícil (postes altos, zonas peligrosas). Audio bidireccional opcional.'
      }
    }));
    console.log('✅ Dahua IPC-HFW5442E-ZE 4MP actualizada\n');

    // CAM-PTZ-001 - Cámara PTZ Hikvision DS-2DE2A404IW-DE3 4MP (PTZ profesional)
    console.log('Actualizando Hikvision PTZ DS-2DE2A404IW-DE3 4MP...');
    updates.push(await prisma.product.update({
      where: { codigo: 'CAM-PTZ-001' },
      data: {
        descripcion: 'Cámara PTZ (Pan-Tilt-Zoom) PROFESIONAL 4MP con control total del área vigilada. ZOOM ÓPTICO 4X (2.8-12mm) permite acercar sin perder calidad. Rotación 360° infinita horizontal + 90° vertical cubre espacios amplios con una sola cámara. 4 patrones de ronda automáticos programables. Seguimiento automático 3D con IA mantiene objetos centrados. Velocidad de giro: 100°/s para seguimiento rápido. Visión nocturna IR hasta 50 metros. Protección IP66 + IK10 ultra robusta. Alimentación PoE+ o 24V AC. Rango: -30°C a +65°C. APLICACIONES: estacionamientos grandes, plazas comerciales, almacenes, perímetros extensos. VENTAJA: Reemplaza 3-4 cámaras fijas, control remoto total desde NVR/app. Requiere NVR compatible con PTZ.'
      }
    }));
    console.log('✅ Hikvision PTZ DS-2DE2A404IW-DE3 4MP actualizada\n');

    console.log(`✅ TOTAL: ${updates.length} cámaras actualizadas con éxito\n`);

    // Estadísticas
    const totalCamaras = await prisma.product.count({
      where: {
        codigo: {
          startsWith: 'CAM-'
        }
      }
    });

    const camarasConDescripcion = await prisma.product.count({
      where: {
        codigo: {
          startsWith: 'CAM-'
        },
        descripcion: {
          not: null
        }
      }
    });

    const camarasSinDescripcion = totalCamaras - camarasConDescripcion;

    console.log('📊 ESTADÍSTICAS DE CÁMARAS:');
    console.log(`   Total cámaras: ${totalCamaras}`);
    console.log(`   CON descripción: ${camarasConDescripcion}`);
    console.log(`   SIN descripción: ${camarasSinDescripcion}`);
    console.log('\n🎉 ¡Actualización completada! La IA ahora puede diferenciar cada cámara perfectamente.\n');

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('❌ Error: Uno o más códigos de cámara no existen en la base de datos.');
      console.error('Verifica que las cámaras existan con esos códigos exactos.');
    } else {
      console.error('❌ Error al actualizar:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateCamerasDescriptions();

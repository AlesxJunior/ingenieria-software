/**
 * Seed de Productos AlexaTech
 * Inserta catálogo de productos de seguridad y tecnología para el negocio
 * - Cámaras de seguridad (Hikvision, Dahua, TP-Link, Ezviz)
 * - Grabadores DVR/NVR
 * - Equipos de red (switches, routers, access points)
 * - Cables y accesorios
 * - Sistemas de control de acceso
 * - Alarmas y sensores
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed de productos AlexaTech...\n');

  // 1. Obtener IDs de maestros desde la BD
  console.log('📦 Obteniendo IDs de categorías y unidades...');
  
  const categorias = await prisma.productCategory.findMany({
    where: { activo: true },
    select: { id: true, codigo: true, nombre: true }
  });

  const unidades = await prisma.unitOfMeasure.findMany({
    where: { activo: true },
    select: { id: true, codigo: true, nombre: true }
  });

  // Mapear códigos a IDs para fácil acceso
  const catMap = {};
  categorias.forEach(c => catMap[c.codigo] = c.id);

  const unitMap = {};
  unidades.forEach(u => unitMap[u.codigo] = u.id);

  console.log(`✅ Categorías encontradas: ${categorias.length}`);
  console.log(`✅ Unidades encontradas: ${unidades.length}\n`);

  // 2. Definir catálogo de productos
  const productos = [
    // ==================== CÁMARAS DE SEGURIDAD (CCTV) ====================
    {
      codigo: 'CAM-HIK-001',
      nombre: 'Cámara IP Hikvision DS-2CD1023G2-IU 2MP',
      descripcion: 'Cámara IP bullet 2MP, visión nocturna 30m, micrófono integrado, H.265+',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 280.00,
      precioCompra: 220.00,
      activo: true
    },
    {
      codigo: 'CAM-HIK-002',
      nombre: 'Cámara IP Hikvision DS-2CD1043G2-I 4MP',
      descripcion: 'Cámara IP bullet 4MP, visión nocturna 30m, WDR 120dB, H.265+',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 380.00,
      precioCompra: 310.00,
      activo: true
    },
    {
      codigo: 'CAM-DAH-001',
      nombre: 'Cámara IP Dahua IPC-HFW1230S 2MP',
      descripcion: 'Cámara IP bullet 2MP, visión nocturna 30m, H.265, IP67',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 260.00,
      precioCompra: 200.00,
      activo: true
    },
    {
      codigo: 'CAM-DAH-002',
      nombre: 'Cámara IP Dahua IPC-HDW1230T 2MP Domo',
      descripcion: 'Cámara IP domo 2MP, visión nocturna 30m, H.265, IK10',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 270.00,
      precioCompra: 210.00,
      activo: true
    },
    {
      codigo: 'CAM-TPL-001',
      nombre: 'Cámara WiFi TP-Link Tapo C200',
      descripcion: 'Cámara WiFi 1080p, visión nocturna, detección movimiento, app móvil',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 120.00,
      precioCompra: 85.00,
      activo: true
    },
    {
      codigo: 'CAM-TPL-002',
      nombre: 'Cámara WiFi TP-Link Tapo C310',
      descripcion: 'Cámara WiFi exterior 3MP, visión nocturna 30m, IP66, detección personas',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 180.00,
      precioCompra: 135.00,
      activo: true
    },
    {
      codigo: 'CAM-EZV-001',
      nombre: 'Cámara WiFi Ezviz C6N 1080p',
      descripcion: 'Cámara WiFi PTZ 1080p, rotación 360°, visión nocturna, audio bidireccional',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 150.00,
      precioCompra: 110.00,
      activo: true
    },
    {
      codigo: 'CAM-HIK-003',
      nombre: 'Cámara IP Hikvision DS-2CD2T43G2-2I 4MP',
      descripcion: 'Cámara IP bullet 4MP, AcuSense, visión nocturna 60m, H.265+',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 520.00,
      precioCompra: 420.00,
      activo: true
    },
    {
      codigo: 'CAM-DAH-003',
      nombre: 'Cámara IP Dahua IPC-HFW5442E-ZE 4MP',
      descripcion: 'Cámara IP varifocal 4MP, visión nocturna 60m, PoE, IVS',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 580.00,
      precioCompra: 460.00,
      activo: true
    },
    {
      codigo: 'CAM-PTZ-001',
      nombre: 'Cámara PTZ Hikvision DS-2DE2A404IW-DE3 4MP',
      descripcion: 'Cámara PTZ IP 4MP, zoom 4x, visión nocturna 20m, autotracking',
      categoriaId: catMap['CCTV'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 850.00,
      precioCompra: 680.00,
      activo: true
    },

    // ==================== GRABADORES DVR/NVR ====================
    {
      codigo: 'DVR-HIK-001',
      nombre: 'DVR Hikvision DS-7108HQHI-K1 8CH',
      descripcion: 'DVR 8 canales 1080p, H.265+, 1 HDD hasta 6TB, HDMI/VGA',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 320.00,
      precioCompra: 250.00,
      activo: true
    },
    {
      codigo: 'DVR-HIK-002',
      nombre: 'DVR Hikvision DS-7116HQHI-K1 16CH',
      descripcion: 'DVR 16 canales 1080p, H.265+, 1 HDD hasta 6TB, salida 4K',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 420.00,
      precioCompra: 340.00,
      activo: true
    },
    {
      codigo: 'DVR-DAH-001',
      nombre: 'XVR Dahua XVR1B08 8CH',
      descripcion: 'XVR 5 en 1, 8 canales 1080p, H.265+, 1 HDD hasta 6TB',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 290.00,
      precioCompra: 230.00,
      activo: true
    },
    {
      codigo: 'NVR-HIK-001',
      nombre: 'NVR Hikvision DS-7608NI-K2/8P 8CH PoE',
      descripcion: 'NVR 8 canales IP, 8 puertos PoE, hasta 8MP, 2 HDD, H.265+',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 650.00,
      precioCompra: 520.00,
      activo: true
    },
    {
      codigo: 'NVR-HIK-002',
      nombre: 'NVR Hikvision DS-7616NI-K2/16P 16CH PoE',
      descripcion: 'NVR 16 canales IP, 16 puertos PoE, hasta 8MP, 2 HDD, H.265+',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 980.00,
      precioCompra: 780.00,
      activo: true
    },
    {
      codigo: 'NVR-DAH-001',
      nombre: 'NVR Dahua NVR2108HS-8P-S3 8CH PoE',
      descripcion: 'NVR 8 canales IP, 8 puertos PoE, hasta 8MP, 1 HDD, H.265+',
      categoriaId: catMap['DVR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 580.00,
      precioCompra: 460.00,
      activo: true
    },

    // ==================== EQUIPOS DE REDES ====================
    {
      codigo: 'SW-TPL-001',
      nombre: 'Switch TP-Link TL-SG1008D 8 Puertos Gigabit',
      descripcion: 'Switch no administrable 8 puertos Gigabit, carcasa metálica',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 85.00,
      precioCompra: 65.00,
      activo: true
    },
    {
      codigo: 'SW-TPL-002',
      nombre: 'Switch TP-Link TL-SG1016D 16 Puertos Gigabit',
      descripcion: 'Switch no administrable 16 puertos Gigabit, rack 19"',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 150.00,
      precioCompra: 115.00,
      activo: true
    },
    {
      codigo: 'SW-POE-001',
      nombre: 'Switch PoE TP-Link TL-SG1008P 8P Gigabit',
      descripcion: 'Switch PoE 8 puertos Gigabit, 4 puertos PoE 802.3af, 53W',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 180.00,
      precioCompra: 140.00,
      activo: true
    },
    {
      codigo: 'SW-POE-002',
      nombre: 'Switch PoE Ubiquiti USW-Lite-8-PoE',
      descripcion: 'Switch PoE administrable 8 puertos Gigabit, 52W, UniFi',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 320.00,
      precioCompra: 260.00,
      activo: true
    },
    {
      codigo: 'AP-UBI-001',
      nombre: 'Access Point Ubiquiti UniFi U6 Lite',
      descripcion: 'AP WiFi 6 dual band, hasta 1.5 Gbps, PoE, montaje techo',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 380.00,
      precioCompra: 310.00,
      activo: true
    },
    {
      codigo: 'AP-TPL-001',
      nombre: 'Access Point TP-Link EAP245 AC1750',
      descripcion: 'AP dual band AC1750, MU-MIMO, PoE 802.3af, Omada SDN',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 280.00,
      precioCompra: 220.00,
      activo: true
    },
    {
      codigo: 'ROU-MIK-001',
      nombre: 'Router MikroTik hEX S RB760iGS',
      descripcion: 'Router 5 puertos Gigabit, SFP, dual core 880MHz, RouterOS L4',
      categoriaId: catMap['REDES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 250.00,
      precioCompra: 195.00,
      activo: true
    },

    // ==================== CABLES Y CONECTORES ====================
    {
      codigo: 'CBL-UTP-001',
      nombre: 'Cable UTP Cat 5e Exterior Caja 305m',
      descripcion: 'Cable UTP categoría 5e para exterior, conductor cobre, caja 305m',
      categoriaId: catMap['CABLES'],
      unidadMedidaId: unitMap['CJ'],
      precioVenta: 180.00,
      precioCompra: 145.00,
      activo: true
    },
    {
      codigo: 'CBL-UTP-002',
      nombre: 'Cable UTP Cat 6 Exterior Caja 305m',
      descripcion: 'Cable UTP categoría 6 para exterior, conductor cobre puro, caja 305m',
      categoriaId: catMap['CABLES'],
      unidadMedidaId: unitMap['CJ'],
      precioVenta: 260.00,
      precioCompra: 210.00,
      activo: true
    },
    {
      codigo: 'CBL-COA-001',
      nombre: 'Cable Coaxial RG59 95% Caja 305m',
      descripcion: 'Cable coaxial RG59 con alimentación, malla 95%, caja 305m',
      categoriaId: catMap['CABLES'],
      unidadMedidaId: unitMap['CJ'],
      precioVenta: 220.00,
      precioCompra: 175.00,
      activo: true
    },
    {
      codigo: 'CBL-UTP-MT',
      nombre: 'Cable UTP Cat 5e por Metro',
      descripcion: 'Cable UTP Cat 5e vendido por metro (cortado de caja)',
      categoriaId: catMap['CABLES'],
      unidadMedidaId: unitMap['MT'],
      precioVenta: 0.80,
      precioCompra: 0.60,
      activo: true
    },
    {
      codigo: 'CONN-RJ45',
      nombre: 'Conector RJ45 Cat 5e x100 unidades',
      descripcion: 'Pack 100 conectores RJ45 categoría 5e para cable UTP',
      categoriaId: catMap['ACCES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 15.00,
      precioCompra: 10.00,
      activo: true
    },
    {
      codigo: 'CONN-BNC',
      nombre: 'Conector BNC x50 unidades',
      descripcion: 'Pack 50 conectores BNC para cable coaxial RG59',
      categoriaId: catMap['ACCES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 18.00,
      precioCompra: 12.00,
      activo: true
    },

    // ==================== FUENTES Y ENERGÍA ====================
    {
      codigo: 'FTE-12V-1A',
      nombre: 'Fuente de Poder 12V 1A',
      descripcion: 'Fuente switching 12V DC 1A para cámaras de seguridad',
      categoriaId: catMap['ENERGIA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 18.00,
      precioCompra: 12.00,
      activo: true
    },
    {
      codigo: 'FTE-12V-2A',
      nombre: 'Fuente de Poder 12V 2A',
      descripcion: 'Fuente switching 12V DC 2A para cámaras de seguridad',
      categoriaId: catMap['ENERGIA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 25.00,
      precioCompra: 18.00,
      activo: true
    },
    {
      codigo: 'FTE-12V-10A',
      nombre: 'Fuente de Poder 12V 10A Centralizada',
      descripcion: 'Fuente switching 12V DC 10A para múltiples cámaras, 9 salidas',
      categoriaId: catMap['ENERGIA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 85.00,
      precioCompra: 65.00,
      activo: true
    },
    {
      codigo: 'UPS-650VA',
      nombre: 'UPS APC Back-UPS 650VA',
      descripcion: 'UPS 650VA/390W, 6 tomas, protección sobretensión',
      categoriaId: catMap['ENERGIA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 280.00,
      precioCompra: 220.00,
      activo: true
    },
    {
      codigo: 'UPS-1500VA',
      nombre: 'UPS APC Back-UPS 1500VA',
      descripcion: 'UPS 1500VA/865W, LCD, 10 tomas, USB, protección línea telefónica',
      categoriaId: catMap['ENERGIA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 680.00,
      precioCompra: 540.00,
      activo: true
    },

    // ==================== CONTROL DE ACCESO ====================
    {
      codigo: 'ACC-CER-001',
      nombre: 'Cerradura Electromagnética 280kg',
      descripcion: 'Cerradura electromagnética 280kg, 12V, con sensor de estado',
      categoriaId: catMap['ACCESO'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 120.00,
      precioCompra: 90.00,
      activo: true
    },
    {
      codigo: 'ACC-CER-002',
      nombre: 'Cerradura Electromagnética 600kg',
      descripcion: 'Cerradura electromagnética 600kg, 12V, para puertas pesadas',
      categoriaId: catMap['ACCESO'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 180.00,
      precioCompra: 140.00,
      activo: true
    },
    {
      codigo: 'ACC-LEC-001',
      nombre: 'Lector RFID 125kHz Standalone',
      descripcion: 'Lector de proximidad RFID 125kHz, standalone, hasta 1000 usuarios',
      categoriaId: catMap['ACCESO'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 85.00,
      precioCompra: 65.00,
      activo: true
    },
    {
      codigo: 'ACC-BIO-001',
      nombre: 'Lector Biométrico Huella + RFID',
      descripcion: 'Control de acceso biométrico, huella digital, RFID, TCP/IP',
      categoriaId: catMap['ACCESO'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 320.00,
      precioCompra: 250.00,
      activo: true
    },
    {
      codigo: 'ACC-TAR-001',
      nombre: 'Tarjetas RFID 125kHz x50',
      descripcion: 'Pack 50 tarjetas de proximidad RFID 125kHz',
      categoriaId: catMap['ACCESO'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 35.00,
      precioCompra: 25.00,
      activo: true
    },

    // ==================== ALARMAS Y SENSORES ====================
    {
      codigo: 'ALR-PIR-001',
      nombre: 'Sensor PIR Detector de Movimiento',
      descripcion: 'Sensor PIR pasivo infrarrojo, alcance 12m, ángulo 110°',
      categoriaId: catMap['ALARMA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 25.00,
      precioCompra: 18.00,
      activo: true
    },
    {
      codigo: 'ALR-MAG-001',
      nombre: 'Sensor Magnético Puerta/Ventana',
      descripcion: 'Sensor magnético para puertas y ventanas, NC/NO configurable',
      categoriaId: catMap['ALARMA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 12.00,
      precioCompra: 8.00,
      activo: true
    },
    {
      codigo: 'ALR-SIR-001',
      nombre: 'Sirena Exterior 120dB',
      descripcion: 'Sirena piezo eléctrica 120dB, 12V, con luz estroboscópica',
      categoriaId: catMap['ALARMA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 65.00,
      precioCompra: 48.00,
      activo: true
    },
    {
      codigo: 'ALR-TEC-001',
      nombre: 'Teclado Alarma LCD 32 Zonas',
      descripcion: 'Teclado alfanumérico LCD para panel de alarma, 32 zonas',
      categoriaId: catMap['ALARMA'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 95.00,
      precioCompra: 72.00,
      activo: true
    },

    // ==================== MONITORES Y ACCESORIOS ====================
    {
      codigo: 'MON-LED-001',
      nombre: 'Monitor LED 19" CCTV HDMI VGA BNC',
      descripcion: 'Monitor LED 19" para CCTV, entradas HDMI, VGA, BNC',
      categoriaId: catMap['MONITOR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 350.00,
      precioCompra: 280.00,
      activo: true
    },
    {
      codigo: 'MON-LED-002',
      nombre: 'Monitor LED 24" Full HD HDMI VGA',
      descripcion: 'Monitor LED 24" Full HD 1080p, HDMI, VGA, para DVR/NVR',
      categoriaId: catMap['MONITOR'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 480.00,
      precioCompra: 385.00,
      activo: true
    },
    {
      codigo: 'ACC-BAL-001',
      nombre: 'Balun Pasivo Video UTP',
      descripcion: 'Par de baluns pasivos para transmitir video por UTP hasta 300m',
      categoriaId: catMap['ACCES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 15.00,
      precioCompra: 10.00,
      activo: true
    },
    {
      codigo: 'ACC-HDD-001',
      nombre: 'Disco Duro Seagate SkyHawk 2TB',
      descripcion: 'HDD 3.5" 2TB optimizado para videovigilancia 24/7, SATA III',
      categoriaId: catMap['ACCES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 280.00,
      precioCompra: 220.00,
      activo: true
    },
    {
      codigo: 'ACC-HDD-002',
      nombre: 'Disco Duro WD Purple 4TB',
      descripcion: 'HDD 3.5" 4TB optimizado para DVR/NVR, SATA III, 64MB caché',
      categoriaId: catMap['ACCES'],
      unidadMedidaId: unitMap['UND'],
      precioVenta: 450.00,
      precioCompra: 360.00,
      activo: true
    },

    // ==================== SOFTWARE Y LICENCIAS ====================
    {
      codigo: 'LIC-VMS-001',
      nombre: 'Licencia VMS Milestone 8 Cámaras',
      descripcion: 'Licencia software VMS Milestone Essential para 8 cámaras IP',
      categoriaId: catMap['SOFT'],
      unidadMedidaId: unitMap['LIC'],
      precioVenta: 850.00,
      precioCompra: 680.00,
      activo: true
    },
    {
      codigo: 'LIC-VMS-002',
      nombre: 'Licencia IVMS-4200 Hikvision',
      descripcion: 'Software cliente IVMS-4200 para gestión cámaras Hikvision (gratuito)',
      categoriaId: catMap['SOFT'],
      unidadMedidaId: unitMap['LIC'],
      precioVenta: 0.00,
      precioCompra: 0.00,
      activo: true
    }
  ];

  console.log(`📦 Preparando ${productos.length} productos para inserción...\n`);

  // 3. Insertar productos en la BD
  let insertados = 0;
  let errores = 0;

  for (const producto of productos) {
    try {
      await prisma.product.create({
        data: {
          codigo: producto.codigo,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoriaId: producto.categoriaId,
          unidadMedidaId: producto.unidadMedidaId,
          precioVenta: producto.precioVenta,
          estado: producto.activo,
          // Campos legacy para compatibilidad (mapeados a 'categoria' y 'unidadMedida' en BD)
          categoria_legacy: categorias.find(c => c.id === producto.categoriaId)?.nombre || '',
          unidadMedida_legacy: unidades.find(u => u.id === producto.unidadMedidaId)?.nombre || ''
        }
      });
      insertados++;
      console.log(`✅ ${producto.codigo} - ${producto.nombre}`);
    } catch (error) {
      errores++;
      console.error(`❌ Error insertando ${producto.codigo}:`, error.message);
    }
  }

  console.log(`\n🎯 RESUMEN:`);
  console.log(`   ✅ Productos insertados: ${insertados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📊 Total procesados: ${productos.length}\n`);

  // 4. Verificar cantidad total en BD
  const totalProductos = await prisma.product.count();
  console.log(`📦 Total productos en BD: ${totalProductos}`);

  // 5. Mostrar distribución por categoría
  console.log(`\n📊 DISTRIBUCIÓN POR CATEGORÍA:`);
  for (const cat of categorias) {
    const count = await prisma.product.count({
      where: { categoriaId: cat.id }
    });
    if (count > 0) {
      console.log(`   ${cat.codigo.padEnd(10)} - ${cat.nombre.padEnd(30)} : ${count} productos`);
    }
  }

  console.log('\n✅ Seed de productos completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

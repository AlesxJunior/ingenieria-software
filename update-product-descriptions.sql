-- ================================================================
-- SCRIPT: Actualizar Descripciones de Productos
-- Fecha: 11 de Diciembre, 2025
-- Propósito: Agregar descripciones técnicas detalladas a productos
--            para mejorar las recomendaciones del Asistente de IA
-- ================================================================

-- IMPORTANTE: 
-- El campo 'descripcion' ya existe en la tabla Product (String?)
-- Este script actualiza los productos existentes con descripciones detalladas

-- ================================================================
-- CÁMARAS DE SEGURIDAD
-- ================================================================

-- Cámara FUN
UPDATE "Product"
SET descripcion = 'Cámara de vigilancia básica ideal para uso interior en comercios y oficinas. Sensor de imagen de alta sensibilidad que captura video claro durante el día. Perfecta para monitoreo de puntos de venta, mostradores y áreas comunes. Diseño discreto que se integra con cualquier ambiente. Compatible con sistemas DVR estándar. Rango de operación: 10-40°C. NOTA: No incluye visión nocturna ni resistencia al agua - uso exclusivo en interiores secos.'
WHERE codigo = 'FUN-001';

-- Cámara FUNCO POC
UPDATE "Product"
SET descripcion = 'Cámara de seguridad compacta diseñada para espacios reducidos en interiores. Ofrece una solución económica de vigilancia para pequeños negocios como bodegas, kioscos y tiendas familiares. Sensor básico con buena claridad durante el día. Instalación sencilla con soporte incluido. Ideal para presupuestos ajustados. Rango de operación: 10-35°C. ADVERTENCIA: No cuenta con certificación IP - no usar en exteriores o zonas húmedas. No tiene visión nocturna infrarroja.'
WHERE codigo = 'POC-001';

-- ================================================================
-- CABLES Y CONECTIVIDAD
-- ================================================================

-- Cable UTP Cat 6 Exterior
UPDATE "Product"
SET descripcion = 'Cable de red UTP Categoría 6 certificado para instalaciones exteriores permanentes. Cubierta robusta resistente a rayos UV, lluvia y temperaturas extremas (-40°C a +70°C). Ideal para interconectar cámaras IP exteriores, access points en postes y enlaces entre edificios. Bobina de 305 metros color negro. Especificaciones: 23AWG, 4 pares trenzados, certificación TIA/EIA-568-B. Soporta velocidades Gigabit Ethernet (1000 Mbps) hasta 100 metros. PERFECTO PARA COSTA: Resistente a humedad salina y corrosión. Compatible con PoE y PoE+ para alimentar dispositivos remotos.'
WHERE codigo = 'CBL-UTP-002';

-- Conector RJ45 Cat 5e
UPDATE "Product"
SET descripcion = 'Conectores RJ45 profesionales para cable UTP Cat 5e/6. Pack de 100 unidades con guía de inserción para cables de 8 hilos. Contactos chapados en oro para mejor conductividad y resistencia a la corrosión. Ideal para terminación de cables de red en instalaciones de CCTV, redes LAN y sistemas PoE. Diseño de 3 puntas para conexión confiable. Compatible con cable UTP/STP. APLICACIONES: Cámaras IP, computadoras, switches, routers. Fácil instalación con pinza ponchadora estándar.'
WHERE codigo = 'CONN-RJ45';

-- ================================================================
-- FUENTES DE PODER
-- ================================================================

-- Fuente de Poder 12V 10A Centralizada
UPDATE "Product"
SET descripcion = 'Fuente de poder centralizada 12V DC 10 Amperios (120W) ideal para alimentar múltiples cámaras de seguridad desde un punto central. Incluye 8 salidas independientes con protección individual por fusible. Entrada: 100-240V AC (universal). Protecciones: sobrecarga, cortocircuito y sobrecalentamiento. Ventilador interno para operación continua 24/7. Instalación en rack o pared. APLICACIONES: Sistemas CCTV de 4-8 cámaras (consumo 1-2A por cámara), iluminación LED 12V, cerraduras electromagnéticas. Certificaciones: CE, FCC. Eficiencia 85%. Cable de entrada 1.5m incluido.'
WHERE codigo = 'FTE-12V-10A';

-- ================================================================
-- ALMACENAMIENTO
-- ================================================================

-- Disco Duro WD Purple 4TB
UPDATE "Product"
SET descripcion = 'Disco duro WD Purple 4TB optimizado específicamente para videovigilancia 24/7. Tecnología AllFrame que reduce pérdida de frames y mejora reproducción de video. Soporta hasta 64 cámaras HD simultáneas. Velocidad: 5400 RPM, Interfaz: SATA III 6Gb/s, Cache: 64MB. Carga de trabajo anual: 180TB/año. MTBF: 1 millón de horas. Operación silenciosa y bajo consumo (5.3W activo). Rango de temperatura: 0-65°C. Compatible con DVR/NVR de todas las marcas (Hikvision, Dahua, etc). Garantía 3 años. IDEAL PARA: Grabación continua de 4-8 cámaras 1080p durante 30-45 días.'
WHERE codigo = 'ACC-HDD-002';

-- ================================================================
-- MONITORES
-- ================================================================

-- Monitor LED 24" Full HD HDMI VGA
UPDATE "Product"
SET descripcion = 'Monitor LED 24 pulgadas (1920x1080 Full HD) con panel TN de respuesta rápida (5ms). Dual entrada: HDMI + VGA para máxima compatibilidad. Brillo: 250 cd/m², Contraste: 1000:1. Ángulo de visión: 170°/160°. Incluye soporte VESA 100x100mm. APLICACIONES: Monitor de DVR/NVR para sistemas de seguridad, estaciones de trabajo, oficinas. Alimentación: 100-240V. Consumo: 25W. Botones de control frontal. INCLUYE: Cable HDMI, cable VGA, cable de poder, base con pie. Garantía 1 año. Perfecto para visualización de cámaras de seguridad en tiempo real.'
WHERE codigo = 'MON-LED-002';

-- ================================================================
-- GRABADORES DE VIDEO (DVR/NVR)
-- ================================================================

-- Unidad Grabadora de Video DVR/NVR
UPDATE "Product"
SET descripcion = 'DVR/NVR híbrido de 8 canales compatible con cámaras analógicas (AHD/TVI/CVI) y cámaras IP. Resolución de grabación hasta 4MP por canal. Compresión H.265+ para máximo ahorro de espacio. Bahía para 1 disco duro (hasta 8TB, NO INCLUIDO). Visualización remota vía app móvil y navegador web. Salidas: HDMI 4K, VGA. 2 puertos USB, 1 puerto Ethernet. Funciones avanzadas: detección de movimiento, grabación por eventos, respaldo en USB. Compatible con discos WD Purple. NOTA: No incluye disco duro. Alimentación: 12V DC (fuente incluida). Consumo: 15W. Dimensiones compactas para instalación en rack o escritorio.'
WHERE nombre LIKE '%Unidad Grabadora de Video%';

-- ================================================================
-- EJEMPLO DE ACTUALIZACIÓN MASIVA POR CATEGORÍA
-- ================================================================

-- Para productos sin descripción en categoría "Cámaras"
UPDATE "Product"
SET descripcion = '⚠️ DESCRIPCIÓN TÉCNICA PENDIENTE - Solicite especificaciones técnicas al proveedor. Producto disponible en stock pero requiere información detallada para recomendaciones precisas.'
WHERE descripcion IS NULL 
  AND categoria_legacy LIKE '%Cámara%'
  AND codigo NOT IN ('FUN-001', 'POC-001'); -- Excluir los ya actualizados

-- Para productos sin descripción en categoría "Cables"
UPDATE "Product"
SET descripcion = '⚠️ DESCRIPCIÓN TÉCNICA PENDIENTE - Cable de datos/poder. Consulte especificaciones (categoría, longitud, certificaciones) antes de recomendar.'
WHERE descripcion IS NULL 
  AND (categoria_legacy LIKE '%Cable%' OR nombre LIKE '%Cable%')
  AND codigo NOT IN ('CBL-UTP-002', 'CONN-RJ45');

-- ================================================================
-- VERIFICACIÓN
-- ================================================================

-- Contar productos CON descripción
SELECT COUNT(*) as "Productos con descripción"
FROM "Product"
WHERE descripcion IS NOT NULL;

-- Contar productos SIN descripción
SELECT COUNT(*) as "Productos sin descripción"
FROM "Product"
WHERE descripcion IS NULL;

-- Ver productos sin descripción por categoría
SELECT 
  COALESCE(categoria_legacy, 'Sin categoría') as categoria,
  COUNT(*) as cantidad_sin_descripcion
FROM "Product"
WHERE descripcion IS NULL
GROUP BY categoria_legacy
ORDER BY cantidad_sin_descripcion DESC;

-- Listar productos prioritarios sin descripción (más vendidos o con stock alto)
SELECT 
  codigo,
  nombre,
  COALESCE(categoria_legacy, 'Sin categoría') as categoria,
  stock,
  "precioVenta"
FROM "Product"
WHERE descripcion IS NULL
  AND estado = true
  AND stock > 0
ORDER BY stock DESC, "precioVenta" DESC
LIMIT 20;

-- ================================================================
-- NOTAS PARA EL EQUIPO
-- ================================================================

/*
SIGUIENTE PASO:
1. Ejecutar este script en la base de datos de producción
2. Identificar los 20-30 productos más importantes sin descripción
3. Solicitar fichas técnicas a proveedores
4. Redactar descripciones siguiendo el formato de los ejemplos
5. Actualizar productos en lotes

FORMATO DE DESCRIPCIÓN IDEAL:
- Primera oración: Qué es y para qué sirve
- Características técnicas principales
- Especificaciones detalladas (voltaje, temperatura, velocidad, etc)
- Aplicaciones típicas
- Advertencias o limitaciones importantes
- Compatibilidades
- Incluye/No incluye

PALABRAS CLAVE PARA IA:
- Para exteriores: "IP67", "IP68", "resistente a lluvia", "UV", "temperatura -XX a +XX"
- Para costa: "resistente a salitre", "anti-corrosión", "humedad"
- Para interiores: "uso exclusivo interior", "no resistente al agua"
- Para clima: "rango de temperatura", "operación continua 24/7"
- Limitaciones: "NOTA:", "ADVERTENCIA:", "NO usar en..."
*/

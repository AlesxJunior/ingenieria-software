# 📦 PLAN DE ENRIQUECIMIENTO DE PRODUCTOS

**Fecha:** 11 de Diciembre, 2025  
**Objetivo:** Enriquecer 20-30 productos clave con descripciones técnicas detalladas para mejorar recomendaciones de IA  
**Estado:** Planificado

---

## 🎯 OBJETIVO

Mejorar la calidad de las recomendaciones del Asistente de IA agregando información técnica detallada a los productos clave del inventario. Esto evitará que el modelo Gemini "invente" características y permitirá recomendaciones basadas en datos reales.

---

## 📊 CRITERIOS DE SELECCIÓN DE PRODUCTOS

### Prioridad Alta (Top 20-30 productos)
1. **Productos más vendidos** (últimos 3 meses)
2. **Productos más consultados** en Asistente IA
3. **Productos con mayor margen de ganancia**
4. **Productos complementarios clave** (cámaras + DVR, routers + switches, etc.)
5. **Productos con casos de uso específicos** (exterior/interior, profesional/hogar)

---

## 🏗️ ESTRUCTURA DE INFORMACIÓN REQUERIDA

### 1. Campos Actuales en Base de Datos
```typescript
interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;  // ← Usualmente vacío o genérico
  categoria: string;
  precioVenta: number;
  currentStock: number;
  isActive: boolean;
}
```

### 2. Campos Nuevos a Agregar (FASE 2)
```typescript
interface ProductEnriched {
  // ... campos existentes
  descripcionTecnica: string;      // Descripción detallada con especificaciones
  especificaciones: {              // Datos estructurados en JSONB
    [key: string]: string | number | boolean;
  };
  usoRecomendado: 'interior' | 'exterior' | 'ambos' | 'profesional' | 'hogar';
  subcategoria: string;            // ej: "Bullet", "Domo", "PTZ"
  caracteristicasClave: string[];  // ["Visión nocturna", "IP67", "4MP"]
  compatibilidadClima: {           // Para recomendaciones climáticas
    costa: boolean;
    sierra: boolean;
    selva: boolean;
  };
}
```

---

## 📝 PLANTILLA DE INFORMACIÓN POR PRODUCTO

### Ejemplo: Cámara de Seguridad Exterior

**INFORMACIÓN BÁSICA:**
- Código: CAM-IP-BUL-4MP-001
- Nombre Corto: Cámara IP Bullet 4MP Visión Nocturna 30m
- Categoría: Cámaras de Seguridad
- Subcategoría: Bullet (Tipo cilíndrico)

**DESCRIPCIÓN TÉCNICA (Detallada):**
```
Cámara de seguridad IP tipo Bullet con resolución 4MP (2560x1440) ideal para vigilancia exterior. 
Cuenta con visión nocturna infrarroja hasta 30 metros, perfecta para cocheras, entradas y perímetros 
sin iluminación. Certificación IP67 garantiza resistencia total al agua y polvo, apta para clima 
costero (resistente a humedad y salinidad) y zonas lluviosas de selva. Rango de temperatura de 
operación: -30°C a 60°C. Compatible con protocolos ONVIF y H.265+ para grabación eficiente. 
Incluye soporte de montaje ajustable. Requiere alimentación PoE (Power over Ethernet) o fuente 12V DC.
```

**ESPECIFICACIONES TÉCNICAS (JSONB):**
```json
{
  "resolucion": "4MP (2560x1440)",
  "sensor": "1/3\" CMOS",
  "lente": "3.6mm fijo",
  "visionNocturna": "30m IR",
  "proteccionIP": "IP67",
  "alimentacion": "PoE / 12V DC",
  "temperatura": "-30°C a 60°C",
  "protocolos": ["ONVIF", "RTSP", "HTTP"],
  "compresion": "H.265+ / H.264",
  "fps": "30fps @ 4MP",
  "audio": false,
  "rangoIR": "30m",
  "montaje": "Pared/Techo"
}
```

**CASOS DE USO:**
- ✅ Cocheras exteriores
- ✅ Entradas de viviendas
- ✅ Perímetros de comercios
- ✅ Almacenes sin techo
- ❌ NO para interiores (sobredimensionada)

**USO RECOMENDADO:** exterior

**CARACTERÍSTICAS CLAVE:**
- Visión nocturna 30m
- Resistente al agua (IP67)
- Resolución 4MP
- Apta para costa y selva

**COMPATIBILIDAD CLIMÁTICA:**
```json
{
  "costa": true,      // Resistente a humedad salina
  "sierra": true,     // Soporta bajas temperaturas
  "selva": true       // Resistente a lluvia intensa
}
```

**PRODUCTOS COMPLEMENTARIOS:**
1. DVR-8CH-4MP (Grabador 8 canales)
2. CAB-UTP-CAT5-EXT-100M (Cable UTP exterior 100m)
3. FTE-12V-2A (Fuente de alimentación 12V 2A)
4. CONECTOR-BNC-PAR (Conectores BNC par)
5. SOPORTE-PARED-AJUSTABLE (Soporte adicional)

---

## 🔧 CATEGORÍAS PRIORITARIAS

### 1️⃣ CÁMARAS DE SEGURIDAD (8-10 productos)

#### Tipos a Cubrir:
- **Bullet (Cilíndricas):** Exterior, visión nocturna larga
- **Domo (Domo/Vandal-proof):** Interior/Exterior, discreta
- **PTZ (Pan-Tilt-Zoom):** Profesional, control remoto
- **WiFi (Inalámbricas):** Hogar, fácil instalación

#### Información Específica Requerida:
- Resolución (720p, 1080p, 2MP, 4MP, 5MP, 8MP)
- Tipo de visión nocturna (IR, Starlight, Color)
- Alcance IR (10m, 20m, 30m, 50m+)
- Protección IP (IP65, IP66, IP67, IP68)
- Uso interior/exterior
- Alimentación (PoE, 12V, Batería)
- Conectividad (Cableada, WiFi, 4G)

---

### 2️⃣ EQUIPOS DE RED (6-8 productos)

#### Tipos a Cubrir:
- **Routers Domésticos:** WiFi AC/AX, cobertura pequeña
- **Routers Empresariales:** Dual-band, VPN, QoS
- **Switches:** 5/8/16/24 puertos, PoE/No-PoE
- **Access Points:** Exteriores, montaje en techo
- **Repetidores:** Amplificación de señal

#### Información Específica Requerida:
- Estándar WiFi (WiFi 5 AC, WiFi 6 AX)
- Velocidad (N300, AC1200, AC1900, AX3000)
- Cobertura (área en m²)
- Cantidad de usuarios soportados
- Puertos Ethernet (cantidad y velocidad)
- PoE (sí/no, presupuesto en watts)
- Uso doméstico/empresarial

---

### 3️⃣ HERRAMIENTAS ELÉCTRICAS (6-8 productos)

#### Tipos a Cubrir:
- **Taladros:** Con cable, inalámbricos, percutores
- **Sierras:** Circulares, caladoras, ingletadoras
- **Amoladoras:** 4.5", 7", 9"
- **Lijadoras:** Orbital, de banda, rotativa

#### Información Específica Requerida:
- Potencia (watts o voltaje de batería)
- RPM (revoluciones por minuto)
- Capacidad (diámetro de broca, profundidad de corte)
- Uso profesional/doméstico
- Accesorios incluidos
- Garantía

---

### 4️⃣ SISTEMAS DE ENERGÍA (4-6 productos)

#### Tipos a Cubrir:
- **UPS:** VA, tiempo de respaldo
- **Estabilizadores:** Voltaje de entrada/salida
- **Paneles Solares:** Watts, voltaje
- **Baterías:** Capacidad, ciclos

---

## 📋 CHECKLIST POR PRODUCTO

Para cada producto a enriquecer, completar:

- [ ] **Código del producto** (verificar en sistema)
- [ ] **Nombre descriptivo completo** (incluir características clave)
- [ ] **Descripción técnica** (200-400 palabras)
- [ ] **Especificaciones en formato JSONB** (15-20 campos)
- [ ] **Uso recomendado** (interior/exterior/profesional/hogar)
- [ ] **Subcategoría específica**
- [ ] **Características clave** (3-5 bullet points)
- [ ] **Compatibilidad climática** (costa/sierra/selva)
- [ ] **Productos complementarios** (3-5 IDs de productos relacionados)
- [ ] **Casos de uso típicos** (3-5 escenarios reales)
- [ ] **Preguntas frecuentes** (opcionales, para futuro chatbot)

---

## 🔄 PROCESO DE IMPLEMENTACIÓN

### PASO 1: Recolección de Información (2-3 días)
1. **Identificar productos clave:**
   - Exportar lista de productos más vendidos
   - Revisar consultas del Asistente IA
   - Consultar con equipo de ventas

2. **Buscar información técnica:**
   - Fichas técnicas de proveedores
   - Manuales de usuario
   - Páginas web de fabricantes
   - Competencia (MercadoLibre, Amazon)

3. **Documentar en plantilla:**
   - Usar formato markdown
   - Una ficha por producto
   - Validar con equipo técnico

### PASO 2: Migración de Base de Datos (1 día)
```sql
-- Agregar campos nuevos
ALTER TABLE "Product" ADD COLUMN "descripcionTecnica" TEXT;
ALTER TABLE "Product" ADD COLUMN "especificaciones" JSONB;
ALTER TABLE "Product" ADD COLUMN "usoRecomendado" TEXT;
ALTER TABLE "Product" ADD COLUMN "subcategoria" TEXT;
ALTER TABLE "Product" ADD COLUMN "caracteristicasClave" TEXT[];
ALTER TABLE "Product" ADD COLUMN "compatibilidadClima" JSONB;

-- Crear tabla de relaciones
CREATE TABLE "ProductoComplementario" (
  "productoId" TEXT NOT NULL,
  "complementarioId" TEXT NOT NULL,
  "razon" TEXT,
  "prioridad" INTEGER DEFAULT 1,
  PRIMARY KEY ("productoId", "complementarioId"),
  FOREIGN KEY ("productoId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("complementarioId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Índices para búsqueda rápida
CREATE INDEX "idx_product_subcategoria" ON "Product"("subcategoria");
CREATE INDEX "idx_product_uso" ON "Product"("usoRecomendado");
CREATE INDEX "idx_product_especificaciones" ON "Product" USING GIN ("especificaciones");
```

### PASO 3: Actualización de Datos (2-3 días)
1. **Insertar información en BD:**
   - Usar script de actualización masiva
   - Verificar que los IDs coincidan
   - Validar formato JSONB

2. **Crear relaciones de productos complementarios:**
   - Armar "kits" lógicos
   - Definir prioridades

### PASO 4: Actualizar Backend (1 día)
```typescript
// En ai-recommendations.service.ts
// Incluir nuevos campos en el contexto de búsqueda
const productosConDetalles = productos.map(p => ({
  id: p.id,
  codigo: p.codigo,
  nombre: p.nombre,
  descripcionTecnica: p.descripcionTecnica || p.descripcion,
  categoria: p.categoria,
  subcategoria: p.subcategoria,
  usoRecomendado: p.usoRecomendado,
  especificaciones: p.especificaciones,
  caracteristicasClave: p.caracteristicasClave,
  compatibilidadClima: p.compatibilidadClima,
  precioVenta: p.precioVenta,
  stock: p.currentStock
}));

// Actualizar prompt de Gemini para usar estos datos
const prompt = `
# Contexto de Productos Disponibles
${JSON.stringify(productosConDetalles, null, 2)}

# Instrucciones
IMPORTANTE: Basa tus recomendaciones ÚNICAMENTE en las características REALES 
especificadas en el campo "especificaciones" y "descripcionTecnica".
NO inventes características que no están documentadas.
Si un producto no tiene una característica específica (ej: IP67), NO lo recomiendes 
para casos que la requieran (ej: uso exterior en clima lluvioso).

Considera:
- compatibilidadClima para la región del cliente
- usoRecomendado para el caso de uso solicitado
- caracteristicasClave para matching con necesidad

Responde en formato JSON...
`;
```

### PASO 5: Testing y Validación (1 día)
1. **Probar consultas del Asistente IA:**
   - "Cámara para cochera" → Debe recomendar productos con IP67
   - "Router para oficina pequeña" → Debe considerar cobertura y usuarios
   - "Herramientas para carpintería" → Debe filtrar por rubro

2. **Validar que NO invente características:**
   - Si un producto NO tiene visión nocturna → NO debe decir que la tiene
   - Si un producto es interior → NO debe recomendarlo para exterior

3. **Verificar productos complementarios:**
   - Al recomendar cámara → Debe sugerir DVR, cables, fuente

---

## 📈 MÉTRICAS DE ÉXITO

### Antes del Enriquecimiento
- ❌ Tasa de conversión Asistente IA → Venta: ~5%
- ❌ Productos recomendados relevantes: ~20%
- ❌ Cliente confía en recomendaciones: Bajo
- ❌ Tickets de soporte por recomendaciones incorrectas: Alto

### Después del Enriquecimiento (Esperado)
- ✅ Tasa de conversión Asistente IA → Venta: ~40-50%
- ✅ Productos recomendados relevantes: ~80%
- ✅ Cliente confía en recomendaciones: Alto
- ✅ Tickets de soporte: Reducción del 70%
- ✅ Ticket promedio: Aumento del 30% (venta cruzada)

---

## 🎯 LISTA DE 20-30 PRODUCTOS SUGERIDOS

### 🎥 CÁMARAS (10 productos)
1. [ ] Cámara IP Bullet 4MP Exterior Visión Nocturna 30m IP67
2. [ ] Cámara IP Domo 2MP Interior/Exterior IR 20m IP66
3. [ ] Cámara IP PTZ 5MP Zoom 4X Visión Nocturna 50m Exterior
4. [ ] Cámara WiFi 2MP Interior Visión Nocturna 10m Alexa/Google
5. [ ] Cámara IP Bullet 8MP (4K) Visión Nocturna 40m IP68
6. [ ] Cámara Domo Vandal-proof 4MP Visión Nocturna 30m IK10
7. [ ] Cámara WiFi Exterior 4MP Batería Solar Panel Incluido
8. [ ] Cámara IP Fisheye 360° 5MP Interior PoE
9. [ ] Cámara Térmica 2MP Detección Temperatura Exterior
10. [ ] DVR 8 Canales 4MP H.265+ 2TB HDD Incluido

### 🌐 EQUIPOS DE RED (8 productos)
11. [ ] Router WiFi 6 AX3000 Dual-band Cobertura 200m²
12. [ ] Router Empresarial AC1900 VPN QoS Cobertura 300m²
13. [ ] Switch 8 Puertos Gigabit PoE 120W Montaje Rack
14. [ ] Access Point Exterior WiFi 6 Largo Alcance 500m
15. [ ] Repetidor WiFi AC1200 Dual-band 2 Antenas
16. [ ] Switch 24 Puertos Gigabit Administrable Capa 2
17. [ ] Modem Router 4G LTE WiFi 5 AC1200 SIM
18. [ ] Firewall Empresarial 4 Puertos Gigabit VPN IPSec

### 🔨 HERRAMIENTAS (8 productos)
19. [ ] Taladro Percutor Inalámbrico 20V 2 Baterías Maletín
20. [ ] Sierra Circular 1400W 7.25" Guía Láser Profesional
21. [ ] Amoladora 4.5" 850W 11000 RPM Mango Auxiliar
22. [ ] Lijadora Orbital 300W 125mm Colector de Polvo
23. [ ] Taladro de Banco 500W 13mm 16 Velocidades
24. [ ] Ingletadora 1800W 10" Doble Bisel Láser
25. [ ] Rotomartillo SDS-Plus 800W 3 Modos Maletín
26. [ ] Pistola de Calor 2000W Temperatura Variable Boquillas

### ⚡ ENERGÍA (4 productos)
27. [ ] UPS 1500VA Regulador Respaldo 30min 8 Tomas
28. [ ] Estabilizador 2000VA Voltaje 150-250V 6 Tomas
29. [ ] Panel Solar 150W 12V Monocristalino Controlador
30. [ ] Batería Litio 12V 100Ah Ciclos Profundos 2000 Ciclos

---

## 💡 TIPS PARA REDACTAR DESCRIPCIONES

### ✅ HACER:
- Usar lenguaje técnico pero accesible
- Incluir datos numéricos precisos (30m, 4MP, 1400W)
- Mencionar certificaciones (IP67, IK10, CE)
- Especificar casos de uso reales ("ideal para cocheras")
- Incluir limitaciones ("NO apta para temperatura >60°C")
- Resaltar ventajas climáticas ("resistente a humedad salina")

### ❌ NO HACER:
- Usar términos vagos ("buena calidad", "excelente")
- Copiar descripciones de marketing genéricas
- Inventar características no verificables
- Omitir especificaciones importantes
- Ignorar compatibilidad regional

---

## 🚀 PRÓXIMOS PASOS

1. **Validar con Equipo Comercial:**
   - ¿Qué productos venden más?
   - ¿Qué preguntan los clientes?
   - ¿Qué productos tienen más devoluciones por expectativas no cumplidas?

2. **Asignar Responsables:**
   - Recopilación de información técnica: [ASIGNAR]
   - Redacción de descripciones: [ASIGNAR]
   - Validación técnica: [ASIGNAR]
   - Carga en sistema: [ASIGNAR]

3. **Definir Timeline:**
   - Semana 1: Recopilación info + redacción (10 productos)
   - Semana 2: Recopilación info + redacción (10 productos restantes)
   - Semana 3: Migración BD + carga datos + testing
   - Semana 4: Monitoreo + ajustes

---

## 📚 RECURSOS

### Fuentes de Información Técnica:
- Fichas técnicas de proveedores
- Hikvision, Dahua, TP-Link, Ubiquiti (sitios oficiales)
- Normas: IEC 60529 (IP rating), IEC 62262 (IK rating)
- Foros técnicos especializados

### Herramientas:
- [Plantilla Google Sheets para recopilar datos](pendiente)
- [Script Python para migración masiva](pendiente)
- [Validador de formato JSONB](pendiente)

---

**Documento creado por:** GitHub Copilot AI  
**Para:** Alexa Tech - Mejora Asistente IA  
**Última actualización:** 11 de Diciembre, 2025

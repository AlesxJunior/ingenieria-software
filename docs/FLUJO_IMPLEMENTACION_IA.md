# 🤖 FLUJO DE IMPLEMENTACIÓN: SISTEMA IA DE RECOMENDACIONES INTELIGENTES

## 📋 Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE VENTAS ACTUAL                     │
│  (Clientes, Productos, Ventas, Inventario, Comprobantes)       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MÓDULO IA (NUEVO)                           │
│  • Recolección de Datos                                         │
│  • Análisis de Patrones                                         │
│  • Motor de Recomendaciones                                     │
│  • Sistema de Alertas de Seguridad                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FUENTES DE DATOS EXTERNAS                    │
│  • API Clima (SENAMHI)                                          │
│  • Datos Geográficos (Ubigeo)                                   │
│  • Índices de Criminalidad                                      │
│  • Tendencias de Mercado                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO: DESDE LA VENTA HASTA LA RECOMENDACIÓN

### **ESCENARIO 1: Nueva Venta con Recomendaciones IA**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 1: Vendedor selecciona cliente en formulario de venta             │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Cliente: Juan Pérez │
                │  DNI: 12345678       │
                │  Ubicación:          │
                │  - Lima              │
                │  - Lima              │
                │  - San Juan Lurig.   │
                └──────────┬───────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 2: Frontend llama automáticamente a API de IA                     │
│                                                                          │
│  GET /api/ia/recomendaciones/:clienteId                                 │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 3: Backend IA inicia proceso de análisis                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ├─────────────────────────────────────────────┐
                           │                                             │
                           ▼                                             ▼
              ┌─────────────────────────┐              ┌──────────────────────────┐
              │  3A: ANÁLISIS CLIMA     │              │  3B: ANÁLISIS UBICACIÓN  │
              │                         │              │                          │
              │  Query a SENAMHI:       │              │  Query a BD Criminalidad:│
              │  Lima → Hoy             │              │  San Juan Lurig. → 8/10  │
              │                         │              │  (zona de alto riesgo)   │
              │  Resultado:             │              │                          │
              │  - Temp: 22°C           │              │  Recomendación:          │
              │  - Lluvia: 85%          │              │  → Productos seguridad   │
              │  - Humedad: 78%         │              │                          │
              │                         │              │                          │
              │  Recomendación:         │              └──────────┬───────────────┘
              │  → Paraguas             │                         │
              │  → Impermeables         │                         │
              └────────────┬────────────┘                         │
                           │                                      │
                           └──────────────┬───────────────────────┘
                                          │
                                          ▼
              ┌─────────────────────────────────────────────────┐
              │  3C: ANÁLISIS HISTORIAL DE COMPRAS              │
              │                                                 │
              │  Query: Últimas 10 ventas de Juan Pérez        │
              │                                                 │
              │  Resultados:                                    │
              │  - Producto más comprado: Laptops (3 veces)     │
              │  - Categoría preferida: Electrónica             │
              │  - Frecuencia: Compra cada 45 días              │
              │  - Última compra: Hace 42 días                  │
              │  - Monto promedio: S/ 1,200                     │
              │                                                 │
              │  Predicción ML:                                 │
              │  → Próxima compra estimada: 3 días              │
              │  → Productos sugeridos: Accesorios laptop       │
              │                                                 │
              └────────────────────────┬────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 4: Motor IA combina todos los análisis                            │
│                                                                          │
│  Algoritmo de Scoring:                                                  │
│                                                                          │
│  1. CLIMA (peso: 25%)                                                   │
│     Lluvia 85% → Paraguas: +85 pts                                      │
│                                                                          │
│  2. UBICACIÓN/SEGURIDAD (peso: 35%)                                     │
│     Zona riesgo 8/10 → Cámara seguridad: +90 pts                        │
│                         Alarma: +85 pts                                 │
│                                                                          │
│  3. HISTORIAL (peso: 30%)                                               │
│     Compra laptops → Mouse inalámbrico: +75 pts                         │
│                      Mochila laptop: +70 pts                            │
│                                                                          │
│  4. TEMPORADA (peso: 10%)                                               │
│     Verano (Nov-Mar) → Ventiladores: +60 pts                            │
│                                                                          │
│  RANKING FINAL:                                                         │
│  1. Cámara seguridad IP    → 90 pts ⭐⭐⭐⭐⭐                             │
│  2. Sistema alarma         → 85 pts ⭐⭐⭐⭐⭐                             │
│  3. Paraguas               → 85 pts ⭐⭐⭐⭐⭐                             │
│  4. Mouse inalámbrico      → 75 pts ⭐⭐⭐⭐                              │
│  5. Mochila laptop         → 70 pts ⭐⭐⭐⭐                              │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 5: Backend responde con recomendaciones JSON                      │
│                                                                          │
│  {                                                                       │
│    "recomendaciones": [                                                 │
│      {                                                                   │
│        "productoId": "cam_001",                                         │
│        "nombre": "Cámara Seguridad IP Hikvision",                       │
│        "categoria": "seguridad",                                        │
│        "puntuacion": 90,                                                │
│        "razon": "Zona de alto riesgo (8/10). Protege tu hogar 24/7",   │
│        "precio": 450.00,                                                │
│        "stock": 15,                                                     │
│        "imagen": "https://..."                                          │
│      },                                                                  │
│      {                                                                   │
│        "productoId": "par_001",                                         │
│        "nombre": "Paraguas automático",                                 │
│        "categoria": "clima",                                            │
│        "puntuacion": 85,                                                │
│        "razon": "85% probabilidad lluvia hoy en Lima",                  │
│        "precio": 25.00,                                                 │
│        "stock": 50                                                      │
│      }                                                                   │
│    ],                                                                    │
│    "alertas": [                                                          │
│      {                                                                   │
│        "tipo": "zona_riesgo",                                           │
│        "nivel": "alto",                                                 │
│        "mensaje": "Cliente en zona de alto índice delictivo"            │
│      }                                                                   │
│    ],                                                                    │
│    "prediccion": {                                                       │
│      "proximaCompra": "2025-11-30",                                     │
│      "confianza": 78                                                    │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 6: Frontend muestra recomendaciones en interfaz                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Nueva Venta - Cliente: Juan Pérez                             │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  🤖 RECOMENDACIONES INTELIGENTES                               │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│    │
│  │                                                                 │    │
│  │  🛡️ PRODUCTOS DE SEGURIDAD (Alto Riesgo en San Juan L.)       │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐  │    │
│  │  │ 📹 Cámara Seguridad IP Hikvision         ⭐ 90% Match   │  │    │
│  │  │ S/ 450.00                                                │  │    │
│  │  │ 💡 Zona de alto riesgo (8/10). Protege tu hogar 24/7    │  │    │
│  │  │ [+ Agregar a Venta]  [Ver Detalles]                     │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐  │    │
│  │  │ 🚨 Sistema de Alarma con Sensores       ⭐ 85% Match   │  │    │
│  │  │ S/ 320.00                                                │  │    │
│  │  │ 💡 Protección perimetral para tu familia                │  │    │
│  │  │ [+ Agregar a Venta]  [Ver Detalles]                     │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  🌧️ CLIMA HOY EN LIMA                                          │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐  │    │
│  │  │ ☂️ Paraguas Automático                   ⭐ 85% Match   │  │    │
│  │  │ S/ 25.00                                                 │  │    │
│  │  │ 💡 85% probabilidad de lluvia hoy en Lima               │  │    │
│  │  │ [+ Agregar a Venta]  [Ver Detalles]                     │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  💼 BASADO EN TU HISTORIAL                                     │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐  │    │
│  │  │ 🖱️ Mouse Inalámbrico Logitech           ⭐ 75% Match   │  │    │
│  │  │ S/ 85.00                                                 │  │    │
│  │  │ 💡 Perfecto para tu laptop HP                           │  │    │
│  │  │ [+ Agregar a Venta]  [Ver Detalles]                     │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                                                                 │    │
│  │  ⏰ PREDICCIÓN: Próxima compra estimada en 3 días (78% conf.) │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 7: Vendedor agrega productos (normales + recomendados)            │
│                                                                          │
│  Productos en carrito:                                                  │
│  1. Laptop HP Pavilion (selección manual)       S/ 2,500.00             │
│  2. Cámara Seguridad IP (IA - click rápido)     S/   450.00             │
│  3. Paraguas (IA - click rápido)                S/    25.00             │
│                                                                          │
│  TOTAL: S/ 2,975.00                                                     │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 8: Venta completada - Se registra en Analytics IA                 │
│                                                                          │
│  INSERT INTO ia_analytics:                                              │
│  {                                                                       │
│    clienteId: "juan_perez_123",                                         │
│    fecha: "2025-11-27T14:30:00Z",                                       │
│    temperatura: 22,                                                     │
│    precipitacion: 85,                                                   │
│    humedad: 78,                                                         │
│    departamento: "Lima",                                                │
│    provincia: "Lima",                                                   │
│    distrito: "San Juan Lurigancho",                                     │
│    indiceCriminalidad: 8,                                               │
│    zonasRiesgo: ["robos", "asaltos"],                                   │
│    horaCompra: 14,                                                      │
│    diaCompra: 3, // Miércoles                                           │
│    productosRecomendados: ["cam_001", "par_001", "mouse_001"],          │
│    productosComprados: ["laptop_hp", "cam_001", "par_001"],             │
│    tasaAceptacion: 66.67, // 2 de 3 recomendaciones aceptadas          │
│    valorVentaTotal: 2975.00,                                            │
│    valorRecomendacionesIA: 475.00 // Ventas extra por IA               │
│  }                                                                       │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PASO 9: IA aprende y mejora                                            │
│                                                                          │
│  Machine Learning Update:                                               │
│  • Cliente en zona riesgo + compró cámara = Patrón positivo ✅           │
│  • Lluvia alta + compró paraguas = Patrón positivo ✅                    │
│  • No compró mouse = Ajustar peso de "historial" ↓                      │
│                                                                          │
│  Modelo actualizado para futuras recomendaciones                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 ESCENARIO 2: Alerta de Seguridad Automática

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TRIGGER: Cliente habitual realiza compra inusual                       │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Cliente: María López                                                    │
│  Historial: Compras de S/ 50-100 en promedio                            │
│  Nueva venta: S/ 3,500 (35x el promedio!)                               │
│  Hora: 2:30 AM (horario inusual)                                        │
│  Ubicación: Diferente a su dirección habitual                           │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  IA DETECTA ANOMALÍA                                                     │
│                                                                          │
│  POST /api/ia/detectar-anomalias                                        │
│                                                                          │
│  Análisis automático:                                                   │
│  🚨 Monto: 35x superior al promedio                                     │
│  🚨 Horario: 2:30 AM (cliente nunca compra de noche)                    │
│  🚨 Ubicación: Dirección nueva sin confirmar                            │
│                                                                          │
│  NIVEL DE RIESGO: ALTO ⚠️                                                │
│  PUNTUACIÓN DE CONFIANZA: 23/100 (Muy bajo)                             │
│                                                                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SISTEMA MUESTRA ALERTA EN INTERFAZ                                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ⚠️ ALERTA DE SEGURIDAD - REVISIÓN REQUERIDA                   │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  Se detectaron las siguientes anomalías:                       │    │
│  │                                                                 │    │
│  │  🔴 Monto inusual: S/ 3,500 (promedio: S/ 75)                  │    │
│  │  🔴 Horario nocturno: 2:30 AM                                  │    │
│  │  🔴 Ubicación no verificada                                    │    │
│  │                                                                 │    │
│  │  Nivel de Riesgo: ALTO                                         │    │
│  │  Confianza: 23% ⚠️                                              │    │
│  │                                                                 │    │
│  │  ACCIONES RECOMENDADAS:                                        │    │
│  │  ✓ Verificar identidad del cliente                            │    │
│  │  ✓ Confirmar método de pago                                   │    │
│  │  ✓ Validar dirección de entrega                               │    │
│  │  ✓ Solicitar autorización de supervisor                       │    │
│  │                                                                 │    │
│  │  [Continuar con Precaución]  [Cancelar Venta]                 │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 ESCENARIO 3: Dashboard Analítico IA

```
┌──────────────────────────────────────────────────────────────────────────┐
│  GERENTE ACCEDE A: /dashboard/ia-analytics                              │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD: ANÁLISIS INTELIGENTE DE VENTAS                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  📈 RENDIMIENTO IA - ÚLTIMOS 30 DÍAS                         │      │
│  ├──────────────────────────────────────────────────────────────┤      │
│  │                                                               │      │
│  │  Total Recomendaciones Generadas:      1,450                 │      │
│  │  Recomendaciones Aceptadas:              725 (50%)           │      │
│  │  Valor Total Generado por IA:        S/ 45,380               │      │
│  │  ROI de Implementación IA:              +340%                │      │
│  │                                                               │      │
│  │  ┌──────────────────────────────────────────────────┐        │      │
│  │  │  Tasa de Aceptación por Categoría:              │        │      │
│  │  │                                                  │        │      │
│  │  │  🛡️ Seguridad:         ████████████ 75%         │        │      │
│  │  │  🌧️ Clima:             ██████████ 62%           │        │      │
│  │  │  📦 Historial:         ████████ 48%             │        │      │
│  │  │  📅 Temporada:         █████ 35%                │        │      │
│  │  │                                                  │        │      │
│  │  └──────────────────────────────────────────────────┘        │      │
│  │                                                               │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  🗺️ ANÁLISIS POR ZONAS                                       │      │
│  ├──────────────────────────────────────────────────────────────┤      │
│  │                                                               │      │
│  │  Distrito          | Índice Riesgo | Productos Top          │      │
│  │  ─────────────────|───────────────|────────────────────────  │      │
│  │  San Juan L.      | 8/10 🔴       | Cámaras, Alarmas       │      │
│  │  Villa El Salv.   | 7/10 🟠       | Cámaras, Cerraduras    │      │
│  │  Miraflores       | 2/10 🟢       | Electrónica, Deco      │      │
│  │  San Isidro       | 1/10 🟢       | Smart Home, Luxe       │      │
│  │                                                               │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  🌦️ IMPACTO CLIMA EN VENTAS                                  │      │
│  ├──────────────────────────────────────────────────────────────┤      │
│  │                                                               │      │
│  │  Días lluviosos:          12 días                            │      │
│  │  Ventas paraguas:         +340% vs días secos                │      │
│  │  Ventas impermeables:     +180%                              │      │
│  │                                                               │      │
│  │  Predicción próxima semana:                                  │      │
│  │  🌧️ Lluvia alta (80%) → Stock sugerido: +50 paraguas        │      │
│  │                                                               │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  🎯 PREDICCIONES ML                                          │      │
│  ├──────────────────────────────────────────────────────────────┤      │
│  │                                                               │      │
│  │  Clientes con alta probabilidad de compra (próximos 7 días): │      │
│  │                                                               │      │
│  │  1. Juan Pérez         - 89% - Productos: Accesorios laptop  │      │
│  │  2. María López        - 78% - Productos: Celulares          │      │
│  │  3. Carlos Rojas       - 65% - Productos: Cámaras            │      │
│  │                                                               │      │
│  │  [Enviar Ofertas Personalizadas]                             │      │
│  │                                                               │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITECTURA TÉCNICA DETALLADA

### **Capa 1: Recolección de Datos**

```
┌─────────────────────────────────────────────────────────────┐
│  FUENTES DE DATOS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DATOS INTERNOS (PostgreSQL)                            │
│     ├─ Ventas históricas                                   │
│     ├─ Clientes y ubicaciones                              │
│     ├─ Productos e inventario                              │
│     └─ Patrones de compra                                  │
│                                                             │
│  2. APIS EXTERNAS                                          │
│     ├─ SENAMHI (clima Perú)                                │
│     ├─ OpenWeather (backup)                                │
│     ├─ Google Maps (geolocalización)                       │
│     └─ Data Gov Perú (estadísticas)                        │
│                                                             │
│  3. WEB SCRAPING (ético)                                   │
│     ├─ Tendencias de productos                             │
│     └─ Precios competencia                                 │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  ETL PIPELINE          │
         │  (Extract Transform    │
         │   Load)                │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  ia_analytics          │
         │  (tabla PostgreSQL)    │
         └────────────────────────┘
```

### **Capa 2: Motor de IA**

```
┌─────────────────────────────────────────────────────────────┐
│  MOTOR DE INTELIGENCIA ARTIFICIAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MÓDULO 1: ANÁLISIS DE PATRONES                            │
│  ┌────────────────────────────────────────────────┐        │
│  │  • Frecuencia de compra por cliente            │        │
│  │  • Productos más comprados juntos              │        │
│  │  • Estacionalidad de productos                 │        │
│  │  • Tendencias temporales                       │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  MÓDULO 2: SCORING Y RANKING                               │
│  ┌────────────────────────────────────────────────┐        │
│  │  Input: Cliente, Contexto, Productos           │        │
│  │                                                 │        │
│  │  Pesos:                                         │        │
│  │  • Clima: 25%                                  │        │
│  │  • Seguridad/Ubicación: 35%                    │        │
│  │  • Historial: 30%                              │        │
│  │  • Temporada: 10%                              │        │
│  │                                                 │        │
│  │  Output: Top 5 productos con score 0-100       │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  MÓDULO 3: MACHINE LEARNING                                │
│  ┌────────────────────────────────────────────────┐        │
│  │  Algoritmos:                                    │        │
│  │  • K-Means Clustering (agrupar clientes)       │        │
│  │  • Linear Regression (predicción ventas)       │        │
│  │  • Decision Trees (categorización)             │        │
│  │  • Collaborative Filtering (recomendaciones)   │        │
│  │                                                 │        │
│  │  Librería: TensorFlow.js / Brain.js            │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  MÓDULO 4: DETECCIÓN DE ANOMALÍAS                          │
│  ┌────────────────────────────────────────────────┐        │
│  │  • Monto fuera de rango (Z-score > 3)          │        │
│  │  • Horario inusual (2AM-6AM)                   │        │
│  │  • Ubicación nueva sin verificar               │        │
│  │  • Cambio drástico en patrones                 │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Capa 3: API y Servicios**

```
Backend (Node.js + TypeScript)
│
├── src/modules/ia/
│   │
│   ├── recomendaciones.service.ts
│   │   ├── generarRecomendaciones(clienteId)
│   │   ├── analizarClimaZona(ubicacion)
│   │   └── calcularScoring(cliente, productos)
│   │
│   ├── predicciones.service.ts
│   │   ├── predecirProximaCompra(clienteId)
│   │   ├── predecirDemandaProducto(productoId)
│   │   └── predecirStockOptimo(productoId)
│   │
│   ├── seguridad.service.ts
│   │   ├── detectarAnomalias(venta)
│   │   ├── calcularRiesgoZona(ubicacion)
│   │   └── recomendarProductosSeguridad(cliente)
│   │
│   ├── analytics.service.ts
│   │   ├── generarReporteIA()
│   │   ├── calcularROI()
│   │   └── obtenerMetricas()
│   │
│   └── ia.controller.ts
│       └── Endpoints REST:
│           GET  /api/ia/recomendaciones/:clienteId
│           POST /api/ia/detectar-anomalias
│           GET  /api/ia/predicciones/:clienteId
│           GET  /api/ia/analytics/dashboard
│           POST /api/ia/feedback (mejora continua)
```

### **Capa 4: Frontend**

```
Frontend (React + TypeScript)
│
├── src/modules/ia/
│   │
│   ├── components/
│   │   ├── RecomendacionesIA.tsx
│   │   │   └── Widget en formulario de venta
│   │   │
│   │   ├── AlertaSeguridad.tsx
│   │   │   └── Modal de advertencia
│   │   │
│   │   ├── PrediccionCompra.tsx
│   │   │   └── Banner "Próxima compra en X días"
│   │   │
│   │   └── DashboardIA.tsx
│   │       └── Página de analytics
│   │
│   ├── hooks/
│   │   ├── useRecomendaciones.ts
│   │   ├── usePredicciones.ts
│   │   └── useAnalyticsIA.ts
│   │
│   └── services/
│       └── iaService.ts
│           └── Llamadas a API backend
```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### **FASE 1: FUNDAMENTOS (Semana 1-2)**

```
Día 1-3: Base de Datos
├── Crear tabla ia_analytics
├── Crear modelo Prisma
├── Script de migración
└── Seed con datos de ejemplo

Día 4-7: Backend Básico
├── Crear módulo /src/modules/ia/
├── Service: recomendaciones.service.ts (versión simple)
├── Controller: ia.controller.ts
├── Rutas: /api/ia/*
└── Tests unitarios

Día 8-10: Integración APIs
├── Configurar cliente SENAMHI
├── Manejar rate limiting
├── Cache de respuestas (Redis opcional)
└── Fallbacks si API falla

Día 11-14: Frontend Básico
├── Componente RecomendacionesIA.tsx
├── Hook useRecomendaciones.ts
├── Integrar en formulario de venta
└── Estilos básicos
```

**Entregable Fase 1:** Sistema de recomendaciones con reglas simples funcionando.

---

### **FASE 2: INTELIGENCIA (Semana 3-4)**

```
Día 15-18: Machine Learning Básico
├── Instalar TensorFlow.js o Brain.js
├── Implementar K-Means para clustering
├── Entrenar con datos históricos
└── Integrar en recomendaciones.service.ts

Día 19-22: Predicciones
├── Service: predicciones.service.ts
├── Algoritmo de predicción de compras
├── Calcular frecuencia promedio
└── Endpoint GET /api/ia/predicciones/:id

Día 23-25: Seguridad
├── Service: seguridad.service.ts
├── Detección de anomalías (Z-score)
├── Alertas en tiempo real
└── Componente AlertaSeguridad.tsx

Día 26-28: Analytics
├── Service: analytics.service.ts
├── Métricas de rendimiento IA
├── Dashboard básico
└── Gráficos con Chart.js
```

**Entregable Fase 2:** Sistema con ML, predicciones y alertas de seguridad.

---

### **FASE 3: OPTIMIZACIÓN (Semana 5-6)**

```
Día 29-32: Mejora de Algoritmos
├── Ajustar pesos de scoring
├── A/B testing de recomendaciones
├── Feedback loop (aprender de aceptación)
└── Mejorar precisión ML

Día 33-36: UX/UI Avanzado
├── Animaciones y transiciones
├── Tooltips explicativos
├── Modo "explicar por qué"
└── Responsive design

Día 37-40: Performance
├── Caching inteligente
├── Lazy loading de recomendaciones
├── Optimización de queries DB
└── CDN para imágenes

Día 41-42: Testing y QA
├── Tests E2E con Playwright
├── Tests de carga (Artillery)
├── Validación de datos
└── Fix de bugs
```

**Entregable Fase 3:** Sistema pulido, rápido y confiable.

---

## 💾 ESTRUCTURA DE DATOS

### **Tabla: ia_analytics**

```sql
CREATE TABLE ia_analytics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id                UUID NOT NULL REFERENCES entidades(id),
  fecha                     TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Clima
  temperatura               DECIMAL(5,2),
  precipitacion             DECIMAL(5,2), -- porcentaje
  humedad                   DECIMAL(5,2),
  estacion                  VARCHAR(20), -- 'verano', 'invierno', etc.
  
  -- Ubicación
  departamento              VARCHAR(100),
  provincia                 VARCHAR(100),
  distrito                  VARCHAR(100),
  latitud                   DECIMAL(10,8),
  longitud                  DECIMAL(11,8),
  
  -- Seguridad
  indice_criminalidad       DECIMAL(3,1), -- 0.0 a 10.0
  zonas_riesgo              TEXT[], -- array de strings
  
  -- Comportamiento
  hora_compra               INTEGER, -- 0-23
  dia_semana                INTEGER, -- 1-7
  frecuencia_compra_dias    DECIMAL(6,2),
  
  -- Recomendaciones
  productos_recomendados    JSONB, -- [{productoId, puntuacion, razon}]
  productos_comprados       JSONB,
  categoria_recomendacion   VARCHAR(50),
  puntuacion_relevancia     DECIMAL(5,2),
  
  -- Métricas
  tasa_aceptacion           DECIMAL(5,2), -- % recomendaciones aceptadas
  valor_venta_total         DECIMAL(10,2),
  valor_recomendaciones_ia  DECIMAL(10,2),
  
  -- Machine Learning
  cluster_cliente           INTEGER, -- grupo de cliente similar
  prediccion_proxima_compra DATE,
  confianza_prediccion      DECIMAL(5,2),
  
  -- Metadata
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ia_cliente ON ia_analytics(cliente_id);
CREATE INDEX idx_ia_fecha ON ia_analytics(fecha DESC);
CREATE INDEX idx_ia_distrito ON ia_analytics(distrito);
CREATE INDEX idx_ia_cluster ON ia_analytics(cluster_cliente);
```

---

## 🧪 EJEMPLO DE CÓDIGO COMPLETO

### **Backend: recomendaciones.service.ts**

```typescript
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface Recomendacion {
  productoId: string;
  nombre: string;
  categoria: 'clima' | 'ubicacion' | 'historial' | 'temporada' | 'seguridad';
  puntuacion: number;
  razon: string;
  precio: number;
  stock: number;
}

export class RecomendacionesIAService {
  
  // Obtener clima de zona
  async getClima(departamento: string) {
    try {
      // API SENAMHI (ejemplo simplificado)
      const response = await axios.get(
        `https://api.senamhi.gob.pe/v1/clima/${departamento}`
      );
      
      return {
        temperatura: response.data.temperatura,
        precipitacion: response.data.precipitacion,
        humedad: response.data.humedad,
        estacion: this.getEstacion()
      };
    } catch (error) {
      // Fallback a valores por defecto
      return {
        temperatura: 20,
        precipitacion: 0,
        humedad: 70,
        estacion: this.getEstacion()
      };
    }
  }

  // Determinar estación del año
  private getEstacion(): string {
    const mes = new Date().getMonth();
    if (mes >= 11 || mes <= 2) return 'verano';
    if (mes >= 3 && mes <= 5) return 'otono';
    if (mes >= 6 && mes <= 8) return 'invierno';
    return 'primavera';
  }

  // Obtener índice de criminalidad (simulado)
  async getIndiceCriminalidad(distrito: string): Promise<number> {
    // En producción: integrar con API del gobierno o base de datos
    const zonasAltoRiesgo = [
      'San Juan de Lurigancho', 'Villa El Salvador', 
      'Callao', 'Comas', 'San Martin de Porres'
    ];
    
    const zonasRiesgoMedio = [
      'Los Olivos', 'Ate', 'Santa Anita', 'El Agustino'
    ];
    
    if (zonasAltoRiesgo.some(z => distrito.includes(z))) return 8.5;
    if (zonasRiesgoMedio.some(z => distrito.includes(z))) return 5.0;
    return 2.0;
  }

  // Motor principal de recomendaciones
  async generar(clienteId: string): Promise<Recomendacion[]> {
    // 1. Obtener cliente
    const cliente = await prisma.entidad.findUnique({
      where: { id: clienteId },
      include: {
        sales: {
          include: { items: { include: { producto: true } } },
          orderBy: { fecha: 'desc' },
          take: 10
        }
      }
    });

    if (!cliente) throw new Error('Cliente no encontrado');

    // 2. Análisis de contexto
    const clima = await this.getClima(cliente.departamento || 'Lima');
    const indiceCriminalidad = await this.getIndiceCriminalidad(
      cliente.distrito || ''
    );

    // 3. Obtener todos los productos disponibles
    const productos = await prisma.producto.findMany({
      where: { activo: true, stock: { gt: 0 } }
    });

    // 4. Calcular puntuaciones
    const recomendaciones: Recomendacion[] = [];

    for (const producto of productos) {
      let puntuacion = 0;
      let razon = '';
      let categoria: Recomendacion['categoria'] = 'historial';

      // SCORING: Clima (peso 25%)
      if (clima.precipitacion > 70 && 
          ['paraguas', 'impermeable', 'botas'].some(k => 
            producto.nombre.toLowerCase().includes(k)
          )) {
        puntuacion += 25 * (clima.precipitacion / 100);
        razon = `${clima.precipitacion}% probabilidad de lluvia`;
        categoria = 'clima';
      }

      if (clima.temperatura > 28 && 
          ['ventilador', 'aire', 'cooler'].some(k => 
            producto.nombre.toLowerCase().includes(k)
          )) {
        puntuacion += 20;
        razon = `Temperatura alta: ${clima.temperatura}°C`;
        categoria = 'clima';
      }

      // SCORING: Seguridad (peso 35%)
      if (indiceCriminalidad > 7 && 
          ['camara', 'alarma', 'cerradura', 'seguridad'].some(k => 
            producto.nombre.toLowerCase().includes(k)
          )) {
        puntuacion += 35 * (indiceCriminalidad / 10);
        razon = `Zona de alto riesgo (${indiceCriminalidad}/10)`;
        categoria = 'seguridad';
      }

      // SCORING: Historial (peso 30%)
      const comprasPrevias = cliente.sales?.flatMap(s => 
        s.items.map(i => i.producto)
      ) || [];
      
      const categoriaComprada = comprasPrevias.some(p => 
        p.categoriaId === producto.categoriaId
      );
      
      if (categoriaComprada) {
        puntuacion += 30;
        razon = razon || 'Basado en tus compras anteriores';
        categoria = 'historial';
      }

      // SCORING: Temporada (peso 10%)
      if (clima.estacion === 'verano' && 
          ['ventilador', 'aire', 'piscina'].some(k => 
            producto.nombre.toLowerCase().includes(k)
          )) {
        puntuacion += 10;
        razon = razon || 'Temporada de verano';
        categoria = 'temporada';
      }

      // Agregar si puntuación > umbral
      if (puntuacion > 40) {
        recomendaciones.push({
          productoId: producto.id,
          nombre: producto.nombre,
          categoria,
          puntuacion: Math.min(puntuacion, 100),
          razon,
          precio: parseFloat(producto.precio.toString()),
          stock: producto.stock
        });
      }
    }

    // 5. Ordenar por puntuación y retornar top 5
    return recomendaciones
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 5);
  }

  // Registrar analytics
  async registrarAnalytics(
    clienteId: string,
    recomendaciones: Recomendacion[],
    productosComprados: string[]
  ) {
    const cliente = await prisma.entidad.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) return;

    const clima = await this.getClima(cliente.departamento || 'Lima');
    const indiceCriminalidad = await this.getIndiceCriminalidad(
      cliente.distrito || ''
    );

    // Calcular tasa de aceptación
    const recomendadosIds = recomendaciones.map(r => r.productoId);
    const aceptados = productosComprados.filter(id => 
      recomendadosIds.includes(id)
    );
    const tasaAceptacion = (aceptados.length / recomendaciones.length) * 100;

    await prisma.$executeRaw`
      INSERT INTO ia_analytics (
        cliente_id, fecha,
        temperatura, precipitacion, humedad,
        departamento, provincia, distrito,
        indice_criminalidad,
        hora_compra, dia_semana,
        productos_recomendados, productos_comprados,
        tasa_aceptacion
      ) VALUES (
        ${clienteId}, NOW(),
        ${clima.temperatura}, ${clima.precipitacion}, ${clima.humedad},
        ${cliente.departamento}, ${cliente.provincia}, ${cliente.distrito},
        ${indiceCriminalidad},
        EXTRACT(HOUR FROM NOW()), EXTRACT(DOW FROM NOW()),
        ${JSON.stringify(recomendaciones)}::jsonb,
        ${JSON.stringify(productosComprados)}::jsonb,
        ${tasaAceptacion}
      )
    `;
  }
}
```

### **Frontend: RecomendacionesIA.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../services/apiService';

interface Recomendacion {
  productoId: string;
  nombre: string;
  categoria: string;
  puntuacion: number;
  razon: string;
  precio: number;
  stock: number;
}

interface Props {
  clienteId: string;
  onAgregarProducto: (productoId: string) => void;
}

export const RecomendacionesIA: React.FC<Props> = ({ 
  clienteId, 
  onAgregarProducto 
}) => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      cargarRecomendaciones();
    }
  }, [clienteId]);

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/ia/recomendaciones/${clienteId}`);
      setRecomendaciones(response.data);
    } catch (err) {
      setError('Error al cargar recomendaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons = {
      clima: '🌧️',
      seguridad: '🛡️',
      historial: '💼',
      temporada: '📅',
      ubicacion: '📍'
    };
    return icons[categoria as keyof typeof icons] || '💡';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      clima: '#3498db',
      seguridad: '#e74c3c',
      historial: '#9b59b6',
      temporada: '#f39c12',
      ubicacion: '#2ecc71'
    };
    return colors[categoria as keyof typeof colors] || '#95a5a6';
  };

  if (!clienteId) return null;

  if (loading) {
    return (
      <Container>
        <Header>🤖 Cargando recomendaciones IA...</Header>
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMsg>{error}</ErrorMsg>
      </Container>
    );
  }

  if (recomendaciones.length === 0) {
    return (
      <Container>
        <Header>🤖 Recomendaciones IA</Header>
        <EmptyMsg>No hay recomendaciones disponibles</EmptyMsg>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        🤖 Recomendaciones Inteligentes
        <Subtitle>Basadas en clima, ubicación e historial</Subtitle>
      </Header>

      <Grid>
        {recomendaciones.map((rec) => (
          <Card key={rec.productoId} color={getCategoriaColor(rec.categoria)}>
            <Badge color={getCategoriaColor(rec.categoria)}>
              {getCategoriaIcon(rec.categoria)} {rec.categoria}
            </Badge>

            <ProductName>{rec.nombre}</ProductName>

            <Razon>💡 {rec.razon}</Razon>

            <Footer>
              <Precio>S/ {rec.precio.toFixed(2)}</Precio>
              <Stock>Stock: {rec.stock}</Stock>
            </Footer>

            <Relevancia>
              <RelevanciaBar width={rec.puntuacion}>
                <span>{rec.puntuacion.toFixed(0)}% relevancia</span>
              </RelevanciaBar>
            </Relevancia>

            <BotonAgregar onClick={() => onAgregarProducto(rec.productoId)}>
              + Agregar a Venta
            </BotonAgregar>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const Header = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Subtitle = styled.span`
  font-size: 14px;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
`;

const Card = styled.div<{ color: string }>`
  background: white;
  border-left: 4px solid ${props => props.color};
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Badge = styled.div<{ color: string }>`
  display: inline-block;
  background: ${props => props.color}22;
  color: ${props => props.color};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
`;

const Razon = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Precio = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #27ae60;
`;

const Stock = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const Relevancia = styled.div`
  margin-bottom: 12px;
`;

const RelevanciaBar = styled.div<{ width: number }>`
  background: linear-gradient(
    to right,
    #3498db ${props => props.width}%,
    #ecf0f1 ${props => props.width}%
  );
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  
  span {
    font-size: 11px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const BotonAgregar = styled.button`
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMsg = styled.div`
  color: #e74c3c;
  text-align: center;
  padding: 20px;
`;

const EmptyMsg = styled.div`
  color: #7f8c8d;
  text-align: center;
  padding: 20px;
`;
```

---

## 🎯 RESUMEN DEL FLUJO

1. **Usuario selecciona cliente** → Frontend detecta cambio
2. **Frontend llama API IA** → GET /api/ia/recomendaciones/:clienteId
3. **Backend analiza**:
   - Clima actual (API SENAMHI)
   - Ubicación y riesgo (base de datos)
   - Historial de compras (PostgreSQL)
   - Temporada actual (fecha)
4. **Motor IA calcula scoring** → Top 5 productos con puntuación
5. **Frontend muestra cards** → Usuario ve recomendaciones
6. **Usuario agrega productos** → Venta normal continúa
7. **Sistema registra analytics** → IA aprende y mejora

---

**🚀 ¿Listo para implementar?** Este sistema transformará tu negocio en una tienda inteligente que anticipa las necesidades del cliente.

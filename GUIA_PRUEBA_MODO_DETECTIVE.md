# 🧪 Guía de Prueba: Modo Detective IA

## 🎯 Objetivo
Verificar que el **Modo Detective** muestra correctamente los 5 pasos de análisis de la IA al usuario.

---

## 🔧 Pre-requisitos

### 1. **Backend Corriendo**
```bash
cd alexa-tech-backend
npm run dev
```
✅ Verificar: `Servidor corriendo en http://localhost:3001`

### 2. **Frontend Corriendo**
```bash
cd alexa-tech-react
npm run dev
```
✅ Verificar: `Local: http://localhost:5173`

### 3. **API Key Configurada**
```bash
# Verificar en alexa-tech-backend/.env
GEMINI_API_KEY=AIzaSyDJA3e8_IiwBRs2zuX3BkWuHYr-mZ-PW08
```

### 4. **Datos Mínimos en BD**
- ✅ Al menos 1 cliente con ubicación completa
- ✅ Al menos 2-3 productos en inventario
- ✅ Usuario con permisos de ventas

---

## 📋 Caso de Prueba 1: Con Productos en Inventario

### **Paso 1: Login**
```
URL: http://localhost:5173/login
Usuario: admin@example.com
Password: admin123
```

### **Paso 2: Navegar al Asistente IA**
```
1. Click en menú lateral "Ventas"
2. Click en "Asistente de Ventas IA" (icono ✨)
```

**Verificar:**
- ✅ Página carga sin errores
- ✅ Título: "✨ Asistente de Ventas Inteligente"
- ✅ Subtítulo menciona "inteligencia artificial"

### **Paso 3: Seleccionar Cliente**
```
1. Click en dropdown "Cliente"
2. Seleccionar cualquier cliente (ej: "Juan Pérez - 12345678")
```

**Verificar:**
- ✅ Dropdown muestra todos los clientes
- ✅ Formato: "Nombre - Documento"

### **Paso 4: Ingresar Consulta**
```
Input: "cámaras de seguridad"
```

**Verificar:**
- ✅ Placeholder: "Ej: cámaras de seguridad"
- ✅ Campo acepta texto con tildes

### **Paso 5: Click en Buscar**
```
1. Click en botón "Buscar" (icono 🔍)
```

**Observar:**
- ✅ Botón cambia a "Analizando..." con spinner
- ✅ Aparece mensaje: "La IA está analizando las mejores opciones..."

---

## 🕵️ Verificación del Modo Detective

### **Panel de Análisis**

Después de 2-3 segundos, debería aparecer:

```
┌─────────────────────────────────────────────────────┐
│ 👁️ 🕵️ Proceso de Análisis de la IA    ⏱️ 2,453ms  │
└─────────────────────────────────────────────────────┘
```

**Verificar Header:**
- ✅ Icono de ojo (👁️)
- ✅ Título: "🕵️ Proceso de Análisis de la IA"
- ✅ Badge con tiempo total (ej: "2,453ms")

---

### **Paso 1: Investigando Perfil del Cliente**

```
┌─────────────────────────────────────────────────┐
│ ✅  🔎 Investigando Perfil del Cliente   45ms   │
│                                                 │
│ Analizando información del cliente para         │
│ entender su ubicación, historial de compras...  │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Cliente:          Juan Pérez López      │   │
│ │ Documento:        12345678              │   │
│ │ Ubicación:        Lima, Lima, Lima      │   │
│ │ Total Compras:    5                     │   │
│ │ Ultima Compra:    2024-11-28...         │   │
│ │ Tiempo Analisis:  45ms                  │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Card con borde verde
- ✅ Icono de check (✅) en círculo verde
- ✅ Título: "🔎 Investigando Perfil del Cliente"
- ✅ Tiempo de análisis (ej: "45ms")
- ✅ Descripción explicativa
- ✅ Panel de datos expandido con:
  - Nombre del cliente
  - Número de documento
  - Ubicación completa (Distrito, Provincia, Departamento)
  - Total de compras
  - Fecha de última compra
  - Tiempo de análisis

---

### **Paso 2: Análisis Climático y Geográfico**

```
┌─────────────────────────────────────────────────┐
│ ✅  🌦️ Análisis Climático y Geográfico  12ms   │
│                                                 │
│ Investigando condiciones ambientales de Lima... │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Clima:            Costero con alta...   │   │
│ │ Temperatura:      15-28°C               │   │
│ │ Caracteristicas:  Alta humedad (80%)... │   │
│ │ Tiempo Analisis:  12ms                  │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Card con borde verde
- ✅ Título: "🌦️ Análisis Climático y Geográfico"
- ✅ Descripción menciona departamento del cliente
- ✅ Panel de datos con:
  - Tipo de clima (Costero/Sierra/Selva)
  - Temperatura promedio
  - Características climáticas
  - Tiempo de análisis

---

### **Paso 3: Búsqueda Inteligente en Inventario**

```
┌─────────────────────────────────────────────────┐
│ ✅  📦 Búsqueda Inteligente en Inventario 156ms │
│                                                 │
│ Escaneando cámaras de seguridad en base de...  │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Consulta:            cámaras de seguri...│   │
│ │ Productos Encontrados: 5                │   │
│ │ Categorias:          Seguridad, Vigil...│   │
│ │ Rango Precios:       {"minimo":280,... │   │
│ │ Tiempo Analisis:     156ms              │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Card con borde verde
- ✅ Título: "📦 Búsqueda Inteligente en Inventario"
- ✅ Descripción menciona la consulta del usuario
- ✅ Panel de datos con:
  - Consulta ingresada
  - Cantidad de productos encontrados
  - Categorías detectadas
  - Rango de precios (mínimo/máximo)
  - Tiempo de análisis

---

### **Paso 4: Análisis con Inteligencia Artificial**

```
┌─────────────────────────────────────────────────┐
│ ✅  🧠 Análisis con Inteligencia Artificial 2.1s│
│                                                 │
│ Consultando a Gemini AI para generar...        │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Modelo:           gemini-2.5-flash      │   │
│ │ Context Length:   8542                  │   │
│ │ Parametros:       {"clima":"Costero"...│   │
│ │ Estado:           Completado            │   │
│ │ Tiempo Analisis:  2185ms                │   │
│ │ Tokens Generados: 3247                  │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Card con borde verde
- ✅ Título: "🧠 Análisis con Inteligencia Artificial"
- ✅ Descripción menciona "Gemini AI"
- ✅ Panel de datos con:
  - Nombre del modelo (gemini-2.5-flash)
  - Longitud del contexto
  - Parámetros (clima, productos, historial)
  - Estado: "Completado"
  - Tiempo de análisis (el más largo ~2s)
  - Tokens generados

---

### **Paso 5: Procesando Resultados**

```
┌─────────────────────────────────────────────────┐
│ ✅  📊 Procesando Resultados             55ms   │
│                                                 │
│ Estructurando y validando las recomendaciones...│
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Estado:           Completado            │   │
│ │ Recomendados:     3                     │   │
│ │ No Recomendados:  2                     │   │
│ │ Tips:             4                     │   │
│ │ Tiempo Analisis:  55ms                  │   │
│ │ Tiempo Total:     2453ms                │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Card con borde verde
- ✅ Título: "📊 Procesando Resultados"
- ✅ Descripción menciona "validando"
- ✅ Panel de datos con:
  - Estado: "Completado"
  - Cantidad de recomendados
  - Cantidad de no recomendados
  - Cantidad de tips
  - Tiempo de análisis del paso
  - **Tiempo total de todo el proceso**

---

## 📊 Verificación de Resultados (Debajo del Panel)

Después del panel de análisis, deberían aparecer:

### **1. Información del Cliente**
```
┌─────────────────────────────────────────┐
│ Juan Pérez López                        │
├─────────────────────────────────────────┤
│ 📍 Ubicación: Lima, Lima, Lima          │
│ 📈 Clima: Costero con alta humedad      │
│ 🛒 Compras anteriores: 5 productos      │
└─────────────────────────────────────────┘
```

### **2. Productos Recomendados**
```
⭐ PRODUCTOS RECOMENDADOS

┌─────────────────────────────────────────┐
│ Cámara Hikvision 4MP IP67    98%       │
│ S/ 1,250.00                             │
│                                         │
│ 🎯 Por qué te lo recomendamos:         │
│   ✓ Protección IP67 ideal para humedad │
│   ✓ Materiales anticorrosivos           │
│                                         │
│ 💡 Ventajas:                            │
│   + Garantía extendida                  │
│                                         │
│ ⚠️ Consideraciones:                     │
│   ! Requiere mantenimiento trimestral   │
│                                         │
│ [🛒 Agregar al Carrito]                │
└─────────────────────────────────────────┘
```

### **3. Productos No Recomendados** (si hay)
```
⚠️ PRODUCTOS NO RECOMENDADOS

┌─────────────────────────────────────────┐
│ ⚠️ Cámara Básica 2MP                    │
│                                         │
│ Sin protección IP. En Lima costa se     │
│ dañará en 2-3 meses por humedad.        │
└─────────────────────────────────────────┘
```

### **4. Tips del Experto**
```
💡 TIPS DEL EXPERTO

┌─────────────────────────────────────────┐
│ 💡 En Lima costa usar IP67+ por humedad │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 💡 Mantenimiento preventivo cada 3 meses│
└─────────────────────────────────────────┘
```

---

## ❌ Caso de Prueba 2: Sin Productos en Inventario

### **Pasos 1-4: Igual que Caso 1**

### **Paso 5: Click en Buscar**

**Observar Panel de Análisis:**

```
✅ Paso 1: Cliente analizado
✅ Paso 2: Clima analizado
✅ Paso 3: 0 productos encontrados

⚠️ Paso 4: Inventario Insuficiente
────────────────────────────────────
No se encontraron productos en stock.
Generando recomendaciones generales...

┌─────────────────────────────────────┐
│ Sugerencia: Agregar productos al    │
│             inventario para obtener │
│             recomendaciones...       │
└─────────────────────────────────────┘
```

**Verificar:**
- ✅ Solo 4 pasos (no hay Paso 5 de IA)
- ✅ Paso 4 es "⚠️ Inventario Insuficiente"
- ✅ Card con color diferente (amarillo/warning)
- ✅ Mensaje explicativo claro

**Verificar Resultados:**
- ✅ Aparece mensaje: "⚠️ No hay productos en inventario"
- ✅ Mensaje explica que IA generó recomendaciones útiles
- ✅ No aparece sección de "Productos Recomendados"
- ✅ Aparece sección de "Tips" con consejos generales

---

## 🐛 Debugging - Errores Comunes

### **Error 1: Panel de Análisis No Aparece**

**Síntoma:** Solo aparecen recomendaciones, sin panel de análisis

**Verificar Backend:**
```bash
# En terminal del backend, buscar:
🔍 [AI DETECTIVE] Iniciando investigación...
✅ [AI] Paso 1 completado: Perfil del cliente obtenido
✅ [AI] Paso 2 completado: Datos climáticos analizados
✅ [AI] Paso 3 completado: 5 productos encontrados
🧠 [AI] Consultando Gemini AI...
✅ [AI] Respuesta recibida de Gemini
```

**Solución:**
- Si no hay logs → Reiniciar backend
- Si hay logs pero no aparece en frontend → Verificar consola del navegador

---

### **Error 2: "Cannot read property 'datos' of undefined"**

**Síntoma:** Error en consola del navegador

**Causa:** Frontend intenta acceder a `pasosAnalisis[3].datos` pero el array no tiene ese índice

**Solución:**
```typescript
// Ya corregido en código con:
if (pasosAnalisis[3]) {
  pasosAnalisis[3].datos.estado = 'Completado';
}
```

**Verificar:** Código actualizado en `ai-recommendations.service.ts`

---

### **Error 3: Tiempo Total Muestra "N/A"**

**Síntoma:** Badge de tiempo total muestra "N/A" en lugar de milisegundos

**Causa:** Paso 5 no tiene `tiempoTotal` en datos

**Solución:**
```typescript
// Verificar en Paso 5:
pasosAnalisis[4].datos = {
  ...
  tiempoTotal: `${Date.now() - startTime1}ms`  // ← Debe existir
};
```

---

### **Error 4: Cards No Tienen Color Verde**

**Síntoma:** Cards del panel aparecen grises en lugar de verdes

**Causa:** Prop `$completed` no está en `true`

**Verificar Frontend:**
```tsx
<StepCard $completed={true}>  {/* ← Debe ser true */}
```

---

## 📸 Capturas Esperadas

### **Estado Inicial**
- Página limpia con formulario de búsqueda
- Dropdown de clientes poblado
- Input de consulta vacío
- Botón "Buscar" habilitado

### **Estado Cargando**
- Botón cambia a "Analizando..." con spinner
- Aparece mensaje: "La IA está analizando..."
- Spinner animado de color azul

### **Estado Completo**
- Panel de Análisis Detective con 5 pasos
- Todos los pasos con ✅ verde
- Tiempo total visible
- Información del cliente
- Cards de productos recomendados
- Tips del experto

---

## ✅ Checklist Final

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] API Key configurada correctamente
- [ ] Al menos 1 cliente en BD
- [ ] Al menos 2-3 productos en BD
- [ ] Panel de Análisis aparece
- [ ] 5 pasos visibles (o 4 si no hay productos)
- [ ] Todos los pasos tienen ✅ verde
- [ ] Datos de cada paso se muestran correctamente
- [ ] Tiempo total aparece en badge
- [ ] Recomendaciones aparecen debajo del panel
- [ ] Tips del experto aparecen
- [ ] Consola del navegador sin errores
- [ ] Logs del backend confirman proceso completo

---

## 🎓 Conclusión

Si todos los checkmarks (✅) están completados, el **Modo Detective** está funcionando correctamente y mostrando transparencia total del proceso de análisis de la IA.

**Tiempo estimado de prueba:** 5-10 minutos

**Resultado esperado:** Usuario puede ver y entender exactamente cómo la IA analiza datos para generar recomendaciones personalizadas.

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Sistema:** Alexa Tech - Asistente de Ventas IA

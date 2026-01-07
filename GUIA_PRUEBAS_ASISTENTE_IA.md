# 🤖 Guía de Pruebas - Asistente de Ventas con IA

## 📋 Implementación Completada

### ✅ Backend (100%)
- **API Key Gemini**: Configurada en `.env`
- **Base de datos climática**: 20+ ubicaciones de Perú (costa, sierra, selva)
- **Servicio de IA**: Integración completa con Google Gemini AI
- **Endpoints**:
  - `GET /api/ai/health` - Verificar estado del servicio
  - `POST /api/ai/recommendations` - Generar recomendaciones
- **Seguridad**: Requiere autenticación y permiso `sales.create`

### ✅ Frontend (100%)
- **Página**: `/ventas/asistente-ia`
- **Componente**: `AsistenteVentas.tsx`
- **Navegación**: Agregado en menú de Ventas con icono 🤖
- **Diseño**: UI futurista con gradientes morados y cards interactivas

---

## 🧪 Casos de Prueba

### **Caso 1: Cliente en Lima (Costa)**
**Objetivo**: Verificar recomendaciones considerando alta humedad y salitre marino

**Pasos**:
1. Acceder a `/ventas/asistente-ia`
2. Seleccionar un cliente de Lima
3. Buscar: "cámaras de seguridad"
4. Verificar que las recomendaciones mencionen:
   - ✓ Protección IP67 o superior
   - ✓ Materiales anti-corrosión
   - ✓ Resistencia a humedad alta
   - ✓ Salitre marino

**Resultado Esperado**:
- Productos con mayor score deben ser cámaras IP67/IP68
- Razones deben incluir contexto climático de Lima
- Tips del experto sobre mantenimiento en zona costera

---

### **Caso 2: Cliente en Puno (Sierra)**
**Objetivo**: Verificar recomendaciones para clima frío extremo

**Pasos**:
1. Seleccionar cliente de Puno
2. Buscar: "cámaras de vigilancia"
3. Verificar que las recomendaciones mencionen:
   - ✓ Calefactor interno
   - ✓ Rango de temperatura -40°C a 60°C
   - ✓ Resistencia a heladas
   - ✓ Protección contra humedad por lluvias

**Resultado Esperado**:
- Score alto para cámaras con calefacción
- Advertencias sobre productos no aptos para frío extremo
- Tips sobre instalación en altitud

---

### **Caso 3: Cliente en Loreto (Selva)**
**Objetivo**: Verificar recomendaciones para humedad extrema

**Pasos**:
1. Seleccionar cliente de Loreto (Iquitos)
2. Buscar: "equipo de seguridad"
3. Verificar que las recomendaciones mencionen:
   - ✓ IP68 (inmersión)
   - ✓ Protección anti-hongos
   - ✓ Materiales resistentes a humedad extrema
   - ✓ Ventilación para evitar condensación

**Resultado Esperado**:
- Solo productos con máxima protección contra agua
- Advertencia sobre productos no sellados
- Sección de "No Recomendados" con productos incompatibles

---

### **Caso 4: Cliente con Historial de Compras**
**Objetivo**: Verificar personalización basada en compras anteriores

**Pasos**:
1. Seleccionar cliente que ya realizó compras
2. Buscar: "cámaras"
3. Verificar:
   - ✓ Contexto del cliente muestra historial de compras
   - ✓ Productos complementarios relacionados con compras previas
   - ✓ Recomendaciones coherentes con productos ya adquiridos

**Resultado Esperado**:
- La IA menciona productos previamente comprados
- Sugiere upgrades o complementos compatibles
- Evita recomendar duplicados

---

### **Caso 5: Búsqueda Genérica**
**Objetivo**: Verificar capacidad de interpretación de la IA

**Pasos**:
1. Seleccionar cualquier cliente
2. Buscar frases variadas:
   - "necesito vigilar mi negocio"
   - "protección para almacén"
   - "sistema de monitoreo"
3. Verificar:
   - ✓ La IA interpreta la necesidad correctamente
   - ✓ Ofrece categorías variadas de productos
   - ✓ Explica el "por qué" de cada recomendación

**Resultado Esperado**:
- Recomendaciones relevantes aunque la consulta sea ambigua
- Score refleja relevancia con la necesidad del cliente
- Tips prácticos sobre implementación

---

## 📊 Estructura de Respuesta de la IA

```json
{
  "recomendados": [
    {
      "productoId": "uuid",
      "nombre": "Cámara IP67 con Calefactor",
      "precio": 450.00,
      "stock": 15,
      "score": 95,
      "razones": [
        "Ideal para clima de Puno con temperaturas bajo cero",
        "Calefactor interno previene condensación",
        "Rango de operación: -40°C a 60°C"
      ],
      "ventajas": [
        "Visión nocturna hasta 30m",
        "Resistente a lluvia y nieve"
      ],
      "consideraciones": [
        "Requiere instalación profesional",
        "Consumo eléctrico mayor por calefactor"
      ]
    }
  ],
  "noRecomendados": [
    {
      "nombre": "Cámara Básica Interior",
      "razon": "No apta para exteriores ni temperaturas bajo cero"
    }
  ],
  "productosComplementarios": [
    {
      "productoId": "uuid",
      "nombre": "Cable de Red Exterior",
      "precio": 80.00,
      "score": 85,
      "razones": ["Necesario para instalación exterior"]
    }
  ],
  "tipsExperto": [
    "En climas fríos, instala las cámaras con ángulo descendente para evitar acumulación de nieve",
    "Verifica periódicamente el desempeño del calefactor durante el invierno"
  ],
  "contextoCliente": {
    "ubicacion": "PUNO-PUNO",
    "clima": "Frío de altura",
    "historialCompras": 5
  }
}
```

---

## 🔍 Verificaciones de Calidad

### **Interfaz de Usuario**
- [ ] El selector de clientes carga correctamente
- [ ] El input de búsqueda es responsive
- [ ] El botón "Buscar" se deshabilita durante la carga
- [ ] Aparece un loader con mensaje mientras la IA procesa
- [ ] Las tarjetas de productos tienen diseño atractivo
- [ ] Los scores usan colores semafóricos (verde ≥90, amarillo ≥70, rojo <70)
- [ ] El botón "Agregar al Carrito" es funcional (o muestra notificación)

### **Lógica de Negocio**
- [ ] No permite buscar sin seleccionar cliente
- [ ] No permite búsquedas de menos de 3 caracteres
- [ ] Maneja errores de API con notificaciones claras
- [ ] Muestra estado vacío cuando no hay resultados
- [ ] La información del cliente se muestra correctamente

### **Backend**
- [ ] El endpoint `/api/ai/health` responde correctamente
- [ ] El endpoint `/api/ai/recommendations` requiere autenticación
- [ ] El endpoint valida que el cliente exista
- [ ] Los logs del backend muestran el proceso de generación
- [ ] La API de Gemini responde en tiempo razonable (<5 segundos)

---

## 🐛 Problemas Comunes y Soluciones

### **Error: "Error al obtener recomendaciones de IA"**
**Causas posibles**:
1. API Key de Gemini inválida → Verificar `.env`
2. Cliente no existe en BD → Verificar que el ID sea válido
3. Sin productos en inventario → Agregar productos de prueba
4. Límite de API alcanzado → Esperar o usar otra clave

**Solución**:
```bash
# Verificar logs del backend
cd alexa-tech-backend
npm run dev
# Observar consola para ver errores específicos
```

---

### **Error: "Cannot find module '@google/generative-ai'"**
**Causa**: Package no instalado

**Solución**:
```bash
cd alexa-tech-backend
npm install @google/generative-ai
npm run dev
```

---

### **Recomendaciones muy genéricas**
**Causa**: Datos climáticos no encontrados o cliente sin ubicación

**Solución**:
1. Verificar que el cliente tenga `departamento` y `provincia` en BD
2. Verificar que la ubicación esté en `climate-data.ts`
3. Agregar más datos climáticos si es necesario

---

## 📈 Métricas de Éxito

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Tiempo de respuesta** | < 5 segundos | Cronometrar desde click en "Buscar" |
| **Relevancia** | Score > 70 en top 3 | Verificar coherencia con necesidad |
| **Contextualización** | 100% menciona clima | Leer razones de cada producto |
| **Diversidad** | Al menos 3 productos | Contar recomendaciones |
| **Complementarios** | Al menos 1 producto | Verificar sección adicional |

---

## 🚀 Próximos Pasos (Mejoras Futuras)

1. **Integración con Carrito**: Agregar productos directamente desde las recomendaciones
2. **Historial de Consultas**: Guardar búsquedas del cliente para análisis
3. **Feedback de Usuario**: Botón "¿Te fue útil?" para mejorar prompts
4. **Cache de Recomendaciones**: Almacenar consultas frecuentes en Redis
5. **Recomendaciones Proactivas**: Sugerir productos al abrir ficha del cliente
6. **Multilenguaje**: Soporte para inglés y otros idiomas
7. **Exportar PDF**: Imprimir recomendaciones como propuesta comercial

---

## 📝 Notas Técnicas

### **Datos Climáticos Disponibles**

**Costa**: Lima, Callao, Arequipa, Piura, Lambayeque, Ica, Tacna, Tumbes
**Sierra**: Puno, Cusco, Junín, Cajamarca, Ayacucho, Huánuco, Áncash
**Selva**: Loreto, Ucayali, Madre de Dios, San Martín, Amazonas

### **Modelo de IA Usado**
- **Proveedor**: Google Gemini
- **Modelo**: `gemini-1.5-pro`
- **Temperatura**: 0.7 (balance creatividad/precisión)
- **Tokens máximos**: Configurado en servicio

### **Permisos Requeridos**
- Usuario debe tener permiso: `sales.create`
- Usuario debe estar autenticado con JWT válido

---

## ✅ Checklist de Implementación Completa

- [x] Backend: Instalar `@google/generative-ai`
- [x] Backend: Configurar API Key en `.env`
- [x] Backend: Crear base de datos climática
- [x] Backend: Implementar servicio de IA
- [x] Backend: Crear controller y rutas
- [x] Backend: Registrar rutas en `routes/index.ts`
- [x] Frontend: Crear página `AsistenteVentas.tsx`
- [x] Frontend: Exportar en `sales/index.ts`
- [x] Frontend: Agregar ruta en `App.tsx`
- [x] Frontend: Agregar link en navegación
- [ ] Testing: Probar caso Lima (costa)
- [ ] Testing: Probar caso Puno (sierra)
- [ ] Testing: Probar caso Loreto (selva)
- [ ] Testing: Validar con cliente real
- [ ] Testing: Ajustar prompts según resultados

---

**🎉 ¡Implementación lista para pruebas!**

El Asistente de Ventas con IA está completamente integrado en el sistema. Inicia sesión en el frontend, navega a **Ventas > 🤖 Asistente de Ventas IA** y comienza a probar con diferentes clientes y búsquedas.

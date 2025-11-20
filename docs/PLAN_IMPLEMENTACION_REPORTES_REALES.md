# 🎯 PLAN DE IMPLEMENTACIÓN: REPORTES CON DATOS REALES

## 📊 DIAGNÓSTICO

### ✅ **Estado Actual del Backend**
El backend **SÍ tiene endpoints funcionales** que devuelven datos reales de la base de datos:

```typescript
✅ GET /api/reportes/ventas          - reportesService.getReporteVentas()
✅ GET /api/reportes/compras         - reportesService.getReporteCompras()
✅ GET /api/reportes/inventario      - reportesService.getReporteInventario()
❌ GET /api/reportes/caja            - reportesService.getReporteCaja()
```

**Servicios implementados:**
- ✅ `ReporteVentas`: Consultas a `prisma.sale` + agregaciones
- ✅ `ReporteCompras`: Consultas a `prisma.purchase` + agregaciones
- ✅ `ReporteInventario`: Consultas a `prisma.product` + `prisma.warehouse`
- ✅ `ReporteCaja`: Consultas a `prisma.cashSession` + ventas por forma de pago

---

### ⚠️ **Estado Actual del Frontend**

#### **ReporteVentas.tsx** ✅ CONECTADO
```typescript
useEffect(() => {
  handleBuscar(); // Llama al backend en mount
}, []);

const handleBuscar = async () => {
  const res = await apiService.getReporteVentas({
    fechaInicio, fechaFin
  });
  setReporteData(res.data); // ✅ Usa datos reales
};
```

#### **ReporteCompras.tsx** ✅ CONECTADO
```typescript
const handleBuscar = async () => {
  const res = await apiService.getReporteCompras({
    fechaInicio, fechaFin
  });
  setReporteData(res.data); // ✅ Usa datos reales
};
```

#### **ReporteInventario.tsx** ✅ CONECTADO
```typescript
const handleBuscar = async () => {
  const res = await apiService.getReporteInventario({
    almacenId
  });
  setReporteData(res.data); // ✅ Usa datos reales
};
```

#### **ReporteCaja.tsx** ❌ USA MOCK DATA
```typescript
const mockMovimientos: MovimientoCaja[] = [
  { id: '1', fecha: '2024-01-15', hora: '09:00', ... },
  // ... 5 registros hardcodeados
];

useEffect(() => {
  setMovimientos(mockMovimientos); // ❌ Datos falsos
}, []);

const handleBuscar = () => {
  setTimeout(() => {
    setMovimientos(mockMovimientos); // ❌ Simula búsqueda
  }, 1000);
};
```

---

## 🔧 PROBLEMAS IDENTIFICADOS

### **1. ReporteCaja NO está conectado al backend**
- ❌ No importa `apiService`
- ❌ No hace llamadas HTTP
- ❌ Usa 5 registros mock hardcodeados
- ❌ La búsqueda es un `setTimeout` fake

### **2. Falta endpoint en apiService**
Verificar si existe `apiService.getReporteCaja()` en `utils/api.ts`

### **3. Estructura de datos no validada**
- Backend devuelve: `{ resumen, movimientosPorCaja, movimientosPorMetodo, ventasPorHora }`
- Frontend espera: `MovimientoCaja[]` (array simple)
- **Incompatibilidad de interfaces**

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Verificar apiService** ⏱️ 5 min

**Objetivo:** Confirmar que existe el método `getReporteCaja()` en el cliente API

**Archivos a revisar:**
- `alexa-tech-react/src/utils/api.ts`

**Acción:**
```typescript
// Verificar si existe:
getReporteCaja(filters?: { 
  fechaInicio?: string; 
  fechaFin?: string;
  // ... otros filtros
}): Promise<ApiResponse<CajaReporte>>
```

**Si NO existe:** Agregarlo siguiendo el patrón de los otros reportes.

---

### **FASE 2: Definir Interfaces TypeScript** ⏱️ 10 min

**Objetivo:** Crear tipos que coincidan con la respuesta del backend

**Archivo:** `alexa-tech-react/src/types/reportes.types.ts` (crear si no existe)

```typescript
export interface CajaReporte {
  resumen: {
    cajasAbiertas: number;
    cajasCerradas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
    totalOtros: number;
    totalGeneral: number;
  };
  movimientosPorCaja: MovimientoCaja[];
  movimientosPorMetodo: {
    metodoPago: string;
    cantidadTransacciones: number;
    montoTotal: number;
    porcentaje: number;
  }[];
  ventasPorHora: {
    hora: number;
    cantidadVentas: number;
    montoTotal: number;
  }[];
}

export interface MovimientoCaja {
  cajaId: string;
  nombreCaja: string;
  usuarioId: string;
  nombreUsuario: string;
  montoApertura: number;
  totalIngresos: number;
  totalEgresos: number;
  montoCierre: number;
  estado: 'Abierta' | 'Cerrada';
  fechaApertura: string;
  fechaCierre?: string;
}
```

---

### **FASE 3: Conectar ReporteCaja al Backend** ⏱️ 20 min

**Objetivo:** Reemplazar mock data con llamadas reales

**Archivo:** `alexa-tech-react/src/modules/reportes/pages/ReporteCaja.tsx`

#### **3.1 Agregar imports**
```typescript
import { apiService } from '../../../utils/api';
import type { CajaReporte } from '../../../types/reportes.types';
```

#### **3.2 Actualizar estado**
```typescript
// ANTES:
const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);

// DESPUÉS:
const [reporteData, setReporteData] = useState<CajaReporte | null>(null);
```

#### **3.3 Implementar handleBuscar real**
```typescript
const handleBuscar = async () => {
  setLoading(true);
  try {
    const res = await apiService.getReporteCaja({
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      tipo: tipo || undefined,
      usuario: usuario || undefined,
      metodoPago: metodoPago || undefined,
      concepto: concepto || undefined,
    });

    if (res.success && res.data) {
      setReporteData(res.data);
    }
  } catch (e) {
    console.error('Error cargando reporte caja', e);
    setReporteData(null);
  } finally {
    setLoading(false);
  }
};
```

#### **3.4 Remover mock data**
```typescript
// ❌ ELIMINAR TODO ESTO:
const mockMovimientos: MovimientoCaja[] = [ ... ];

useEffect(() => {
  setMovimientos(mockMovimientos);
}, []);
```

#### **3.5 Actualizar useEffect**
```typescript
useEffect(() => {
  handleBuscar(); // Cargar datos reales en mount
}, []);
```

#### **3.6 Adaptar funciones de cálculo**
```typescript
const calcularResumen = () => {
  if (!reporteData) return {
    totalIngresos: 0,
    totalEgresos: 0,
    saldoFinal: 0,
    totalMovimientos: 0
  };
  
  return {
    totalIngresos: reporteData.resumen.totalEfectivo + 
                   reporteData.resumen.totalTarjeta + 
                   reporteData.resumen.totalTransferencia + 
                   reporteData.resumen.totalOtros,
    totalEgresos: 0, // Backend no proporciona egresos aún
    saldoFinal: reporteData.resumen.totalGeneral,
    totalMovimientos: reporteData.movimientosPorCaja.length
  };
};

const calcularMovimientosPorTipo = () => {
  if (!reporteData) return [];
  // Mapear movimientosPorCaja a tipos
  return [
    {
      tipo: 'INGRESO',
      cantidad: reporteData.movimientosPorCaja.length,
      total: reporteData.resumen.totalGeneral,
      porcentaje: 100
    }
  ];
};

const calcularMovimientosPorUsuario = () => {
  if (!reporteData) return [];
  // Agrupar por usuario
  const usuariosMap = new Map();
  reporteData.movimientosPorCaja.forEach(mov => {
    const key = mov.usuarioId;
    const current = usuariosMap.get(key);
    usuariosMap.set(key, {
      usuario: mov.nombreUsuario,
      cantidad: (current?.cantidad || 0) + 1,
      total: (current?.total || 0) + mov.totalIngresos
    });
  });
  return Array.from(usuariosMap.values())
    .sort((a, b) => b.cantidad - a.cantidad);
};

const calcularMovimientosPorMetodoPago = () => {
  return reporteData?.movimientosPorMetodo || [];
};
```

#### **3.7 Actualizar JSX para usar reporteData**
```typescript
// Tab "resumen"
<CardValue style={{ color: '#059669' }}>
  S/ {resumen.totalIngresos.toFixed(2)}
</CardValue>

// Tab "movimientos"
<tbody>
  {reporteData?.movimientosPorCaja.map((movimiento) => (
    <tr key={movimiento.cajaId}>
      <TableCell>{formatDMY(movimiento.fechaApertura)}</TableCell>
      <TableCell>{movimiento.nombreCaja}</TableCell>
      <TableCell>{movimiento.nombreUsuario}</TableCell>
      <TableCell>S/ {movimiento.montoApertura.toFixed(2)}</TableCell>
      <TableCell>S/ {movimiento.totalIngresos.toFixed(2)}</TableCell>
      <TableCell>S/ {movimiento.montoCierre.toFixed(2)}</TableCell>
      <TableCell>
        <TypeBadge type={movimiento.estado === 'Abierta' ? 'APERTURA' : 'CIERRE'}>
          {movimiento.estado}
        </TypeBadge>
      </TableCell>
    </tr>
  ))}
</tbody>

// Tab "análisis"
{calcularMovimientosPorMetodoPago().map((metodo) => (
  <ChartBar key={metodo.metodoPago} percentage={metodo.porcentaje} color="#6366f1">
    <span className="label">{metodo.metodoPago}</span>
    <div className="bar-container">
      <div className="bar-fill"></div>
    </div>
    <span className="value">
      S/ {metodo.montoTotal.toFixed(2)} ({metodo.porcentaje.toFixed(1)}%)
    </span>
  </ChartBar>
))}
```

#### **3.8 Actualizar CSV Export**
```typescript
const handleExportar = () => {
  if (!reporteData) return;

  const BOM = '\uFEFF';
  
  let header = `Reporte de Movimientos de Caja\n`;
  header += `Período Analizado:\t${fechaInicio || 'Todas las fechas'}\tal\t${fechaFin || 'Hoy'}\n`;
  header += `Fecha de Generación:\t${new Date().toLocaleString('es-PE')}\n\n`;

  // Resumen
  header += `=== RESUMEN GENERAL ===\n`;
  header += `Total Efectivo\tTotal Tarjeta\tTotal Transferencia\tTotal General\n`;
  header += `S/ ${reporteData.resumen.totalEfectivo.toFixed(2)}\tS/ ${reporteData.resumen.totalTarjeta.toFixed(2)}\tS/ ${reporteData.resumen.totalTransferencia.toFixed(2)}\tS/ ${reporteData.resumen.totalGeneral.toFixed(2)}\n\n`;

  // Movimientos por caja
  header += `=== MOVIMIENTOS POR CAJA ===\n`;
  header += `Caja\tUsuario\tApertura\tIngresos\tCierre\tEstado\tFecha Apertura\n`;
  reporteData.movimientosPorCaja.forEach(m => {
    header += `${m.nombreCaja}\t${m.nombreUsuario}\tS/ ${m.montoApertura.toFixed(2)}\tS/ ${m.totalIngresos.toFixed(2)}\tS/ ${m.montoCierre.toFixed(2)}\t${m.estado}\t${m.fechaApertura}\n`;
  });
  header += `\n`;

  // Métodos de pago
  header += `=== DISTRIBUCIÓN POR MÉTODO DE PAGO ===\n`;
  header += `Método\tTransacciones\tMonto Total\tPorcentaje\n`;
  reporteData.movimientosPorMetodo.forEach(m => {
    header += `${m.metodoPago}\t${m.cantidadTransacciones}\tS/ ${m.montoTotal.toFixed(2)}\t${m.porcentaje.toFixed(2)}%\n`;
  });

  const blob = new Blob([BOM + header], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Caja_${fechaInicio || 'completo'}_${fechaFin || new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

### **FASE 4: Verificar apiService.getReporteCaja()** ⏱️ 10 min

**Archivo:** `alexa-tech-react/src/utils/api.ts`

**Agregar si no existe:**
```typescript
async getReporteCaja(filters?: {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
  usuario?: string;
  metodoPago?: string;
  concepto?: string;
}): Promise<ApiResponse<CajaReporte>> {
  const params = new URLSearchParams();
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.usuario) params.append('usuarioId', filters.usuario);
  if (filters?.metodoPago) params.append('metodoPago', filters.metodoPago);
  if (filters?.concepto) params.append('concepto', filters.concepto);

  const queryString = params.toString();
  const url = `/reportes/caja${queryString ? `?${queryString}` : ''}`;
  
  return this.request<CajaReporte>('GET', url);
}
```

---

### **FASE 5: Testing** ⏱️ 15 min

#### **5.1 Verificar Backend está corriendo**
```bash
cd alexa-tech-backend
npm run dev
```

#### **5.2 Verificar Frontend está corriendo**
```bash
cd alexa-tech-react
npm run dev
```

#### **5.3 Probar endpoint manualmente**
```bash
# En el navegador o Postman:
GET http://localhost:3000/api/reportes/caja?fechaInicio=2024-01-01&fechaFin=2024-12-31

# Verificar respuesta:
{
  "success": true,
  "message": "Reporte de caja generado exitosamente",
  "data": {
    "resumen": { ... },
    "movimientosPorCaja": [ ... ],
    ...
  }
}
```

#### **5.4 Probar interfaz**
- Navegar a `/reportes` → Pestaña "Caja"
- Verificar que carga datos (no mock)
- Cambiar filtros y verificar que se actualizan
- Exportar CSV y verificar contenido

#### **5.5 Verificar consola**
```javascript
// Verificar que NO aparezcan errores como:
❌ "Error cargando reporte caja: 404"
❌ "apiService.getReporteCaja is not a function"
❌ "Cannot read property 'resumen' of null"
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### **Backend**
- [ ] Endpoint `/api/reportes/caja` responde 200 OK
- [ ] Respuesta contiene estructura `{ resumen, movimientosPorCaja, movimientosPorMetodo, ventasPorHora }`
- [ ] Datos provienen de `prisma.cashSession` y `prisma.sale`
- [ ] Filtros `fechaInicio`, `fechaFin` funcionan correctamente

### **Frontend**
- [ ] `apiService.getReporteCaja()` está definido en `utils/api.ts`
- [ ] Interfaces TypeScript coinciden con respuesta del backend
- [ ] `ReporteCaja.tsx` importa `apiService`
- [ ] Mock data eliminado completamente
- [ ] `handleBuscar()` hace llamada HTTP real
- [ ] `useEffect()` carga datos en mount
- [ ] Tabs muestran datos reales (no hardcodeados)
- [ ] CSV export contiene datos de `reporteData`, no mock

### **UX**
- [ ] Spinner de loading aparece durante carga
- [ ] Mensaje de error si falla la petición
- [ ] Filtros actualizan los datos al buscar
- [ ] Botón "Exportar" genera CSV con datos reales
- [ ] Nombres de columnas coinciden con estructura de datos

---

## 🎯 RESULTADO ESPERADO

### **ANTES (Mock Data)**
```typescript
const mockMovimientos = [
  { id: '1', fecha: '2024-01-15', hora: '09:00', ... }, // ❌ Hardcoded
];
setMovimientos(mockMovimientos); // ❌ Datos falsos
```

### **DESPUÉS (Datos Reales)**
```typescript
const res = await apiService.getReporteCaja({ fechaInicio, fechaFin }); // ✅ HTTP Request
setReporteData(res.data); // ✅ Datos de la BD

// Datos provienen de:
// - prisma.cashSession (sesiones de caja)
// - prisma.sale (ventas por forma de pago)
// - prisma.user (usuarios que operaron cajas)
```

---

## 📝 NOTAS ADICIONALES

### **Diferencia de Arquitectura**
- **ReporteVentas/Compras/Inventario**: Ya implementados correctamente ✅
- **ReporteCaja**: Aún usa mock data ❌

### **Por qué solo ReporteCaja está en mock?**
Posiblemente porque:
1. Se implementó como prototipo visual primero
2. El endpoint backend se agregó después
3. Faltó sincronizar frontend con backend

### **Patrón a seguir**
Los otros 3 reportes ya tienen el patrón correcto:
```typescript
// ✅ PATRÓN CORRECTO (usado en Ventas/Compras/Inventario)
const [reporteData, setReporteData] = useState<any>(null);

useEffect(() => {
  handleBuscar();
}, []);

const handleBuscar = async () => {
  const res = await apiService.getReporte___({...});
  setReporteData(res.data);
};
```

Aplicar el mismo patrón a **ReporteCaja** resolverá el problema.

---

## 🚀 RESUMEN EJECUTIVO

| Componente | Estado Actual | Acción Requerida | Prioridad |
|------------|---------------|------------------|-----------|
| **Backend** `/api/reportes/caja` | ✅ Funcional | Ninguna | - |
| **apiService.getReporteCaja()** | ❓ Verificar | Agregar si falta | 🔴 ALTA |
| **ReporteCaja.tsx** | ❌ Mock data | Conectar al backend | 🔴 ALTA |
| **Interfaces TypeScript** | ❌ No existen | Crear en `types/` | 🟡 MEDIA |
| **CSV Export** | ⚠️ Usa mock | Actualizar para usar `reporteData` | 🟡 MEDIA |

**Tiempo estimado total:** 1 hora  
**Archivos a modificar:** 3-4 archivos  
**Complejidad:** Media (seguir patrón existente)

---

## 📚 REFERENCIAS

- Endpoints backend: `alexa-tech-backend/src/modules/reportes/reportes.routes.ts`
- Servicio backend: `alexa-tech-backend/src/modules/reportes/reportes.service.ts`
- Ejemplo funcional: `alexa-tech-react/src/modules/reportes/pages/ReporteVentas.tsx`
- API client: `alexa-tech-react/src/utils/api.ts`

---

**Autor:** GitHub Copilot  
**Fecha:** 2025-11-19  
**Versión:** 1.0  
**Estado:** 📋 Pendiente de implementación

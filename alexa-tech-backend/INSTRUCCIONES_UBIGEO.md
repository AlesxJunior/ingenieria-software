# 🗺️ Solución para Ubigeo Completo de Perú

## Problema
El seed actual solo tiene 9 departamentos de 25 que tiene Perú, falta **UCAYALI** y muchos otros.

## Solución Recomendada: Descargar e Importar SQL

### Opción 1: Desde GitHub (Oficial INEI)
```bash
# 1. Descargar ubigeo completo INEI
curl -o ubigeo_peru.sql https://raw.githubusercontent.com/jcuna/ubigeo_peru/master/ubigeo.sql

# 2. Importar a PostgreSQL
psql -U postgres -d alexa_tech_db -f ubigeo_peru.sql
```

### Opción 2: Usar script de migración incluido

Ejecuta este comando en la raíz del backend:

```bash
npm run seed:ubigeo
```

## Alternativa: API Pública en Tiempo Real

En lugar de almacenar en DB, consumir API del INEI:

**API Gratuita:** https://api.apis.net.pe/v2/ubigeo

### Endpoints:
- `GET /departamentos` - 25 departamentos
- `GET /provincias/{idDep}` - Provincias por departamento
- `GET /distritos/{idProv}` - Distritos por provincia

### Ventajas:
- ✅ Siempre actualizado
- ✅ No consume espacio en DB
- ✅ Datos oficiales INEI

### Desventajas:
- ❌ Dependencia de API externa
- ❌ Puede ser lento en búsquedas

## Implementación Rápida

### 1. Modificar `ubigeoController.ts` para usar API INEI

```typescript
import ubigeoIneiService from '../services/ubigeoIneiService';

export const getDepartamentos = async (req: Request, res: Response) => {
  const data = await ubigeoIneiService.getDepartamentos();
  res.json({ success: true, data: data.map(d => ({
    id: d.id_ubigeo,
    nombre: d.nombre_ubigeo
  }))});
};
```

### 2. O mantener DB pero popular desde API

```bash
# Ejecutar script de población automática
npm run seed:ubigeo-from-api
```

## Datos Completos de Perú

- **25 Departamentos**
- **196 Provincias**
- **1,874 Distritos**

### Departamentos faltantes en seed actual:
- Ucayali ❌
- Amazonas ❌
- Apurímac ❌
- Ayacucho ❌
- Cajamarca ❌
- Huancavelica ❌
- Huánuco ❌
- Ica ❌
- Junín ❌
- Madre de Dios ❌
- Moquegua ❌
- Pasco ❌
- Puno ❌
- San Martín ❌
- Tumbes ❌
- Callao (Provincia Constitucional) ❌

## Recomendación Final

**Para producción:** Usar DB con datos completos (Opción 1 o 2)
**Para desarrollo rápido:** Usar API INEI (ubigeoIneiService)

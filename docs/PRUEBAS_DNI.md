# Pruebas DNI - Autocompletado de Datos Personales

## Objetivo
Verificar que el autocompletado de DNI funciona correctamente en QuickClientModal y RegistroEntidad.

## DNIs de Prueba (Válidos)

Para probar el autocompletado, usaremos DNIs válidos peruanos:

- **43218765** - DNI ejemplo 1
- **12345678** - DNI ejemplo 2
- **87654321** - DNI ejemplo 3
- **72345678** - DNI ejemplo 4

> **Nota:** La API de SUNAT/RENIEC devuelve datos reales solo para DNIs registrados. Si un DNI no existe, la API devolverá error 404.

## Estructura de Respuesta API DNI

```json
{
  "first_name": "JUAN",
  "first_last_name": "PEREZ",
  "second_last_name": "GARCIA",
  "document_number": "12345678"
}
```

## Campos que deben autocompletarse

1. ✅ **Nombres** (`first_name`)
2. ✅ **Apellido Paterno** (`first_last_name`)
3. ✅ **Apellido Materno** (`second_last_name`)
4. ✅ **Número de Documento** (ya ingresado)

## Campos que NO se autocompletan (DNI)

- ❌ **Departamento** - No disponible en API DNI
- ❌ **Provincia** - No disponible en API DNI
- ❌ **Distrito** - No disponible en API DNI
- ❌ **Dirección** - No disponible en API DNI
- ❌ **Teléfono** - No disponible en API DNI
- ❌ **Email** - No disponible en API DNI

> El usuario debe completar manualmente estos campos para DNI.

## Proceso de Prueba

### En QuickClientModal (Realizar Venta)

1. Ir a "Realizar Venta"
2. Hacer clic en "Nuevo Cliente"
3. Seleccionar tipo documento: **DNI**
4. Ingresar número de DNI (8 dígitos)
5. Hacer clic en "Buscar"
6. Verificar que se autocompletan:
   - Campo "Nombres"
   - Campo "Apellidos" (combina paterno + materno)
7. Verificar que los campos de ubigeo estén vacíos (esperado)
8. Completar manualmente: email, teléfono, dirección, ubigeo
9. Guardar cliente

### En RegistroEntidad (Página de Registro)

1. Ir a "Clientes" → "Nuevo Cliente"
2. Seleccionar tipo documento: **DNI**
3. Ingresar número de DNI (8 dígitos)
4. Hacer clic en botón de búsqueda 🔍
5. Verificar que se autocompletan:
   - Campo "Nombres"
   - Campo "Apellido Paterno"
   - Campo "Apellido Materno"
6. Verificar que los campos de ubigeo estén vacíos (esperado)
7. Completar manualmente: email, teléfono, dirección, ubigeo
8. Guardar cliente

## Criterios de Éxito

Para cada DNI probado:
1. ✅ Los nombres se cargan correctamente
2. ✅ Los apellidos se cargan correctamente
3. ✅ No hay errores en consola
4. ✅ Los campos de ubigeo permanecen vacíos (comportamiento esperado)
5. ✅ El usuario puede completar manualmente el resto de campos
6. ✅ Se puede guardar el cliente exitosamente

## Verificación del Código

### QuickClientModal - Campo Apellidos

```tsx
// Debe combinar first_last_name + second_last_name
const apellidosCompletos = `${data.first_last_name} ${data.second_last_name}`.trim();
setApellidos(apellidosCompletos);
```

### RegistroEntidad - Campos Separados

```tsx
// Campos separados para apellido paterno y materno
setFormData(prev => ({
  ...prev,
  nombres: data.first_name,
  apellidoPaterno: data.first_last_name,
  apellidoMaterno: data.second_last_name,
}));
```

## Registro de Pruebas DNI

| DNI | Nombres | Ap. Paterno | Ap. Materno | Status | Notas |
|-----|---------|-------------|-------------|--------|-------|
|  |  |  |  | 🔄 | Pendiente |
|  |  |  |  |  |  |

---

## Posibles Errores y Soluciones

### Error 404 - DNI no encontrado
- **Causa:** El DNI no existe en la base de datos de RENIEC
- **Solución:** Probar con otro DNI válido

### Error de conexión
- **Causa:** API SUNAT/decolecta no disponible
- **Solución:** Verificar token, verificar conectividad

### Campos vacíos después de búsqueda
- **Causa:** Respuesta de API no tiene el formato esperado
- **Solución:** Revisar console.log y verificar mapeo de campos en sunat.service.ts

---

## Siguiente Paso

Después de verificar DNI, continuaremos con:
- **Tarea 8:** Crear cliente completo desde QuickClientModal (RUC + DNI)
- **Tarea 9:** Crear cliente completo desde RegistroEntidad (RUC + DNI)
- **Tarea 10:** Verificación final end-to-end

# Plan de Pruebas - Autocompletado RUC + Ubigeo

## Objetivo
Verificar que el autocompletado de ubigeo funciona correctamente con RUCs de diferentes departamentos del Perú.

## RUCs de Prueba (Diferentes Departamentos)

### LIMA
- **20601918471** - Empresa en Lima (Miraflores/San Isidro típico)
- **20131312955** - Supermercados Peruanos (Lima)

### UCAYALI
- **20601233488** - Empresa en Yarinacocha ✅ (Ya probado - funciona)

### SAN MARTÍN
- **20404097343** - Empresa en Tarapoto (recién probado)
- **20493912451** - Otra empresa San Martín

### AREQUIPA
- **20498912471** - Empresa en Arequipa
- **20100113612** - Southern Peru (Arequipa)

### CUSCO
- **20401030013** - Empresa en Cusco

### PIURA
- **20526471751** - Empresa en Piura

### LA LIBERTAD (Trujillo)
- **20482065501** - Empresa en Trujillo

### LAMBAYEQUE (Chiclayo)
- **20493546858** - Empresa en Chiclayo

### ICA
- **20519597086** - Empresa en Ica

### JUNÍN
- **20487471521** - Empresa en Huancayo

## Criterios de Éxito

Para cada RUC probado:
1. ✅ **Departamento** se autocompleta correctamente
2. ✅ **Provincia** se autocompleta correctamente  
3. ✅ **Distrito** se autocompleta correctamente
4. ✅ Los datos de razón social, dirección se cargan
5. ✅ No hay errores en consola del navegador

## Proceso de Prueba

1. Abrir QuickClientModal en "Realizar Venta"
2. Seleccionar tipo documento: RUC
3. Ingresar número de RUC
4. Hacer clic en "Buscar"
5. Verificar:
   - Razón social cargada
   - Dirección cargada
   - Departamento seleccionado
   - Provincia seleccionada
   - Distrito seleccionado
6. Revisar console.log para ver el flujo completo

## Notas

- Si un distrito específico NO está en la BD (solo tenemos capitales provinciales), el autocompletado seleccionará departamento + provincia pero NO distrito
- Esto es esperado y correcto
- LIMA tiene 43 distritos completos
- UCAYALI tiene 10 distritos completos
- SAN MARTÍN tiene 77 distritos completos
- Otras provincias solo tienen capitales

## Registro de Pruebas

| RUC | Departamento | Provincia | Distrito | Status | Notas |
|-----|--------------|-----------|----------|--------|-------|
| 20601233488 | UCAYALI | CORONEL PORTILLO | YARINACOCHA | ✅ | Confirmado funciona |
| 20404097343 | SAN MARTIN | SAN MARTÍN | TARAPOTO | 🔄 | En prueba |
|  |  |  |  |  |  |

---

## Siguiente Fase: Pruebas DNI

Después de verificar RUCs, probaremos con DNIs:
- DNI válido peruano (8 dígitos)
- Debe autocompletar: Nombres, Apellido Paterno, Apellido Materno
- NO autocompleta ubigeo (API DNI no devuelve ubicación)

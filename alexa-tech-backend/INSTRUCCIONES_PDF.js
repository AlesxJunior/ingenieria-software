/**
 * Script simple para probar PDF con curl
 */

console.log(`
================================================================================
INSTRUCCIONES PARA PROBAR GENERACIÓN DE PDFs
================================================================================

1. Primero, obtén un token de autenticación:

curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d "{\\"email\\": \\"admin@alexatech.com\\", \\"password\\": \\"admin123\\"}"

Copia el "accessToken" de la respuesta.

2. Obtén una caja registradora:

curl -X GET "http://localhost:3001/api/cash-registers?limit=1" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"

Copia el "id" de la primera caja.

3. Obtén un cliente:

curl -X GET "http://localhost:3001/api/entidades?tipo=Cliente&limit=1" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"

Copia el "id" del primer cliente.

4. Obtén un producto:

curl -X GET "http://localhost:3001/api/products?limit=1" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"

Copia el "id" del primer producto.

5. Obtén un almacén:

curl -X GET "http://localhost:3001/api/warehouses?limit=1" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"

Copia el "id" del primer almacén.

6. Abre una sesión de caja:

curl -X POST http://localhost:3001/api/cash-sessions/open \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d "{\\"cashRegisterId\\": \\"ID_CAJA_AQUI\\", \\"montoApertura\\": 500}"

Copia el "id" de la sesión creada.

7. Crea una venta:

curl -X POST http://localhost:3001/api/sales \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"tipoComprobante\\": \\"Factura\\",
    \\"formaPago\\": \\"Efectivo\\",
    \\"clienteId\\": \\"ID_CLIENTE_AQUI\\",
    \\"almacenId\\": \\"ID_ALMACEN_AQUI\\",
    \\"cashSessionId\\": \\"ID_SESION_AQUI\\",
    \\"items\\": [{
      \\"productId\\": \\"ID_PRODUCTO_AQUI\\",
      \\"cantidad\\": 2,
      \\"precioUnitario\\": 150
    }]
  }"

Copia el "id" de la venta creada.

8. Completa la venta:

curl -X PATCH "http://localhost:3001/api/sales/ID_VENTA_AQUI/status" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d "{\\"estado\\": \\"Completada\\"}"

9. GENERA EL PDF (descarga):

curl -X GET "http://localhost:3001/api/sales/ID_VENTA_AQUI/invoice/download" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  --output factura.pdf

10. O PREVISUALIZA en el navegador:

Abre en tu navegador (con el token en la URL):
http://localhost:3001/api/sales/ID_VENTA_AQUI/invoice/preview

(Añade el header Authorization manualmente o usa una extensión como ModHeader)

================================================================================
`);

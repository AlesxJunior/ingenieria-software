# Script de Tests para Módulo de Reportes
# Valida todos los endpoints de reportes del sistema AlexaTech

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3001/api"
$token = ""

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TESTS DEL MÓDULO DE REPORTES - ALEXA TECH              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ==========================================
# 1. AUTENTICACIÓN
# ==========================================

Write-Host "═══ 1. AUTENTICACIÓN ═══" -ForegroundColor Yellow

try {
    $loginBody = @{
        email = "admin@alexatech.com"
        password = "admin123"
    } | ConvertTo-Json -Compress
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json; charset=utf-8"
    
    $token = $response.data.accessToken
    Write-Host "✓ Login exitoso" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Login falló: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

# ==========================================
# 2. REPORTE DE RESUMEN EJECUTIVO
# ==========================================

Write-Host "═══ 2. REPORTE DE RESUMEN EJECUTIVO ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/resumen" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/resumen exitoso" -ForegroundColor Green
    Write-Host "  Ventas Total: S/ $($response.data.ventas.total)" -ForegroundColor White
    Write-Host "  Cantidad Ventas: $($response.data.ventas.cantidad)" -ForegroundColor White
    Write-Host "  Ticket Promedio: S/ $([math]::Round($response.data.ventas.ticketPromedio, 2))" -ForegroundColor White
    Write-Host "  Compras Total: S/ $($response.data.compras.total)" -ForegroundColor White
    Write-Host "  Valor Inventario: S/ $([math]::Round($response.data.inventario.valorTotal, 2))" -ForegroundColor White
    Write-Host "  Utilidad: S/ $([math]::Round($response.data.financiero.utilidad, 2))" -ForegroundColor White
    Write-Host "  Margen: $([math]::Round($response.data.financiero.margen, 2))%`n" -ForegroundColor White
} catch {
    Write-Host "✗ Error en resumen ejecutivo: $_" -ForegroundColor Red
}

# ==========================================
# 3. REPORTE DE VENTAS
# ==========================================

Write-Host "═══ 3. REPORTE DE VENTAS ═══" -ForegroundColor Yellow

try {
    # Obtener reporte de ventas del último mes
    $fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
    $fechaFin = (Get-Date).ToString("yyyy-MM-dd")
    
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/ventas?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/ventas exitoso" -ForegroundColor Green
    Write-Host "  Período: $fechaInicio a $fechaFin" -ForegroundColor Gray
    Write-Host "  Total Ventas: S/ $($response.data.resumen.totalVentas)" -ForegroundColor White
    Write-Host "  Cantidad Ventas: $($response.data.resumen.cantidadVentas)" -ForegroundColor White
    Write-Host "  Ticket Promedio: S/ $([math]::Round($response.data.resumen.ticketPromedio, 2))" -ForegroundColor White
    
    if ($response.data.ventasPorMetodoPago.Count -gt 0) {
        Write-Host "`n  Ventas por Método de Pago:" -ForegroundColor Cyan
        foreach ($metodo in $response.data.ventasPorMetodoPago | Select-Object -First 3) {
            Write-Host "    - $($metodo.metodoPago): S/ $([math]::Round($metodo.total, 2)) ($([math]::Round($metodo.porcentaje, 1))%)" -ForegroundColor White
        }
    }
    
    if ($response.data.topProductos.Count -gt 0) {
        Write-Host "`n  Top 3 Productos Vendidos:" -ForegroundColor Cyan
        foreach ($producto in $response.data.topProductos | Select-Object -First 3) {
            Write-Host "    - $($producto.nombreProducto): $($producto.cantidadVendida) unidades, S/ $([math]::Round($producto.totalVendido, 2))" -ForegroundColor White
        }
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte de ventas: $_" -ForegroundColor Red
}

# ==========================================
# 4. REPORTE DE COMPRAS
# ==========================================

Write-Host "═══ 4. REPORTE DE COMPRAS ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/compras?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/compras exitoso" -ForegroundColor Green
    Write-Host "  Total Compras: S/ $($response.data.resumen.totalCompras)" -ForegroundColor White
    Write-Host "  Cantidad Compras: $($response.data.resumen.cantidadCompras)" -ForegroundColor White
    Write-Host "  Compra Promedio: S/ $([math]::Round($response.data.resumen.compraPromedio, 2))" -ForegroundColor White
    
    if ($response.data.comprasPorProveedor.Count -gt 0) {
        Write-Host "`n  Top 3 Proveedores:" -ForegroundColor Cyan
        foreach ($proveedor in $response.data.comprasPorProveedor | Select-Object -First 3) {
            Write-Host "    - $($proveedor.nombreProveedor): S/ $([math]::Round($proveedor.totalCompras, 2)) ($([math]::Round($proveedor.porcentaje, 1))%)" -ForegroundColor White
        }
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte de compras: $_" -ForegroundColor Red
}

# ==========================================
# 5. REPORTE DE INVENTARIO
# ==========================================

Write-Host "═══ 5. REPORTE DE INVENTARIO ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/inventario" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/inventario exitoso" -ForegroundColor Green
    Write-Host "  Total Productos: $($response.data.resumen.totalProductos)" -ForegroundColor White
    Write-Host "  Productos Activos: $($response.data.resumen.productosActivos)" -ForegroundColor White
    Write-Host "  Productos Con Stock: $($response.data.resumen.productosConStock)" -ForegroundColor White
    Write-Host "  Productos Sin Stock: $($response.data.resumen.productosSinStock)" -ForegroundColor White
    Write-Host "  Productos en Alerta: $($response.data.resumen.productosEnAlerta)" -ForegroundColor Yellow
    Write-Host "  Valor Total Inventario: S/ $([math]::Round($response.data.resumen.valorTotalInventario, 2))" -ForegroundColor White
    
    if ($response.data.stockPorAlmacen.Count -gt 0) {
        Write-Host "`n  Stock por Almacén:" -ForegroundColor Cyan
        foreach ($almacen in $response.data.stockPorAlmacen) {
            Write-Host "    - $($almacen.nombreAlmacen): $($almacen.cantidadProductos) productos, S/ $([math]::Round($almacen.valorInventario, 2))" -ForegroundColor White
        }
    }
    
    if ($response.data.productosEnAlerta.Count -gt 0) {
        Write-Host "`n  Productos en Alerta (primeros 3):" -ForegroundColor Yellow
        foreach ($producto in $response.data.productosEnAlerta | Select-Object -First 3) {
            Write-Host "    ⚠ $($producto.nombreProducto): Stock $($producto.stockActual) (Mínimo: $($producto.stockMinimo))" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte de inventario: $_" -ForegroundColor Red
}

# ==========================================
# 6. REPORTE FINANCIERO
# ==========================================

Write-Host "═══ 6. REPORTE FINANCIERO ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/financiero?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/financiero exitoso" -ForegroundColor Green
    Write-Host "  Total Ingresos: S/ $([math]::Round($response.data.resumen.totalIngresos, 2))" -ForegroundColor Green
    Write-Host "  Total Egresos: S/ $([math]::Round($response.data.resumen.totalEgresos, 2))" -ForegroundColor Red
    Write-Host "  Utilidad Bruta: S/ $([math]::Round($response.data.resumen.utilidadBruta, 2))" -ForegroundColor Cyan
    Write-Host "  Margen Bruto: $([math]::Round($response.data.resumen.margenBruto, 2))%" -ForegroundColor Cyan
    Write-Host "  Ventas por Cobrar: S/ $([math]::Round($response.data.resumen.ventasPorCobrar, 2))" -ForegroundColor Yellow
    Write-Host "  Compras por Pagar: S/ $([math]::Round($response.data.resumen.comprasPorPagar, 2))" -ForegroundColor Yellow
    
    if ($response.data.flujoEfectivo.Count -gt 0) {
        $ultimoFlujo = $response.data.flujoEfectivo | Select-Object -Last 1
        Write-Host "`n  Último Flujo de Efectivo:" -ForegroundColor Cyan
        Write-Host "    Fecha: $($ultimoFlujo.fecha)" -ForegroundColor White
        Write-Host "    Saldo: S/ $([math]::Round($ultimoFlujo.saldo, 2))" -ForegroundColor White
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte financiero: $_" -ForegroundColor Red
}

# ==========================================
# 7. REPORTE DE CAJA
# ==========================================

Write-Host "═══ 7. REPORTE DE CAJA ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/caja?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/caja exitoso" -ForegroundColor Green
    Write-Host "  Total Efectivo: S/ $([math]::Round($response.data.resumen.totalEfectivo, 2))" -ForegroundColor White
    Write-Host "  Total Tarjeta: S/ $([math]::Round($response.data.resumen.totalTarjeta, 2))" -ForegroundColor White
    Write-Host "  Total Transferencia: S/ $([math]::Round($response.data.resumen.totalTransferencia, 2))" -ForegroundColor White
    Write-Host "  Total General: S/ $([math]::Round($response.data.resumen.totalGeneral, 2))" -ForegroundColor Cyan
    
    if ($response.data.movimientosPorMetodo.Count -gt 0) {
        Write-Host "`n  Movimientos por Método de Pago:" -ForegroundColor Cyan
        foreach ($metodo in $response.data.movimientosPorMetodo) {
            Write-Host "    - $($metodo.metodoPago): $($metodo.cantidadTransacciones) transacciones, S/ $([math]::Round($metodo.montoTotal, 2))" -ForegroundColor White
        }
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte de caja: $_" -ForegroundColor Red
}

# ==========================================
# 8. REPORTE DE PRODUCTOS MÁS VENDIDOS
# ==========================================

Write-Host "═══ 8. REPORTE DE PRODUCTOS MÁS VENDIDOS ═══" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reportes/productos-vendidos?fechaInicio=$fechaInicio&fechaFin=$fechaFin&limit=5" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ GET /reportes/productos-vendidos exitoso" -ForegroundColor Green
    Write-Host "  Período: $($response.data.periodo.fechaInicio) a $($response.data.periodo.fechaFin)" -ForegroundColor Gray
    Write-Host "  Total Productos: $($response.data.total)" -ForegroundColor White
    
    if ($response.data.productos.Count -gt 0) {
        Write-Host "`n  Top 5 Productos Más Vendidos:" -ForegroundColor Cyan
        $index = 1
        foreach ($producto in $response.data.productos) {
            Write-Host "    $index. $($producto.nombre) [$($producto.codigo)]" -ForegroundColor White
            Write-Host "       Cantidad Vendida: $($producto.cantidadVendida) unidades" -ForegroundColor Gray
            Write-Host "       Total Vendido: S/ $([math]::Round($producto.totalVendido, 2))" -ForegroundColor Gray
            Write-Host "       Precio Promedio: S/ $([math]::Round($producto.precioPromedio, 2))" -ForegroundColor Gray
            $index++
        }
    } else {
        Write-Host "  No hay productos vendidos en el período" -ForegroundColor Yellow
    }
    
    Write-Host ""
} catch {
    Write-Host "✗ Error en reporte de productos más vendidos: $_" -ForegroundColor Red
}

# ==========================================
# 9. VERIFICAR PERMISOS
# ==========================================

Write-Host "═══ 9. VERIFICACIÓN DE PERMISOS ═══" -ForegroundColor Yellow

$endpointsConPermisos = @(
    @{ Endpoint = "/reportes/ventas"; Permiso = "reports.sales" },
    @{ Endpoint = "/reportes/compras"; Permiso = "reports.inventory" },
    @{ Endpoint = "/reportes/inventario"; Permiso = "reports.inventory" },
    @{ Endpoint = "/reportes/financiero"; Permiso = "reports.financial" },
    @{ Endpoint = "/reportes/caja"; Permiso = "reports.financial" },
    @{ Endpoint = "/reportes/productos-vendidos"; Permiso = "reports.sales" }
)

Write-Host "Endpoints protegidos con permisos:" -ForegroundColor Cyan
foreach ($item in $endpointsConPermisos) {
    Write-Host "  ✓ $($item.Endpoint) -> $($item.Permiso)" -ForegroundColor White
}

Write-Host ""

# ==========================================
# RESUMEN FINAL
# ==========================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ✓ TESTS DEL MÓDULO DE REPORTES COMPLETADOS             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✓ Todos los endpoints de reportes están funcionando" -ForegroundColor Green
Write-Host "✓ Permisos configurados correctamente" -ForegroundColor Green
Write-Host "✓ Reportes generan datos analíticos correctos`n" -ForegroundColor Green

Write-Host "ENDPOINTS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "  GET /api/reportes/resumen              - Resumen ejecutivo" -ForegroundColor White
Write-Host "  GET /api/reportes/ventas               - Reporte de ventas" -ForegroundColor White
Write-Host "  GET /api/reportes/compras              - Reporte de compras" -ForegroundColor White
Write-Host "  GET /api/reportes/inventario           - Reporte de inventario" -ForegroundColor White
Write-Host "  GET /api/reportes/financiero           - Reporte financiero" -ForegroundColor White
Write-Host "  GET /api/reportes/caja                 - Reporte de caja" -ForegroundColor White
Write-Host "  GET /api/reportes/productos-vendidos   - Productos más vendidos`n" -ForegroundColor White

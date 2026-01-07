# Test UTF-8 en Módulo de Configuración
# Verifica que las tildes se guarden correctamente

$baseUrl = "http://localhost:3001/api"
$token = ""

Write-Host "`n═══ TEST DE CODIFICACIÓN UTF-8 ═══`n" -ForegroundColor Cyan

# 1. Login
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
} catch {
    Write-Host "✗ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Obtener empresa actual
try {
    $empresa = Invoke-RestMethod -Uri "$baseUrl/configuracion/empresa" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    Write-Host "`nDatos de la empresa:" -ForegroundColor Yellow
    Write-Host "  País: $($empresa.data.pais)" -ForegroundColor White
    Write-Host "  Razón Social: $($empresa.data.razonSocial)" -ForegroundColor White
    
    # Verificar que el país contenga 'Perú' correctamente
    if ($empresa.data.pais -eq "Perú") {
        Write-Host "`n✓ UTF-8 CORRECTO: El país 'Perú' se guardó con tilde" -ForegroundColor Green
    } else {
        Write-Host "`n✗ UTF-8 INCORRECTO: País guardado como '$($empresa.data.pais)'" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error obteniendo empresa: $_" -ForegroundColor Red
}

# 3. Listar comprobantes y verificar tildes
try {
    $comprobantes = Invoke-RestMethod -Uri "$baseUrl/configuracion/comprobantes" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    Write-Host "`nComprobantes encontrados:" -ForegroundColor Yellow
    foreach ($comp in $comprobantes.data) {
        Write-Host "  - $($comp.nombre)" -ForegroundColor White
        
        # Verificar nombres con tildes
        if ($comp.nombre -like "*Electrónica*") {
            Write-Host "    ✓ Contiene 'Electrónica' con tilde" -ForegroundColor Green
        }
        if ($comp.nombre -like "*Crédito*") {
            Write-Host "    ✓ Contiene 'Crédito' con tilde" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "✗ Error listando comprobantes: $_" -ForegroundColor Red
}

# 4. Listar métodos de pago
try {
    $metodos = Invoke-RestMethod -Uri "$baseUrl/configuracion/metodos-pago" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
        }
    
    Write-Host "`nMétodos de pago encontrados:" -ForegroundColor Yellow
    foreach ($metodo in $metodos.data) {
        Write-Host "  - $($metodo.nombre)" -ForegroundColor White
        
        if ($metodo.nombre -like "*Crédito*" -or $metodo.nombre -like "*Débito*") {
            Write-Host "    ✓ Contiene tildes correctas" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "✗ Error listando métodos de pago: $_" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════`n" -ForegroundColor Cyan

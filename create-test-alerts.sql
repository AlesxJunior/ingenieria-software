-- Script para crear productos con alertas de stock
-- Ejecutar en la base de datos para probar el AlertasBadge

-- 1. Crear productos de prueba con stock bajo
INSERT INTO "Product" (id, codigo, nombre, descripcion, precio, costo, categoria_id, marca_id, unidad_id, estado, "trackInventory", created_at, updated_at, "stockMinimo")
VALUES 
  (gen_random_uuid(), 'TEST-CRIT-001', 'Producto Crítico Test', 'Para pruebas de alerta crítica', 100.00, 50.00, 
   (SELECT id FROM "Category" LIMIT 1), 
   (SELECT id FROM "Brand" LIMIT 1), 
   (SELECT id FROM "Unit" LIMIT 1), 
   true, true, NOW(), NOW(), 100),
  
  (gen_random_uuid(), 'TEST-BAJO-001', 'Producto Bajo Test', 'Para pruebas de alerta baja', 150.00, 75.00, 
   (SELECT id FROM "Category" LIMIT 1), 
   (SELECT id FROM "Brand" LIMIT 1), 
   (SELECT id FROM "Unit" LIMIT 1), 
   true, true, NOW(), NOW(), 50),
   
  (gen_random_uuid(), 'TEST-NORM-001', 'Producto Normal Test', 'Stock normal sin alertas', 200.00, 100.00, 
   (SELECT id FROM "Category" LIMIT 1), 
   (SELECT id FROM "Brand" LIMIT 1), 
   (SELECT id FROM "Unit" LIMIT 1), 
   true, true, NOW(), NOW(), 20);

-- 2. Crear stock para estos productos
-- Producto CRÍTICO: 40 unidades (40% del mínimo de 100) → CRÍTICO
INSERT INTO "StockByWarehouse" (id, "productId", "warehouseId", quantity, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  w.id,
  40,
  NOW(),
  NOW()
FROM "Product" p
CROSS JOIN "Warehouse" w
WHERE p.codigo = 'TEST-CRIT-001'
LIMIT 1;

-- Producto BAJO: 30 unidades (60% del mínimo de 50) → BAJO
INSERT INTO "StockByWarehouse" (id, "productId", "warehouseId", quantity, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  w.id,
  30,
  NOW(),
  NOW()
FROM "Product" p
CROSS JOIN "Warehouse" w
WHERE p.codigo = 'TEST-BAJO-001'
LIMIT 1;

-- Producto NORMAL: 25 unidades (125% del mínimo de 20) → NORMAL (no alerta)
INSERT INTO "StockByWarehouse" (id, "productId", "warehouseId", quantity, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  w.id,
  25,
  NOW(),
  NOW()
FROM "Product" p
CROSS JOIN "Warehouse" w
WHERE p.codigo = 'TEST-NORM-001'
LIMIT 1;

-- Verificación
SELECT 
  p.codigo,
  p.nombre,
  p."stockMinimo" as min_stock,
  s.quantity as stock_actual,
  ROUND((s.quantity::numeric / NULLIF(p."stockMinimo", 0)) * 100, 2) as porcentaje,
  CASE
    WHEN s.quantity <= (p."stockMinimo" * 0.5) THEN 'CRÍTICO 🔴'
    WHEN s.quantity < p."stockMinimo" THEN 'BAJO 🟡'
    ELSE 'NORMAL ✅'
  END as estado
FROM "Product" p
JOIN "StockByWarehouse" s ON p.id = s."productId"
WHERE p.codigo LIKE 'TEST-%'
ORDER BY estado DESC;

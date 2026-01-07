-- ============================================
-- SCRIPT: Agregar constraint de stock positivo
-- Fecha: 2025-12-09
-- Propósito: Prevenir stock negativo a nivel de BD
-- ============================================

-- PASO 1: Verificar si hay registros con cantidad negativa
-- (ejecutar primero para detectar problemas)
SELECT 
  sbw.id,
  p.codigo,
  p.nombre,
  w.nombre as almacen,
  sbw.cantidad
FROM stock_by_warehouse sbw
JOIN products p ON p.id = sbw."productId"
JOIN warehouses w ON w.id = sbw."warehouseId"
WHERE sbw.cantidad < 0;

-- Si hay registros negativos, corregirlos antes de continuar:
-- UPDATE stock_by_warehouse SET cantidad = 0 WHERE cantidad < 0;

-- PASO 2: Agregar constraint CHECK
ALTER TABLE stock_by_warehouse 
ADD CONSTRAINT check_positive_quantity 
CHECK (cantidad >= 0);

-- PASO 3: Verificar que el constraint fue creado
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'stock_by_warehouse'::regclass
  AND conname = 'check_positive_quantity';

-- ============================================
-- NOTAS:
-- 1. El constraint rechazará cualquier INSERT/UPDATE con cantidad < 0
-- 2. Los errores de BD serán: "new row violates check constraint"
-- 3. La validación en backend (inventoryService.ts) es la primera línea de defensa
-- 4. Este constraint es la última línea de defensa a nivel de datos
-- ============================================

-- Migración manual: Actualizar órdenes con estado CERRADA a COMPLETADA
-- Ejecutar ANTES de aplicar la migración que elimina CERRADA del enum

-- 1. Actualizar todas las órdenes de compra con estado CERRADA a COMPLETADA
UPDATE "PurchaseOrder"
SET estado = 'COMPLETADA'
WHERE estado = 'CERRADA';

-- 2. Verificar que no queden órdenes con estado CERRADA
-- SELECT COUNT(*) FROM "PurchaseOrder" WHERE estado = 'CERRADA';
-- El resultado debe ser 0

-- Nota: Después de ejecutar este script, aplicar la migración de Prisma
-- que elimina CERRADA del enum PurchaseOrderStatus

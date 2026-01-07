-- Eliminar registro de migración fallida de la tabla _prisma_migrations
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251109063409_add_payment_tracking_and_status';

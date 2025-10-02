-- Eliminar la columna role de la tabla users
ALTER TABLE users DROP COLUMN role;

-- Eliminar el tipo enum UserRole
DROP TYPE "UserRole";
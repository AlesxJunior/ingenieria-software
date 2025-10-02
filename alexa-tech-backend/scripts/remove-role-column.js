const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function removeRoleColumn() {
  try {
    console.log('Eliminando columna role...');
    
    // Eliminar la columna role
    await prisma.$executeRaw`ALTER TABLE users DROP COLUMN role`;
    console.log('Columna role eliminada exitosamente');
    
    // Eliminar el tipo enum UserRole
    await prisma.$executeRaw`DROP TYPE "UserRole"`;
    console.log('Tipo enum UserRole eliminado exitosamente');
    
    console.log('Migración completada');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeRoleColumn();
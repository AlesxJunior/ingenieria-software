const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log('users count', count);
  } catch (e) {
    console.error('Error checking users count:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
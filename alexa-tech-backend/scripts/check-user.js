const { PrismaClient } = require('@prisma/client');
const email = process.argv[2];

(async () => {
  if (!email) {
    console.error('Provide an email: node scripts/check-user.js <email>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user ? { email: user.email, username: user.username, isActive: user.isActive, permissions: user.permissions, createdAt: user.createdAt } : null);
  } catch (e) {
    console.error('Error fetching user:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
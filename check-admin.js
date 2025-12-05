const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'admin' }
    });
    
    if (user) {
      console.log('✅ Usuario admin encontrado:');
      console.log('   Username:', user.username);
      console.log('   Email:', user.email);
      console.log('   ID:', user.id);
    } else {
      console.log('❌ Usuario admin NO encontrado');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

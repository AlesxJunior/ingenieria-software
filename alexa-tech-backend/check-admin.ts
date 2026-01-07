import { prisma } from './src/config/database';

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'admin' }
    });
    
    if (user) {
      console.log('✓ Usuario encontrado:', user.username);
      console.log('  Email:', user.email);
      console.log('  Activo:', user.isActive);
    } else {
      console.log('✗ Usuario admin no existe');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkUser();

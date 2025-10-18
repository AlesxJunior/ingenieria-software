// Ejecuta las pruebas integrales de Usuarios, Entidades y Productos en secuencia
// Uso: npm run test:all

const { spawn } = require('child_process');
const path = require('path');

const backendDir = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      shell: true,
      stdio: 'inherit',
      cwd: backendDir,
      env: { ...process.env, ...env },
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  console.log('🔗 API_BASE_URL:', baseUrl);
  console.log('🚀 Ejecutando pruebas integrales (users, clients, productos)...');
  await run('npm', ['run', 'test:users'], { API_BASE_URL: baseUrl });
  await run('npm', ['run', 'test:clients'], { API_BASE_URL: baseUrl });
  await run('npm', ['run', 'test:productos'], { API_BASE_URL: baseUrl });
  console.log('🎉 Todas las pruebas completadas exitosamente');
}

main().catch((err) => {
  console.error('❌ Error ejecutando pruebas:', err.message);
  process.exit(1);
});
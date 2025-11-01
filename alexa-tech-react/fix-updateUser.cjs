const fs = require('fs');

const file = 'src/components/__tests__/ProtectedRoute.test.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ahora voy a usar un enfoque de encontrar y reemplazar cada mockReturnValue completo
// Buscar todos los mockReturnValue que NO tienen updateUser

// Patrón: buscar mockReturnValue({ ... login: vi.fn(), logout: vi.fn() }); SIN updateUser después
let lines = content.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
  // Si encontramos una línea con logout: vi.fn() sin coma al final
  if (lines[i].trim() === 'logout: vi.fn()') {
    // Verificar que la siguiente línea sea cierre de bloque
    if (i + 1 < lines.length && lines[i + 1].trim().startsWith('}')) {
      // Añadir coma y updateUser
      lines[i] = lines[i] + ',';
      // Insertar updateUser en la siguiente línea (antes del cierre)
      const indent = lines[i].match(/^(\s*)/)[0];
      lines.splice(i + 1, 0, indent + 'updateUser: vi.fn()');
      modified = true;
    }
  }
}

if (modified) {
  content = lines.join('\n');
  fs.writeFileSync(file, content);
  console.log('✅ Archivo actualizado correctamente');
} else {
  console.log('⚠️  No se encontraron cambios necesarios');
}

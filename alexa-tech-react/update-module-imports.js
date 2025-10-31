/**
 * Script para actualizar imports en los módulos del frontend
 * Convierte paths relativos al src/ a paths desde modules/
 */

const fs = require('fs');
const path = require('path');

// Mapeo de paths comunes que necesitan ser actualizados
const importReplacements = [
  // Recursos compartidos (3 niveles arriba desde modules/[module]/pages/)
  { from: "from '../components/Layout'", to: "from '../../../components/Layout'" },
  { from: "from '../components/LoadingSpinner'", to: "from '../../../components/LoadingSpinner'" },
  { from: "from '../components/Modal'", to: "from '../../../components/Modal'" },
  { from: "from '../context/AuthContext'", to: "from '../../auth/context/AuthContext'" },
  { from: "from '../context/NotificationContext'", to: "from '../../../context/NotificationContext'" },
  { from: "from '../context/ModalContext'", to: "from '../../../context/ModalContext'" },
  { from: "from '../context/UIContext'", to: "from '../../../context/UIContext'" },
  { from: "from '../utils/", to: "from '../../../utils/" },
  { from: "from '../constants/", to: "from '../../../constants/" },
  { from: "from '../styles/", to: "from '../../../styles/" },
  { from: "from '../types/", to: "from '../../../types/" },
  { from: "from '../hooks/useAuth'", to: "from '../hooks/useAuth'" }, // Ya está en el módulo
];

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    importReplacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error en ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  let filesUpdated = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      filesUpdated += processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (updateImportsInFile(fullPath)) {
        filesUpdated++;
      }
    }
  });
  
  return filesUpdated;
}

// Ejecutar
const modulesDir = path.join(__dirname, '..', 'src', 'modules');
console.log('🔄 Actualizando imports en módulos del frontend...\n');

const totalUpdated = processDirectory(modulesDir);

console.log(`\n✨ Proceso completado: ${totalUpdated} archivos actualizados`);

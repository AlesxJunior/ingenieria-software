import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider, useModal } from './context/ModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import { InventoryProvider } from './context/InventoryContext';

// Lazy loading de páginas
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GestionCaja = lazy(() => import('./pages/GestionCaja'));
const ListaEntidades = lazy(() => import('./pages/ListaEntidades'));
const ListaProductos = lazy(() => import('./pages/ListaProductos'));
const EditarProducto = lazy(() => import('./pages/EditarProducto'));
const EditarEntidad = lazy(() => import('./pages/EditarEntidad'));
const RegistroEntidad = lazy(() => import('./pages/RegistroEntidad'));
const AperturaCaja = lazy(() => import('./pages/AperturaCaja'));
const RealizarVenta = lazy(() => import('./pages/RealizarVenta'));
const ListaVentas = lazy(() => import('./pages/ListaVentas'));
const ListaUsuarios = lazy(() => import('./pages/ListaUsuarios'));
const CrearUsuario = lazy(() => import('./pages/CrearUsuario'));
const EditarUsuario = lazy(() => import('./pages/EditarUsuario'));
const PerfilUsuario = lazy(() => import('./pages/PerfilUsuario'));
const AuditoriaLogs = lazy(() => import('./pages/AuditoriaLogs'));
const ListaCompras = lazy(() => import('./pages/ListaCompras'));
const ListadoStock = lazy(() => import('./pages/Inventario/ListadoStock'));
const Kardex = lazy(() => import('./pages/Inventario/Kardex'));

// Componente interno para manejar el modal
const AppContent = () => {
  const { isModalOpen, modalContent, modalTitle, modalSize, closeModal } = useModal();
  
  return (
    <>
      <GlobalStyles />
      <NotificationContainer />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        size={modalSize}
      >
        {modalContent}
      </Modal>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <ModalProvider>
            <InventoryProvider>
              <Router>
                <AppContent />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute requiredPermission="dashboard.read">
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/gestion-caja" 
                    element={
                      <ProtectedRoute requiredPermission="configuration.read">
                        <GestionCaja />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lista-entidades" 
                    element={
                      <ProtectedRoute requiredPermission="commercial_entities.read">
                        <ListaEntidades />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/lista-productos" element={
                    <ProtectedRoute requiredPermission="products.read">
                      <ListaProductos />
                    </ProtectedRoute>
                  } />
                  <Route path="/editar-producto/:id" element={
                    <ProtectedRoute requiredPermission="products.update">
                      <EditarProducto />
                    </ProtectedRoute>
                  } />
                  <Route path="/editar-entidad/:id" element={
                    <ProtectedRoute requiredPermission="commercial_entities.update">
                      <EditarEntidad />
                    </ProtectedRoute>
                  } />
                  <Route path="/registrar-entidad" element={
                    <ProtectedRoute requiredPermission="commercial_entities.create">
                      <RegistroEntidad />
                    </ProtectedRoute>
                  } />
                  <Route path="/ventas/apertura-caja" element={
                    <ProtectedRoute requiredPermission="sales.create">
                      <AperturaCaja />
                    </ProtectedRoute>
                  } />
                  <Route path="/ventas/realizar" element={
                      <ProtectedRoute requiredPermission="sales.create">
                        <RealizarVenta />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/lista" element={
                      <ProtectedRoute requiredPermission="sales.read">
                        <ListaVentas />
                      </ProtectedRoute>
                    } />
                    <Route path="/usuarios" element={
                        <ProtectedRoute requiredPermission="users.read">
                          <ListaUsuarios />
                        </ProtectedRoute>
                      } />
                      <Route path="/usuarios/crear" element={
                    <ProtectedRoute requiredPermission="users.create">
                      <CrearUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/usuarios/editar/:id" element={
                    <ProtectedRoute requiredPermission="users.update">
                      <EditarUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <PerfilUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria" element={
                    <ProtectedRoute requiredPermission="reports.users">
                      <AuditoriaLogs />
                    </ProtectedRoute>
                  } />
                  {/* Aquí se pueden agregar más rutas según se vayan migrando las páginas */}
                  <Route path="/compras" element={
                    <ProtectedRoute requiredPermission="purchases.read">
                      <ListaCompras />
                    </ProtectedRoute>
                  } />

                  <Route path="/inventario/stock" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <ListadoStock />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario/kardex" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <Kardex />
                    </ProtectedRoute>
                  } />
                </Routes>
                </Suspense>
              </Router>
            </InventoryProvider>
          </ModalProvider>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

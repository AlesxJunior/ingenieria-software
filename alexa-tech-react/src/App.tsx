import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider, useModal } from './context/ModalContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import { InventoryProvider } from './modules/inventory/context/InventoryContext';

// Lazy loading de páginas desde módulos
const Login = lazy(() => import('./modules/auth/pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GestionCaja = lazy(() => import('./modules/sales/pages/GestionCaja'));
const ListaEntidades = lazy(() => import('./modules/clients/pages/ListaEntidades'));
const ListaProductos = lazy(() => import('./modules/products/pages/ListaProductos'));
const EditarProducto = lazy(() => import('./modules/products/pages/EditarProducto'));
const EditarEntidad = lazy(() => import('./modules/clients/pages/EditarEntidad'));
const RegistroEntidad = lazy(() => import('./modules/clients/pages/RegistroEntidad'));
const AperturaCaja = lazy(() => import('./modules/sales/pages/AperturaCaja'));
const RealizarVenta = lazy(() => import('./modules/sales/pages/RealizarVenta'));
const ListaVentas = lazy(() => import('./modules/sales/pages/ListaVentas'));
const ListaUsuarios = lazy(() => import('./modules/users/pages/ListaUsuarios'));
const CrearUsuario = lazy(() => import('./modules/users/pages/CrearUsuario'));
const EditarUsuario = lazy(() => import('./modules/users/pages/EditarUsuario'));
const PerfilUsuario = lazy(() => import('./modules/users/pages/PerfilUsuario'));
const AuditoriaLogs = lazy(() => import('./pages/AuditoriaLogs'));
const ListaCompras = lazy(() => import('./modules/purchases/pages/ListaCompras'));
const ListadoStock = lazy(() => import('./modules/inventory/pages/Inventario/ListadoStock'));
const Kardex = lazy(() => import('./modules/inventory/pages/Inventario/Kardex'));
const ListaAlmacenes = lazy(() => import('./modules/inventory/pages/Inventario/ListaAlmacenes'));
const ListaMotivosMovimiento = lazy(() => import('./modules/inventory/pages/Inventario/ListaMotivosMovimiento'));

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
                  <Route path="/inventario/almacenes" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <ListaAlmacenes />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario/motivos" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <ListaMotivosMovimiento />
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

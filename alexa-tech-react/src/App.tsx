import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider, useModal } from './context/ModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
import Modal from './components/Modal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GestionCaja from './pages/GestionCaja';
import ListaClientes from './pages/ListaClientes';
import RegistroProducto from './pages/RegistroProducto';
import ListaProductos from './pages/ListaProductos';
import EditarProducto from './pages/EditarProducto';
import EditarCliente from './pages/EditarCliente';
import RegistroCliente from './pages/RegistroCliente';
import AperturaCaja from './pages/AperturaCaja';
import RealizarVenta from './pages/RealizarVenta';
import ListaVentas from './pages/ListaVentas';
import ListaUsuarios from './pages/ListaUsuarios';
import CrearUsuario from './pages/CrearUsuario';
import EditarUsuario from './pages/EditarUsuario';
import PerfilUsuario from './pages/PerfilUsuario';
import AuditoriaLogs from './pages/AuditoriaLogs';

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
            <Router>
              <AppContent />
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
              path="/lista-clientes" 
              element={
                <ProtectedRoute requiredPermission="clients.read">
                  <ListaClientes />
                </ProtectedRoute>
              } 
            />
            <Route path="/registrar-producto" element={
              <ProtectedRoute requiredPermission="products.create">
                <RegistroProducto />
              </ProtectedRoute>
            } />
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
            <Route path="/editar-cliente/:id" element={
              <ProtectedRoute requiredPermission="clients.update">
                <EditarCliente />
              </ProtectedRoute>
            } />
            <Route path="/registrar-cliente" element={
              <ProtectedRoute requiredPermission="clients.create">
                <RegistroCliente />
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
          </Routes>
            </Router>
          </ModalProvider>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
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
import ListaPermisos from './pages/ListaPermisos';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <Router>
          <GlobalStyles />
          <NotificationContainer />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestion-caja" 
              element={
                <ProtectedRoute>
                  <GestionCaja />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lista-clientes" 
              element={
                <ProtectedRoute>
                  <ListaClientes />
                </ProtectedRoute>
              } 
            />
            <Route path="/registrar-producto" element={
              <ProtectedRoute>
                <RegistroProducto />
              </ProtectedRoute>
            } />
            <Route path="/lista-productos" element={
              <ProtectedRoute>
                <ListaProductos />
              </ProtectedRoute>
            } />
            <Route path="/editar-producto/:id" element={
              <ProtectedRoute>
                <EditarProducto />
              </ProtectedRoute>
            } />
            <Route path="/editar-cliente/:id" element={
              <ProtectedRoute>
                <EditarCliente />
              </ProtectedRoute>
            } />
            <Route path="/registrar-cliente" element={
              <ProtectedRoute>
                <RegistroCliente />
              </ProtectedRoute>
            } />
            <Route path="/ventas/apertura-caja" element={
              <ProtectedRoute>
                <AperturaCaja />
              </ProtectedRoute>
            } />
            <Route path="/ventas/realizar" element={
                <ProtectedRoute>
                  <RealizarVenta />
                </ProtectedRoute>
              } />
              <Route path="/ventas/lista" element={
                <ProtectedRoute>
                  <ListaVentas />
                </ProtectedRoute>
              } />
              <Route path="/usuarios" element={
                <ProtectedRoute>
                  <ListaUsuarios />
                </ProtectedRoute>
              } />
              <Route path="/permisos" element={
                <ProtectedRoute>
                  <ListaPermisos />
                </ProtectedRoute>
              } />
            {/* Aquí se pueden agregar más rutas según se vayan migrando las páginas */}
          </Routes>
          </Router>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

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
import { ConfiguracionProvider } from './modules/configuracion/context/ConfiguracionContext';
import { SalesProvider } from './modules/sales/context/SalesContext';
import { QuotesProvider } from './modules/sales/context/QuotesContext';
import { ProductProvider } from './modules/products/context/ProductContext';
import { ClientProvider } from './modules/clients/context/ClientContext';

// Lazy loading de páginas desde módulos
const Login = lazy(() => import('./modules/auth/pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GestionCaja = lazy(() => import('./modules/sales/pages/GestionCaja'));
const HistorialCaja = lazy(() => import('./modules/sales/pages/HistorialCaja'));
const ListaEntidades = lazy(() => import('./modules/clients/pages/ListaEntidades'));
const ListaProductos = lazy(() => import('./modules/products/pages/ListaProductos'));
const EditarProducto = lazy(() => import('./modules/products/pages/EditarProducto'));
const EditarEntidad = lazy(() => import('./modules/clients/pages/EditarEntidad'));
const RegistroEntidad = lazy(() => import('./modules/clients/pages/RegistroEntidad'));
const RealizarVenta = lazy(() => import('./modules/sales/pages/RealizarVenta'));
const ListaVentas = lazy(() => import('./modules/sales/pages/ListaVentas'));
const DetalleVenta = lazy(() => import('./modules/sales/pages/DetalleVenta'));
const Cotizaciones = lazy(() => import('./modules/sales/pages/Cotizaciones'));
const ListaUsuarios = lazy(() => import('./modules/users/pages/ListaUsuarios'));
const CrearUsuario = lazy(() => import('./modules/users/pages/CrearUsuario'));
const EditarUsuario = lazy(() => import('./modules/users/pages/EditarUsuario'));
const PerfilUsuario = lazy(() => import('./modules/users/pages/PerfilUsuario'));
const ListaRoles = lazy(() => import('./pages/ListaRoles'));
const AuditoriaLogs = lazy(() => import('./pages/AuditoriaLogs'));
const ListaCompras = lazy(() => import('./modules/purchases/pages/ListaCompras'));
const ListadoStock = lazy(() => import('./modules/inventory/pages/Inventario/ListadoStock'));
const Kardex = lazy(() => import('./modules/inventory/pages/Inventario/Kardex'));
const ListaAlmacenes = lazy(() => import('./modules/inventory/pages/Inventario/ListaAlmacenes'));
const ListaMotivosMovimiento = lazy(() => import('./modules/inventory/pages/Inventario/ListaMotivosMovimiento'));

// Módulo de Configuración
const ConfiguracionMiPerfil = lazy(() => import('./modules/configuracion/pages/MiPerfil'));
const ConfiguracionEmpresa = lazy(() => import('./modules/configuracion/pages/Empresa'));
const ConfiguracionComprobantes = lazy(() => import('./modules/configuracion/pages/Comprobantes'));
const ConfiguracionMetodosPago = lazy(() => import('./modules/configuracion/pages/MetodosPago'));

// Módulo de Reportes
const ReportesVentas = lazy(() => import('./modules/reportes/pages/ReporteVentas'));
const ReportesCompras = lazy(() => import('./modules/reportes/pages/ReporteCompras'));
const ReportesInventario = lazy(() => import('./modules/reportes/pages/ReporteInventario'));
const ReportesCaja = lazy(() => import('./modules/reportes/pages/ReporteCaja'));

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
            <ClientProvider>
              <ProductProvider>
                <SalesProvider>
                  <QuotesProvider>
                    <InventoryProvider>
                    <ConfiguracionProvider>
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
                      <ProtectedRoute requiredPermission="cash-sessions.create">
                        <GestionCaja />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/historial-caja" 
                    element={
                      <ProtectedRoute requiredPermission="cash-sessions.read">
                        <HistorialCaja />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lista-entidades" 
                    element={
                      <ProtectedRoute requiredPermission="clients.read">
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
                    <ProtectedRoute requiredPermission="clients.update">
                      <EditarEntidad />
                    </ProtectedRoute>
                  } />
                  <Route path="/registrar-entidad" element={
                    <ProtectedRoute requiredPermission="clients.create">
                      <RegistroEntidad />
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
                    <Route path="/ventas/detalle/:id" element={
                      <ProtectedRoute requiredPermission="sales.read">
                        <DetalleVenta />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/cotizaciones" element={
                      <ProtectedRoute requiredPermission="sales.create">
                        <Cotizaciones />
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
                  <Route path="/roles" element={
                    <ProtectedRoute requiredPermission="users.read">
                      <ListaRoles />
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <PerfilUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria" element={
                    <ProtectedRoute requiredPermission="system.settings">
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

                  {/* Módulo de Configuración */}
                  <Route path="/configuracion/mi-perfil" element={
                    <ProtectedRoute>
                      <ConfiguracionMiPerfil />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/empresa" element={
                    <ProtectedRoute requiredPermission="system.settings">
                      <ConfiguracionEmpresa />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/comprobantes" element={
                    <ProtectedRoute requiredPermission="system.settings">
                      <ConfiguracionComprobantes />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/metodos-pago" element={
                    <ProtectedRoute requiredPermission="system.settings">
                      <ConfiguracionMetodosPago />
                    </ProtectedRoute>
                  } />

                  {/* Módulo de Reportes */}
                  <Route path="/reportes/ventas" element={
                    <ProtectedRoute requiredPermission="reports.sales">
                      <ReportesVentas />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/compras" element={
                    <ProtectedRoute requiredPermission="reports.inventory">
                      <ReportesCompras />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/inventario" element={
                    <ProtectedRoute requiredPermission="reports.inventory">
                      <ReportesInventario />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/caja" element={
                    <ProtectedRoute requiredPermission="reports.financial">
                      <ReportesCaja />
                    </ProtectedRoute>
                  } />
                </Routes>
                </Suspense>
              </Router>
            </ConfiguracionProvider>
            </InventoryProvider>
          </QuotesProvider>
        </SalesProvider>
      </ProductProvider>
    </ClientProvider>
          </ModalProvider>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

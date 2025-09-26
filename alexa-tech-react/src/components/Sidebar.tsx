import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled.aside`
  width: 250px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  text-align: center;
  padding: 20px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  background: rgba(30, 58, 138, 0.3);

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }
`;





const SidebarNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  
  /* Estilos para el scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(30, 58, 138, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.6);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.8);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const NavItem = styled.li<{ $isActive?: boolean }>`
  margin-bottom: 5px;

  a {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    color: ${props => props.$isActive ? '#ffffff' : '#ffffff'};
    background-color: ${props => props.$isActive ? 'rgba(59, 130, 246, 0.6)' : 'transparent'};
    transition: all 0.3s ease;
    text-decoration: none;
    border-radius: 0;
    margin: 0;
    border-left: ${props => props.$isActive ? '4px solid #3b82f6' : '4px solid transparent'};

    &:hover {
      background-color: ${props => props.$isActive ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.3)'};
      border-radius: 0;
      margin: 0;
    }

    i {
      margin-right: 12px;
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    span {
      font-weight: 500;
    }
  }
`;

const SubMenu = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: rgba(30, 58, 138, 0.4);

  a {
    display: block;
    text-decoration: none;
    color: #ffffff;
    transition: all 0.3s ease;

    &:hover h3 {
      background-color: rgba(59, 130, 246, 0.4);
    }
  }

  h3 {
    padding: 12px 40px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0;
    border-left: 3px solid transparent;
    color: #ffffff;

    &:hover {
      background-color: rgba(59, 130, 246, 0.3);
    }
  }
`;

const SubMenuItem = styled.div<{ $isActive?: boolean }>`
  a {
    display: block;
    text-decoration: none;
    color: #ffffff;
    transition: all 0.3s ease;

    h3 {
      padding: 12px 20px 12px 40px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 0;
      border-left: ${props => props.$isActive ? '4px solid #60a5fa' : '4px solid transparent'};
      background-color: ${props => props.$isActive ? 'rgba(96, 165, 250, 0.4)' : 'transparent'};
      color: ${props => props.$isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'};
      font-weight: ${props => props.$isActive ? '600' : '500'};

      &:hover {
        background-color: ${props => props.$isActive ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
      }
    }
  }
`;

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Función para determinar qué módulo debe estar abierto según la ruta actual
  const getActiveModule = (pathname: string) => {
    if (pathname.includes('/usuarios') || pathname.includes('/roles') || pathname.includes('/auditoria')) {
      return 'usuarios';
    }
    if (pathname.includes('/lista-clientes') || pathname.includes('/registrar-cliente')) {
      return 'clientes';
    }
    if (pathname.includes('/ventas') || pathname.includes('/gestion-caja')) {
      return 'ventas';
    }
    if (pathname.includes('/lista-productos') || pathname.includes('/registrar-producto')) {
      return 'productos';
    }
    return null;
  };

  // Calcular el módulo activo usando useMemo para evitar recálculos innecesarios
  const activeModule = useMemo(() => getActiveModule(location.pathname), [location.pathname]);

  // Inicializar el estado con el módulo activo ya abierto
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>(() => {
    const initialState: { [key: string]: boolean } = {};
    const currentActiveModule = getActiveModule(location.pathname);
    if (currentActiveModule) {
      initialState[currentActiveModule] = true;
    }
    return initialState;
  });



  // useEffect optimizado que solo actualiza cuando es necesario
  useEffect(() => {
    if (activeModule && !openMenus[activeModule]) {
      setOpenMenus(prev => ({
        ...prev,
        [activeModule]: true
      }));
    }
  }, [activeModule, openMenus]);

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };





  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarContainer className={className}>
        <SidebarHeader>
          <h2>AlexaTech</h2>
        </SidebarHeader>
        


      <SidebarNav>
        <ul>
          <NavItem $isActive={isActive('/dashboard')}>
            <Link to="/dashboard">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/usuarios') || isActive('/usuarios/crear') || isActive('/roles') || isActive('/auditoria')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('usuarios'); }}>
              <i className="fas fa-user-friends"></i>
              <span>Usuarios</span>
            </a>
            <SubMenu $isOpen={openMenus.usuarios}>
              <SubMenuItem $isActive={isActive('/usuarios')}>
                <Link to="/usuarios">
                  <h3>Lista de Usuarios</h3>
                </Link>
              </SubMenuItem>

              <SubMenuItem $isActive={isActive('/roles')}>
                <Link to="/roles">
                  <h3>Gestión de Roles</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/auditoria')}>
                <Link to="/auditoria">
                  <h3>Auditoría y Logs</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/lista-clientes') || isActive('/registrar-cliente')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('clientes'); }}>
              <i className="fas fa-users"></i>
              <span>Clientes</span>
            </a>
            <SubMenu $isOpen={openMenus.clientes}>
              <SubMenuItem $isActive={isActive('/lista-clientes')}>
                <Link to="/lista-clientes">
                  <h3>Lista de Clientes</h3>
                </Link>
              </SubMenuItem>

            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/ventas/apertura-caja') || isActive('/ventas/gestion-caja') || isActive('/ventas/realizar') || isActive('/ventas/lista') || isActive('/gestion-caja')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('ventas'); }}>
              <i className="fas fa-chart-pie"></i>
              <span>Ventas</span>
            </a>
            <SubMenu $isOpen={openMenus.ventas}>
              <SubMenuItem $isActive={isActive('/ventas/apertura-caja')}>
                <Link to="/ventas/apertura-caja">
                  <h3>Apertura de caja</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/gestion-caja')}>
                <Link to="/ventas/gestion-caja">
                  <h3>Gestión Caja</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/realizar')}>
                <Link to="/ventas/realizar">
                  <h3>Realizar Venta</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/lista')}>
                <Link to="/ventas/lista">
                  <h3>Lista de Ventas</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/gestion-caja')}>
                <Link to="/gestion-caja">
                  <h3>Gestión de Caja</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/lista-productos') || isActive('/registrar-producto')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('productos'); }}>
              <i className="fas fa-cube"></i>
              <span>Productos</span>
            </a>
            <SubMenu $isOpen={openMenus.productos}>
              <SubMenuItem $isActive={isActive('/lista-productos')}>
                <Link to="/lista-productos">
                  <h3>Lista de Productos</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/registrar-producto')}>
                <Link to="/registrar-producto">
                  <h3>Registrar Producto</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/inventario')}>
            <Link to="/inventario">
              <i className="fas fa-box-open"></i>
              <span>Inventario</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/compras')}>
            <Link to="/compras">
              <i className="fas fa-receipt"></i>
              <span>Compras</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/facturacion')}>
            <Link to="/facturacion">
              <i className="fas fa-file-invoice"></i>
              <span>Facturación</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/configuracion')}>
            <Link to="/configuracion">
              <i className="fas fa-cogs"></i>
              <span>Configuración</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/reportes')}>
            <Link to="/reportes">
              <i className="fas fa-chart-bar"></i>
              <span>Reportes</span>
            </Link>
          </NavItem>
        </ul>
      </SidebarNav>

      {/* Botón de Logout - Integrado */}
      <div style={{ 
        padding: '20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(30, 58, 138, 0.3)',
        flexShrink: 0
      }}>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          style={{
            width: '100%',
            padding: '15px 20px',
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '15px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.3)';
            e.currentTarget.style.borderColor = '#dc3545';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <i className="fas fa-sign-out-alt" style={{ fontSize: '16px' }}></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </SidebarContainer>
  );
};

export default Sidebar;
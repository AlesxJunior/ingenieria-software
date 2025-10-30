import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

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

const LogoutSection = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(30, 58, 138, 0.3);
  flex-shrink: 0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 15px 20px;
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(220, 53, 69, 0.3);
    border-color: #dc3545;
    color: #ffffff;
  }

  i {
    font-size: 16px;
  }
`;

interface SidebarContentProps {
  onItemClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onItemClick }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Función para determinar qué módulo debe estar abierto según la ruta actual
  const getActiveModule = (pathname: string) => {
    if (pathname.includes('/usuarios')) {
      return 'usuarios';
    }
    if (pathname.includes('/auditoria')) {
      return 'auditoria';
    }
    if (pathname.includes('/lista-entidades') || pathname.includes('/registrar-entidad')) {
      return 'entidades_comerciales';
    }
    if (pathname.includes('/ventas') || pathname.includes('/gestion-caja')) {
      return 'ventas';
    }
    if (pathname.includes('/lista-productos')) {
      return 'productos';
    }
    if (pathname.includes('/compras')) {
      return 'compras';
    }
    if (pathname.includes('/inventario')) {
      return 'inventario';
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

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      <SidebarNav>
        <ul>
          <NavItem $isActive={isActive('/dashboard')}>
            <Link to="/dashboard" onClick={handleItemClick}>
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/usuarios') || isActive('/usuarios/crear')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('usuarios'); }}>
              <i className="fas fa-user-friends"></i>
              <span>Usuarios</span>
            </a>
            <SubMenu $isOpen={openMenus.usuarios}>
              <SubMenuItem $isActive={isActive('/usuarios')}>
                <Link to="/usuarios" onClick={handleItemClick}>
                  <h3>Lista de Usuarios</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/lista-entidades') || isActive('/registrar-entidad')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('entidades_comerciales'); }}>
              <i className="fas fa-users"></i>
              <span>Entidades Comerciales</span>
            </a>
            <SubMenu $isOpen={openMenus.entidades_comerciales}>
              <SubMenuItem $isActive={isActive('/lista-entidades')}>
                <Link to="/lista-entidades" onClick={handleItemClick}>
                  <h3>Lista de Entidades</h3>
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
                <Link to="/ventas/apertura-caja" onClick={handleItemClick}>
                  <h3>Apertura de caja</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/gestion-caja')}>
                <Link to="/ventas/gestion-caja" onClick={handleItemClick}>
                  <h3>Gestión Caja</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/realizar')}>
                <Link to="/ventas/realizar" onClick={handleItemClick}>
                  <h3>Realizar Venta</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/ventas/lista')}>
                <Link to="/ventas/lista" onClick={handleItemClick}>
                  <h3>Lista de Ventas</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/gestion-caja')}>
                <Link to="/gestion-caja" onClick={handleItemClick}>
                  <h3>Gestión de Caja</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/lista-productos')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('productos'); }}>
              <i className="fas fa-cube"></i>
              <span>Productos</span>
            </a>
            <SubMenu $isOpen={openMenus.productos}>
              <SubMenuItem $isActive={isActive('/lista-productos')}>
                <Link to="/lista-productos" onClick={handleItemClick}>
                  <h3>Lista de Productos</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/inventario/stock') || isActive('/inventario/kardex') || isActive('/inventario/almacenes') || isActive('/inventario/motivos')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('inventario'); }}>
              <i className="fas fa-boxes"></i>
              <span>Inventario</span>
            </a>
            <SubMenu $isOpen={openMenus.inventario}>
              <SubMenuItem $isActive={isActive('/inventario/stock')}>
                <Link to="/inventario/stock" onClick={handleItemClick}>
                  <h3>Stock</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/inventario/kardex')}>
                <Link to="/inventario/kardex" onClick={handleItemClick}>
                  <h3>Kardex</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/inventario/almacenes')}>
                <Link to="/inventario/almacenes" onClick={handleItemClick}>
                  <h3>Almacenes</h3>
                </Link>
              </SubMenuItem>
              <SubMenuItem $isActive={isActive('/inventario/motivos')}>
                <Link to="/inventario/motivos" onClick={handleItemClick}>
                  <h3>Motivos de Movimiento</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/compras')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('compras'); }}>
              <i className="fas fa-receipt"></i>
              <span>Compras</span>
            </a>
            <SubMenu $isOpen={openMenus.compras}>
              <SubMenuItem $isActive={isActive('/compras')}>
                <Link to="/compras" onClick={handleItemClick}>
                  <h3>Lista de Compras</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem $isActive={isActive('/facturacion')}>
            <Link to="/facturacion" onClick={handleItemClick}>
              <i className="fas fa-file-invoice"></i>
              <span>Facturación</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/configuracion')}>
            <Link to="/configuracion" onClick={handleItemClick}>
              <i className="fas fa-cogs"></i>
              <span>Configuración</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/reportes')}>
            <Link to="/reportes" onClick={handleItemClick}>
              <i className="fas fa-chart-bar"></i>
              <span>Reportes</span>
            </Link>
          </NavItem>

          <NavItem $isActive={isActive('/auditoria')}>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('auditoria'); }}>
              <i className="fas fa-search"></i>
              <span>Auditoría y Logs</span>
            </a>
            <SubMenu $isOpen={openMenus.auditoria}>
              <SubMenuItem $isActive={isActive('/auditoria')}>
                <Link to="/auditoria" onClick={handleItemClick}>
                  <h3>Logs del Sistema</h3>
                </Link>
              </SubMenuItem>
            </SubMenu>
          </NavItem>
        </ul>
      </SidebarNav>

      <LogoutSection>
        <LogoutButton onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </LogoutButton>
      </LogoutSection>
    </>
  );
};

export default SidebarContent;
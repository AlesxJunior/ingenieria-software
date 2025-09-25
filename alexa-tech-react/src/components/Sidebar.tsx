import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: black;
  color: #fff;
  padding: 20px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  text-align: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const SidebarNav = styled.nav`
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
    color: ${props => props.$isActive ? '#000' : '#fff'};
    background-color: ${props => props.$isActive ? '#fff' : 'transparent'};
    transition: all 0.3s ease;
    text-decoration: none;

    &:hover {
      background-color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.1)'};
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
  max-height: ${props => props.$isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);

  h3 {
    padding: 10px 40px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

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

          <NavItem>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('usuarios'); }}>
              <i className="fas fa-user-friends"></i>
              <span>Usuarios</span>
            </a>
            <SubMenu $isOpen={openMenus.usuarios}>
              <Link to="/usuarios">
                <h3>Lista de Usuarios</h3>
              </Link>
              <Link to="/permisos">
                <h3>Lista de Permisos</h3>
              </Link>
            </SubMenu>
          </NavItem>

          <NavItem>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('clientes'); }}>
              <i className="fas fa-users"></i>
              <span>Clientes</span>
            </a>
            <SubMenu $isOpen={openMenus.clientes}>
              <Link to="/lista-clientes">
                <h3>Lista de Clientes</h3>
              </Link>
              <Link to="/registrar-cliente">
                <h3>Registrar Cliente</h3>
              </Link>
            </SubMenu>
          </NavItem>

          <NavItem>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('ventas'); }}>
              <i className="fas fa-chart-pie"></i>
              <span>Ventas</span>
            </a>
            <SubMenu $isOpen={openMenus.ventas}>
              <Link to="/ventas/apertura-caja">
                <h3>Apertura de caja</h3>
              </Link>
              <Link to="/ventas/gestion-caja">
                <h3>Gestión Caja</h3>
              </Link>
              <Link to="/ventas/realizar">
                <h3>Realizar Venta</h3>
              </Link>
              <Link to="/ventas/lista">
                <h3>Lista de Ventas</h3>
              </Link>
              <Link to="/gestion-caja">
                <h3>Gestión de Caja</h3>
              </Link>
            </SubMenu>
          </NavItem>

          <NavItem>
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('productos'); }}>
              <i className="fas fa-cube"></i>
              <span>Productos</span>
            </a>
            <SubMenu $isOpen={openMenus.productos}>
              <Link to="/lista-productos">
                <h3>Lista de Productos</h3>
              </Link>
              <Link to="/registrar-producto">
                <h3>Registrar Producto</h3>
              </Link>
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
    </SidebarContainer>
  );
};

export default Sidebar;
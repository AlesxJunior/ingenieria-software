import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { NavLink, Outlet } from 'react-router-dom';

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
`;

const TabLink = styled(NavLink)`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  &.active {
    background: #3498db;
    color: white;
  }
  &:hover {
    background: #f1f3f5;
  }
`;

const TabInventario: React.FC = () => {
  return (
    <Layout title="Inventario">
      <Tabs>
        <TabLink to="/inventario/stock">Stock</TabLink>
        <TabLink to="/inventario/kardex">Kardex</TabLink>
      </Tabs>
      <Outlet />
    </Layout>
  );
};

export default TabInventario;
import React from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../../../styles/theme';
import Layout from '../../../../components/Layout';
import { NavLink, Outlet } from 'react-router-dom';

const Tabs = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  background: ${COLORS.neutral.white};
  padding: ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  margin-bottom: ${SPACING.lg};
`;

const TabLink = styled(NavLink)`
  padding: ${SPACING.md} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.md};
  text-decoration: none;
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  transition: all 0.2s;
  &.active {
    background: ${COLOR_SCALES.primary[500]};
    color: ${COLORS.neutral.white};
  }
  &:hover {
    background: ${COLORS.neutral[50]};
  }
`;

const TabInventario: React.FC = () => {
  return (
    <Layout title="Inventario">
      <Tabs>
        <TabLink to="/inventario/stock">📦 Stock</TabLink>
        <TabLink to="/inventario/kardex">📋 Kardex</TabLink>
        <TabLink to="/inventario/almacenes">🏪 Almacenes</TabLink>
      </Tabs>
      <Outlet />
    </Layout>
  );
};

export default TabInventario;
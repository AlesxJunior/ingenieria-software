import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles/theme';
import { StatCard, StatsGrid, StatValue, StatLabel, Card } from '../components/shared';

const ActivityCard = styled(Card)`
  grid-column: 1 / -1;
`;

const ActivityTitle = styled.h3`
  margin: 0 0 ${SPACING.xl} 0;
  font-size: ${TYPOGRAPHY.fontSize.h3};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  padding: ${SPACING.md} 0;
  border-bottom: 1px solid ${COLORS.neutral[200]};
  display: flex;
  align-items: center;
  gap: ${SPACING.md};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.i`
  color: ${COLORS.primary[600]};
  font-size: ${TYPOGRAPHY.fontSize.small};
  min-width: 16px;
`;

const Dashboard: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <StatsGrid>
        <StatCard $color="#27ae60">
          <StatValue $color="#27ae60">$ 1,520.00</StatValue>
          <StatLabel>Ventas de Hoy</StatLabel>
        </StatCard>

        <StatCard $color="#3498db">
          <StatValue $color="#3498db">325</StatValue>
          <StatLabel>Total de Productos</StatLabel>
        </StatCard>

        <StatCard $color="#f39c12">
          <StatValue $color="#f39c12">12</StatValue>
          <StatLabel>Nuevas Entidades Comerciales</StatLabel>
        </StatCard>

        <StatCard $color="#e74c3c">
          <StatValue $color="#e74c3c">8</StatValue>
          <StatLabel>Pedidos Pendientes</StatLabel>
        </StatCard>
      </StatsGrid>

      <ActivityCard>
        <ActivityTitle>Actividad Reciente</ActivityTitle>
        <ActivityList>
          <ActivityItem>
            <ActivityIcon className="fas fa-shopping-cart" />
            Venta: Camara de Seguridad (x2) a Juan Perez
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon className="fas fa-user-plus" />
            Nueva entidad comercial registrada: Maria Lopez
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon className="fas fa-box" />
            Producto actualizado: Sistema de Alarma
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon className="fas fa-shopping-cart" />
            Venta: Portero Automatico (x1) a Maria Lopez
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon className="fas fa-plus-circle" />
            Producto agregado: Sensor de Movimiento
          </ActivityItem>
        </ActivityList>
      </ActivityCard>
    </Layout>
  );
};

export default Dashboard;

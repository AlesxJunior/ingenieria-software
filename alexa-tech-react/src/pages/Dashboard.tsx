import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { media } from '../styles/breakpoints';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  ${media.tablet} {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  ${media.mobile} {
    padding: 16px;
    border-radius: 8px;
  }
`;

const SummaryCard = styled(Card)`
  .summary-content {
    display: flex;
    align-items: center;
    gap: 15px;
    
    ${media.mobile} {
      gap: 12px;
    }
  }

  .summary-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;

    &.sales-icon {
      background-color: #28a745;
    }

    &.inventory-icon {
      background-color: #17a2b8;
    }

    &.clients-icon {
      background-color: #ffc107;
      color: #333;
    }

    &.orders-icon {
      background-color: #dc3545;
    }
    
    ${media.mobile} {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
  }

  .summary-text {
    h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      color: #666;
      font-weight: 500;
      
      ${media.mobile} {
        font-size: 14px;
      }
    }

    p {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
      
      ${media.mobile} {
        font-size: 20px;
      }
    }
  }
`;

const ActivityCard = styled(Card)`
  grid-column: 1 / -1;

  h3 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #333;
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 10px;

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        color: #007bff;
        font-size: 14px;
      }
    }
  }
`;

const Dashboard: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <DashboardGrid>
        <SummaryCard>
          <div className="summary-content">
            <div className="summary-icon sales-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="summary-text">
              <h3>Ventas de Hoy</h3>
              <p>$ 1,520.00</p>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard>
          <div className="summary-content">
            <div className="summary-icon inventory-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="summary-text">
              <h3>Total de Productos</h3>
              <p>325</p>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard>
          <div className="summary-content">
            <div className="summary-icon clients-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="summary-text">
              <h3>Nuevos Clientes</h3>
              <p>12</p>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard>
          <div className="summary-content">
            <div className="summary-icon orders-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="summary-text">
              <h3>Pedidos Pendientes</h3>
              <p>8</p>
            </div>
          </div>
        </SummaryCard>

        <ActivityCard>
          <h3>Actividad Reciente</h3>
          <ul>
            <li>
              <i className="fas fa-shopping-cart activity-icon"></i>
              Venta: Cámara de Seguridad (x2) a Juan Pérez
            </li>
            <li>
              <i className="fas fa-user-plus activity-icon"></i>
              Nuevo cliente registrado: María López
            </li>
            <li>
              <i className="fas fa-box activity-icon"></i>
              Producto actualizado: Sistema de Alarma
            </li>
            <li>
              <i className="fas fa-shopping-cart activity-icon"></i>
              Venta: Portero Automático (x1) a María López
            </li>
            <li>
              <i className="fas fa-plus-circle activity-icon"></i>
              Producto agregado: Sensor de Movimiento
            </li>
          </ul>
        </ActivityCard>
      </DashboardGrid>
    </Layout>
  );
};

export default Dashboard;
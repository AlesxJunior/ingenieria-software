import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';

const TableContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input[type="date"] {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }

  .search-btn {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &.btn-success {
    background-color: #28a745;
    
    &:hover {
      background-color: #218838;
    }
  }

  &.btn-warning {
    background-color: #ffc107;
    color: #333;
    
    &:hover {
      background-color: #e0a800;
    }
  }

  &.btn-info {
    background-color: #17a2b8;
    
    &:hover {
      background-color: #138496;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.closed {
    background-color: #dc3545;
    color: white;
  }

  &.open {
    background-color: #28a745;
    color: white;
  }

  &.pending {
    background-color: #ffc107;
    color: #333;
  }
`;

const ResponsiveTable = styled.div`
  overflow-x: auto;
`;

interface CajaData {
  id: number;
  numero: number;
  fecha: string;
  horaApertura: string;
  horaCierre: string;
  saldoInicial: number;
  saldoFinal: number;
  status: 'open' | 'closed' | 'pending';
}

const GestionCaja: React.FC = () => {
  const navigate = useNavigate();
  const [searchDate, setSearchDate] = useState('');
  
  // Datos de ejemplo - en una aplicación real vendrían de una API
  const [cajas] = useState<CajaData[]>([
    {
      id: 1,
      numero: 1,
      fecha: '04/09/2025',
      horaApertura: '12:15:23',
      horaCierre: '12:16:37',
      saldoInicial: 100.00,
      saldoFinal: 100.00,
      status: 'closed'
    },
    {
      id: 2,
      numero: 1,
      fecha: '31/08/2025',
      horaApertura: '20:51:10',
      horaCierre: '21:03:52',
      saldoInicial: 100.00,
      saldoFinal: 100.00,
      status: 'closed'
    },
    {
      id: 3,
      numero: 2,
      fecha: '30/08/2025',
      horaApertura: '08:00:00',
      horaCierre: '',
      saldoInicial: 150.00,
      saldoFinal: 0,
      status: 'open'
    }
  ]);

  const handleSearch = () => {
    console.log('Buscando por fecha:', searchDate);
    // Aquí implementarías la lógica de búsqueda
  };

  const handleAperturaCaja = () => {
    navigate('/apertura-caja');
  };

  const handleVender = () => {
    navigate('/ventas');
  };

  const handleMovimientoCaja = () => {
    navigate('/movimiento-caja');
  };

  const handleArqueoCaja = () => {
    navigate('/arqueo-caja');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Caja Abierta';
      case 'closed': return 'Caja Cerrada';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <Layout title="Gestión de Cajas">
      <TableContainer>
        <TableHeader>
          <SearchSection>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Seleccionar fecha"
            />
            <button className="search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </SearchSection>

          <ActionButtons>
            <ActionButton onClick={handleAperturaCaja}>
              <i className="fas fa-cash-register"></i>
              Aperturar Caja
            </ActionButton>
            <ActionButton className="btn-success" onClick={handleVender}>
              <i className="fas fa-shopping-cart"></i>
              Vender
            </ActionButton>
            <ActionButton className="btn-warning" onClick={handleMovimientoCaja}>
              <i className="fas fa-exchange-alt"></i>
              Movimiento Caja
            </ActionButton>
            <ActionButton className="btn-info" onClick={handleArqueoCaja}>
              <i className="fas fa-calculator"></i>
              Arqueo Caja
            </ActionButton>
          </ActionButtons>
        </TableHeader>

        <ResponsiveTable>
          <Table>
            <thead>
              <tr>
                <th>N° Caja</th>
                <th>Fecha</th>
                <th>Hora Apertura</th>
                <th>Hora Cierre</th>
                <th>S. Inicial</th>
                <th>S. Final</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cajas.map((caja) => (
                <tr key={caja.id}>
                  <td>{caja.numero}</td>
                  <td>{caja.fecha}</td>
                  <td>{caja.horaApertura}</td>
                  <td>{caja.horaCierre || '-'}</td>
                  <td>${caja.saldoInicial.toFixed(2)}</td>
                  <td>${caja.saldoFinal.toFixed(2)}</td>
                  <td>
                    <StatusBadge className={caja.status}>
                      {getStatusText(caja.status)}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ResponsiveTable>
      </TableContainer>
    </Layout>
  );
};

export default GestionCaja;
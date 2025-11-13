import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';

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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e8ed;

  h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #7f8c8d;
    
    &:hover {
      color: #2c3e50;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #3498db;
    }

    &:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  .info-text {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #7f8c8d;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &.btn-primary {
      background-color: #3498db;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2980b9;
      }
    }

    &.btn-success {
      background-color: #27ae60;
      color: white;

      &:hover:not(:disabled) {
        background-color: #229954;
      }
    }

    &.btn-secondary {
      background-color: #95a5a6;
      color: white;

      &:hover {
        background-color: #7f8c8d;
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const AlertBox = styled.div<{ $type: 'info' | 'warning' | 'error' | 'success' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  ${props => {
    switch (props.$type) {
      case 'info':
        return `
          background-color: #d1ecf1;
          border: 1px solid #bee5eb;
          color: #0c5460;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        `;
      case 'success':
        return `
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        `;
    }
  }}

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e1e8ed;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #2c3e50;
    }

    .value {
      color: #7f8c8d;
      font-weight: 500;

      &.highlight {
        color: #27ae60;
        font-size: 1.1rem;
        font-weight: bold;
      }

      &.warning {
        color: #e74c3c;
        font-weight: bold;
      }
    }
  }
`;

const GestionCaja: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const {
    cashRegisters,
    cashSessions,
    activeCashSession,
    openCashSession,
    closeCashSession,
    loadCashRegisters,
    loadCashSessions,
    loading,
  } = useSales();

  const [searchDate, setSearchDate] = useState('');
  const [showAperturaModal, setShowAperturaModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);

  // Estados para apertura
  const [selectedCashRegister, setSelectedCashRegister] = useState('');
  const [montoApertura, setMontoApertura] = useState('');
  const [observacionesApertura, setObservacionesApertura] = useState('');

  // Estados para cierre
  const [montoCierre, setMontoCierre] = useState('');
  const [observacionesCierre, setObservacionesCierre] = useState('');

  useEffect(() => {
    loadCashRegisters();
    loadCashSessions();
  }, []);

  const handleSearch = () => {
    console.log('Buscando por fecha:', searchDate);
    loadCashSessions();
  };

  const handleAperturaCaja = () => {
    if (activeCashSession) {
      addNotification('warning', 'Caja Abierta', 'Ya existe una sesión de caja abierta');
      return;
    }
    setShowAperturaModal(true);
  };

  const handleSubmitApertura = async () => {
    if (!selectedCashRegister || !montoApertura) {
      addNotification('warning', 'Campos Requeridos', 'Selecciona una caja e ingresa el monto inicial');
      return;
    }

    try {
      const session = await openCashSession(
        selectedCashRegister,
        parseFloat(montoApertura),
        observacionesApertura
      );

      addNotification(
        'success',
        'Caja Abierta',
        `Sesión iniciada con S/ ${session.montoApertura.toFixed(2)}`
      );

      setShowAperturaModal(false);
      setSelectedCashRegister('');
      setMontoApertura('');
      setObservacionesApertura('');
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Error al abrir caja');
    }
  };

  const handleCierreCaja = () => {
    if (!activeCashSession) {
      addNotification('warning', 'Sin Caja Abierta', 'No hay ninguna sesión de caja abierta');
      return;
    }
    setShowCierreModal(true);
  };

  const handleSubmitCierre = async () => {
    if (!activeCashSession || !montoCierre) {
      addNotification('warning', 'Campo Requerido', 'Ingresa el monto final contado');
      return;
    }

    try {
      const closedSession = await closeCashSession(
        activeCashSession.id,
        parseFloat(montoCierre),
        observacionesCierre
      );

      const diferencia = closedSession.diferencia || 0;
      const mensaje =
        diferencia === 0
          ? '¡Cuadre perfecto!'
          : `Diferencia: S/ ${Math.abs(diferencia).toFixed(2)} ${
              diferencia > 0 ? '(Sobrante)' : '(Faltante)'
            }`;

      addNotification('success', 'Caja Cerrada', mensaje);

      setShowCierreModal(false);
      setMontoCierre('');
      setObservacionesCierre('');
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Error al cerrar caja');
    }
  };

  const handleVender = () => {
    if (!activeCashSession) {
      addNotification('warning', 'Caja Cerrada', 'Debes abrir una caja antes de realizar ventas');
      return;
    }
    navigate('/ventas/realizar-venta');
  };

  const handleArqueoCaja = () => {
    navigate('/arqueo-caja');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Abierta':
        return 'Caja Abierta';
      case 'Cerrada':
        return 'Caja Cerrada';
      default:
        return status;
    }
  };

  const montoEsperado = activeCashSession
    ? activeCashSession.montoApertura + activeCashSession.totalVentas
    : 0;

  const diferenciaPreliminar = montoCierre ? parseFloat(montoCierre) - montoEsperado : 0;

  return (
    <Layout title="Gestión de Cajas">
      <TableContainer>
        {activeCashSession && (
          <AlertBox $type="success">
            <strong>✅ Caja Abierta</strong>
            <div>
              <p>Caja: {activeCashSession.cashRegister?.nombre || 'N/A'}</p>
              <p>
                Apertura: {new Date(activeCashSession.fechaApertura).toLocaleString('es-PE')}
              </p>
              <p>Monto Inicial: S/ {activeCashSession.montoApertura.toFixed(2)}</p>
              <p>Total Ventas: S/ {activeCashSession.totalVentas.toFixed(2)}</p>
            </div>
          </AlertBox>
        )}

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
            <ActionButton onClick={handleAperturaCaja} disabled={!!activeCashSession}>
              <i className="fas fa-cash-register"></i>
              Aperturar Caja
            </ActionButton>
            <ActionButton className="btn-success" onClick={handleVender}>
              <i className="fas fa-shopping-cart"></i>
              Vender
            </ActionButton>
            <ActionButton className="btn-warning" onClick={handleCierreCaja} disabled={!activeCashSession}>
              <i className="fas fa-lock"></i>
              Cerrar Caja
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
                <th>Caja</th>
                <th>Fecha Apertura</th>
                <th>Fecha Cierre</th>
                <th>Monto Inicial</th>
                <th>Total Ventas</th>
                <th>Monto Final</th>
                <th>Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    Cargando...
                  </td>
                </tr>
              ) : cashSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    No hay sesiones de caja registradas
                  </td>
                </tr>
              ) : (
                cashSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.cashRegister?.nombre || 'N/A'}</td>
                    <td>{new Date(session.fechaApertura).toLocaleString('es-PE')}</td>
                    <td>
                      {session.fechaCierre
                        ? new Date(session.fechaCierre).toLocaleString('es-PE')
                        : '-'}
                    </td>
                    <td>S/ {session.montoApertura.toFixed(2)}</td>
                    <td>S/ {session.totalVentas.toFixed(2)}</td>
                    <td>
                      {session.montoCierre ? `S/ ${session.montoCierre.toFixed(2)}` : '-'}
                    </td>
                    <td>
                      {session.diferencia !== undefined && session.diferencia !== null ? (
                        <span
                          style={{
                            color: session.diferencia === 0 ? '#27ae60' : '#e74c3c',
                            fontWeight: 'bold',
                          }}
                        >
                          S/ {session.diferencia.toFixed(2)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <StatusBadge className={session.estado === 'Abierta' ? 'open' : 'closed'}>
                        {getStatusText(session.estado)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ResponsiveTable>
      </TableContainer>

      {/* Modal Apertura de Caja */}
      {showAperturaModal && (
        <Modal onClick={() => setShowAperturaModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Aperturar Caja</h2>
              <button onClick={() => setShowAperturaModal(false)}>×</button>
            </ModalHeader>

            <AlertBox $type="info">
              <strong>ℹ️ Información</strong>
              <p>Selecciona la caja registradora e ingresa el monto inicial en efectivo.</p>
            </AlertBox>

            <FormGroup>
              <label>Caja Registradora *</label>
              <select
                value={selectedCashRegister}
                onChange={(e) => setSelectedCashRegister(e.target.value)}
              >
                <option value="">Seleccionar caja...</option>
                {cashRegisters
                  .filter((cr) => cr.activo)
                  .map((cr) => (
                    <option key={cr.id} value={cr.id}>
                      {cr.nombre} - {cr.ubicacion || 'Sin ubicación'}
                    </option>
                  ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>Monto Inicial (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="0.00"
              />
              <p className="info-text">Ingresa el dinero en efectivo con que abrirás la caja</p>
            </FormGroup>

            <FormGroup>
              <label>Observaciones (Opcional)</label>
              <textarea
                value={observacionesApertura}
                onChange={(e) => setObservacionesApertura(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </FormGroup>

            <ModalButtons>
              <button className="btn-secondary" onClick={() => setShowAperturaModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-success"
                onClick={handleSubmitApertura}
                disabled={!selectedCashRegister || !montoApertura}
              >
                Abrir Caja
              </button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Cierre de Caja */}
      {showCierreModal && activeCashSession && (
        <Modal onClick={() => setShowCierreModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Cerrar Caja</h2>
              <button onClick={() => setShowCierreModal(false)}>×</button>
            </ModalHeader>

            <AlertBox $type="warning">
              <strong>⚠️ Advertencia</strong>
              <p>
                Asegúrate de contar correctamente el dinero antes de cerrar la caja. Esta acción
                no se puede deshacer.
              </p>
            </AlertBox>

            <InfoCard>
              <div className="info-row">
                <span className="label">Caja:</span>
                <span className="value">{activeCashSession.cashRegister?.nombre || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Fecha Apertura:</span>
                <span className="value">
                  {new Date(activeCashSession.fechaApertura).toLocaleString('es-PE')}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Monto Inicial:</span>
                <span className="value">S/ {activeCashSession.montoApertura.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span className="label">Total Ventas:</span>
                <span className="value">S/ {activeCashSession.totalVentas.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span className="label">Monto Esperado:</span>
                <span className="value highlight">S/ {montoEsperado.toFixed(2)}</span>
              </div>
            </InfoCard>

            <FormGroup>
              <label>Monto Final Contado (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                placeholder="0.00"
              />
              <p className="info-text">Ingresa el total de dinero contado en la caja</p>
            </FormGroup>

            {montoCierre && diferenciaPreliminar !== 0 && (
              <AlertBox $type={diferenciaPreliminar > 0 ? 'success' : 'error'}>
                <strong>
                  {diferenciaPreliminar > 0 ? '💰 Sobrante' : '⚠️ Faltante'}
                </strong>
                <p>
                  Diferencia: S/ {Math.abs(diferenciaPreliminar).toFixed(2)}{' '}
                  {diferenciaPreliminar > 0 ? '(más dinero del esperado)' : '(menos dinero del esperado)'}
                </p>
              </AlertBox>
            )}

            <FormGroup>
              <label>Observaciones (Opcional)</label>
              <textarea
                value={observacionesCierre}
                onChange={(e) => setObservacionesCierre(e.target.value)}
                placeholder="Explica si hay diferencias, problemas o notas adicionales..."
              />
            </FormGroup>

            <ModalButtons>
              <button className="btn-secondary" onClick={() => setShowCierreModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmitCierre} disabled={!montoCierre}>
                Cerrar Caja
              </button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

export default GestionCaja;
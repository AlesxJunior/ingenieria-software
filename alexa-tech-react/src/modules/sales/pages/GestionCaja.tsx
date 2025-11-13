import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';

// ==================== STYLED COMPONENTS ====================

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ColumnRight = styled.div``;

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
`;

const CashStatusView = styled.div`
  text-align: center;

  p {
    font-size: 16px;
    margin: 10px 0;
  }

  strong {
    color: #007bff;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background-color: #0d6efd;
    color: white;
  }

  &.btn-success {
    background-color: #28a745;
    color: white;
  }

  &.btn-danger {
    background-color: #dc3545;
    color: white;
  }

  &.btn-warning {
    background-color: #ffc107;
    color: #333;
  }

  &.btn-secondary {
    background-color: #6c757d;
    color: white;
  }
`;

const MovementButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MovementsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  td {
    font-size: 14px;
  }
`;

const MovementType = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  &.ingreso {
    background-color: #d4edda;
    color: #155724;
  }

  &.egreso {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    font-size: 15px;

    span {
      color: #555;
    }

    strong {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .summary-separator {
    border-bottom: 1px dashed #e0e0e0;
    margin: 8px 0;
    padding: 0;
  }

  .summary-total {
    border-top: 2px solid #333;
    margin-top: 8px;
    padding-top: 16px !important;

    strong {
      font-size: 18px;
      color: #007bff;
    }
  }
`;

const SummaryNote = styled.p`
  font-size: 12px;
  color: #777;
  margin-top: 16px;
  font-style: italic;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  form {
    padding: 24px;

    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      margin-bottom: 16px;
      font-family: inherit;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;

  button {
    width: auto;
    min-width: 100px;
  }
`;

const DiscrepancyAlert = styled.div`
  padding: 16px;
  border-radius: 6px;
  margin: 16px 0;
  font-weight: 600;

  &.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }

  &.danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  h4 {
    margin-top: 0;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #777;

  p {
    margin: 0;
    font-size: 14px;
  }
`;

// ==================== MAIN COMPONENT ====================

const GestionCaja: React.FC = () => {
  const {
    cashRegisters,
    activeCashSession,
    cashMovements,
    cashSummary,
    loadCashRegisters,
    loadCashSessions,
    openCashSession,
    closeCashSession,
    createCashMovement,
    loadCashMovements,
    loadCashSummary,
    deleteCashMovement,
  } = useSales();

  const { showSuccess, showError } = useNotification();

  // Estado para los 3 modales
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Estado para Abrir Caja
  const [openAmount, setOpenAmount] = useState('');

  // Estado para Movimiento de Caja
  const [movementType, setMovementType] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementMotivo, setMovementMotivo] = useState('');
  const [movementDescripcion, setMovementDescripcion] = useState('');

  // Estado para Cerrar Caja
  const [closeCountedAmount, setCloseCountedAmount] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadCashRegisters();
    loadCashSessions();
  }, []);

  // Cargar movimientos y resumen cuando hay sesión activa
  useEffect(() => {
    if (activeCashSession?.id) {
      loadCashMovements(activeCashSession.id);
      loadCashSummary(activeCashSession.id);
    }
  }, [activeCashSession?.id]);

  // ==================== HANDLERS ====================

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openAmount || parseFloat(openAmount) < 0) {
      showError('Por favor ingresa un monto válido');
      return;
    }

    try {
      const firstRegister = cashRegisters[0];
      if (!firstRegister) {
        showError('No hay cajas registradas en el sistema');
        return;
      }

      await openCashSession(firstRegister.id, parseFloat(openAmount), '');
      showSuccess('Caja abierta exitosamente');
      setShowOpenModal(false);
      setOpenAmount('');
    } catch (error: any) {
      showError(error.message || 'Error al abrir la caja');
    }
  };

  const handleOpenMovementModal = (tipo: 'INGRESO' | 'EGRESO') => {
    setMovementType(tipo);
    setMovementAmount('');
    setMovementMotivo('');
    setMovementDescripcion('');
    setShowMovementModal(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementAmount || parseFloat(movementAmount) <= 0) {
      showError('El monto debe ser mayor a 0');
      return;
    }
    if (!movementMotivo.trim()) {
      showError('Debes ingresar un motivo');
      return;
    }
    if (!activeCashSession) {
      showError('No hay sesión activa');
      return;
    }

    try {
      await createCashMovement(movementType, {
        cashSessionId: activeCashSession.id,
        monto: parseFloat(movementAmount),
        motivo: movementMotivo,
        descripcion: movementDescripcion || undefined,
      });

      showSuccess(`${movementType === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado exitosamente`);
      setShowMovementModal(false);
    } catch (error: any) {
      showError(error.message || 'Error al registrar movimiento');
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;

    try {
      await deleteCashMovement(movementId);
      showSuccess('Movimiento eliminado exitosamente');
    } catch (error: any) {
      showError(error.message || 'Error al eliminar movimiento');
    }
  };

  const handleCloseCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeCountedAmount || parseFloat(closeCountedAmount) < 0) {
      showError('Por favor ingresa el monto contado');
      return;
    }
    if (!activeCashSession) {
      showError('No hay sesión activa para cerrar');
      return;
    }

    try {
      await closeCashSession(activeCashSession.id, parseFloat(closeCountedAmount), '');
      showSuccess('Caja cerrada exitosamente');
      setShowCloseModal(false);
      setCloseCountedAmount('');
    } catch (error: any) {
      showError(error.message || 'Error al cerrar la caja');
    }
  };

  // ==================== COMPUTED VALUES ====================

  const totalEsperado = cashSummary?.totalEsperado 
    ? (typeof cashSummary.totalEsperado === 'string' 
        ? parseFloat(cashSummary.totalEsperado) 
        : cashSummary.totalEsperado)
    : 0;
  const diferencia = parseFloat(closeCountedAmount || '0') - totalEsperado;

  const getDiscrepancyClass = () => {
    if (!closeCountedAmount) return '';
    if (Math.abs(diferencia) < 0.5) return 'success';
    if (Math.abs(diferencia) < 10) return 'warning';
    return 'danger';
  };

  const getDiscrepancyMessage = () => {
    if (Math.abs(diferencia) < 0.5) {
      return '✅ Cuadre perfecto. El monto contado coincide con el esperado.';
    }
    if (diferencia > 0) {
      return `⚠ Sobrante de S/ ${diferencia.toFixed(2)}. Hay más efectivo del esperado.`;
    }
    return `❌ Faltante de S/ ${Math.abs(diferencia).toFixed(2)}. Falta efectivo en caja.`;
  };

  // ==================== UTILITIES ====================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `S/ ${numAmount.toFixed(2)}`;
  };

  return (
    <Layout title="Gestión de Caja">
      <PageGrid>
        {/* ==================== COLUMNA IZQUIERDA ==================== */}
        <ColumnLeft>
          {/* Card: Estado de Caja */}
          <Card>
            <CardTitle>Estado de Caja</CardTitle>
            {!activeCashSession ? (
              <CashStatusView>
                <p>🔒 La caja se encuentra actualmente <strong>cerrada</strong>.</p>
                <p>Debes abrirla para registrar movimientos o realizar ventas.</p>
                <Button className="btn-primary" onClick={() => setShowOpenModal(true)}>
                  🔓 Abrir Caja
                </Button>
              </CashStatusView>
            ) : (
              <CashStatusView>
                <p>
                  ✅ Caja abierta desde:{' '}
                  <strong>{formatDate(activeCashSession.fechaApertura)}</strong>
                </p>
                <p>
                  💰 Monto Inicial: <strong>{formatCurrency(activeCashSession.montoApertura)}</strong>
                </p>
                <Button className="btn-danger" onClick={() => setShowCloseModal(true)}>
                  🔒 Cerrar Caja
                </Button>
              </CashStatusView>
            )}
          </Card>

          {/* Card: Movimientos de Caja (solo si hay sesión activa) */}
          {activeCashSession && (
            <Card>
              <CardTitle>Movimientos de Caja</CardTitle>
              <MovementButtons>
                <Button
                  className="btn-success"
                  onClick={() => handleOpenMovementModal('INGRESO')}
                >
                  ➕ Ingreso de Efectivo
                </Button>
                <Button
                  className="btn-warning"
                  onClick={() => handleOpenMovementModal('EGRESO')}
                >
                  ➖ Retiro de Efectivo
                </Button>
              </MovementButtons>

              {cashMovements.length > 0 ? (
                <MovementsTable>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Motivo</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashMovements && cashMovements.length > 0 ? (
                      cashMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            <MovementType className={movement.tipo.toLowerCase()}>
                              {movement.tipo === 'INGRESO' ? '⬆' : '⬇'} {movement.tipo}
                            </MovementType>
                          </td>
                          <td>{movement.motivo}</td>
                          <td style={{ fontSize: '0.9em', color: '#666' }}>
                            {movement.descripcion || '—'}
                          </td>
                          <td>{formatCurrency(movement.monto)}</td>
                          <td>
                            {movement.usuario
                              ? `${movement.usuario.firstName} ${movement.usuario.lastName}`
                              : 'N/A'}
                          </td>
                          <td>{formatDate(movement.createdAt)}</td>
                          <td>
                            <DeleteButton
                              onClick={() => {
                                if (window.confirm('¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer.')) {
                                  handleDeleteMovement(movement.id);
                                }
                              }}
                              title="Eliminar movimiento"
                            >
                              🗑️
                            </DeleteButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                          No hay movimientos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </MovementsTable>
              ) : (
                <EmptyState>
                  <p>No hay movimientos registrados en esta sesión.</p>
                </EmptyState>
              )}
            </Card>
          )}
        </ColumnLeft>

        {/* ==================== COLUMNA DERECHA ==================== */}
        <ColumnRight>
          {activeCashSession && cashSummary && (
            <Card>
              <CardTitle>Resumen de Caja</CardTitle>
              <SummaryList>
                <li>
                  <span>(+) Monto de Apertura</span>
                  <strong>{formatCurrency(cashSummary.montoApertura)}</strong>
                </li>
                <li>
                  <span>(+) Ventas</span>
                  <strong>{formatCurrency(cashSummary.totalVentas)}</strong>
                </li>
                <li>
                  <span>(+) Otros Ingresos</span>
                  <strong>{formatCurrency(cashSummary.totalIngresos)}</strong>
                </li>

                <li className="summary-separator"></li>

                <li>
                  <span>(-) Retiros / Gastos</span>
                  <strong>{formatCurrency(cashSummary.totalEgresos)}</strong>
                </li>

                <li className="summary-total">
                  <span>💵 Total Esperado en Caja</span>
                  <strong>{formatCurrency(cashSummary.totalEsperado)}</strong>
                </li>
              </SummaryList>

              <SummaryNote>
                * El monto de "Ventas" incluye todas las formas de pago y se actualiza automáticamente desde el módulo de
                "Realizar Venta".
              </SummaryNote>
            </Card>
          )}
        </ColumnRight>
      </PageGrid>

      {/* ==================== MODAL: ABRIR CAJA ==================== */}
      {showOpenModal && (
        <Modal onClick={() => setShowOpenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleOpenCash}>
              <h3>🔓 Abrir Caja</h3>
              <p>Ingresa el monto inicial en efectivo con el que abrirás la caja.</p>

              <label htmlFor="open-amount">Monto inicial en caja (S/)</label>
              <input
                type="number"
                id="open-amount"
                step="0.01"
                min="0"
                value={openAmount}
                onChange={(e) => setOpenAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              <ModalActions>
                <Button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowOpenModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  Confirmar Apertura
                </Button>
              </ModalActions>
            </form>
          </div>
        </Modal>
      )}

      {/* ==================== MODAL: REGISTRAR MOVIMIENTO (compartido INGRESO/EGRESO) ==================== */}
      {showMovementModal && (
        <Modal onClick={() => setShowMovementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveMovement}>
              <h3>
                {movementType === 'INGRESO' ? '➕ Registrar Ingreso' : '➖ Registrar Egreso'}
              </h3>
              <p>
                {movementType === 'INGRESO'
                  ? 'Registra un ingreso adicional de efectivo (diferente a ventas).'
                  : 'Registra un retiro o gasto de efectivo de la caja.'}
              </p>

              <label htmlFor="movement-amount">Monto (S/)</label>
              <input
                type="number"
                id="movement-amount"
                step="0.01"
                min="0.01"
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              <label htmlFor="movement-motivo">Motivo</label>
              <select
                id="movement-motivo"
                value={movementMotivo}
                onChange={(e) => setMovementMotivo(e.target.value)}
                required
              >
                <option value="">-- Selecciona un motivo --</option>
                {movementType === 'INGRESO' ? (
                  <>
                    <option value="Depósito bancario">Depósito bancario</option>
                    <option value="Fondo de caja chica">Fondo de caja chica</option>
                    <option value="Devolución de préstamo">Devolución de préstamo</option>
                    <option value="Reembolso">Reembolso</option>
                    <option value="Ingreso por servicio">Ingreso por servicio</option>
                    <option value="Corrección de arqueo">Corrección de arqueo</option>
                    <option value="Otros ingresos">Otros ingresos</option>
                  </>
                ) : (
                  <>
                    <option value="Pago a proveedor">Pago a proveedor</option>
                    <option value="Gastos operativos">Gastos operativos</option>
                    <option value="Retiro de propietario">Retiro de propietario</option>
                    <option value="Pago de servicios">Pago de servicios (luz, agua, internet)</option>
                    <option value="Compra de suministros">Compra de suministros</option>
                    <option value="Préstamo al personal">Préstamo al personal</option>
                    <option value="Depósito al banco">Depósito al banco</option>
                    <option value="Corrección de arqueo">Corrección de arqueo</option>
                    <option value="Otros egresos">Otros egresos</option>
                  </>
                )}
              </select>

              <label htmlFor="movement-descripcion">Descripción (opcional)</label>
              <textarea
                id="movement-descripcion"
                value={movementDescripcion}
                onChange={(e) => setMovementDescripcion(e.target.value)}
                placeholder="Detalles adicionales del movimiento..."
              />

              <ModalActions>
                <Button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowMovementModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  Guardar Movimiento
                </Button>
              </ModalActions>
            </form>
          </div>
        </Modal>
      )}

      {/* ==================== MODAL: CERRAR CAJA ==================== */}
      {showCloseModal && activeCashSession && (
        <Modal onClick={() => setShowCloseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCloseCash}>
              <h3>🔒 Cerrar Caja</h3>
              <p>
                Este es el resumen final de la sesión. Por favor, cuenta el efectivo en tu cajón e
                ingrésalo a continuación.
              </p>

              <SummaryList style={{ marginBottom: '20px' }}>
                <li>
                  <span>💵 Total Esperado en Sistema</span>
                  <strong>{formatCurrency(totalEsperado)}</strong>
                </li>
              </SummaryList>

              <label htmlFor="close-counted-amount">Monto Contado (Real) (S/)</label>
              <input
                type="number"
                id="close-counted-amount"
                step="0.01"
                min="0"
                value={closeCountedAmount}
                onChange={(e) => setCloseCountedAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              {closeCountedAmount && (
                <DiscrepancyAlert className={getDiscrepancyClass()}>
                  <h4>Resultado del Cierre</h4>
                  <p>{getDiscrepancyMessage()}</p>
                </DiscrepancyAlert>
              )}

              <ModalActions>
                <Button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCloseModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  Confirmar Cierre
                </Button>
              </ModalActions>
            </form>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default GestionCaja;

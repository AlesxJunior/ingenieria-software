import React, { useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { COLORS, SPACING, BORDER_RADIUS, TRANSITIONS } from '../styles/theme';
import { Button as SharedButton } from './shared/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const Row = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
`;

interface CambiarEstadoModalProps {
  purchaseId: string;
  currentStatus: string;
  onClose: () => void;
  onUpdated?: () => void;
}

const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({ purchaseId, currentStatus, onClose, onUpdated }) => {
  const { showSuccess, showError } = useNotification();
  const [nextStatus, setNextStatus] = useState<'COMPLETADA' | 'CANCELADA'>('COMPLETADA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await apiService.updatePurchaseStatus(purchaseId, nextStatus);
      if (!response.success) throw new Error(response.message || 'Error al cambiar estado');
      const estadoLabel = nextStatus === 'COMPLETADA' ? 'Completada' : 'Cancelada';
      showSuccess('Estado Actualizado', `La orden cambió a ${estadoLabel} correctamente`);
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Error al Actualizar', 'No se pudo cambiar el estado de la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus !== 'PENDIENTE') {
    return (
      <Container>
        <p>Solo las compras en estado PENDIENTE pueden cambiar de estado.</p>
        <Actions>
          <Button $variant="secondary" onClick={onClose}>Cerrar</Button>
        </Actions>
      </Container>
    );
  }

  return (
    <Container>
      <p>Seleccione el nuevo estado para la compra:</p>
      <Row>
        <label>
          <input type="radio" name="estado" value="COMPLETADA" checked={nextStatus === 'COMPLETADA'} onChange={() => setNextStatus('COMPLETADA')} />
          Completada
        </label>
        <label>
          <input type="radio" name="estado" value="CANCELADA" checked={nextStatus === 'CANCELADA'} onChange={() => setNextStatus('CANCELADA')} />
          Cancelada
        </label>
      </Row>
      <Actions>
        <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button $variant="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Actualizando...' : 'Confirmar'}</Button>
      </Actions>
    </Container>
  );
};

export default CambiarEstadoModal;
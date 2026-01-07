import React, { useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../utils/api';
import { useNotification } from '../../../context/NotificationContext';
import { SPACING, COLORS, BORDER_RADIUS } from '../../../styles/theme';
import { Button } from '../../../components/shared';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md};
`;

const Row = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.sm};
`;

interface CambiarEstadoModalProps {
  purchaseId: string;
  currentStatus: 'Pendiente' | 'Recibida' | 'Cancelada';
  onClose: () => void;
  onUpdated?: () => void;
}

const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({ purchaseId, currentStatus, onClose, onUpdated }) => {
  const { showSuccess, showError } = useNotification();
  const [nextStatus, setNextStatus] = useState<'Recibida' | 'Cancelada'>('Recibida');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await apiService.updatePurchaseStatus(purchaseId, nextStatus);
      if (!response.success) throw new Error(response.message || 'Error al cambiar estado');
      showSuccess('Estado actualizado');
      onClose();
      onUpdated && onUpdated();
    } catch (err) {
      console.error('Error updating status:', err);
      showError('No se pudo actualizar el estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus !== 'Pendiente') {
    return (
      <Container>
        <p>Solo las compras en estado Pendiente pueden cambiar de estado.</p>
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
          <input type="radio" name="estado" value="Recibida" checked={nextStatus === 'Recibida'} onChange={() => setNextStatus('Recibida')} />
          Recibida
        </label>
        <label>
          <input type="radio" name="estado" value="Cancelada" checked={nextStatus === 'Cancelada'} onChange={() => setNextStatus('Cancelada')} />
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
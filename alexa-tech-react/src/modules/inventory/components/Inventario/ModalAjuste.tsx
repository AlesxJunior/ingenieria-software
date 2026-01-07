import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../../styles/theme';
import { Input as SharedInput } from '../../../../components/shared/Input';
import { Select as SharedSelect } from '../../../../components/shared/Select';
import { Label as SharedLabel } from '../../../../components/shared/Label';
import { Button as SharedButton } from '../../../../components/shared/Button';
import Modal from '../../../../components/Modal';
import type { StockItem, AjusteFormData } from '../../../../types/inventario';
import { getWarehouseLabel } from '../../../../constants/warehouses';
import { movementReasonsApi } from '../../services/movementReasonsApi';
import type { MovementReason } from '../../services/movementReasonsApi';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xl};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
`;

const ErrorMessage = styled.span`
  color: ${COLOR_SCALES.danger[500]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin-top: ${SPACING.xs};
  display: block;
`;

const InfoCard = styled.div`
  background: ${COLORS.neutral[50]};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.secondary};
`;

const InfoValue = styled.span`
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const StockPreview = styled.div<{ $isValid: boolean }>`
  background: ${props => props.$isValid ? COLOR_SCALES.success[100] : COLOR_SCALES.danger[100]};
  border: 1px solid ${props => props.$isValid ? COLOR_SCALES.success[300] : COLOR_SCALES.danger[300]};
  color: ${props => props.$isValid ? COLOR_SCALES.success[700] : COLOR_SCALES.danger[700]};
  padding: ${SPACING.md};
  border-radius: ${BORDER_RADIUS.md};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-align: center;
  margin-top: ${SPACING.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  justify-content: flex-end;
  margin-top: ${SPACING.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${SPACING.md};
  }
`;

interface ModalAjusteProps {
  isOpen: boolean;
  stockItem: StockItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: AjusteFormData) => Promise<void>;
}

const ModalAjuste: React.FC<ModalAjusteProps> = ({
  isOpen,
  stockItem,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<AjusteFormData>({
    productId: '',
    warehouseId: '',
    cantidadAjuste: 0,
    adjustmentReason: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [motivosAjuste, setMotivosAjuste] = useState<MovementReason[]>([]);
  const [loadingMotivos, setLoadingMotivos] = useState(false);

  // Cargar motivos de ajuste desde la API
  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        setLoadingMotivos(true);
        const motivos = await movementReasonsApi.getMovementReasons({ 
          tipo: 'AJUSTE',
          activo: true 
        });
        setMotivosAjuste(motivos);
      } catch (error) {
        console.error('Error al cargar motivos de ajuste:', error);
        // Si falla, no bloqueamos el formulario
      } finally {
        setLoadingMotivos(false);
      }
    };

    if (isOpen) {
      fetchMotivos();
    }
  }, [isOpen]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && stockItem) {
      setFormData({
        productId: stockItem.productId,
        warehouseId: stockItem.warehouseId,
        cantidadAjuste: 0,
        adjustmentReason: '',
        observaciones: ''
      });
      setErrors({});
    }
  }, [isOpen, stockItem]);

  // Calcular stock resultante
  const stockResultante = stockItem ? stockItem.cantidad + formData.cantidadAjuste : 0;
  const isStockValid = stockResultante >= 0;

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof AjusteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.cantidadAjuste === 0) {
      newErrors.cantidadAjuste = 'La cantidad de ajuste no puede ser cero';
    }

    if (!isStockValid) {
      newErrors.cantidadAjuste = 'El stock resultante no puede ser negativo';
    }

    if (!formData.adjustmentReason) {
      newErrors.adjustmentReason = 'Debe seleccionar un motivo para el ajuste';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviar el reasonId en lugar de adjustmentReason
      const submitData = {
        ...formData,
        reasonId: formData.adjustmentReason, // El valor ahora es el ID del motivo
        adjustmentReason: undefined // Limpiamos el campo legacy
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      // El error se maneja en el contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!stockItem) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ajuste de Inventario">
      <Form onSubmit={handleSubmit}>
        {/* Info producto/almacén */}
        <InfoCard>
          <InfoRow>
            <InfoLabel>Código</InfoLabel>
            <InfoValue>{stockItem?.codigo}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Producto</InfoLabel>
            <InfoValue>{stockItem?.nombre}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Almacén</InfoLabel>
            <InfoValue>{getWarehouseLabel(stockItem?.warehouseId || '')}</InfoValue>
          </InfoRow>
        </InfoCard>

        {/* Cantidad ajuste */}
        <FormGroup>
          <SharedLabel htmlFor="cantidadAjuste" required>Cantidad a ajustar</SharedLabel>
          <SharedInput
            id="cantidadAjuste"
            type="number"
            value={formData.cantidadAjuste}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cantidadAjuste', Number(e.target.value))}
            error={!!errors.cantidadAjuste}
            placeholder="Ingrese la cantidad"
            data-testid="ajuste-input-cantidad"
          />
          {errors.cantidadAjuste && (
            <ErrorMessage data-testid="ajuste-error-cantidad">
              {errors.cantidadAjuste}
            </ErrorMessage>
          )}
          <StockPreview $isValid={isStockValid}>
            {isStockValid ? `Stock resultante: ${stockResultante}` : 'El stock resultante no puede ser negativo'}
          </StockPreview>
        </FormGroup>

        {/* Motivo */}
        <FormGroup>
          <SharedLabel htmlFor="adjustmentReason" required>Motivo del ajuste</SharedLabel>
          <SharedSelect
            id="adjustmentReason"
            value={formData.adjustmentReason}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('adjustmentReason', e.target.value)}
            error={!!errors.adjustmentReason}
            data-testid="ajuste-select-motivo"
            disabled={loadingMotivos}
          >
            <option value="">
              {loadingMotivos ? 'Cargando motivos...' : 'Seleccione un motivo'}
            </option>
            {motivosAjuste.map(motivo => (
              <option key={motivo.id} value={motivo.id}>
                {motivo.codigo} - {motivo.nombre}
              </option>
            ))}
          </SharedSelect>
          {errors.adjustmentReason && (
            <ErrorMessage data-testid="ajuste-error-motivo">
              {errors.adjustmentReason}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Observaciones */}
        <FormGroup>
          <SharedLabel htmlFor="observaciones">Observaciones</SharedLabel>
          <SharedInput
            as="textarea"
            id="observaciones"
            value={formData.observaciones || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('observaciones', e.target.value)}
            placeholder="Notas adicionales"
            style={{ minHeight: '80px', resize: 'vertical' }}
            data-testid="ajuste-input-observaciones"
          />
        </FormGroup>

        {/* Acciones */}
        <ButtonGroup>
          <SharedButton type="button" $variant="secondary" onClick={handleClose} data-testid="ajuste-button-cancelar">Cancelar</SharedButton>
          <SharedButton type="submit" $variant="primary" disabled={isSubmitting} data-testid="ajuste-button-confirmar">
            {isSubmitting ? 'Guardando...' : 'Confirmar Ajuste'}
          </SharedButton>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default ModalAjuste;
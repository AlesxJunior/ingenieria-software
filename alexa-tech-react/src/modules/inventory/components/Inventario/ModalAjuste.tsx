import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../../../../components/Modal';
import type { StockItem, AjusteFormData } from '../../../../types/inventario';
import { getWarehouseLabel } from '../../../../constants/warehouses';
import { movementReasonsApi } from '../../services/movementReasonsApi';
import type { MovementReason } from '../../services/movementReasonsApi';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ $required?: boolean }>`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #e74c3c;
    }
  `}
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }
`;

const Textarea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #495057;
`;

const InfoValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;

const StockPreview = styled.div<{ $isValid: boolean }>`
  background: ${props => props.$isValid ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.$isValid ? '#c3e6cb' : '#f5c6cb'};
  color: ${props => props.$isValid ? '#155724' : '#721c24'};
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  margin-top: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #3498db;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2980b9;
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a6268;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
          <Label htmlFor="cantidadAjuste" $required>Cantidad a ajustar</Label>
          <Input
            id="cantidadAjuste"
            type="number"
            value={formData.cantidadAjuste}
            onChange={(e) => handleInputChange('cantidadAjuste', Number(e.target.value))}
            $hasError={!!errors.cantidadAjuste}
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
          <Label htmlFor="adjustmentReason" $required>Motivo del ajuste</Label>
          <Select
            id="adjustmentReason"
            value={formData.adjustmentReason}
            onChange={(e) => handleInputChange('adjustmentReason', e.target.value)}
            $hasError={!!errors.adjustmentReason}
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
          </Select>
          {errors.adjustmentReason && (
            <ErrorMessage data-testid="ajuste-error-motivo">
              {errors.adjustmentReason}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Observaciones */}
        <FormGroup>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones || ''}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Notas adicionales"
            data-testid="ajuste-input-observaciones"
          />
        </FormGroup>

        {/* Acciones */}
        <ButtonGroup>
          <Button type="button" $variant="secondary" onClick={handleClose} data-testid="ajuste-button-cancelar">Cancelar</Button>
          <Button type="submit" $variant="primary" disabled={isSubmitting} data-testid="ajuste-button-confirmar">
            {isSubmitting ? 'Guardando...' : 'Confirmar Ajuste'}
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default ModalAjuste;
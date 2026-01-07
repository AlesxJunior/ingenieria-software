import React, { useState } from 'react';
import styled from 'styled-components';
import { configuracionApi } from '../../services/configuracionApi';
import type { ProductCategory, CategoryInput } from '../../types/configuracion';
import { useNotification } from '../../context/NotificationContext';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../styles/theme';
import { Button as SharedButton } from '../shared/Button';
import { Input as SharedInput } from '../shared/Input';
import { Label as SharedLabel } from '../shared/Label';

const ModalOverlay = styled.div`
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
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.xl};
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: ${SPACING['2xl']} ${SPACING['2xl']} 0 ${SPACING['2xl']};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  margin-bottom: ${SPACING['2xl']};
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${SPACING.lg} 0;
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
`;

const ModalContent = styled.div`
  padding: 0 ${SPACING['2xl']} ${SPACING['2xl']} ${SPACING['2xl']};
`;

const FormGroup = styled.div`
  margin-bottom: ${SPACING.xl};

  .error {
    color: ${COLOR_SCALES.danger[500]};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    margin-top: ${SPACING.sm};
  }

  .hint {
    color: ${COLORS.text.secondary};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    margin-top: ${SPACING.xs};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.lg};
  margin-top: ${SPACING['2xl']};
`;

interface CategoriaModalProps {
  categoria?: ProductCategory;
  onClose: (saved: boolean) => void;
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ categoria, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CategoryInput>({
    codigo: categoria?.codigo || '',
    nombre: categoria?.nombre || '',
    descripcion: categoria?.descripcion || '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (formData.codigo.length > 10) {
      newErrors.codigo = 'El código no puede exceder 10 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (categoria) {
        // Editar
        await configuracionApi.updateCategory(categoria.id, formData);
        showSuccess('Categoría actualizada correctamente');
      } else {
        // Crear
        await configuracionApi.createCategory(formData);
        showSuccess('Categoría creada correctamente');
      }
      onClose(true);
    } catch (error: any) {
      showError(error.message || 'Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>
              {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </ModalTitle>
          </ModalHeader>

          <ModalContent>
            <FormGroup>
              <label>
                Código<span className="required">*</span>
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ej: ABR"
                maxLength={10}
                disabled={!!categoria} // No editable si es edición
              />
              {errors.codigo && <div className="error">{errors.codigo}</div>}
              <div className="hint">Máximo 10 caracteres. No editable después de crear.</div>
            </FormGroup>

            <FormGroup>
              <label>
                Nombre<span className="required">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Abarrotes"
                maxLength={100}
              />
              {errors.nombre && <div className="error">{errors.nombre}</div>}
              <div className="hint">Máximo 100 caracteres</div>
            </FormGroup>

            <FormGroup>
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción opcional de la categoría"
              />
              <div className="hint">Opcional</div>
            </FormGroup>

            <Actions>
              <Button
                type="button"
                $variant="secondary"
                onClick={() => onClose(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" $variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Actions>
          </ModalContent>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CategoriaModal;

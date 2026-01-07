import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { validatePasswordWithConfirmation, validateUsername, validateEmail } from '../../../utils/validation';
import PasswordRequirements from '../../../components/PasswordRequirements';
import RoleSelector from './RoleSelector';
import PermissionsPreview from './PermissionsPreview';
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS, Z_INDEX } from '../../../styles/theme';
import {
  Button,
  Input,
  FormGroup,
  Label,
  RequiredMark,
  ValidationMessage,
  ButtonGroup
} from '../../../components/shared';

// ============================================================================
// INTERFACES
// ============================================================================

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  roleId: string; // ✅ RBAC: Rol obligatorio (sin permissions directos)
}

interface FormErrors {
  [key: string]: string;
}

interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserFormData>) => Promise<void>;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.modal};
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${SHADOWS.xl};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${COLORS.border};
`;

const ModalTitle = styled.h2`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.text};
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.h2};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.75rem;
  color: ${COLORS.textLight};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS.small};
  transition: all ${TRANSITIONS.normal};

  &:hover {
    background: ${COLORS.background};
    color: ${COLORS.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${COLORS.primary};
`;

const CheckboxLabel = styled.label`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.body};
  cursor: pointer;
  user-select: none;
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLORS.border};
  margin: 1.5rem 0;
`;

const SectionTitle = styled.h3`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.h3};
  margin-bottom: 1rem;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background: ${COLORS.primary};
    border-radius: 2px;
  }
`;

const InfoBox = styled.div`
  background: ${COLORS.infoBg};
  border-left: 4px solid ${COLORS.info};
  padding: 1rem;
  border-radius: ${BORDER_RADIUS.small};
  margin: 1rem 0;
  
  p {
    margin: 0;
    color: ${COLORS.infoText};
    font-size: ${TYPOGRAPHY.fontSize.small};
    line-height: 1.5;
    font-family: ${TYPOGRAPHY.fontFamily};
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    isActive: true,
    roleId: '' // ✅ RBAC: Rol obligatorio
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.errors[0]?.message || 'Error en nombre de usuario';
    }

    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0]?.message || 'Error en email';
    }

    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    // Validar contraseña con requisitos robustos
    const passwordValidation = validatePasswordWithConfirmation(formData.password, formData.confirmPassword);
    if (!passwordValidation.isValid) {
      const passwordErrors = passwordValidation.errors.filter(e => e.field === 'Contraseña');
      const confirmErrors = passwordValidation.errors.filter(e => e.field === 'confirmPassword');
      
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0].message;
      }
      if (confirmErrors.length > 0) {
        newErrors.confirmPassword = confirmErrors[0].message;
      }
    }

    // ✅ RBAC: Validar que se haya seleccionado un rol (OBLIGATORIO)
    if (!formData.roleId || formData.roleId.trim() === '') {
      newErrors.roleId = 'Debe seleccionar un rol para el usuario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Error de Validación', 'Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setIsLoading(true);
      
      // ✅ RBAC: Preparar datos - NO incluir confirmPassword ni permissions
      const { confirmPassword, ...userDataToSend } = formData;
      
      // Enviar al backend con roleId obligatorio
      await onSave(userDataToSend);
      
      // Resetear formulario
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        roleId: ''
      });
      setSelectedRole(null);
      setErrors({});
      
      onClose();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      showNotification(
        'error',
        'Error al Crear Usuario',
        error.response?.data?.message || error.message || 'Error al crear el usuario'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (roleId: string, role: Role | null) => {
    setFormData(prev => ({ ...prev, roleId }));
    setSelectedRole(role);
    
    // Limpiar error de roleId
    if (errors.roleId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.roleId;
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Crear Nuevo Usuario</ModalTitle>
          <CloseButton onClick={onClose} type="button">&times;</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {/* INFORMACIÓN BÁSICA */}
          <SectionTitle>Información Básica</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>
                Nombre de Usuario<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                $hasError={!!errors.username}
                placeholder="Ej: jperez"
                disabled={isLoading}
                autoComplete="username"
              />
              {errors.username && <ValidationMessage $type="error">{errors.username}</ValidationMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Correo Electrónico<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                $hasError={!!errors.email}
                placeholder="Ej: juan.perez@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && <ValidationMessage $type="error">{errors.email}</ValidationMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>
                Nombre<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                $hasError={!!errors.firstName}
                placeholder="Ej: Juan"
                disabled={isLoading}
                autoComplete="given-name"
              />
              {errors.firstName && <ValidationMessage $type="error">{errors.firstName}</ValidationMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Apellido<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                $hasError={!!errors.lastName}
                placeholder="Ej: Pérez"
                disabled={isLoading}
                autoComplete="family-name"
              />
              {errors.lastName && <ValidationMessage $type="error">{errors.lastName}</ValidationMessage>}
            </FormGroup>
          </FormRow>

          <Divider />

          {/* SEGURIDAD */}
          <SectionTitle>Seguridad</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>
                Contraseña<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                $hasError={!!errors.password}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && <ValidationMessage $type="error">{errors.password}</ValidationMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Confirmar Contraseña<RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                $hasError={!!errors.confirmPassword}
                placeholder="Repita la contraseña"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <ValidationMessage $type="error">{errors.confirmPassword}</ValidationMessage>}
            </FormGroup>
          </FormRow>

          <PasswordRequirements password={formData.password} />

          <Divider />

          {/* ✅ RBAC: ASIGNACIÓN DE ROL (OBLIGATORIO) */}
          <SectionTitle>Rol y Permisos</SectionTitle>

          <InfoBox>
            <p>
              <strong>Sistema RBAC:</strong> Los permisos se asignan automáticamente según el rol seleccionado. 
              El usuario heredará todos los permisos del rol que elija.
            </p>
          </InfoBox>

          <RoleSelector
            value={formData.roleId}
            onChange={handleRoleChange}
            required
            disabled={isLoading}
            error={errors.roleId}
            label="Rol del Usuario"
            showDescription
          />

          {/* Preview de permisos del rol seleccionado */}
          {selectedRole && selectedRole.permissions.length > 0 && (
            <PermissionsPreview
              permissions={selectedRole.permissions}
              title="Permisos que tendrá este usuario:"
              groupByModule
            />
          )}

          <Divider />

          {/* ESTADO */}
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isLoading}
            />
            <CheckboxLabel htmlFor="isActive">
              Usuario activo (puede iniciar sesión)
            </CheckboxLabel>
          </CheckboxWrapper>

          {/* BOTONES */}
          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevoUsuarioModal;

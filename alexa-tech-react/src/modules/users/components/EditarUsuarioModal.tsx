import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { validateUsername, validateEmail } from '../../../utils/validation';
import RoleSelector from './RoleSelector';
import PermissionsPreview from './PermissionsPreview';
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS, Z_INDEX } from '../../../styles/theme';
import {
  Button,
  Input,
  Label,
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
}

interface ExtendedUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  role?: Role;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
}

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  onSave: (userData: UserFormData) => void;
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${Z_INDEX.modal};
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${SHADOWS.xl};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${COLORS.border};
  background: ${COLORS.primary};
  border-radius: ${BORDER_RADIUS.large} ${BORDER_RADIUS.large} 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.h2};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.white};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: ${COLORS.white};
  width: 36px;
  height: 36px;
  border-radius: ${BORDER_RADIUS.round};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${TRANSITIONS.normal};

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const FormGroup = styled.div`
  padding: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const InputWithError = styled(Input)<{ hasError?: boolean }>`
  border-color: ${props => props.hasError ? COLORS.danger : COLORS.border};
  
  &:focus {
    border-color: ${props => props.hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? COLORS.dangerBg : COLORS.primaryLight};
  }
`;

const InfoBox = styled.div`
  background: ${COLORS.infoBg};
  border-left: 4px solid ${COLORS.info};
  padding: 16px;
  border-radius: ${BORDER_RADIUS.medium};
  margin-bottom: 20px;
`;

const InfoTitle = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.infoText};
  margin-bottom: 8px;
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const InfoText = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.infoText};
  font-size: ${TYPOGRAPHY.fontSize.small};
  line-height: 1.5;
`;

const RoleChangeAlert = styled.div`
  background: ${COLORS.warningBg};
  border-left: 4px solid ${COLORS.warning};
  padding: 16px;
  border-radius: ${BORDER_RADIUS.medium};
  margin-bottom: 20px;
`;

const RoleChangeTitle = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.warningText};
  margin-bottom: 8px;
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const RoleChangeText = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.warningText};
  font-size: ${TYPOGRAPHY.fontSize.small};
  line-height: 1.5;
`;

const RoleChangeBadge = styled.span<{ $variant?: 'old' | 'new' }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$variant === 'old' ? COLORS.danger : COLORS.success};
  color: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-family: ${TYPOGRAPHY.fontFamily};
  margin: 0 4px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLORS.border};
  margin: 1.5rem 0;
`;

const ModalButtonGroup = styled(ButtonGroup)`
  padding: 24px;
  border-top: 1px solid ${COLORS.border};
  background-color: ${COLORS.background};
`;

// ============================================================================
// COMPONENT
// ============================================================================

const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [originalRoleId, setOriginalRoleId] = useState<string>('');

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    isActive: true,
    roleId: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roleId: user.roleId
      };
      
      console.log('🔍 [EditarUsuarioModal] Loading user data:', userData);
      setFormData(userData);

      // Guardar rol original para detectar cambios
      setOriginalRoleId(user.roleId);

      // Establecer rol seleccionado actual
      if (user.role) {
        setSelectedRole(user.role);
      }
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre de usuario
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

    // Validar rol
    if (!formData.roleId) {
      newErrors.roleId = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Error de Validación', 'Por favor corrige los errores en el formulario');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      showNotification('success', 'Usuario Actualizado', 'El usuario ha sido actualizado exitosamente.');
      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message || 'No se pudo actualizar el usuario.';
      console.error('Error al actualizar el usuario:', error);
      showNotification('error', 'Error de Actualización', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (roleId: string, role: Role | null) => {
    setFormData(prev => ({ ...prev, roleId }));
    setSelectedRole(role);
    
    // Limpiar error de roleId
    if (errors.roleId) {
      setErrors(prev => ({ ...prev, roleId: undefined }));
    }
  };

  if (!isOpen) return null;

  const hasRoleChanged = originalRoleId !== formData.roleId;
  const originalRole = user?.role;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Usuario</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <InfoBox>
              <InfoTitle>Sistema de Control de Acceso Basado en Roles (RBAC)</InfoTitle>
              <InfoText>
                Los permisos del usuario están determinados por el rol asignado. 
                Para modificar permisos, edite el rol correspondiente en la sección "Roles y Permisos".
              </InfoText>
            </InfoBox>

            {/* Alerta de cambio de rol */}
            {hasRoleChanged && originalRole && selectedRole && (
              <RoleChangeAlert>
                <RoleChangeTitle>⚠️ Cambio de Rol Detectado</RoleChangeTitle>
                <RoleChangeText>
                  Está cambiando el rol de 
                  <RoleChangeBadge $variant="old">{originalRole.name}</RoleChangeBadge>
                  a
                  <RoleChangeBadge $variant="new">{selectedRole.name}</RoleChangeBadge>
                </RoleChangeText>
                <RoleChangeText style={{ marginTop: '8px', fontWeight: 600 }}>
                  Los permisos del usuario se actualizarán según el nuevo rol.
                </RoleChangeText>
              </RoleChangeAlert>
            )}

            <InputGroup>
              <Label htmlFor="username">Nombre de Usuario</Label>
              <InputWithError
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                hasError={!!errors.username}
                required
              />
              {errors.username && <ValidationMessage $type="error">{errors.username}</ValidationMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <InputWithError
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                hasError={!!errors.email}
                required
              />
              {errors.email && <ValidationMessage $type="error">{errors.email}</ValidationMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="firstName">Nombre</Label>
              <InputWithError
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                hasError={!!errors.firstName}
                required
              />
              {errors.firstName && <ValidationMessage $type="error">{errors.firstName}</ValidationMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="lastName">Apellido</Label>
              <InputWithError
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                hasError={!!errors.lastName}
                required
              />
              {errors.lastName && <ValidationMessage $type="error">{errors.lastName}</ValidationMessage>}
            </InputGroup>

            <Divider />

            {/* ✅ RBAC: Selector de Rol con componente reutilizable */}
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
                title={`Permisos del rol "${selectedRole.name}":`}
                groupByModule
              />
            )}

            <Divider />
          </FormGroup>
          
          <ModalButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </ModalButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarUsuarioModal;

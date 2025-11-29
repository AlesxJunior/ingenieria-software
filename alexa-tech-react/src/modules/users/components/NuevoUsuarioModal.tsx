import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { validatePasswordWithConfirmation, validateUsername, validateEmail } from '../../../utils/validation';
import PasswordRequirements from '../../../components/PasswordRequirements';
import RoleSelector from './RoleSelector';
import PermissionsPreview from './PermissionsPreview';

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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
`;

const Required = styled.span`
  color: #e74c3c;
  margin-left: 0.25rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#dee2e6'};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
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
`;

const CheckboxLabel = styled.label`
  color: #2c3e50;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
`;

const Divider = styled.div`
  height: 1px;
  background: #e9ecef;
  margin: 1.5rem 0;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background: #3498db;
    border-radius: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 120px;

  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: #3498db;
        color: white;
        &:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }
      `;
    }
    return `
      background: #95a5a6;
      color: white;
      &:hover:not(:disabled) {
        background: #7f8c8d;
      }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  
  p {
    margin: 0;
    color: #1565c0;
    font-size: 0.9rem;
    line-height: 1.5;
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
                Nombre de Usuario<Required>*</Required>
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
              {errors.username && <ErrorText>{errors.username}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Correo Electrónico<Required>*</Required>
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
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>
                Nombre<Required>*</Required>
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
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Apellido<Required>*</Required>
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
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
            </FormGroup>
          </FormRow>

          <Divider />

          {/* SEGURIDAD */}
          <SectionTitle>Seguridad</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>
                Contraseña<Required>*</Required>
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
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Confirmar Contraseña<Required>*</Required>
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
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
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

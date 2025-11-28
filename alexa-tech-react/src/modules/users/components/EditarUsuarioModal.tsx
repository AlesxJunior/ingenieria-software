import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { validateUsername, validateEmail } from '../../../utils/validation';
import { apiService } from '../../../utils/api';

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
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

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

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#ddd'};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const InputWithError = styled(Input)<{ hasError?: boolean }>`
  border-color: ${props => props.hasError ? '#dc3545' : '#ddd'};
  
  &:focus {
    border-color: ${props => props.hasError ? '#dc3545' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 6px;
  margin-left: 4px;
  font-weight: 500;
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border-left: 4px solid #2196f3;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const InfoTitle = styled.div`
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
  font-size: 14px;
`;

const InfoText = styled.div`
  color: #0d47a1;
  font-size: 13px;
  line-height: 1.5;
`;

const PermissionsPreview = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
`;

const PermissionBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  margin: 4px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
    }
  `}
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 10px;
    cursor: pointer;
  }
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    isActive: true,
    roleId: ''
  });

  // Cargar roles disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.get<Role[]>('/users/roles');
        setRoles(response.filter(r => r.isActive));
      } catch (error) {
        console.error('Error al cargar roles:', error);
        showNotification('error', 'Error', 'No se pudieron cargar los roles disponibles');
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roleId: user.roleId
      });

      // Cargar permisos del rol actual
      if (user.role) {
        setSelectedRolePermissions(user.role.permissions);
      }
    }
  }, [user]);

  // Actualizar preview de permisos cuando cambia el rol
  useEffect(() => {
    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (selectedRole) {
      setSelectedRolePermissions(selectedRole.permissions);
    } else {
      setSelectedRolePermissions([]);
    }
  }, [formData.roleId, roles]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  if (!isOpen) return null;

  const selectedRole = roles.find(r => r.id === formData.roleId);

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
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
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
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
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
              {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
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
              {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="roleId">Rol *</Label>
              <Select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                hasError={!!errors.roleId}
                required
              >
                <option value="">Seleccionar rol...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </Select>
              {errors.roleId && <ErrorMessage>{errors.roleId}</ErrorMessage>}

              {selectedRole && selectedRolePermissions.length > 0 && (
                <PermissionsPreview>
                  <Label style={{ marginBottom: '8px' }}>
                    Permisos del rol "{selectedRole.name}":
                  </Label>
                  {selectedRolePermissions.map(permission => (
                    <PermissionBadge key={permission}>
                      {permission}
                    </PermissionBadge>
                  ))}
                </PermissionsPreview>
              )}
            </InputGroup>

            <InputGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Usuario Activo
              </CheckboxLabel>
            </InputGroup>
          </FormGroup>
          
          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarUsuarioModal;

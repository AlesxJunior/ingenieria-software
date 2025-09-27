import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { validatePasswordWithConfirmation, validateUsername, validateEmail } from '../utils/validation';
import PasswordRequirements from './PasswordRequirements';
import PermissionSelector from './PermissionSelector';

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO';
  password: string;
  confirmPassword: string;
  isActive: boolean;
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserFormData>) => Promise<void>;
}

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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Form = styled.form`
  display: grid;
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
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
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

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;



const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  `}

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'VENDEDOR',
    password: '',
    confirmPassword: '',
    isActive: true,
    permissions: []
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



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionsChange = (permissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
      
      // Resetear formulario
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'VENDEDOR',
        password: '',
        confirmPassword: '',
        isActive: true,
        permissions: []
      });
      
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      showNotification('error', 'Error', 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Crear Nuevo Usuario</Title>
          <CloseButton onClick={onClose}>Cerrar</CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                $hasError={!!errors.username}
                placeholder="Ingrese el nombre de usuario"
              />
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                $hasError={!!errors.email}
                placeholder="Ingrese el email"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                $hasError={!!errors.firstName}
                placeholder="Ingrese el nombre"
              />
              {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                $hasError={!!errors.lastName}
                placeholder="Ingrese el apellido"
              />
              {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>

            <FormGroup>
              <Label htmlFor="role">Rol *</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                $hasError={!!errors.role}
              >
                <option value="VENDEDOR">Vendedor</option>
              <option value="CAJERO">Cajero</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Administrador</option>
              </Select>
              {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                $hasError={!!errors.password}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              <PasswordRequirements password={formData.password} />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                $hasError={!!errors.confirmPassword}
                placeholder="Confirme la contraseña"
              />
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <PermissionSelector
            selectedPermissions={formData.permissions}
            onPermissionsChange={handlePermissionsChange}
          />

          <FormGroup>
            <Label htmlFor="isActive">
              <Input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                style={{ width: 'auto', marginRight: '8px' }}
              />
              Usuario Activo
            </Label>
          </FormGroup>



          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
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
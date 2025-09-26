import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
  confirmPassword: string;
  status: 'activo' | 'inactivo';
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const PermissionsContainer = styled.div`
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
`;

const PermissionsTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
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

const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    role: '',
    password: '',
    confirmPassword: '',
    status: 'activo',
    permissions: []
  });

  const availablePermissions = [
    'crear_usuarios', 'editar_usuarios', 'eliminar_usuarios', 'ver_usuarios',
    'crear_productos', 'editar_productos', 'eliminar_productos', 'ver_productos',
    'crear_clientes', 'editar_clientes', 'eliminar_clientes', 'ver_clientes',
    'realizar_ventas', 'ver_ventas', 'cancelar_ventas',
    'gestionar_caja', 'ver_reportes', 'configurar_sistema'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
    
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('success', 'Éxito', 'Usuario creado exitosamente');
      onClose();
      
      // Resetear formulario
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: '',
        password: '',
        confirmPassword: '',
        status: 'activo',
        permissions: []
      });
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
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                $hasError={!!errors.fullName}
                placeholder="Ingrese el nombre completo"
              />
              {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="role">Rol *</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                $hasError={!!errors.role}
              >
                <option value="">Seleccione un rol</option>
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
                <option value="cajero">Cajero</option>
                <option value="supervisor">Supervisor</option>
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
                placeholder="Ingrese la contraseña"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
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

          <FormGroup>
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </FormGroup>

          <PermissionsContainer>
            <PermissionsTitle>Permisos *</PermissionsTitle>
            <PermissionsGrid>
              {availablePermissions.map(permission => (
                <PermissionItem key={permission}>
                  <Checkbox
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                  />
                  <span>{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </PermissionItem>
              ))}
            </PermissionsGrid>
            {errors.permissions && <ErrorMessage>{errors.permissions}</ErrorMessage>}
          </PermissionsContainer>

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
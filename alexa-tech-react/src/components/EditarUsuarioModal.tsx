import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PermissionSelector from './PermissionSelector';
import { useNotification } from '../context/NotificationContext';

interface ExtendedUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO';
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO';
  isActive: boolean;
  permissions: string[];
}

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  onSave: (userData: UserFormData) => Promise<void>;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;



const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  ${props => props.variant === 'primary' ? `
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
    }
  `}

  &:disabled {
    background-color: #6c757d;
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'VENDEDOR',
    isActive: true,
    permissions: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        permissions: user.permissions ? user.permissions.map(p => p.id) : []
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
       console.error('Error al actualizar el usuario:', error);
       showNotification('error', 'Error', 'Error al actualizar el usuario');
     } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'role' ? value as 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO' : value
    }));
  };

  const handlePermissionsChange = (permissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions
    }));
  };



  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Usuario</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="VENDEDOR">Vendedor</option>
              <option value="CAJERO">Cajero</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Administrador</option>
            </Select>
          </FormGroup>
          
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
                onChange={handleChange}
                style={{ width: 'auto', marginRight: '8px' }}
              />
              Usuario Activo
            </Label>
          </FormGroup>


          
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarUsuarioModal;
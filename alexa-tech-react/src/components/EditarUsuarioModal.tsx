import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface ExtendedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
  status: 'activo' | 'inactivo' | 'suspendido';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  onSave: (userData: Partial<ExtendedUser>) => void;
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

const PermissionsContainer = styled.div`
  margin-bottom: 20px;
`;

const PermissionsTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9f9f9;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const PermissionCheckbox = styled.input`
  margin-right: 8px;
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const PermissionDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
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
`;

const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const availablePermissions: Permission[] = [
    { id: 'dashboard', name: 'Dashboard', description: 'Acceso al panel principal', module: 'General' },
    { id: 'usuarios', name: 'Usuarios', description: 'Gestión de usuarios', module: 'Administración' },
    { id: 'clientes', name: 'Clientes', description: 'Gestión de clientes', module: 'Ventas' },
    { id: 'ventas', name: 'Ventas', description: 'Gestión de ventas', module: 'Ventas' },
    { id: 'productos', name: 'Productos', description: 'Gestión de productos', module: 'Inventario' },
    { id: 'inventario', name: 'Inventario', description: 'Control de inventario', module: 'Inventario' },
    { id: 'caja', name: 'Caja', description: 'Gestión de caja', module: 'Finanzas' },
    { id: 'reportes', name: 'Reportes', description: 'Generación de reportes', module: 'Análisis' }
  ];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: 'activo' as 'activo' | 'inactivo' | 'suspendido',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions || []
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? value as 'activo' | 'inactivo' | 'suspendido' : value
    }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
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
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="cajero">Cajero</option>
              <option value="supervisor">Supervisor</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </FormGroup>

          <PermissionsContainer>
            <PermissionsTitle>Permisos</PermissionsTitle>
            <PermissionsGrid>
              {availablePermissions.map((permission) => (
                <PermissionItem key={permission.id}>
                  <PermissionCheckbox
                    type="checkbox"
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                  <PermissionInfo>
                    <PermissionName>{permission.name}</PermissionName>
                    <PermissionDescription>{permission.description}</PermissionDescription>
                  </PermissionInfo>
                </PermissionItem>
              ))}
            </PermissionsGrid>
          </PermissionsContainer>
          
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarUsuarioModal;
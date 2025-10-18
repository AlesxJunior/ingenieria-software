import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { validateUsername, validateEmail } from '../utils/validation';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  submodule?: string;
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
  permissions?: string[];
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions: string[];
}

interface FormErrors {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  onSave: (userData: UserFormData) => void;
}

// Definición de permisos disponibles basados en el sistema del backend
const AVAILABLE_PERMISSIONS: Permission[] = [
  // MÓDULO: DASHBOARD
  {
    id: 'dashboard.read',
    name: 'Ver Dashboard',
    description: 'Acceder al panel principal y métricas del sistema',
    module: 'DASHBOARD'
  },
  
  // MÓDULO: USUARIOS
  {
    id: 'users.create',
    name: 'Crear Usuarios',
    description: 'Crear nuevos usuarios en el sistema',
    module: 'USUARIOS'
  },
  {
    id: 'users.read',
    name: 'Ver Usuarios',
    description: 'Ver la lista de usuarios del sistema',
    module: 'USUARIOS'
  },
  {
    id: 'users.update',
    name: 'Actualizar Usuarios',
    description: 'Modificar información de usuarios existentes',
    module: 'USUARIOS'
  },
  
  
  // MÓDULO: ENTIDADES COMERCIALES
  {
    id: 'commercial_entities.create',
    name: 'Crear Entidades Comerciales',
    description: 'Registrar nuevas entidades comerciales en el sistema',
    module: 'ENTIDADES COMERCIALES'
  },
  {
    id: 'commercial_entities.read',
    name: 'Ver Entidades Comerciales',
    description: 'Ver la lista de entidades comerciales del sistema',
    module: 'ENTIDADES COMERCIALES'
  },
  {
    id: 'commercial_entities.update',
    name: 'Actualizar Entidades Comerciales',
    description: 'Modificar información de entidades comerciales',
    module: 'ENTIDADES COMERCIALES'
  },
  
  // MÓDULO: VENTAS
  {
    id: 'sales.create',
    name: 'Crear Ventas',
    description: 'Registrar nuevas ventas',
    module: 'VENTAS'
  },
  {
    id: 'sales.read',
    name: 'Ver Ventas',
    description: 'Ver el historial de ventas',
    module: 'VENTAS'
  },
  {
    id: 'sales.update',
    name: 'Actualizar Ventas',
    description: 'Modificar ventas existentes',
    module: 'VENTAS'
  },
  {
    id: 'sales.delete',
    name: 'Eliminar Ventas',
    description: 'Eliminar registros de ventas',
    module: 'VENTAS'
  },
  
  // MÓDULO: PRODUCTOS
  {
    id: 'products.create',
    name: 'Crear Productos',
    description: 'Agregar nuevos productos al catálogo',
    module: 'PRODUCTOS'
  },
  {
    id: 'products.read',
    name: 'Ver Productos',
    description: 'Ver el catálogo de productos',
    module: 'PRODUCTOS'
  },
  {
    id: 'products.update',
    name: 'Actualizar Productos',
    description: 'Modificar información de productos',
    module: 'PRODUCTOS'
  },
  {
    id: 'products.delete',
    name: 'Eliminar Productos',
    description: 'Eliminar productos del catálogo',
    module: 'PRODUCTOS'
  },
  
  // MÓDULO: INVENTARIO
  {
    id: 'inventory.read',
    name: 'Ver Inventario',
    description: 'Ver el estado del inventario',
    module: 'INVENTARIO'
  },
  {
    id: 'inventory.update',
    name: 'Actualizar Inventario',
    description: 'Modificar niveles de inventario',
    module: 'INVENTARIO'
  },
  
  // MÓDULO: COMPRAS
  {
    id: 'purchases.create',
    name: 'Crear Compras',
    description: 'Registrar nuevas compras a proveedores',
    module: 'COMPRAS'
  },
  {
    id: 'purchases.read',
    name: 'Ver Compras',
    description: 'Ver el historial de compras',
    module: 'COMPRAS'
  },
  {
    id: 'purchases.update',
    name: 'Actualizar Compras',
    description: 'Modificar compras existentes',
    module: 'COMPRAS'
  },
  {
    id: 'purchases.delete',
    name: 'Eliminar Compras',
    description: 'Eliminar registros de compras',
    module: 'COMPRAS'
  },
  
  // MÓDULO: FACTURACIÓN
  {
    id: 'invoicing.create',
    name: 'Crear Facturas',
    description: 'Generar nuevas facturas',
    module: 'FACTURACIÓN'
  },
  {
    id: 'invoicing.read',
    name: 'Ver Facturas',
    description: 'Ver el historial de facturas',
    module: 'FACTURACIÓN'
  },
  {
    id: 'invoicing.update',
    name: 'Actualizar Facturas',
    description: 'Modificar facturas existentes',
    module: 'FACTURACIÓN'
  },
  {
    id: 'invoicing.delete',
    name: 'Eliminar Facturas',
    description: 'Eliminar facturas del sistema',
    module: 'FACTURACIÓN'
  },
  
  // MÓDULO: CONFIGURACIÓN
  {
    id: 'configuration.read',
    name: 'Ver Configuración',
    description: 'Acceder a la configuración del sistema',
    module: 'CONFIGURACIÓN'
  },
  {
    id: 'configuration.update',
    name: 'Actualizar Configuración',
    description: 'Modificar configuraciones del sistema',
    module: 'CONFIGURACIÓN'
  },
  
  // MÓDULO: REPORTES
  {
    id: 'reports.sales',
    name: 'Reportes de Ventas',
    description: 'Generar y ver reportes de ventas',
    module: 'REPORTES'
  },
  {
    id: 'reports.users',
    name: 'Reportes de Usuarios',
    description: 'Generar y ver reportes de usuarios',
    module: 'REPORTES'
  },
  {
    id: 'reports.inventory',
    name: 'Reportes de Inventario',
    description: 'Ver reportes de inventario y stock',
    module: 'REPORTES'
  },
  {
    id: 'reports.financial',
    name: 'Reportes Financieros',
    description: 'Ver reportes financieros y contables',
    module: 'REPORTES'
  }
];



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



const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PermissionsSection = styled.div`
  margin-top: 20px;
`;

const PermissionsTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
`;

const ModuleGroup = styled.div`
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const ModuleHeader = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModuleName = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
`;

const SelectAllButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #764ba2;
  }
`;

const PermissionsList = styled.div`
  padding: 16px;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PermissionCheckbox = styled.input`
  margin-right: 12px;
  margin-top: 2px;
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
`;

const PermissionDescription = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const InputWithError = styled(Input)<{ hasError?: boolean }>`
  border-color: ${props => props.hasError ? '#dc3545' : '#ddd'};
  
  &:focus {
    border-color: ${props => props.hasError ? '#dc3545' : '#667eea'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(102, 126, 234, 0.25)'};
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
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
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
        isActive: user.isActive,
        permissions: user.permissions || []
      });
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

    // Los permisos son opcionales, no requieren validación específica

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
       const errorMessage = (error as Error).message || 'No se pudo actualizar el usuario. Es posible que no tengas los permisos necesarios.';
       console.error('Error al actualizar el usuario:', error);
       showNotification('error', 'Error de Actualización', errorMessage);
       return;
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
  };



  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const handleSelectAllPermissions = (module: string, select: boolean) => {
    const modulePermissions = AVAILABLE_PERMISSIONS
      .filter(p => p.module === module)
      .map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: select
        ? [...new Set([...prev.permissions, ...modulePermissions])]
        : prev.permissions.filter(id => !modulePermissions.includes(id))
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

          <PermissionsSection>
            <PermissionsTitle>Permisos del Usuario</PermissionsTitle>
            {Object.entries(
              AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
                if (!acc[permission.module]) {
                  acc[permission.module] = [];
                }
                acc[permission.module].push(permission);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([module, permissions]) => {
              const modulePermissionIds = permissions.map(p => p.id);
              const allSelected = modulePermissionIds.every(id => formData.permissions.includes(id));
              
              return (
                <ModuleGroup key={module}>
                  <ModuleHeader>
                    <ModuleName>{module}</ModuleName>
                    <SelectAllButton
                      type="button"
                      onClick={() => handleSelectAllPermissions(module, !allSelected)}
                    >
                      {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </SelectAllButton>
                  </ModuleHeader>
                  <PermissionsList>
                    {permissions.map(permission => (
                      <PermissionItem key={permission.id}>
                        <PermissionCheckbox
                          type="checkbox"
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        />
                        <PermissionInfo>
                          <PermissionName>{permission.name}</PermissionName>
                          <PermissionDescription>{permission.description}</PermissionDescription>
                        </PermissionInfo>
                      </PermissionItem>
                    ))}
                  </PermissionsList>
                </ModuleGroup>
              );
            })}
          </PermissionsSection>


          
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
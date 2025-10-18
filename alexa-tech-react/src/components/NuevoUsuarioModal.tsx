import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { validatePasswordWithConfirmation, validateUsername, validateEmail } from '../utils/validation';
import PasswordRequirements from './PasswordRequirements';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  submodule?: string;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
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
    description: 'Modificar información de entidades comerciales existentes',
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
    description: 'Modificar información de productos existentes',
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
    description: 'Modificar cantidades y estado del inventario',
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
    description: 'Ver reportes y estadísticas de ventas',
    module: 'REPORTES'
  },
  {
    id: 'reports.users',
    name: 'Auditoría de Usuarios',
    description: 'Ver registros de actividad y auditoría de usuarios',
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
const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
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
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
      
      // Mostrar notificación de éxito
      showNotification('success', 'Usuario Creado', 'El usuario ha sido creado exitosamente.');
      
      // Resetear formulario
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        permissions: []
      });
      
      setErrors({});
      
      // Cerrar modal
      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message || 'No se pudo crear el usuario. Es posible que no tengas los permisos necesarios.';
      console.error('Error al crear el usuario:', error);
      showNotification('error', 'Error de Creación', errorMessage);
      return;
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
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevoUsuarioModal;
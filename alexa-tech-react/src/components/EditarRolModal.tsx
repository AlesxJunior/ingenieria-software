import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { apiService } from '../utils/api';

// ============================================================================
// INTERFACES
// ============================================================================

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface EditarRolModalProps {
  role: Role;
  onClose: () => void;
  onSubmit: (roleData: Partial<RoleFormData>) => Promise<void>;
}

// ============================================================================
// PERMISOS DISPONIBLES (mismo metadata que NuevoRolModal)
// ============================================================================

const PERMISSION_METADATA: Record<string, { name: string; description: string; module: string }> = {
  // Dashboard
  'dashboard.read': { name: 'Ver Dashboard', description: 'Acceso al panel principal', module: 'DASHBOARD' },
  
  // Usuarios
  'users.create': { name: 'Crear Usuarios', description: 'Crear nuevos usuarios', module: 'USUARIOS' },
  'users.read': { name: 'Ver Usuarios', description: 'Ver lista de usuarios', module: 'USUARIOS' },
  'users.update': { name: 'Actualizar Usuarios', description: 'Modificar usuarios', module: 'USUARIOS' },
  
  // Clientes
  'clients.create': { name: 'Crear Clientes', description: 'Registrar clientes', module: 'CLIENTES' },
  'clients.read': { name: 'Ver Clientes', description: 'Ver lista de clientes', module: 'CLIENTES' },
  'clients.update': { name: 'Actualizar Clientes', description: 'Modificar clientes', module: 'CLIENTES' },
  'clients.delete': { name: 'Eliminar Clientes', description: 'Eliminar clientes', module: 'CLIENTES' },
  
  // Ventas
  'sales.create': { name: 'Crear Ventas', description: 'Registrar ventas', module: 'VENTAS' },
  'sales.read': { name: 'Ver Ventas', description: 'Ver lista de ventas', module: 'VENTAS' },
  'sales.update': { name: 'Actualizar Ventas', description: 'Modificar ventas', module: 'VENTAS' },
  'sales.delete': { name: 'Eliminar Ventas', description: 'Eliminar ventas', module: 'VENTAS' },
  
  // Productos
  'products.create': { name: 'Crear Productos', description: 'Registrar productos', module: 'PRODUCTOS' },
  'products.read': { name: 'Ver Productos', description: 'Ver lista de productos', module: 'PRODUCTOS' },
  'products.update': { name: 'Actualizar Productos', description: 'Modificar productos', module: 'PRODUCTOS' },
  'products.delete': { name: 'Eliminar Productos', description: 'Eliminar productos', module: 'PRODUCTOS' },
  
  // Inventario
  'inventory.read': { name: 'Ver Inventario', description: 'Ver estado de inventario', module: 'INVENTARIO' },
  'inventory.update': { name: 'Actualizar Inventario', description: 'Modificar inventario', module: 'INVENTARIO' },
  
  // Compras
  'purchases.create': { name: 'Crear Compras', description: 'Registrar compras', module: 'COMPRAS' },
  'purchases.read': { name: 'Ver Compras', description: 'Ver lista de compras', module: 'COMPRAS' },
  'purchases.update': { name: 'Actualizar Compras', description: 'Modificar compras', module: 'COMPRAS' },
  'purchases.delete': { name: 'Eliminar Compras', description: 'Eliminar compras', module: 'COMPRAS' },
  
  // Cajas Registradoras
  'cash-registers.create': { name: 'Crear Cajas', description: 'Registrar cajas', module: 'CAJAS' },
  'cash-registers.read': { name: 'Ver Cajas', description: 'Ver lista de cajas', module: 'CAJAS' },
  'cash-registers.update': { name: 'Actualizar Cajas', description: 'Modificar cajas', module: 'CAJAS' },
  'cash-registers.delete': { name: 'Eliminar Cajas', description: 'Eliminar cajas', module: 'CAJAS' },
  
  // Sesiones de Caja
  'cash-sessions.create': { name: 'Crear Sesiones', description: 'Abrir sesiones de caja', module: 'SESIONES' },
  'cash-sessions.read': { name: 'Ver Sesiones', description: 'Ver sesiones de caja', module: 'SESIONES' },
  'cash-sessions.update': { name: 'Actualizar Sesiones', description: 'Modificar sesiones', module: 'SESIONES' },
  
  // Sistema
  'system.settings': { name: 'Configuración', description: 'Acceso a configuración', module: 'SISTEMA' },
  
  // Reportes
  'reports.sales': { name: 'Reportes de Ventas', description: 'Ver reportes de ventas', module: 'REPORTES' },
  'reports.inventory': { name: 'Reportes de Inventario', description: 'Ver reportes de inventario', module: 'REPORTES' },
  'reports.financial': { name: 'Reportes Financieros', description: 'Ver reportes financieros', module: 'REPORTES' },
};

// ============================================================================
// STYLED COMPONENTS (idénticos a NuevoRolModal)
// ============================================================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const SystemBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;

  span {
    color: #e74c3c;
    margin-left: 0.25rem;
  }
`;

const Input = styled.input<{ $hasError?: boolean; disabled?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
    box-shadow: ${props => props.disabled ? 'none' : `0 0 0 3px ${props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'}`};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean; disabled?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
    box-shadow: ${props => props.disabled ? 'none' : `0 0 0 3px ${props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'}`};
  }
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const InfoText = styled.div`
  background: #d1ecf1;
  color: #0c5460;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #0c5460;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const PermissionsSection = styled.div`
  margin-top: 1rem;
`;

const PermissionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PermissionCount = styled.span`
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const SelectAllButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: #2980b9;
  }
`;

const ModuleGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ModuleTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  padding: 0.5rem 0;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-top: 0.25rem;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const PermissionDescription = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    &:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
  ` : `
    background: #f8f9fa;
    color: #495057;
    &:hover { background: #e9ecef; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

// ============================================================================
// COMPONENTE
// ============================================================================

const EditarRolModal: React.FC<EditarRolModalProps> = ({ role, onClose, onSubmit }) => {
  const { showError } = useNotification();
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [validPermissions, setValidPermissions] = useState<string[]>([]);

  // Cargar permisos válidos del backend
  useEffect(() => {
    loadValidPermissions();
  }, []);

  const loadValidPermissions = async () => {
    try {
      const response = await apiService.get<string[]>('/roles/permissions');
      setValidPermissions(response.data || []);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      showError('Error al cargar permisos disponibles');
    }
  };

  // Agrupar permisos por módulo
  const permissionsByModule = validPermissions.reduce((acc, permId) => {
    const metadata = PERMISSION_METADATA[permId];
    if (metadata) {
      const module = metadata.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push({
        id: permId,
        ...metadata
      });
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.permissions.length === validPermissions.length) {
      setFormData(prev => ({ ...prev, permissions: [] }));
    } else {
      setFormData(prev => ({ ...prev, permissions: [...validPermissions] }));
    }
  };

  const handleModuleToggle = (module: string) => {
    const modulePerms = permissionsByModule[module].map(p => p.id);
    const allSelected = modulePerms.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !modulePerms.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...modulePerms])]
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Solo validar nombre y descripción si no es rol del sistema
    if (!role.isSystem) {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre del rol es requerido';
      } else if (formData.name.length < 3) {
        newErrors.name = 'El nombre debe tener al menos 3 caracteres';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
      } else if (formData.description.length < 10) {
        newErrors.description = 'La descripción debe tener al menos 10 caracteres';
      }
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      
      // Si es rol del sistema, solo enviamos permisos
      if (role.isSystem) {
        await onSubmit({ permissions: formData.permissions });
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      // Error ya manejado en el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ModalTitle>Editar Rol</ModalTitle>
            {role.isSystem && <SystemBadge>Sistema</SystemBadge>}
          </div>
          <CloseButton onClick={onClose} type="button">×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {role.isSystem && (
            <InfoText>
              <strong>Rol del Sistema:</strong> Solo puedes modificar los permisos. El nombre y descripción no pueden cambiarse.
            </InfoText>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                Nombre del Rol{!role.isSystem && <span>*</span>}
              </Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Gerente, Asistente, etc."
                $hasError={!!errors.name}
                disabled={role.isSystem}
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Descripción{!role.isSystem && <span>*</span>}
              </Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe las responsabilidades y alcance de este rol..."
                $hasError={!!errors.description}
                disabled={role.isSystem}
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            <PermissionsSection>
              <PermissionsHeader>
                <Label>
                  Permisos<span>*</span>
                  {formData.permissions.length > 0 && (
                    <PermissionCount style={{ marginLeft: '1rem' }}>
                      {formData.permissions.length} seleccionados
                    </PermissionCount>
                  )}
                </Label>
                <SelectAllButton type="button" onClick={handleSelectAll}>
                  {formData.permissions.length === validPermissions.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </SelectAllButton>
              </PermissionsHeader>
              {errors.permissions && <ErrorText>{errors.permissions}</ErrorText>}

              {Object.entries(permissionsByModule).map(([module, permissions]) => (
                <ModuleGroup key={module}>
                  <ModuleTitle>
                    {module}
                    <SelectAllButton type="button" onClick={() => handleModuleToggle(module)}>
                      {permissions.every(p => formData.permissions.includes(p.id)) ? 'Deseleccionar' : 'Seleccionar'}
                    </SelectAllButton>
                  </ModuleTitle>
                  <PermissionGrid>
                    {permissions.map(permission => (
                      <PermissionItem key={permission.id}>
                        <Checkbox
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                        <PermissionInfo>
                          <PermissionName>{permission.name}</PermissionName>
                          <PermissionDescription>{permission.description}</PermissionDescription>
                        </PermissionInfo>
                      </PermissionItem>
                    ))}
                  </PermissionGrid>
                </ModuleGroup>
              ))}
            </PermissionsSection>
          </Form>
        </ModalBody>

        <ModalFooter>
          <Button type="button" $variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" $variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EditarRolModal;

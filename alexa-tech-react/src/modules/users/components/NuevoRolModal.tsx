import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS, TRANSITIONS, Z_INDEX } from '../../../styles/theme';
import { Button, ValidationMessage, ButtonGroup } from '../../../components/shared';

// ============================================================================
// INTERFACES
// ============================================================================

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface NuevoRolModalProps {
  onClose: () => void;
  onSubmit: (roleData: RoleFormData) => Promise<void>;
}

// ============================================================================
// PERMISOS DISPONIBLES (43 permisos del sistema)
// ============================================================================

const PERMISSION_METADATA: Record<string, { name: string; description: string; module: string }> = {
  // Dashboard
  'dashboard.read': { name: 'Ver Dashboard', description: 'Acceso al panel principal', module: 'DASHBOARD' },
  
  // Usuarios
  'users.create': { name: 'Crear Usuarios', description: 'Crear nuevos usuarios', module: 'USUARIOS' },
  'users.read': { name: 'Ver Usuarios', description: 'Ver lista de usuarios', module: 'USUARIOS' },
  'users.update': { name: 'Actualizar Usuarios', description: 'Modificar usuarios', module: 'USUARIOS' },
  'users.delete': { name: 'Eliminar Usuarios', description: 'Eliminar usuarios', module: 'USUARIOS' },
  
  // Roles
  'roles.create': { name: 'Crear Roles', description: 'Crear nuevos roles', module: 'ROLES' },
  'roles.read': { name: 'Ver Roles', description: 'Ver lista de roles', module: 'ROLES' },
  'roles.update': { name: 'Actualizar Roles', description: 'Modificar roles', module: 'ROLES' },
  'roles.delete': { name: 'Eliminar Roles', description: 'Eliminar roles', module: 'ROLES' },
  
  // Clientes/Entidades Comerciales
  'clients.create': { name: 'Crear Entidades', description: 'Registrar clientes/proveedores', module: 'ENTIDADES COMERCIALES' },
  'clients.read': { name: 'Ver Entidades', description: 'Ver lista de clientes/proveedores', module: 'ENTIDADES COMERCIALES' },
  'clients.update': { name: 'Actualizar Entidades', description: 'Modificar clientes/proveedores', module: 'ENTIDADES COMERCIALES' },
  'clients.delete': { name: 'Eliminar Entidades', description: 'Eliminar clientes/proveedores', module: 'ENTIDADES COMERCIALES' },
  
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
  
  // Almacenes
  'warehouses.create': { name: 'Crear Almacenes', description: 'Registrar almacenes', module: 'ALMACENES' },
  'warehouses.read': { name: 'Ver Almacenes', description: 'Ver lista de almacenes', module: 'ALMACENES' },
  'warehouses.update': { name: 'Actualizar Almacenes', description: 'Modificar almacenes', module: 'ALMACENES' },
  'warehouses.delete': { name: 'Eliminar Almacenes', description: 'Eliminar almacenes', module: 'ALMACENES' },
  
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
  'cash-sessions.delete': { name: 'Eliminar Sesiones', description: 'Eliminar sesiones', module: 'SESIONES' },
  
  // Configuración
  'settings.read': { name: 'Ver Configuración', description: 'Ver configuración del sistema', module: 'CONFIGURACIÓN' },
  'settings.update': { name: 'Actualizar Configuración', description: 'Modificar configuración', module: 'CONFIGURACIÓN' },
  
  // Auditoría
  'audit.read': { name: 'Ver Auditoría', description: 'Ver registros de auditoría', module: 'AUDITORÍA' },
  
  // Reportes
  'reports.read': { name: 'Ver Reportes', description: 'Acceso a todos los reportes', module: 'REPORTES' },
};

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
  justify-content: center;
  align-items: center;
  z-index: ${Z_INDEX.modal};
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${SHADOWS.xl};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.h2};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${COLORS.textLight};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS.round};
  transition: all ${TRANSITIONS.normal};

  &:hover {
    background: ${COLORS.background};
    color: ${COLORS.text};
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
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.body};

  span {
    color: ${COLORS.danger};
    margin-left: 0.25rem;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.border};
  border-radius: ${BORDER_RADIUS.medium};
  font-size: ${TYPOGRAPHY.fontSize.body};
  transition: all ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? COLORS.dangerBg : COLORS.primaryLight};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.border};
  border-radius: ${BORDER_RADIUS.medium};
  font-size: ${TYPOGRAPHY.fontSize.body};
  min-height: 80px;
  resize: vertical;
  transition: all ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? COLORS.dangerBg : COLORS.primaryLight};
  }
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
  background: ${COLORS.infoBg};
  color: ${COLORS.infoText};
  padding: 0.25rem 0.75rem;
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const SelectAllButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.primary};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-family: ${TYPOGRAPHY.fontFamily};
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: ${COLORS.primaryHover};
  }
`;

const ModuleGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ModuleTitle = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  padding: 0.5rem 0;
  border-bottom: 2px solid ${COLORS.border};
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
  border: 2px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.medium};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};
  font-family: ${TYPOGRAPHY.fontFamily};

  &:hover {
    border-color: ${COLORS.primary};
    background: ${COLORS.background};
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-top: 0.25rem;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: ${COLORS.primary};
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const PermissionDescription = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  margin-top: 0.25rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

// ============================================================================
// COMPONENTE
// ============================================================================

const NuevoRolModal: React.FC<NuevoRolModalProps> = ({ onClose, onSubmit }) => {
  const { showError } = useNotification();
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
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
      await onSubmit(formData);
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
          <ModalTitle>Nuevo Rol</ModalTitle>
          <CloseButton onClick={onClose} type="button">×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                Nombre del Rol<span>*</span>
              </Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Gerente, Asistente, etc."
                $hasError={!!errors.name}
              />
              {errors.name && <ValidationMessage $type="error">{errors.name}</ValidationMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Descripción<span>*</span>
              </Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe las responsabilidades y alcance de este rol..."
                $hasError={!!errors.description}
              />
              {errors.description && <ValidationMessage $type="error">{errors.description}</ValidationMessage>}
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
              {errors.permissions && <ValidationMessage $type="error">{errors.permissions}</ValidationMessage>}

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
            {loading ? 'Creando...' : 'Crear Rol'}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default NuevoRolModal;

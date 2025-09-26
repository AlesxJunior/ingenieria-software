import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

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
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const CreateButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2980b9;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const RoleCard = styled.div`
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleName = styled.h3`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const RoleDescription = styled.p`
  color: #7f8c8d;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
`;

const RoleStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const StatLabel = styled.span`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const Badge = styled.span<{ variant: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.variant) {
      case 'system':
        return `background: #e74c3c; color: white;`;
      case 'custom':
        return `background: #3498db; color: white;`;
      default:
        return `background: #95a5a6; color: white;`;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          background: #f39c12;
          color: white;
          &:hover { background: #e67e22; }
        `;
      case 'delete':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover { background: #7f8c8d; }
        `;
    }
  }}

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const PermissionCard = styled.div`
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
`;

const PermissionModule = styled.div`
  font-weight: 600;
  color: #3498db;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const PermissionName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const PermissionDescription = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;

  &:hover {
    color: #2c3e50;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
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

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
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

const PermissionsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
`;

const PermissionGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PermissionGroupTitle = styled.h4`
  color: #3498db;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const Checkbox = styled.input`
  margin: 0;
`;

const CheckboxLabel = styled.span`
  color: #2c3e50;
  font-size: 0.9rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  ${props => props.variant === 'primary' ? `
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

const GestionRoles: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const mockPermissions: Permission[] = [
    { id: 'users_view', name: 'Ver usuarios', description: 'Visualizar lista de usuarios', module: 'Usuarios' },
    { id: 'users_create', name: 'Crear usuarios', description: 'Registrar nuevos usuarios', module: 'Usuarios' },
    { id: 'users_edit', name: 'Editar usuarios', description: 'Modificar información de usuarios', module: 'Usuarios' },
    { id: 'users_delete', name: 'Eliminar usuarios', description: 'Eliminar usuarios del sistema', module: 'Usuarios' },
    { id: 'sales_view', name: 'Ver ventas', description: 'Visualizar registro de ventas', module: 'Ventas' },
    { id: 'sales_create', name: 'Crear ventas', description: 'Registrar nuevas ventas', module: 'Ventas' },
    { id: 'sales_edit', name: 'Editar ventas', description: 'Modificar ventas existentes', module: 'Ventas' },
    { id: 'inventory_view', name: 'Ver inventario', description: 'Visualizar productos en stock', module: 'Inventario' },
    { id: 'inventory_manage', name: 'Gestionar inventario', description: 'Agregar/editar productos', module: 'Inventario' },
    { id: 'reports_view', name: 'Ver reportes', description: 'Acceder a reportes del sistema', module: 'Reportes' },
    { id: 'reports_export', name: 'Exportar reportes', description: 'Descargar reportes en diferentes formatos', module: 'Reportes' },
    { id: 'settings_view', name: 'Ver configuración', description: 'Acceder a configuración del sistema', module: 'Configuración' },
    { id: 'settings_edit', name: 'Editar configuración', description: 'Modificar configuración del sistema', module: 'Configuración' }
  ];

  const mockRoles: Role[] = [
    {
      id: '1',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: mockPermissions.map(p => p.id),
      userCount: 2,
      isSystem: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Vendedor',
      description: 'Gestión de ventas y clientes',
      permissions: ['sales_view', 'sales_create', 'inventory_view', 'users_view'],
      userCount: 5,
      isSystem: false,
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'Cajero',
      description: 'Procesamiento de ventas y pagos',
      permissions: ['sales_view', 'sales_create', 'inventory_view'],
      userCount: 3,
      isSystem: false,
      createdAt: '2024-02-01'
    },
    {
      id: '4',
      name: 'Supervisor',
      description: 'Supervisión de operaciones y reportes',
      permissions: ['sales_view', 'inventory_view', 'reports_view', 'reports_export', 'users_view'],
      userCount: 1,
      isSystem: false,
      createdAt: '2024-02-15'
    }
  ];

  const groupedPermissions = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));

    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    if (role.isSystem) {
      showWarning('Los roles del sistema no pueden ser editados');
      return;
    }

    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingRole) {
        showSuccess(`Rol "${formData.name}" actualizado exitosamente`);
      } else {
        showSuccess(`Rol "${formData.name}" creado exitosamente`);
      }

      closeModal();
    } catch (error) {
      showError('Error al guardar el rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      showWarning('Los roles del sistema no pueden ser eliminados');
      return;
    }

    if (role.userCount > 0) {
      showWarning(`No se puede eliminar el rol "${role.name}" porque tiene ${role.userCount} usuario(s) asignado(s)`);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) {
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 500));
        showSuccess(`Rol "${role.name}" eliminado exitosamente`);
      } catch (error) {
        showError('Error al eliminar el rol');
      }
    }
  };

  return (
    <Layout title="Gestión de Roles">
      <Container>
        <Header>
          <Title>Gestión de Roles y Permisos</Title>
          <CreateButton onClick={openCreateModal}>
            Crear Nuevo Rol
          </CreateButton>
        </Header>

        <Grid>
          <Section>
            <SectionTitle>Roles del Sistema</SectionTitle>
            {mockRoles.map(role => (
              <RoleCard key={role.id}>
                <RoleHeader>
                  <RoleInfo>
                    <RoleName>{role.name}</RoleName>
                    <RoleDescription>{role.description}</RoleDescription>
                    <Badge variant={role.isSystem ? 'system' : 'custom'}>
                      {role.isSystem ? 'Sistema' : 'Personalizado'}
                    </Badge>
                  </RoleInfo>
                  <ActionButtons>
                    <ActionButton 
                      variant="edit" 
                      onClick={() => openEditModal(role)}
                      disabled={role.isSystem}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton 
                      variant="delete" 
                      onClick={() => handleDeleteRole(role)}
                      disabled={role.isSystem}
                    >
                      Eliminar
                    </ActionButton>
                  </ActionButtons>
                </RoleHeader>
                <RoleStats>
                  <Stat>
                    <StatValue>{role.userCount}</StatValue>
                    <StatLabel>Usuarios</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>{role.permissions.length}</StatValue>
                    <StatLabel>Permisos</StatLabel>
                  </Stat>
                </RoleStats>
              </RoleCard>
            ))}
          </Section>

          <Section>
            <SectionTitle>Permisos Disponibles</SectionTitle>
            <PermissionGrid>
              {mockPermissions.map(permission => (
                <PermissionCard key={permission.id}>
                  <PermissionModule>{permission.module}</PermissionModule>
                  <PermissionName>{permission.name}</PermissionName>
                  <PermissionDescription>{permission.description}</PermissionDescription>
                </PermissionCard>
              ))}
            </PermissionGrid>
          </Section>
        </Grid>

        <Modal $isOpen={isModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Nombre del Rol</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  $hasError={!!errors.name}
                  placeholder="Ej: Gerente de Ventas"
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Descripción</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  $hasError={!!errors.description}
                  placeholder="Describe las responsabilidades de este rol..."
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Permisos</Label>
                <PermissionsList>
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <PermissionGroup key={module}>
                      <PermissionGroupTitle>{module}</PermissionGroupTitle>
                      <CheckboxGroup>
                        {permissions.map(permission => (
                          <CheckboxItem key={permission.id}>
                            <Checkbox
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            />
                            <CheckboxLabel>
                              {permission.name} - {permission.description}
                            </CheckboxLabel>
                          </CheckboxItem>
                        ))}
                      </CheckboxGroup>
                    </PermissionGroup>
                  ))}
                </PermissionsList>
                {errors.permissions && <ErrorMessage>{errors.permissions}</ErrorMessage>}
              </FormGroup>

              <ButtonContainer>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : (editingRole ? 'Actualizar' : 'Crear')}
                </Button>
              </ButtonContainer>
            </Form>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default GestionRoles;
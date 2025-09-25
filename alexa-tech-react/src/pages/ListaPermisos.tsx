import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

// Interfaces para permisos y módulos
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  permissions: Permission[];
}

interface UserPermission {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  permissions: string[];
}

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e1e8ed;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$isActive ? '#3498db' : 'transparent'};
  color: ${props => props.$isActive ? 'white' : '#7f8c8d'};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isActive ? '#2980b9' : '#f8f9fa'};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 250px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #3498db;
          color: white;
          &:hover {
            background: #2980b9;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
            transform: translateY(-1px);
          }
        `;
    }
  }}
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ModuleCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ModuleHeader = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
`;

const ModuleTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ModuleIcon = styled.span`
  font-size: 1.5rem;
`;

const ModuleDescription = styled.p`
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const PermissionsList = styled.div`
  padding: 1rem;
`;

const PermissionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f2f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const PermissionDescription = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const PermissionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatusToggle = styled.button<{ $isActive: boolean }>`
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$isActive ? `
    background: #d4edda;
    color: #155724;
  ` : `
    background: #f8d7da;
    color: #721c24;
  `}

  &:hover {
    transform: scale(1.05);
  }
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.variant === 'edit' ? `
    background: #3498db;
    color: white;
    &:hover {
      background: #2980b9;
    }
  ` : `
    background: #e74c3c;
    color: white;
    &:hover {
      background: #c0392b;
    }
  `}
`;

const UserPermissionsTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }

  &:hover {
    background: #e3f2fd;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e1e8ed;
  color: #2c3e50;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.role) {
      case 'admin':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      case 'vendedor':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'cajero':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const PermissionTag = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  display: inline-block;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ListaPermisos: React.FC = () => {
  const { showError, showInfo } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'modules' | 'users'>('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  // Datos de ejemplo - en una aplicación real vendrían de una API
  const [modules] = useState<Module[]>([
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Panel principal con métricas y resúmenes',
      icon: '📊',
      permissions: [
        {
          id: 'dashboard_view',
          name: 'Ver Dashboard',
          description: 'Acceso al panel principal',
          module: 'dashboard',
          action: 'view',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'dashboard_export',
          name: 'Exportar Datos',
          description: 'Exportar información del dashboard',
          module: 'dashboard',
          action: 'export',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'usuarios',
      name: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      icon: '👥',
      permissions: [
        {
          id: 'users_view',
          name: 'Ver Usuarios',
          description: 'Listar y ver información de usuarios',
          module: 'usuarios',
          action: 'view',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'users_create',
          name: 'Crear Usuarios',
          description: 'Registrar nuevos usuarios',
          module: 'usuarios',
          action: 'create',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'users_edit',
          name: 'Editar Usuarios',
          description: 'Modificar información de usuarios',
          module: 'usuarios',
          action: 'edit',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'users_delete',
          name: 'Eliminar Usuarios',
          description: 'Eliminar usuarios del sistema',
          module: 'usuarios',
          action: 'delete',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'clientes',
      name: 'Clientes',
      description: 'Gestión de clientes y proveedores',
      icon: '🏢',
      permissions: [
        {
          id: 'clients_view',
          name: 'Ver Clientes',
          description: 'Listar y ver información de clientes',
          module: 'clientes',
          action: 'view',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'clients_create',
          name: 'Crear Clientes',
          description: 'Registrar nuevos clientes',
          module: 'clientes',
          action: 'create',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'clients_edit',
          name: 'Editar Clientes',
          description: 'Modificar información de clientes',
          module: 'clientes',
          action: 'edit',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'clients_delete',
          name: 'Eliminar Clientes',
          description: 'Eliminar clientes del sistema',
          module: 'clientes',
          action: 'delete',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'ventas',
      name: 'Ventas',
      description: 'Gestión de ventas y facturación',
      icon: '💰',
      permissions: [
        {
          id: 'sales_view',
          name: 'Ver Ventas',
          description: 'Listar y ver información de ventas',
          module: 'ventas',
          action: 'view',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sales_create',
          name: 'Realizar Ventas',
          description: 'Procesar nuevas ventas',
          module: 'ventas',
          action: 'create',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sales_cancel',
          name: 'Cancelar Ventas',
          description: 'Cancelar ventas existentes',
          module: 'ventas',
          action: 'cancel',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'productos',
      name: 'Productos',
      description: 'Gestión de productos e inventario',
      icon: '📦',
      permissions: [
        {
          id: 'products_view',
          name: 'Ver Productos',
          description: 'Listar y ver información de productos',
          module: 'productos',
          action: 'view',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'products_create',
          name: 'Crear Productos',
          description: 'Registrar nuevos productos',
          module: 'productos',
          action: 'create',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'products_edit',
          name: 'Editar Productos',
          description: 'Modificar información de productos',
          module: 'productos',
          action: 'edit',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'inventory_manage',
          name: 'Gestionar Inventario',
          description: 'Controlar stock y movimientos',
          module: 'productos',
          action: 'manage',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ]);

  const [userPermissions] = useState<UserPermission[]>([
    {
      userId: '1',
      userName: 'Administrador Principal',
      userEmail: 'admin@alexatech.com',
      role: 'admin',
      permissions: ['dashboard_view', 'dashboard_export', 'users_view', 'users_create', 'users_edit', 'clients_view', 'clients_create', 'clients_edit', 'clients_delete', 'sales_view', 'sales_create', 'products_view', 'products_create', 'products_edit', 'inventory_manage']
    },
    {
      userId: '2',
      userName: 'Jhose Daniel',
      userEmail: 'jhosedaniel@gmail.com',
      role: 'vendedor',
      permissions: ['dashboard_view', 'clients_view', 'clients_create', 'clients_edit', 'sales_view', 'sales_create', 'products_view']
    },
    {
      userId: '3',
      userName: 'Nestor René',
      userEmail: 'nestorRene@gmail.com',
      role: 'cajero',
      permissions: ['dashboard_view', 'sales_view', 'sales_create']
    },
    {
      userId: '4',
      userName: 'Alex Junior',
      userEmail: 'alexjunior@gmail.com',
      role: 'vendedor',
      permissions: ['dashboard_view', 'clients_view', 'sales_view']
    }
  ]);

  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.permissions.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesModule = !moduleFilter || module.id === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [modules, searchTerm, moduleFilter]);

  const filteredUserPermissions = useMemo(() => {
    return userPermissions.filter(user => {
      const matchesSearch = 
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [userPermissions, searchTerm]);

  const getPermissionName = (permissionId: string) => {
    for (const module of modules) {
      const permission = module.permissions.find(p => p.id === permissionId);
      if (permission) return permission.name;
    }
    return permissionId;
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'cajero': return 'Cajero';
      default: return role;
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    showInfo(`Cambiando estado del permiso: ${permissionId}`);
    // Aquí se implementaría la lógica para cambiar el estado del permiso
  };

  const handleEditPermission = (permissionId: string) => {
    showInfo(`Editando permiso: ${permissionId}`);
    // Aquí se implementaría la navegación al formulario de edición
  };

  const handleDeletePermission = (permissionId: string) => {
    showError(`¿Estás seguro de que deseas eliminar el permiso ${permissionId}?`);
    // Aquí se implementaría la confirmación y eliminación
  };

  const handleCreatePermission = () => {
    showInfo('Redirigiendo al formulario de creación de permiso');
    // Aquí se implementaría la navegación al formulario de creación
  };

  const handleAssignPermissions = (userId: string) => {
    showInfo(`Asignando permisos al usuario: ${userId}`);
    // Aquí se implementaría un modal para asignar permisos
  };

  const clearFilters = () => {
    setSearchTerm('');
    setModuleFilter('');
  };

  return (
    <Layout title="Lista de Permisos">
      <Container>
        <Header>
          <Title>Gestión de Permisos</Title>
          <Button variant="primary" onClick={handleCreatePermission}>
            Nuevo Permiso
          </Button>
        </Header>

        <TabContainer>
          <Tab 
            $isActive={activeTab === 'modules'} 
            onClick={() => setActiveTab('modules')}
          >
            Permisos por Módulos
          </Tab>
          <Tab 
            $isActive={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          >
            Permisos por Usuarios
          </Tab>
        </TabContainer>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder={activeTab === 'modules' ? "Buscar módulos o permisos..." : "Buscar usuarios..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {activeTab === 'modules' && (
            <FilterSelect
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">Todos los módulos</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </FilterSelect>
          )}
          {(searchTerm || moduleFilter) && (
            <Button variant="secondary" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          )}
        </SearchContainer>

        {activeTab === 'modules' ? (
          <ModulesGrid>
            {filteredModules.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🔐</EmptyIcon>
                <h3>No se encontraron módulos</h3>
                <p>No hay módulos que coincidan con los filtros aplicados.</p>
              </EmptyState>
            ) : (
              filteredModules.map((module) => (
                <ModuleCard key={module.id}>
                  <ModuleHeader>
                    <ModuleTitle>
                      <ModuleIcon>{module.icon}</ModuleIcon>
                      {module.name}
                    </ModuleTitle>
                    <ModuleDescription>{module.description}</ModuleDescription>
                  </ModuleHeader>
                  <PermissionsList>
                    {module.permissions.map((permission) => (
                      <PermissionItem key={permission.id}>
                        <PermissionInfo>
                          <PermissionName>{permission.name}</PermissionName>
                          <PermissionDescription>{permission.description}</PermissionDescription>
                        </PermissionInfo>
                        <PermissionActions>
                          <StatusToggle 
                            $isActive={permission.isActive}
                            onClick={() => handleTogglePermission(permission.id)}
                          >
                            {permission.isActive ? 'Activo' : 'Inactivo'}
                          </StatusToggle>
                          <ActionButton 
                            variant="edit"
                            onClick={() => handleEditPermission(permission.id)}
                          >
                            Editar
                          </ActionButton>
                          <ActionButton 
                            variant="delete"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            Eliminar
                          </ActionButton>
                        </PermissionActions>
                      </PermissionItem>
                    ))}
                  </PermissionsList>
                </ModuleCard>
              ))
            )}
          </ModulesGrid>
        ) : (
          <UserPermissionsTable>
            {filteredUserPermissions.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👤</EmptyIcon>
                <h3>No se encontraron usuarios</h3>
                <p>No hay usuarios que coincidan con los filtros aplicados.</p>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Usuario</TableHeaderCell>
                    <TableHeaderCell>Rol</TableHeaderCell>
                    <TableHeaderCell>Permisos Asignados</TableHeaderCell>
                    <TableHeaderCell>Acciones</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {filteredUserPermissions.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <UserInfo>
                          <UserName>{user.userName}</UserName>
                          <UserEmail>{user.userEmail}</UserEmail>
                        </UserInfo>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role}>
                          {getRoleText(user.role)}
                        </RoleBadge>
                      </TableCell>
                      <TableCell>
                        <div style={{ maxWidth: '300px' }}>
                          {user.permissions.slice(0, 5).map(permission => (
                            <PermissionTag key={permission}>
                              {getPermissionName(permission)}
                            </PermissionTag>
                          ))}
                          {user.permissions.length > 5 && (
                            <PermissionTag>
                              +{user.permissions.length - 5} más
                            </PermissionTag>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="primary"
                          onClick={() => handleAssignPermissions(user.userId)}
                        >
                          Gestionar Permisos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </UserPermissionsTable>
        )}
      </Container>
    </Layout>
  );
};

export default ListaPermisos;
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import NuevoRolModal from '../components/NuevoRolModal';
import EditarRolModal from '../components/EditarRolModal';

// ============================================================================
// INTERFACES
// ============================================================================

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
  custom: number;
  totalUsers: number;
  usersWithoutRole: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

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

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  ${props => {
    switch (props.$variant) {
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  border-left-color: ${props => props.color || '#3498db'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #f8f9fa;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }

  &:hover {
    background: #e3f2fd;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e1e8ed;
  color: #2c3e50;
`;

const Badge = styled.span<{ $variant?: 'success' | 'danger' | 'warning' | 'info' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;

  ${props => {
    switch (props.$variant) {
      case 'success':
        return 'background: #d4edda; color: #155724;';
      case 'danger':
        return 'background: #f8d7da; color: #721c24;';
      case 'warning':
        return 'background: #fff3cd; color: #856404;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'toggle' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;

  ${props => {
    switch (props.$variant) {
      case 'edit':
        return `
          background: #3498db;
          color: white;
          &:hover { background: #2980b9; transform: translateY(-1px); }
        `;
      case 'delete':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; transform: translateY(-1px); }
        `;
      case 'toggle':
        return `
          background: #f39c12;
          color: white;
          &:hover { background: #e67e22; transform: translateY(-1px); }
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
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 1.5rem;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const PermissionCount = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const TypeBadge = styled.span<{ $isSystem?: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  ${props => props.$isSystem
    ? 'background: #d1ecf1; color: #0c5460;'
    : 'background: #fff3cd; color: #856404;'
  }
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ListaRoles: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { hasPermission } = useAuth();

  // Estados
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Permisos
  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');

  // Cargar roles y estadísticas
  useEffect(() => {
    loadRoles();
    loadStats();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ data: Role[] }>('/roles?includeInactive=true');
      const data = response.data as any;
      setRoles(data?.data || data || []);
    } catch (error: any) {
      console.error('Error cargando roles:', error);
      showError('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.get<{ data: RoleStats }>('/roles/stats');
      const data = response.data as any;
      setStats(data?.data || data || null);
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Filtrado de roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      // Filtro de búsqueda
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && role.isActive) ||
        (filterStatus === 'inactive' && !role.isActive);

      // Filtro de tipo
      const matchesType =
        filterType === 'all' ||
        (filterType === 'system' && role.isSystem) ||
        (filterType === 'custom' && !role.isSystem);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [roles, searchTerm, filterStatus, filterType]);

  // Handlers
  const handleCreateRole = async (roleData: RoleFormData) => {
    try {
      await apiService.post('/roles', roleData);
      showSuccess('Rol creado exitosamente');
      setShowNewModal(false);
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear el rol';
      showError(message);
      throw error;
    }
  };

  const handleEditRole = async (roleId: string, roleData: Partial<RoleFormData>) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (role?.isSystem) {
        // Para roles del sistema, solo actualizar permisos
        await apiService.patch(`/roles/${roleId}/permissions`, { permissions: roleData.permissions });
      } else {
        // Para roles personalizados, actualizar todo
        await apiService.put(`/roles/${roleId}`, roleData);
      }
      showSuccess('Rol actualizado exitosamente');
      setShowEditModal(false);
      setSelectedRole(null);
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar el rol';
      showError(message);
      throw error;
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      const endpoint = role.isActive ? 'deactivate' : 'activate';
      await apiService.patch(`/roles/${role.id}/${endpoint}`, {});
      showSuccess(`Rol ${role.isActive ? 'desactivado' : 'activado'} exitosamente`);
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar el estado del rol';
      showError(message);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.delete(`/roles/${role.id}`);
      showSuccess('Rol eliminado exitosamente');
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar el rol';
      showError(message);
    }
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Layout title="Gestión de Roles">
      <Container>
        <Header>
          <Title>Gestión de Roles</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <FilterSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </FilterSelect>
            <FilterSelect value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">Todos los tipos</option>
              <option value="system">Sistema</option>
              <option value="custom">Personalizados</option>
            </FilterSelect>
            {canCreate && (
              <Button $variant="primary" onClick={() => setShowNewModal(true)}>
                + Nuevo Rol
              </Button>
            )}
          </SearchContainer>
        </Header>

        {/* Estadísticas */}
        {stats && (
          <StatsGrid>
            <StatCard color="#3498db">
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total de Roles</StatLabel>
            </StatCard>
            <StatCard color="#2ecc71">
              <StatValue>{stats.active}</StatValue>
              <StatLabel>Roles Activos</StatLabel>
            </StatCard>
            <StatCard color="#9b59b6">
              <StatValue>{stats.system}</StatValue>
              <StatLabel>Roles del Sistema</StatLabel>
            </StatCard>
            <StatCard color="#e67e22">
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Usuarios Asignados</StatLabel>
            </StatCard>
            <StatCard color="#e74c3c">
              <StatValue>{stats.usersWithoutRole}</StatValue>
              <StatLabel>Sin Rol Asignado</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {/* Tabla de roles */}
        {loading ? (
          <LoadingSpinner>Cargando roles...</LoadingSpinner>
        ) : filteredRoles.length === 0 ? (
          <TableContainer>
            <EmptyState>
              <h3>No se encontraron roles</h3>
              <p>
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No hay roles que coincidan con los filtros aplicados.'
                  : 'Aún no se han creado roles en el sistema.'}
              </p>
              {canCreate && (
                <Button $variant="primary" onClick={() => setShowNewModal(true)}>
                  + Crear Primer Rol
                </Button>
              )}
            </EmptyState>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table>
              <Thead>
                <tr>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Descripción</Th>
                  <Th>Permisos</Th>
                  <Th>Usuarios</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </Thead>
              <Tbody>
                {filteredRoles.map(role => (
                  <Tr key={role.id}>
                    <Td>
                      <strong>{role.name}</strong>
                    </Td>
                    <Td>
                      <TypeBadge $isSystem={role.isSystem}>
                        {role.isSystem ? 'Sistema' : 'Personalizado'}
                      </TypeBadge>
                    </Td>
                    <Td>{role.description}</Td>
                    <Td>
                      <PermissionCount>{role.permissions.length} permisos</PermissionCount>
                    </Td>
                    <Td>{role._count?.users || 0} usuarios</Td>
                    <Td>
                      <Badge $variant={role.isActive ? 'success' : 'danger'}>
                        {role.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Td>
                    <Td>
                      {canUpdate && (
                        <>
                          <ActionButton
                            $variant="edit"
                            onClick={() => openEditModal(role)}
                          >
                            Editar
                          </ActionButton>
                          {!role.isSystem && (
                            <ActionButton
                              $variant="toggle"
                              onClick={() => handleToggleStatus(role)}
                            >
                              {role.isActive ? 'Desactivar' : 'Activar'}
                            </ActionButton>
                          )}
                          {!role.isSystem && (
                            <ActionButton
                              $variant="delete"
                              onClick={() => handleDeleteRole(role)}
                              disabled={!!(role._count?.users && role._count.users > 0)}
                              title={role._count?.users && role._count.users > 0 ? 'No se puede eliminar: hay usuarios asignados' : 'Eliminar rol'}
                            >
                              Eliminar
                            </ActionButton>
                          )}
                        </>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Modales */}
        {showNewModal && (
          <NuevoRolModal
            onClose={() => setShowNewModal(false)}
            onSubmit={handleCreateRole}
          />
        )}

        {showEditModal && selectedRole && (
          <EditarRolModal
            role={selectedRole}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            onSubmit={(data) => handleEditRole(selectedRole.id, data)}
          />
        )}
      </Container>
    </Layout>
  );
};

export default ListaRoles;

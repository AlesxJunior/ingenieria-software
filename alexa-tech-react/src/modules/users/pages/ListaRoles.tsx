import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import NuevoRolModal from '../components/NuevoRolModal';
import EditarRolModal from '../components/EditarRolModal';
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../../styles/theme';
import {
  Button,
  ActionButton,
  Input,
  Select,
  StatusBadge,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  EmptyState,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

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

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled(Input)`
  min-width: 250px;
`;

const FilterSelect = styled(Select)`
  min-width: 150px;
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

const TypeBadge = styled.span<{ $isSystem?: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-family: ${TYPOGRAPHY.fontFamily};
  ${props => props.$isSystem
    ? `background: ${COLORS.infoBg}; color: ${COLORS.infoText};`
    : `background: ${COLORS.warningBg}; color: ${COLORS.warningText};`
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.textLight};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const DeleteConfirmModal = styled.div`
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

const DeleteConfirmContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  padding: ${SPACING.xl};
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const DeleteConfirmTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.large};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DeleteConfirmMessage = styled.p`
  margin: 0 0 ${SPACING.xl} 0;
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.body};
  line-height: 1.5;
`;

const DeleteConfirmActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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
    const action = role.isActive ? 'desactivar' : 'activar';
    try {
      const endpoint = role.isActive ? 'deactivate' : 'activate';
      await apiService.patch(`/roles/${role.id}/${endpoint}`, {});
      showSuccess(`Rol ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || `Error al ${action} el rol`;
      showError(message);
    }
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await apiService.patch(`/roles/${roleToDelete.id}/deactivate`, {});
      showSuccess('Rol eliminado exitosamente');
      setIsDeleteConfirmOpen(false);
      setRoleToDelete(null);
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar el rol';
      showError(message);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setRoleToDelete(null);
  };

  const handleActivateRole = async (role: Role) => {
    try {
      await apiService.patch(`/roles/${role.id}/activate`, {});
      showSuccess('Rol activado exitosamente');
      loadRoles();
      loadStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al activar el rol';
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
        <PageHeader>
          <div>
            <PageTitle>Gestión de Roles</PageTitle>
            <PageSubtitle>Administra los roles del sistema y sus permisos de acceso</PageSubtitle>
          </div>
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
        </PageHeader>

        {/* Estadísticas */}
        {stats && (
          <StatsGrid>
            <StatCard $color="#3498db">
              <StatValue $color="#3498db">{stats.total}</StatValue>
              <StatLabel>Total de Roles</StatLabel>
            </StatCard>
            <StatCard $color="#28a745">
              <StatValue $color="#28a745">{stats.active}</StatValue>
              <StatLabel>Roles Activos</StatLabel>
            </StatCard>
            <StatCard $color="#17a2b8">
              <StatValue $color="#17a2b8">{stats.system}</StatValue>
              <StatLabel>Roles del Sistema</StatLabel>
            </StatCard>
            <StatCard $color="#f0ad4e">
              <StatValue $color="#f0ad4e">{stats.totalUsers}</StatValue>
              <StatLabel>Usuarios Asignados</StatLabel>
            </StatCard>
            <StatCard $color="#dc3545">
              <StatValue $color="#dc3545">{stats.usersWithoutRole}</StatValue>
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
              <EmptyTitle>No se encontraron roles</EmptyTitle>
              <EmptyText>
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No hay roles que coincidan con los filtros aplicados.'
                  : 'Aún no se han creado roles en el sistema.'}
              </EmptyText>
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
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Descripción</Th>
                  <Th>Permisos</Th>
                  <Th>Usuarios</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
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
                      <StatusBadge variant={role.isActive ? 'success' : 'danger'} dot>
                        {role.isActive ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
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
                            role.isActive ? (
                              <ActionButton
                                $variant="delete"
                                onClick={() => handleDeleteClick(role)}
                              >
                                Eliminar
                              </ActionButton>
                            ) : (
                              <ActionButton
                                $variant="activate"
                                onClick={() => handleActivateRole(role)}
                              >
                                Activar
                              </ActionButton>
                            )
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

        {/* Modal de Confirmación de Eliminación */}
        {isDeleteConfirmOpen && roleToDelete && (
          <DeleteConfirmModal>
            <DeleteConfirmContent>
              <DeleteConfirmTitle>¿Eliminar Rol?</DeleteConfirmTitle>
              <DeleteConfirmMessage>
                ¿Estás seguro de que deseas eliminar el rol{' '}
                <strong>{roleToDelete.name}</strong>?
                Esta acción marcará el rol como inactivo.
              </DeleteConfirmMessage>
              <DeleteConfirmActions>
                <Button $variant="outline" onClick={handleCancelDelete}>
                  Cancelar
                </Button>
                <Button $variant="danger" onClick={handleConfirmDelete}>
                  Eliminar
                </Button>
              </DeleteConfirmActions>
            </DeleteConfirmContent>
          </DeleteConfirmModal>
        )}
      </Container>
    </Layout>
  );
};

export default ListaRoles;

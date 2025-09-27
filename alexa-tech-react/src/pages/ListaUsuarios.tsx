import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiService } from '../utils/api';
import NuevoUsuarioModal from '../components/NuevoUsuarioModal';
import EditarUsuarioModal from '../components/EditarUsuarioModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// Interfaces extendidas para usuarios

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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const TableContainer = styled.div`
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'activo':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'inactivo':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      case 'suspendido':
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

const RoleBadge = styled.span<{ role: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.role) {
      case 'ADMIN':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      case 'VENDEDOR':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'CAJERO':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'SUPERVISOR':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.3s ease;

  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          background: #3498db;
          color: white;
          &:hover {
            background: #2980b9;
          }
        `;
      case 'delete':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
          }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
          }
        `;
    }
  }}
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



const ListaUsuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showError, showInfo } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isNuevoUsuarioModalOpen, setIsNuevoUsuarioModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  
  // Estados para datos del backend
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);

  // Cargar usuarios del backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      });
      
      setUsers(response.data?.users || []);
      setTotalUsers(response.data?.pagination?.totalUsers || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);



  const filteredUsers = users; // Los filtros se aplican en el backend

  const stats = useMemo(() => {
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.filter(user => !user.isActive).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers: users.filter(user => user.role === 'ADMIN').length
    };
  }, [users, totalUsers]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    
    return date.toLocaleDateString('es-PE');
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'SUPERVISOR': return 'Supervisor';
      case 'CAJERO': return 'Cajero';
      case 'VENDEDOR': return 'Vendedor';
      default: return role;
    }
  };



  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      showError('No puedes eliminar tu propio usuario');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  // Función para mapear roles del frontend al backend
  const mapRoleToBackend = (role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO'): 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO' => {
    return role; // Ya están en el formato correcto
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      if (selectedUser) {
        // Filtrar solo las propiedades que acepta la API y mapear el rol
        const backendUserData: any = {};
        
        if (userData.username) backendUserData.username = userData.username;
        if (userData.email) backendUserData.email = userData.email;
        if (userData.firstName) backendUserData.firstName = userData.firstName;
        if (userData.lastName) backendUserData.lastName = userData.lastName;
        if (userData.role) backendUserData.role = mapRoleToBackend(userData.role);
        if (userData.isActive !== undefined) backendUserData.isActive = userData.isActive;
        if (userData.permissions) backendUserData.permissions = userData.permissions;
        
        await apiService.updateUser(selectedUser.id, backendUserData);
        showInfo('Usuario actualizado exitosamente');
        loadUsers(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Error al actualizar el usuario');
    } finally {
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedUser) {
        await apiService.deleteUser(selectedUser.id);
        showInfo(`Usuario ${selectedUser.username} eliminado exitosamente`);
        loadUsers(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error al eliminar el usuario');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      // Filtrar solo las propiedades que acepta la API y mapear el rol
      const backendUserData: any = {};
      
      if (userData.username) backendUserData.username = userData.username;
      if (userData.email) backendUserData.email = userData.email;
      if (userData.password) backendUserData.password = userData.password;
      if (userData.firstName) backendUserData.firstName = userData.firstName;
      if (userData.lastName) backendUserData.lastName = userData.lastName;
      if (userData.role) backendUserData.role = mapRoleToBackend(userData.role);
      if (userData.isActive !== undefined) backendUserData.isActive = userData.isActive;
      if (userData.permissions) backendUserData.permissions = userData.permissions;
      
      await apiService.createUser(backendUserData);
      showInfo('Usuario creado exitosamente');
      loadUsers(); // Recargar la lista
      setIsNuevoUsuarioModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Error al crear el usuario');
    }
  };

  const handleOpenCreateModal = () => {
    setIsNuevoUsuarioModalOpen(true);
  };

  const handleCloseNuevoUsuarioModal = () => {
    setIsNuevoUsuarioModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
  };

  return (
    <Layout title="Lista de Usuarios">
      <Container>
        <Header>
          <Title>Lista de Usuarios</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </FilterSelect>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="CAJERO">Cajero</option>
                <option value="VENDEDOR">Vendedor</option>
            </FilterSelect>
            {(searchTerm || statusFilter || roleFilter) && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
            <Button variant="primary" onClick={handleOpenCreateModal}>
              Nuevo Usuario
            </Button>
          </SearchContainer>
        </Header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Cargando usuarios...
          </div>
        ) : (
          <>
            <StatsContainer>
              <StatCard>
                <StatValue>{stats.totalUsers}</StatValue>
                <StatLabel>Total de Usuarios</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.activeUsers}</StatValue>
                <StatLabel>Usuarios Activos</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.inactiveUsers}</StatValue>
                <StatLabel>Usuarios Inactivos</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.adminUsers}</StatValue>
                <StatLabel>Administradores</StatLabel>
              </StatCard>
            </StatsContainer>
          </>
        )}

        <TableContainer>
          {filteredUsers.length === 0 ? (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <h3>No se encontraron usuarios</h3>
              <p>
                {users.length === 0 
                  ? 'Aún no se han registrado usuarios en el sistema.'
                  : 'No hay usuarios que coincidan con los filtros aplicados.'
                }
              </p>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Usuario</TableHeaderCell>
                  <TableHeaderCell>Rol</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell>Último Acceso</TableHeaderCell>
                  <TableHeaderCell>Acciones</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserInfo>
                        <UserAvatar>
                          {getInitials(user.firstName, user.lastName)}
                        </UserAvatar>
                        <div>
                          <UserName>{user.firstName} {user.lastName}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                          <UserName>@{user.username}</UserName>
                        </div>
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role}>
                        {getRoleText(user.role)}
                      </RoleBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.isActive ? 'activo' : 'inactivo'}>
                        {getStatusText(user.isActive)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: '0.9rem' }}>
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActionButton 
                        variant="edit"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Editar
                      </ActionButton>
                      {user.id !== currentUser?.id && (
                        <ActionButton 
                          variant="delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Eliminar
                        </ActionButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </Container>
      
      <NuevoUsuarioModal
        isOpen={isNuevoUsuarioModalOpen}
        onClose={handleCloseNuevoUsuarioModal}
        onSave={handleCreateUser}
      />
      
      <EditarUsuarioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        itemName={selectedUser?.username}
      />
    </Layout>
  );
};

export default ListaUsuarios;
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import NuevoUsuarioModal from '../components/NuevoUsuarioModal';
import EditarUsuarioModal from '../components/EditarUsuarioModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// Interfaces extendidas para usuarios y permisos
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

const UserDetails = styled.div`
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

const PermissionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 200px;
`;

const PermissionTag = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
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

  // Datos de ejemplo - en una aplicación real vendrían de una API
  const [users] = useState<ExtendedUser[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@alexatech.com',
      fullName: 'Administrador Principal',
      role: 'admin',
      status: 'activo',
      permissions: ['dashboard', 'usuarios', 'clientes', 'ventas', 'productos', 'inventario', 'reportes'],
      lastLogin: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      username: 'jhose_daniel',
      email: 'jhosedaniel@gmail.com',
      fullName: 'Jhose Daniel',
      role: 'vendedor',
      status: 'activo',
      permissions: ['dashboard', 'clientes', 'ventas', 'productos'],
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date()
    },
    {
      id: '3',
      username: 'nestor_rene',
      email: 'nestorRene@gmail.com',
      fullName: 'Nestor René',
      role: 'cajero',
      status: 'activo',
      permissions: ['dashboard', 'ventas', 'caja'],
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date()
    },
    {
      id: '4',
      username: 'alex_junior',
      email: 'alexjunior@gmail.com',
      fullName: 'Alex Junior',
      role: 'vendedor',
      status: 'inactivo',
      permissions: ['dashboard', 'clientes', 'ventas'],
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date()
    }
  ]);

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesRole = !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'activo').length;
    const inactiveUsers = users.filter(user => user.status === 'inactivo').length;
    const suspendedUsers = users.filter(user => user.status === 'suspendido').length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers
    };
  }, [users]);

  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-PE');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'suspendido': return 'Suspendido';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'cajero': return 'Cajero';
      default: return role;
    }
  };

  const getPermissionName = (permissionId: string) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
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

  const handleSaveUser = (userData: Partial<ExtendedUser>) => {
    // Aquí se implementaría la lógica para guardar los cambios del usuario
    // TODO: Usar userData para actualizar el usuario
    console.log('Datos del usuario a guardar:', userData);
    showInfo('Usuario actualizado exitosamente');
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      // Aquí se implementaría la lógica para eliminar el usuario
      showInfo(`Usuario ${selectedUser.username} eliminado exitosamente`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleCreateUser = () => {
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
              <option value="suspendido">Suspendido</option>
            </FilterSelect>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="cajero">Cajero</option>
            </FilterSelect>
            {(searchTerm || statusFilter || roleFilter) && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
            <Button variant="primary" onClick={handleCreateUser}>
              Nuevo Usuario
            </Button>
          </SearchContainer>
        </Header>

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
            <StatValue>{stats.suspendedUsers}</StatValue>
            <StatLabel>Usuarios Suspendidos</StatLabel>
          </StatCard>
        </StatsContainer>

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
                  <TableHeaderCell>Permisos</TableHeaderCell>
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
                          {getInitials(user.fullName)}
                        </UserAvatar>
                        <UserDetails>
                          <UserName>{user.fullName}</UserName>
                          <UserEmail>@{user.username} • {user.email}</UserEmail>
                        </UserDetails>
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role}>
                        {getRoleText(user.role)}
                      </RoleBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status}>
                        {getStatusText(user.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <PermissionsList>
                        {user.permissions.slice(0, 3).map(permission => (
                          <PermissionTag key={permission}>
                            {getPermissionName(permission)}
                          </PermissionTag>
                        ))}
                        {user.permissions.length > 3 && (
                          <PermissionTag>
                            +{user.permissions.length - 3} más
                          </PermissionTag>
                        )}
                      </PermissionsList>
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
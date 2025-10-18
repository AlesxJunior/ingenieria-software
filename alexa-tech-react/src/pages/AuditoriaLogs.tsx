import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  userId: string;
  module: string;
  action: string;
  status: string;
}

const Container = styled.div`
  padding: 1rem;
  max-width: 1400px;
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

const ExportButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #229954;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
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
    background: #95a5a6;
    color: white;
    &:hover {
      background: #7f8c8d;
    }
  `}
`;

const LogsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LogsHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogsTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const LogsCount = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const LogsTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e1e8ed;

  &:hover {
    background: #f8f9fa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #2c3e50;
  font-size: 0.9rem;
  vertical-align: top;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `background: #d4edda; color: #155724;`;
      case 'error':
        return `background: #f8d7da; color: #721c24;`;
      case 'warning':
        return `background: #fff3cd; color: #856404;`;
      default:
        return `background: #e2e3e5; color: #383d41;`;
    }
  }}
`;

const ActionBadge = styled.span<{ action: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.action.toLowerCase()) {
      case 'login':
        return `background: #d1ecf1; color: #0c5460;`;
      case 'logout':
        return `background: #f8d7da; color: #721c24;`;
      case 'create':
        return `background: #d4edda; color: #155724;`;
      case 'update':
        return `background: #fff3cd; color: #856404;`;
      case 'delete':
        return `background: #f8d7da; color: #721c24;`;
      default:
        return `background: #e2e3e5; color: #383d41;`;
    }
  }}
`;

const ModuleBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1565c0;
`;

const DetailsCell = styled(TableCell)`
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e1e8ed;
`;

const PaginationInfo = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #e1e8ed;
  background: ${props => props.$isActive ? '#3498db' : 'white'};
  color: ${props => props.$isActive ? 'white' : '#2c3e50'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive ? '#2980b9' : '#f8f9fa'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const AuditoriaLogs: React.FC = () => {
  const { showSuccess } = useNotification();

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    userId: '',
    module: '',
    action: '',
    status: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Mock data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-03-15 14:30:25',
      userId: 'user1',
      username: 'admin',
      action: 'Login',
      module: 'Autenticación',
      details: 'Inicio de sesión exitoso',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-03-15 14:32:10',
      userId: 'user1',
      username: 'admin',
      action: 'Create',
      module: 'Usuarios',
      details: 'Usuario creado: María García (maria.garcia@email.com)',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-03-15 14:35:45',
      userId: 'user2',
      username: 'vendedor1',
      action: 'Create',
      module: 'Ventas',
      details: 'Venta registrada: VT-2024-001 por $250.00',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2024-03-15 14:40:12',
      userId: 'user3',
      username: 'cajero1',
      action: 'Update',
      module: 'Inventario',
      details: 'Stock actualizado: Laptop HP - Cantidad: 15',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-03-15 14:42:30',
      userId: 'user4',
      username: 'supervisor1',
      action: 'Delete',
      module: 'Productos',
      details: 'Producto eliminado: Mouse Inalámbrico (ID: 123)',
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'warning'
    },
    {
      id: '6',
      timestamp: '2024-03-15 14:45:18',
      userId: 'user5',
      username: 'usuario_test',
      action: 'Login',
      module: 'Autenticación',
      details: 'Intento de inicio de sesión fallido - Credenciales incorrectas',
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'error'
    },
    {
      id: '7',
      timestamp: '2024-03-15 14:50:05',
      userId: 'user1',
      username: 'admin',
      action: 'Update',
      module: 'Configuración',
      details: 'Configuración de sistema actualizada: Tiempo de sesión modificado a 8 horas',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '8',
      timestamp: '2024-03-15 14:55:22',
      userId: 'user2',
      username: 'vendedor1',
      action: 'Create',
      module: 'Entidades Comerciales',
      details: 'Entidad comercial registrada: Juan Pérez (juan.perez@email.com)',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    }
  ];

  const modules = ['Todos', 'Autenticación', 'Usuarios', 'Ventas', 'Inventario', 'Productos', 'Entidades Comerciales', 'Configuración'];
  const actions = ['Todos', 'Login', 'Logout', 'Create', 'Update', 'Delete', 'View'];
  const statuses = ['Todos', 'success', 'error', 'warning'];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    showSuccess('Filtros aplicados exitosamente');
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      userId: '',
      module: '',
      action: '',
      status: ''
    });
    setCurrentPage(1);
    showSuccess('Filtros limpiados');
  };

  const exportLogs = () => {
    // Simular exportación
    showSuccess('Logs exportados exitosamente');
  };

  const filteredLogs = mockLogs.filter(log => {
    if (filters.module && filters.module !== 'Todos' && log.module !== filters.module) return false;
    if (filters.action && filters.action !== 'Todos' && log.action !== filters.action) return false;
    if (filters.status && filters.status !== 'Todos' && log.status !== filters.status) return false;
    if (filters.userId && !log.username.toLowerCase().includes(filters.userId.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      default: return status;
    }
  };

  return (
    <Layout title="Auditoría y Logs">
      <Container>
        <Header>
          <Title>Auditoría y Logs del Sistema</Title>
          <ExportButton onClick={exportLogs}>
            Exportar Logs
          </ExportButton>
        </Header>

        <FilterSection>
          <FilterTitle>Filtros de Búsqueda</FilterTitle>
          <FilterGrid>
            <FilterGroup>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="userId">Usuario</Label>
              <Input
                type="text"
                id="userId"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Buscar por usuario..."
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="module">Módulo</Label>
              <Select
                id="module"
                name="module"
                value={filters.module}
                onChange={handleFilterChange}
              >
                {modules.map(module => (
                  <option key={module} value={module === 'Todos' ? '' : module}>
                    {module}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="action">Acción</Label>
              <Select
                id="action"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
              >
                {actions.map(action => (
                  <option key={action} value={action === 'Todos' ? '' : action}>
                    {action}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="status">Estado</Label>
              <Select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                {statuses.map(status => (
                  <option key={status} value={status === 'Todos' ? '' : status}>
                    {status === 'Todos' ? 'Todos' : getStatusText(status)}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FilterGrid>

          <FilterActions>
            <Button $variant="secondary" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
            <Button $variant="primary" onClick={applyFilters}>
              Aplicar Filtros
            </Button>
          </FilterActions>
        </FilterSection>

        <LogsSection>
          <LogsHeader>
            <LogsTitle>Registro de Actividades</LogsTitle>
            <LogsCount>{filteredLogs.length} registros encontrados</LogsCount>
          </LogsHeader>

          <LogsTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Fecha/Hora</TableHeaderCell>
                  <TableHeaderCell>Usuario</TableHeaderCell>
                  <TableHeaderCell>Acción</TableHeaderCell>
                  <TableHeaderCell>Módulo</TableHeaderCell>
                  <TableHeaderCell>Detalles</TableHeaderCell>
                  <TableHeaderCell>IP</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {currentLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>
                      <ActionBadge action={log.action}>{log.action}</ActionBadge>
                    </TableCell>
                    <TableCell>
                      <ModuleBadge>{log.module}</ModuleBadge>
                    </TableCell>
                    <DetailsCell>{log.details}</DetailsCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <StatusBadge status={log.status}>
                        {getStatusText(log.status)}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </LogsTable>

          <Pagination>
            <PaginationInfo>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} de {filteredLogs.length} registros
            </PaginationInfo>
            <PaginationControls>
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </PaginationButton>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationButton
                    key={page}
                    $isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationButton>
                );
              })}
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </PaginationButton>
            </PaginationControls>
          </Pagination>
        </LogsSection>
      </Container>
    </Layout>
  );
};

export default AuditoriaLogs;
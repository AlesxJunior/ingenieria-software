import React from 'react';
import styled from 'styled-components';

interface PermissionsPreviewProps {
  permissions: string[];
  title?: string;
  emptyMessage?: string;
  groupByModule?: boolean;
}

const Container = styled.div`
  margin: 1rem 0;
`;

const Title = styled.h4`
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const ModuleGroup = styled.div`
  margin-bottom: 1rem;
`;

const ModuleTitle = styled.div`
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #3498db;
`;

const PermissionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #495057;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '✓';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 0.5rem;
    background: #27ae60;
    color: white;
    border-radius: 50%;
    font-size: 0.7rem;
    line-height: 16px;
    text-align: center;
    font-weight: bold;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
`;

const Counter = styled.div`
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

// Mapeo de permisos a nombres legibles y módulos
const PERMISSION_NAMES: Record<string, { name: string; module: string }> = {
  'dashboard.read': { name: 'Ver Dashboard', module: 'Dashboard' },
  'users.create': { name: 'Crear Usuarios', module: 'Usuarios' },
  'users.read': { name: 'Ver Usuarios', module: 'Usuarios' },
  'users.update': { name: 'Actualizar Usuarios', module: 'Usuarios' },
  'users.delete': { name: 'Eliminar Usuarios', module: 'Usuarios' },
  'commercial_entities.create': { name: 'Crear Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.read': { name: 'Ver Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.update': { name: 'Actualizar Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.delete': { name: 'Eliminar Entidades', module: 'Entidades Comerciales' },
  'products.create': { name: 'Crear Productos', module: 'Productos' },
  'products.read': { name: 'Ver Productos', module: 'Productos' },
  'products.update': { name: 'Actualizar Productos', module: 'Productos' },
  'products.delete': { name: 'Eliminar Productos', module: 'Productos' },
  'inventory.read': { name: 'Ver Inventario', module: 'Inventario' },
  'inventory.update': { name: 'Actualizar Inventario', module: 'Inventario' },
  'inventory.adjustment': { name: 'Ajustar Inventario', module: 'Inventario' },
  'sales.create': { name: 'Crear Ventas', module: 'Ventas' },
  'sales.read': { name: 'Ver Ventas', module: 'Ventas' },
  'sales.cancel': { name: 'Cancelar Ventas', module: 'Ventas' },
  'sales.credit_note': { name: 'Notas de Crédito', module: 'Ventas' },
  'purchases.create': { name: 'Crear Compras', module: 'Compras' },
  'purchases.read': { name: 'Ver Compras', module: 'Compras' },
  'purchases.update': { name: 'Actualizar Compras', module: 'Compras' },
  'cash.open_session': { name: 'Abrir Caja', module: 'Caja' },
  'cash.close_session': { name: 'Cerrar Caja', module: 'Caja' },
  'cash.movements': { name: 'Movimientos de Caja', module: 'Caja' },
  'reports.sales': { name: 'Reportes de Ventas', module: 'Reportes' },
  'reports.inventory': { name: 'Reportes de Inventario', module: 'Reportes' },
  'reports.cash': { name: 'Reportes de Caja', module: 'Reportes' },
  'reports.audit': { name: 'Reportes de Auditoría', module: 'Reportes' },
  'configuration.read': { name: 'Ver Configuración', module: 'Configuración' },
  'configuration.update': { name: 'Actualizar Configuración', module: 'Configuración' },
  'audit.read': { name: 'Ver Auditoría', module: 'Auditoría' },
  'roles.manage': { name: 'Gestionar Roles', module: 'Roles' },
  'quotes.create': { name: 'Crear Cotizaciones', module: 'Ventas' },
  'quotes.read': { name: 'Ver Cotizaciones', module: 'Ventas' },
};

const PermissionsPreview: React.FC<PermissionsPreviewProps> = ({
  permissions,
  title = 'Permisos incluidos:',
  emptyMessage = 'No hay permisos asignados',
  groupByModule = true
}) => {
  if (!permissions || permissions.length === 0) {
    return (
      <Container>
        {title && <Title>{title}</Title>}
        <EmptyState>{emptyMessage}</EmptyState>
      </Container>
    );
  }

  // Agrupar permisos por módulo
  const groupedPermissions: Record<string, string[]> = {};
  
  permissions.forEach(permId => {
    const permInfo = PERMISSION_NAMES[permId];
    const module = permInfo?.module || 'Otros';
    
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = [];
    }
    groupedPermissions[module].push(permId);
  });

  if (!groupByModule) {
    return (
      <Container>
        {title && (
          <Title>
            {title}
            <Counter>{permissions.length}</Counter>
          </Title>
        )}
        <PermissionsGrid>
          {permissions.map(permId => {
            const permInfo = PERMISSION_NAMES[permId];
            return (
              <PermissionBadge key={permId}>
                {permInfo?.name || permId}
              </PermissionBadge>
            );
          })}
        </PermissionsGrid>
      </Container>
    );
  }

  return (
    <Container>
      {title && (
        <Title>
          {title}
          <Counter>{permissions.length}</Counter>
        </Title>
      )}
      {Object.entries(groupedPermissions).map(([module, perms]) => (
        <ModuleGroup key={module}>
          <ModuleTitle>{module} ({perms.length})</ModuleTitle>
          <PermissionsGrid>
            {perms.map(permId => {
              const permInfo = PERMISSION_NAMES[permId];
              return (
                <PermissionBadge key={permId}>
                  {permInfo?.name || permId}
                </PermissionBadge>
              );
            })}
          </PermissionsGrid>
        </ModuleGroup>
      ))}
    </Container>
  );
};

export default PermissionsPreview;

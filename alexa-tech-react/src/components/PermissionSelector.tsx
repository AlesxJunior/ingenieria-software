import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface PermissionsByModule {
  [module: string]: {
    [submodule: string]: Permission[];
  };
}

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const Container = styled.div`
  margin-top: 1rem;
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ModuleContainer = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ModuleHeader = styled.div`
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: #eeeeee;
  }
`;

const ModuleContent = styled.div<{ $isExpanded: boolean }>`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
  padding: 1rem;
`;



const PermissionItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #f9f9f9;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.75rem;
  margin-top: 0.2rem;
  cursor: pointer;
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const PermissionDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  margin-bottom: 1rem;
`;

const SelectAllContainer = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  transform: ${props => props.$isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s;
  font-size: 0.8rem;
`;

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onPermissionsChange,
  disabled = false
}) => {
  const [permissions, setPermissions] = useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { showNotification } = useNotification();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllPermissions();
      
      if (response.success && response.data && response.data.permissions) {
        setPermissions(response.data.permissions as unknown as PermissionsByModule);
        // Expandir todos los módulos por defecto
        setExpandedModules(new Set(Object.keys(response.data.permissions)));
      } else {
        throw new Error(response.message || 'Error al cargar permisos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      showNotification('error', 'Error', 'Error al cargar permisos: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (disabled) return;

    let newPermissions: string[];
    if (checked) {
      newPermissions = [...selectedPermissions, permissionId];
    } else {
      newPermissions = selectedPermissions.filter(id => id !== permissionId);
    }
    onPermissionsChange(newPermissions);
  };

  const handleSelectAll = (checked: boolean) => {
    if (disabled) return;

    if (checked) {
      const allPermissionIds: string[] = [];
      Object.values(permissions).forEach(modulePerms => {
        if (modulePerms && typeof modulePerms === 'object') {
          Object.values(modulePerms).forEach(submodulePerms => {
            if (Array.isArray(submodulePerms)) {
              submodulePerms.forEach(permission => {
                allPermissionIds.push(permission.id);
              });
            }
          });
        }
      });
      onPermissionsChange(allPermissionIds);
    } else {
      onPermissionsChange([]);
    }
  };

  const getAllPermissionIds = (): string[] => {
    const allIds: string[] = [];
    Object.values(permissions).forEach(modulePerms => {
      if (modulePerms && typeof modulePerms === 'object') {
        Object.values(modulePerms).forEach(submodulePerms => {
          if (Array.isArray(submodulePerms)) {
            submodulePerms.forEach(permission => {
              allIds.push(permission.id);
            });
          }
        });
      }
    });
    return allIds;
  };

  const isAllSelected = () => {
    const allIds = getAllPermissionIds();
    return allIds.length > 0 && allIds.every(id => selectedPermissions.includes(id));
  };

  const isSomeSelected = () => {
    const allIds = getAllPermissionIds();
    return allIds.some(id => selectedPermissions.includes(id));
  };

  if (loading) {
    return (
      <Container>
        <Title>Permisos</Title>
        <LoadingContainer>Cargando permisos...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Permisos</Title>
        <ErrorContainer>
          {error}
          <button 
            onClick={loadPermissions}
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
          >
            Reintentar
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Permisos</Title>
      
      <SelectAllContainer>
        <Checkbox
          type="checkbox"
          checked={isAllSelected()}
          ref={input => {
            if (input) input.indeterminate = isSomeSelected() && !isAllSelected();
          }}
          onChange={(e) => handleSelectAll(e.target.checked)}
          disabled={disabled}
        />
        <strong>Seleccionar todos los permisos</strong>
      </SelectAllContainer>

      {Object.entries(permissions).map(([module, modulePerms]) => (
        <ModuleContainer key={module}>
          <ModuleHeader onClick={() => toggleModule(module)}>
            <span>{module.charAt(0).toUpperCase() + module.slice(1)}</span>
            <ExpandIcon $isExpanded={expandedModules.has(module)}>
              ▶
            </ExpandIcon>
          </ModuleHeader>
          
          <ModuleContent $isExpanded={expandedModules.has(module)}>
            {modulePerms && typeof modulePerms === 'object' ? (
              Object.entries(modulePerms).map(([submodule, submodulePerms]) => {
                if (!Array.isArray(submodulePerms)) {
                  return null;
                }

                return (
                  <div key={`${module}-${submodule}`} style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #e0e0e0' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: '#555', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                      {submodule}
                    </h4>
                    <div>
                      {submodulePerms.map((permission) => (
                        <PermissionItem key={permission.id}>
                          <Checkbox
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            disabled={disabled}
                          />
                          <PermissionInfo>
                            <PermissionName>{permission.name}</PermissionName>
                            <PermissionDescription>{permission.description}</PermissionDescription>
                          </PermissionInfo>
                        </PermissionItem>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No hay permisos disponibles para este módulo</div>
            )}
          </ModuleContent>
        </ModuleContainer>
      ))}
    </Container>
  );
};

export default PermissionSelector;
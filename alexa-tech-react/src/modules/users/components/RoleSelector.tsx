import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../utils/api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
}

interface RoleSelectorProps {
  value: string;
  onChange: (roleId: string, role: Role | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  showDescription?: boolean;
}

const Container = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
`;

const Required = styled.span`
  color: #e74c3c;
  margin-left: 0.25rem;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#dee2e6'};
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.25rem;
  padding-right: 3rem;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    padding: 0.75rem;
  }
`;

const RoleInfo = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const RoleName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SystemBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: #3498db;
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const RoleDescription = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
`;

const PermissionsCount = styled.div`
  font-size: 0.85rem;
  color: #495057;
  
  strong {
    color: #27ae60;
    font-weight: 600;
  }
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
`;

const LoadingText = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
`;

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  label = 'Rol',
  showDescription = true
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (value && roles.length > 0) {
      const role = roles.find(r => r.id === value);
      setSelectedRole(role || null);
    } else {
      setSelectedRole(null);
    }
  }, [value, roles]);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get<any>('/roles');
      
      console.log('🔍 [RoleSelector] Response from /roles:', response);
      
      // Extraer array de roles desde response.data o response directo
      let rolesArray: Role[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Response es { success: true, data: [...] }
        rolesArray = response.data;
      } else if (Array.isArray(response)) {
        // Response es [...] directo
        rolesArray = response;
      } else {
        console.warn('⚠️ [RoleSelector] Response format unknown:', typeof response, response);
        return;
      }
      
      // Filtrar solo roles activos
      const activeRoles = rolesArray.filter((role: Role) => role.isActive);
      console.log(`✅ [RoleSelector] Loaded ${activeRoles.length} active roles out of ${rolesArray.length} total:`, activeRoles);
      setRoles(activeRoles);
    } catch (error) {
      console.error('❌ [RoleSelector] Error cargando roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const role = roles.find(r => r.id === roleId) || null;
    setSelectedRole(role);
    onChange(roleId, role);
  };

  if (isLoading) {
    return (
      <Container>
        {label && <Label>{label}{required && <Required>*</Required>}</Label>}
        <LoadingText>Cargando roles...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
      )}
      
      <SelectWrapper>
        <Select
          value={value}
          onChange={handleChange}
          disabled={disabled || roles.length === 0}
          $hasError={!!error}
          required={required}
        >
          <option value="">
            {roles.length === 0 ? 'No hay roles disponibles' : 'Seleccione un rol...'}
          </option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name} {role.isSystem ? '(Sistema)' : ''}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      {error && <ErrorText>{error}</ErrorText>}

      {showDescription && selectedRole && (
        <RoleInfo>
          <RoleName>
            {selectedRole.name}
            {selectedRole.isSystem && <SystemBadge>Sistema</SystemBadge>}
          </RoleName>
          {selectedRole.description && (
            <RoleDescription>{selectedRole.description}</RoleDescription>
          )}
          <PermissionsCount>
            Este rol incluye <strong>{selectedRole.permissions.length}</strong> permiso{selectedRole.permissions.length !== 1 ? 's' : ''}
          </PermissionsCount>
        </RoleInfo>
      )}
    </Container>
  );
};

export default RoleSelector;

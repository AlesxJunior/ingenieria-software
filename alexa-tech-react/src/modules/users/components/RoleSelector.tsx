import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../utils/api';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, TRANSITIONS } from '../../../styles/theme';
import { Label, RequiredMark, ValidationMessage } from '../../../components/shared';

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
  margin-bottom: ${SPACING.lg};
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.border.medium};
  border-radius: ${BORDER_RADIUS.md};
  background: white;
  color: ${COLORS.text.primary};
  cursor: pointer;
  transition: ${TRANSITIONS.normal};
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${SPACING.md} center;
  background-size: 1.25rem;
  padding-right: 3rem;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? `${COLORS.danger}1a` : `${COLORS.primary}1a`};
  }

  &:disabled {
    background-color: ${COLORS.background.secondary};
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    padding: ${SPACING.sm};
  }
`;

const RoleInfo = styled.div`
  margin-top: ${SPACING.sm};
  padding: ${SPACING.md};
  background: ${COLORS.background.secondary};
  border-radius: ${BORDER_RADIUS.md};
  border-left: 4px solid ${COLORS.primary};
`;

const RoleName = styled.div`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
  margin-bottom: ${SPACING.xs};
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
`;

const SystemBadge = styled.span`
  display: inline-block;
  padding: ${SPACING.xs} 0.6rem;
  background: ${COLORS.primary};
  color: white;
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  text-transform: uppercase;
`;

const RoleDescription = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text.muted};
  margin-bottom: ${SPACING.xs};
`;

const PermissionsCount = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text.secondary};
  
  strong {
    color: ${COLORS.success};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  }
`;

const LoadingText = styled.div`
  padding: ${SPACING.md};
  text-align: center;
  color: ${COLORS.text.muted};
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
        {label && (
          <Label>
            {label}
            {required && <RequiredMark />}
          </Label>
        )}
        <LoadingText>Cargando roles...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label>
          {label}
          {required && <RequiredMark />}
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

      {error && <ValidationMessage $type="error">{error}</ValidationMessage>}

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

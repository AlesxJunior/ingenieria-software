import React from 'react';
import styled from 'styled-components';
import { checkPasswordRequirements, getPasswordRequirements } from '../utils/validation';

interface PasswordRequirementsProps {
  password: string;
  show?: boolean;
}

const RequirementsContainer = styled.div<{ $show: boolean }>`
  margin-top: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s ease;
  opacity: ${props => props.$show ? 1 : 0};
  max-height: ${props => props.$show ? '200px' : '0'};
  overflow: hidden;
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: ${props => props.$met ? '#28a745' : '#6c757d'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RequirementIcon = styled.span<{ $met: boolean }>`
  margin-right: 8px;
  font-weight: bold;
  color: ${props => props.$met ? '#28a745' : '#dc3545'};
`;

const RequirementText = styled.span<{ $met: boolean }>`
  text-decoration: ${props => props.$met ? 'line-through' : 'none'};
  opacity: ${props => props.$met ? 0.7 : 1};
`;

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ 
  password, 
  show = true 
}) => {
  const requirements = getPasswordRequirements();
  const status = checkPasswordRequirements(password);
  
  const requirementChecks = [
    { key: 'minLength', text: requirements[0], met: status.minLength },
    { key: 'hasUppercase', text: requirements[1], met: status.hasUppercase },
    { key: 'hasLowercase', text: requirements[2], met: status.hasLowercase },
    { key: 'hasNumber', text: requirements[3], met: status.hasNumber }
  ];

  return (
    <RequirementsContainer $show={Boolean(show)}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
        Requisitos de contraseña:
      </div>
      {requirementChecks.map((requirement) => (
        <RequirementItem key={requirement.key} $met={Boolean(requirement.met)}>
          <RequirementIcon $met={Boolean(requirement.met)}>
            {requirement.met ? '✓' : '✗'}
          </RequirementIcon>
          <RequirementText $met={Boolean(requirement.met)}>
            {requirement.text}
          </RequirementText>
        </RequirementItem>
      ))}
    </RequirementsContainer>
  );
};

export default PasswordRequirements;
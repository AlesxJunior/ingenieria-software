import React from 'react';
import styled from 'styled-components';
import { checkPasswordRequirements, getPasswordRequirements } from '../utils/validation';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../styles/theme';

interface PasswordRequirementsProps {
  password: string;
  show?: boolean;
}

const RequirementsContainer = styled.div<{ $show: boolean }>`
  margin-top: ${SPACING.sm};
  padding: ${SPACING.lg};
  background-color: ${COLORS.neutral[50]};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  transition: ${TRANSITIONS.default};
  opacity: ${props => props.$show ? 1 : 0};
  max-height: ${props => props.$show ? '200px' : '0'};
  overflow: hidden;
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING.xs};
  color: ${props => props.$met ? COLOR_SCALES.success[500] : COLORS.text.secondary};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RequirementIcon = styled.span<{ $met: boolean }>`
  margin-right: ${SPACING.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${props => props.$met ? COLOR_SCALES.success[500] : COLOR_SCALES.danger[500]};
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
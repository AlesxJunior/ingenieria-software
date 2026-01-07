import React from 'react';
import styled, { keyframes } from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, TYPOGRAPHY } from '../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: ${SPACING['3xl']};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${COLORS.neutral[200]};
  border-top: 4px solid ${COLOR_SCALES.primary[500]};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: ${SPACING.lg};
`;

const LoadingText = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: 0;
`;

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
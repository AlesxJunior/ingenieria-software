import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { media } from '../styles/breakpoints';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/theme';

const BadgeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  cursor: pointer;
  padding: ${SPACING.sm} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.md};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  ${media.mobile} {
    padding: ${SPACING.xs} ${SPACING.lg};
  }
`;

const AlertIcon = styled.div<{ $hasAlerts: boolean }>`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  transition: all 0.3s ease;
  animation: ${props => props.$hasAlerts ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  ${media.mobile} {
    font-size: ${TYPOGRAPHY.fontSize.xl};
  }
`;

const BadgeCounter = styled.div<{ $critical?: boolean }>`
  min-width: 28px;
  height: 28px;
  background: ${props => props.$critical ? 
    `linear-gradient(135deg, ${COLOR_SCALES.danger[600]}, ${COLOR_SCALES.danger[700]})` : 
    `linear-gradient(135deg, ${COLOR_SCALES.warning[500]}, ${COLOR_SCALES.warning[600]})`
  };
  color: ${COLORS.neutral.white};
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  padding: 0 ${SPACING.sm};
  box-shadow: ${SHADOWS.md};
  animation: ${props => props.$critical ? 'shake 0.5s ease' : 'none'};
  border: 2px solid ${COLORS.neutral.white};

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  ${media.mobile} {
    min-width: 24px;
    height: 24px;
    font-size: ${TYPOGRAPHY.fontSize['2xs']};
    border: 1px solid ${COLORS.neutral.white};
  }
`;

const BadgeText = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.secondary};

  ${media.mobile} {
    display: none; /* Ocultar texto en móvil */
  }
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${SPACING.sm};
  background: ${COLORS.neutral.white};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  box-shadow: ${SHADOWS.lg};
  z-index: 1000;
  min-width: 200px;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  pointer-events: none;

  ${media.mobile} {
    right: auto;
    left: 0;
  }
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${SPACING.sm} 0;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.neutral[100]};
  }
`;

const TooltipLabel = styled.span`
  color: ${COLORS.text.secondary};
`;

const TooltipValue = styled.span<{ $critical?: boolean }>`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${props => props.$critical ? COLOR_SCALES.danger[600] : COLOR_SCALES.warning[500]};
`;

interface AlertCount {
  total: number;
  critico: number;
  bajo: number;
}

const AlertasBadge: React.FC = () => {
  const [alertCount, setAlertCount] = useState<AlertCount>({ total: 0, critico: 0, bajo: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAlertCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/alertas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const alertas = response.data.data?.rows || response.data.data || [];
      const critico = alertas.filter((a: any) => a.tipoAlerta === 'CRITICO').length;
      const bajo = alertas.filter((a: any) => a.tipoAlerta === 'BAJO').length;
      
      setAlertCount({
        total: alertas.length,
        critico,
        bajo
      });
    } catch (error) {
      console.error('Error loading alert count:', error);
      // No mostrar error al usuario, solo log
    }
  };

  const handleClick = () => {
    navigate('/inventario/alertas');
  };

  if (alertCount.total === 0) {
    return null; // No mostrar badge si no hay alertas
  }

  const hasCritical = alertCount.critico > 0;

  return (
    <BadgeContainer 
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title="Ver alertas de inventario"
    >
      <AlertIcon $hasAlerts={alertCount.total > 0}>
        {hasCritical ? '🔴' : '🟡'}
      </AlertIcon>
      <BadgeCounter $critical={hasCritical}>
        {alertCount.total > 99 ? '99+' : alertCount.total}
      </BadgeCounter>
      <BadgeText>Alertas</BadgeText>
      
      <Tooltip $show={showTooltip}>
        <TooltipRow>
          <TooltipLabel>Stock Crítico:</TooltipLabel>
          <TooltipValue $critical>{alertCount.critico}</TooltipValue>
        </TooltipRow>
        <TooltipRow>
          <TooltipLabel>Stock Bajo:</TooltipLabel>
          <TooltipValue>{alertCount.bajo}</TooltipValue>
        </TooltipRow>
        <TooltipRow>
          <TooltipLabel>Total:</TooltipLabel>
          <TooltipValue>{alertCount.total}</TooltipValue>
        </TooltipRow>
      </Tooltip>
    </BadgeContainer>
  );
};

export default AlertasBadge;

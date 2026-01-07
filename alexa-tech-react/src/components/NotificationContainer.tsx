import React from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../styles/theme';

const NotificationWrapper = styled.div`
  position: fixed;
  top: ${SPACING.xl};
  right: ${SPACING.xl};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md};
  max-width: 400px;
`;

const NotificationCard = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.medium};
  box-shadow: ${SHADOWS.large};
  padding: ${SPACING.lg};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.danger;
      case 'warning': return COLORS.warning;
      case 'info': return COLORS.info;
      default: return COLORS.border;
    }
  }};
  animation: slideIn 0.3s ease-out;
  position: relative;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${props => {
    switch (props.$type) {
      case 'success': return COLORS.successText;
      case 'error': return COLORS.dangerText;
      case 'warning': return COLORS.warningText;
      case 'info': return COLORS.infoText;
      default: return COLORS.text;
    }
  }};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
  line-height: ${TYPOGRAPHY.lineHeight.normal};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.textLight};
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  margin-left: ${SPACING.md};
  transition: color ${TRANSITIONS.fast};

  &:hover {
    color: ${COLORS.text};
  }
`;

const NotificationIcon = styled.span<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  margin-right: ${SPACING.sm};
  font-size: 16px;

  &::before {
    content: ${props => {
      switch (props.$type) {
        case 'success': return '"✓"';
        case 'error': return '"✕"';
        case 'warning': return '"⚠"';
        case 'info': return '"ℹ"';
        default: return '"•"';
      }
    }};
    color: ${props => {
      switch (props.$type) {
        case 'success': return COLORS.success;
        case 'error': return COLORS.danger;
        case 'warning': return COLORS.warning;
        case 'info': return COLORS.info;
        default: return COLORS.textLight;
      }
    }};
  }
`;

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  // Defensive: ensure notifications is an array before accessing length
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <NotificationWrapper>
      {notifications.map(notification => (
        <NotificationCard key={notification.id} $type={notification.type}>
          <NotificationHeader>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <NotificationIcon $type={notification.type} />
              <NotificationTitle $type={notification.type}>
                {notification.title}
              </NotificationTitle>
            </div>
            <CloseButton onClick={() => removeNotification(notification.id)}>
              ×
            </CloseButton>
          </NotificationHeader>
          <NotificationMessage>
            {notification.message}
          </NotificationMessage>
        </NotificationCard>
      ))}
    </NotificationWrapper>
  );
};

export default NotificationContainer;
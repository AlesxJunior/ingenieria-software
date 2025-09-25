import React from 'react';
import styled from 'styled-components';
import { useApp } from '../hooks/useApp';

const NotificationWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
`;

const NotificationCard = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
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
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      case 'info': return '#0c5460';
      default: return '#495057';
    }
  }};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  margin-left: 10px;

  &:hover {
    color: #495057;
  }
`;

const NotificationIcon = styled.span<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  margin-right: 8px;
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
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#6c757d';
      }
    }};
  }
`;

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) {
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
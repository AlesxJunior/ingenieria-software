import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { media } from '../styles/breakpoints';
import { COLORS, COLOR_SCALES, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../styles/theme';

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
  padding: ${SPACING.sm} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.md};
  transition: ${TRANSITIONS.default};
  margin-left: auto; /* Fuerza la alineación a la derecha */
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  ${media.mobile} {
    align-self: flex-end; /* En móvil, se alinea a la derecha */
    margin-left: auto;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${BORDER_RADIUS.full};
  background: linear-gradient(135deg, ${COLOR_SCALES.primary[500]}, ${COLOR_SCALES.primary[700]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  color: ${COLORS.neutral.white};
  box-shadow: ${SHADOWS.md};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.div`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  margin-bottom: ${SPACING.xs};
`;

const UserInfoLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
`;

const UserInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <UserInfoContainer>
      <UserInfoLink to="/perfil">
        <UserDetails>
          <UserName>@{user.username}</UserName>
        </UserDetails>
        <UserAvatar>
          {getUserInitials(user.username)}
        </UserAvatar>
      </UserInfoLink>
    </UserInfoContainer>
  );
};

export default UserInfo;
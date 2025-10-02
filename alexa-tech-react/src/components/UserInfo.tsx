import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { media } from '../styles/breakpoints';

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
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
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
`;

const UserInfoLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 12px;
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
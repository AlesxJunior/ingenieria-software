import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { media } from '../styles/breakpoints';
import SidebarContent from './SidebarContent';

const SidebarContainer = styled.aside`
  width: 250px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  
  ${media.tablet} {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  text-align: center;
  padding: 20px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  background: rgba(30, 58, 138, 0.3);

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }
`;

const TitleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    opacity: 0.9;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;







interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <SidebarContainer className={className}>
      <SidebarHeader>
        <TitleLink to="/dashboard">
          <h2>AlexaTech</h2>
        </TitleLink>
      </SidebarHeader>
      <SidebarContent />
    </SidebarContainer>
  );
};

export default Sidebar;
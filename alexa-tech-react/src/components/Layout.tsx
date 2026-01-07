import React from 'react';
import Sidebar from './Sidebar';
import UserInfo from './UserInfo';
import AlertasBadge from './AlertasBadge';
import MobileNav from './MobileNav';
import SidebarContent from './SidebarContent';
import { DashboardContainer, MainContent, MainHeader, ContentBody } from '../styles/GlobalStyles';
import { media } from '../styles/breakpoints';
import styled from 'styled-components';
import { SPACING } from '../styles/theme';

const MobileMainContent = styled(MainContent)`
  ${media.tablet} {
    padding-top: 60px; /* Espacio para la barra de navegación móvil */
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
  
  ${media.mobile} {
    gap: ${SPACING.sm};
  }
`;

const Layout: React.FC<LayoutProps> = ({ children, title, className }) => {
  return (
    <>
      <MobileNav>
        <SidebarContent onItemClick={() => {}} />
      </MobileNav>
      <DashboardContainer className={className}>
        <Sidebar />
        <MobileMainContent>
          <MainHeader>
            <h1>{title}</h1>
            <HeaderRight>
              <AlertasBadge />
              <UserInfo />
            </HeaderRight>
          </MainHeader>
          <ContentBody>
            {children}
          </ContentBody>
        </MobileMainContent>
      </DashboardContainer>
    </>
  );
};

export default Layout;
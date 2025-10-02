import React from 'react';
import Sidebar from './Sidebar';
import UserInfo from './UserInfo';
import MobileNav from './MobileNav';
import SidebarContent from './SidebarContent';
import { DashboardContainer, MainContent, MainHeader, ContentBody } from '../styles/GlobalStyles';
import { media } from '../styles/breakpoints';
import styled from 'styled-components';

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
            <UserInfo />
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
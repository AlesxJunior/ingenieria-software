import React from 'react';
import Sidebar from './Sidebar';
import { DashboardContainer, MainContent, MainHeader, ContentBody } from '../styles/GlobalStyles';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, className }) => {
  return (
    <DashboardContainer className={className}>
      <Sidebar />
      <MainContent>
        <MainHeader>
          <h1>{title}</h1>
        </MainHeader>
        <ContentBody>
          {children}
        </ContentBody>
      </MainContent>
    </DashboardContainer>
  );
};

export default Layout;
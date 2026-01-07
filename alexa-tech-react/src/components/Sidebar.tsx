import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { media } from '../styles/breakpoints';
import SidebarContent from './SidebarContent';
import { COLORS, COLOR_SCALES, SPACING, TYPOGRAPHY, SHADOWS, TRANSITIONS } from '../styles/theme';

const SidebarContainer = styled.aside`
  width: 250px;
  background: linear-gradient(180deg, ${COLOR_SCALES.primary[900]} 0%, ${COLOR_SCALES.primary[800]} 50%, ${COLOR_SCALES.primary[700]} 100%);
  color: ${COLORS.neutral.white};
  box-shadow: ${SHADOWS.md};
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  position: sticky;
  top: 0;
  
  ${media.tablet} {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  text-align: center;
  padding: ${SPACING.xl} ${SPACING.xl} ${SPACING.xl};
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  background: rgba(30, 58, 138, 0.3);

  h2 {
    margin: 0;
    font-size: ${TYPOGRAPHY.fontSize['2xl']};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    color: ${COLORS.neutral.white};
  }
`;

const TitleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  transition: ${TRANSITIONS.default};
  
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
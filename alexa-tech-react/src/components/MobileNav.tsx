import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { media } from '../styles/breakpoints';
import { COLORS, COLOR_SCALES, SPACING, TYPOGRAPHY, SHADOWS, TRANSITIONS } from '../styles/theme';

const MobileNavContainer = styled.div`
  display: none;
  
  ${media.tablet} {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(90deg, ${COLOR_SCALES.primary[900]} 0%, ${COLOR_SCALES.primary[800]} 50%, ${COLOR_SCALES.primary[700]} 100%);
    color: ${COLORS.neutral.white};
    padding: ${SPACING.md} ${SPACING.lg};
    box-shadow: ${SHADOWS.md};
  }
`;

const MobileNavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h2`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.neutral.white};
  
  ${media.mobile} {
    font-size: ${TYPOGRAPHY.fontSize.lg};
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

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.neutral.white};
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  cursor: pointer;
  padding: ${SPACING.xs};
  
  &:hover {
    opacity: 0.8;
  }
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const MobileMenuContent = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: ${props => props.$isOpen ? '0' : '-100%'};
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, ${COLOR_SCALES.primary[900]} 0%, ${COLOR_SCALES.primary[800]} 50%, ${COLOR_SCALES.primary[700]} 100%);
  z-index: 1002;
  transition: ${TRANSITIONS.default};
  overflow-y: auto;
  
  ${media.mobile} {
    width: 100%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    opacity: 0.8;
  }
`;

interface MobileNavProps {
  children: React.ReactNode;
}

const MobileNav: React.FC<MobileNavProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <MobileNavContainer>
        <MobileNavHeader>
          <TitleLink to="/dashboard">
            <Logo>AlexaTech</Logo>
          </TitleLink>
          <MenuButton onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </MenuButton>
        </MobileNavHeader>
      </MobileNavContainer>

      <MobileMenuOverlay $isOpen={isMenuOpen} onClick={closeMenu} />
      
      <MobileMenuContent $isOpen={isMenuOpen}>
        <CloseButton onClick={closeMenu}>
          <i className="fas fa-times"></i>
        </CloseButton>
        <div style={{ paddingTop: '60px' }}>
          {children}
        </div>
      </MobileMenuContent>
    </>
  );
};

export default MobileNav;
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { media } from '../styles/breakpoints';

const MobileNavContainer = styled.div`
  display: none;
  
  ${media.tablet} {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
    color: white;
    padding: 10px 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
`;

const MobileNavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  
  ${media.mobile} {
    font-size: 18px;
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

const MenuButton = styled.button`
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
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
  z-index: 1002;
  transition: left 0.3s ease;
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
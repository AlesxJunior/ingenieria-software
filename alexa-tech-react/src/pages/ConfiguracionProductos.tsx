import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { COLORS, COLOR_SCALES, SPACING, TYPOGRAPHY, TRANSITIONS } from '../styles/theme';
import CategoriasTable from '../components/configuracion/CategoriasTable';
import UnidadesTable from '../components/configuracion/UnidadesTable';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: 0;
`;

const TabContainer = styled.div`
  margin-bottom: ${SPACING.xl};
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  border-bottom: 2px solid ${COLORS.neutral[200]};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${SPACING.md} ${SPACING.xl};
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? COLOR_SCALES.primary[500] : 'transparent'};
  color: ${props => props.$active ? COLOR_SCALES.primary[500] : COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${props => props.$active ? TYPOGRAPHY.fontWeight.semibold : TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  position: relative;
  top: 2px;

  &:hover {
    color: ${COLOR_SCALES.primary[500]};
  }
`;

const TabContent = styled.div`
  margin-top: ${SPACING.xl};
`;

type TabType = 'categorias' | 'unidades';

const ConfiguracionProductos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categorias');

  return (
    <Layout title="Configuración de Productos">
      <Container>
        <Header>
          <div>
            <Title>Configuración de Productos</Title>
            <Subtitle>Administre las categorías y unidades de medida para sus productos</Subtitle>
          </div>
        </Header>

        <TabContainer>
          <TabButtons>
            <TabButton
              $active={activeTab === 'categorias'}
              onClick={() => setActiveTab('categorias')}
            >
              Categorías
            </TabButton>
            <TabButton
              $active={activeTab === 'unidades'}
              onClick={() => setActiveTab('unidades')}
            >
              Unidades de Medida
            </TabButton>
          </TabButtons>
        </TabContainer>

        <TabContent>
          {activeTab === 'categorias' && <CategoriasTable />}
          {activeTab === 'unidades' && <UnidadesTable />}
        </TabContent>
      </Container>
    </Layout>
  );
};

export default ConfiguracionProductos;

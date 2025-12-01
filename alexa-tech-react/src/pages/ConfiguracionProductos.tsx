import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { media } from '../styles/breakpoints';
import CategoriasTable from '../components/configuracion/CategoriasTable';
import UnidadesTable from '../components/configuracion/UnidadesTable';

const Container = styled.div`
  padding: 20px;
  
  ${media.mobile} {
    padding: 12px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
  
  ${media.mobile} {
    font-size: 14px;
    margin: 0 0 20px 0;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e0e0e0;
  
  ${media.mobile} {
    gap: 5px;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? '#007bff' : '#666'};
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  top: 2px;

  &:hover {
    color: #007bff;
  }
  
  ${media.mobile} {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const TabContent = styled.div`
  margin-top: 20px;
`;

type TabType = 'categorias' | 'unidades';

const ConfiguracionProductos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categorias');

  return (
    <Layout title="Configuración de Productos">
      <Container>
        <Subtitle>
          Administre las categorías y unidades de medida para sus productos
        </Subtitle>

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

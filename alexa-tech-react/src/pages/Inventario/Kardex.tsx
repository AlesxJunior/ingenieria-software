import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import FiltersKardex from '../../components/Inventario/FiltersKardex';
import TablaKardex from '../../components/Inventario/TablaKardex';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { KardexFilters } from '../../types/inventario';

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const ErrorContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  margin: 2rem 0;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #e74c3c;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  margin: 0 0 2rem 0;
  font-size: 1rem;
  line-height: 1.5;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const RetryButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const EmptyState = styled.div`
  background: #f1f3f5;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const Kardex: React.FC = () => {
  const { movimientos, loading, error, pagination, clearError, debouncedFetchKardex } = useInventarioWithDebounce();
  const [filters, setFilters] = useState<KardexFilters>({ page: 1, pageSize: 20, sortBy: 'fecha', order: 'desc', warehouseId: 'WH-PRINCIPAL' });

  // Buscar cuando cambian filtros (debounced) y evitar doble fetch inicial
  useEffect(() => {
    console.log('filters changed:', filters);
    debouncedFetchKardex(filters, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters: KardexFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
  };

  const handlePageChange = (page: number) => {
    const merged = { ...filters, page };
    setFilters(merged);
  };

  // Renderizar estado de error mejorado
  if (error) {
    return (
      <Layout title="Kardex">
        <Container>
          <Header>
            <Title>Kardex de Inventario</Title>
          </Header>
          
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Error al cargar los datos</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <ErrorActions>
              <RetryButton onClick={() => {
                clearError();
                debouncedFetchKardex(filters, 0);
              }}>
                Reintentar
              </RetryButton>
              <SecondaryButton onClick={() => {
                clearError();
                setFilters({
                  page: 1,
                  pageSize: 20,
                  sortBy: 'fecha',
                  order: 'desc',
                  warehouseId: 'WH-PRINCIPAL'
                });
              }}>
                Limpiar filtros
              </SecondaryButton>
            </ErrorActions>
          </ErrorContainer>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Kardex">

      <FiltersKardex onFilterChange={handleFilterChange} loading={loading} defaultWarehouseId="WH-PRINCIPAL" />

      {!loading && movimientos.length === 0 && (
        <EmptyState>No hay movimientos</EmptyState>
      )}

      <TablaKardex
        movimientos={movimientos}
        pagination={pagination.kardex || { page: filters.page || 1, pages: 1, total: movimientos.length, limit: filters.pageSize || 20 }}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </Layout>
  );
};

export default Kardex;
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import FiltersStock from '../../components/Inventario/FiltersStock';
import TablaStock from '../../components/Inventario/TablaStock';
import ModalAjuste from '../../components/Inventario/ModalAjuste';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { StockFilters, StockItem, AjusteFormData } from '../../types/inventario';

const ErrorBanner = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  background: #f1f3f5;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const ListadoStock: React.FC = () => {
  const { stockItems, loading, error, pagination, clearError, debouncedFetchStock, crearAjuste, canUpdateInventory } = useInventarioWithDebounce();
  const [filters, setFilters] = useState<StockFilters>({ page: 1, limit: 10, sortBy: 'producto', order: 'asc', almacenId: 'WH-PRINCIPAL' });
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  // Debounce fetch cuando cambian filtros y evitar doble fetch inicial
  useEffect(() => {
    console.log('Stock filters changed:', filters);
    debouncedFetchStock(filters, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const areFiltersEqual = (a: StockFilters, b: StockFilters) => (
    a.almacenId === b.almacenId &&
    a.q === b.q &&
    a.estado === b.estado &&
    a.page === b.page &&
    a.limit === b.limit &&
    a.sortBy === b.sortBy &&
    a.order === b.order
  );

  const handleFilterChange = (newFilters: StockFilters) => {
    const merged = { ...filters, ...newFilters };
    if (areFiltersEqual(filters, merged)) return; // evitar set sin cambios
    setFilters(merged);
  };

  const handlePageChange = (page: number) => {
    const merged = { ...filters, page };
    if (areFiltersEqual(filters, merged)) return;
    setFilters(merged);
  };

  const handleOpenAjuste = (item: StockItem) => {
    setSelectedStock(item);
    setAjusteOpen(true);
  };

  const handleCloseAjuste = () => {
    setAjusteOpen(false);
    setSelectedStock(null);
  };

  const handleSubmitAjuste = async (form: AjusteFormData) => {
    if (!selectedStock) return;
    await crearAjuste({
      productId: selectedStock.productId,
      warehouseId: selectedStock.warehouseId ?? filters.almacenId ?? 'WH-PRINCIPAL',
      cantidadAjuste: form.cantidadAjuste,
      reasonId: form.reasonId, // Enviar el ID del motivo
      adjustmentReason: form.adjustmentReason, // Mantener para compatibilidad
      observaciones: form.observaciones || '',
    });
    handleCloseAjuste();
  };

  return (
    <Layout title="Stock">
      {error && (
        <ErrorBanner>
          {error}
          <button style={{ marginLeft: '1rem' }} onClick={clearError}>Cerrar</button>
        </ErrorBanner>
      )}

      <FiltersStock onFilterChange={handleFilterChange} loading={loading} defaultWarehouseId="WH-PRINCIPAL" />

      {!loading && stockItems.length === 0 && (
        <EmptyState>No hay stock para los filtros seleccionados</EmptyState>
      )}

      <TablaStock
        stockItems={stockItems}
        pagination={pagination.stock || { page: filters.page || 1, pages: 1, total: stockItems.length, limit: filters.limit || 10 }}
        loading={loading}
        onPageChange={handlePageChange}
        onAjustar={handleOpenAjuste}
        canUpdateInventory={canUpdateInventory}
      />

      <ModalAjuste
        isOpen={ajusteOpen}
        stockItem={selectedStock}
        onClose={handleCloseAjuste}
        onSubmit={handleSubmitAjuste}
      />
    </Layout>
  );
};

export default ListadoStock;
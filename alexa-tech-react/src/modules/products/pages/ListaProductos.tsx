import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useProducts, type Product } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { useModal } from '../../../context/ModalContext';
import NuevoProductoModal from '../components/NuevoProductoModal';
import EditarProductoModal from '../components/EditarProductoModal';
import { apiService } from '../../../utils/api';
import { media } from '../../../styles/breakpoints';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';
import { 
  Button, ActionButton, StatusBadge, Input, Select, 
  StatCard, StatsGrid, StatValue, StatLabel,
  PaginationContainer as SharedPaginationContainer, 
  PaginationInfo as SharedPaginationInfo, 
  PageButton 
} from '../../../components/shared';

const TableContainer = styled.div`
  background-color: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.lg};
  
  ${media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.muted};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: ${SPACING.xs} 0 0 0;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  position: relative;

  i {
    position: absolute;
    right: ${SPACING.md};
    color: ${COLORS.text.muted};
  }
`;

const AdvancedSearchContainer = styled.div<{ $show: boolean }>`
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

// Usamos Input y Select del shared para filtros

// Botones reemplazados por shared components Button y ActionButton

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const Thead = styled.thead`
  background: ${COLORS.background};
`;

const Th = styled.th`
  padding: ${SPACING.md};
  text-align: left;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.muted};
  border-bottom: 1px solid ${COLORS.border};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.borderLight};
  }

  &:hover {
    background: ${COLORS.background};
  }
`;

const Td = styled.td`
  padding: ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text.primary};
`;

const MobileCardContainer = styled.div`
  display: none;
  
  ${media.mobile} {
    display: block;
    padding: 12px;
  }
`;

const MobileCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MobileCardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

const MobileCardCode = styled.span`
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileCardLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 2px;
`;

const MobileCardValue = styled.span`
  font-size: 14px;
  color: #333;
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid #dee2e6;
  padding-top: 12px;
`;


// ActionButton y ActiveBadge reemplazados por shared components (StatusBadge)

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.text.muted};
`;

// Usamos SharedPaginationContainer, SharedPaginationInfo y PageButton del shared

const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteConfirmContent = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  max-width: 400px;
  width: 90%;
  box-shadow: ${SHADOWS.lg};
`;

const DeleteConfirmTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DeleteConfirmMessage = styled.p`
  margin: 0 0 ${SPACING.xl} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.md};
  line-height: 1.5;
`;

const DeleteConfirmActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;


const ListaProductos: React.FC = () => {
  const { products, pagination, updateProduct, loadProducts } = useProducts();
  const { showSuccess, showError } = useNotification();
  const { openModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Debounce para búsqueda
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Efecto de debounce para searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar productos con filtros server-side
  const fetchProductsWithFilters = useCallback(async () => {
    try {
      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearchTerm) filters.q = debouncedSearchTerm;
      if (selectedCategory) filters.categoria = selectedCategory;
      if (minPrice) filters.minPrecio = parseFloat(minPrice);
      if (maxPrice) filters.maxPrecio = parseFloat(maxPrice);

      await loadProducts(filters);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, selectedCategory, minPrice, maxPrice, loadProducts]);

  // Cargar productos cuando cambien los filtros o la página
  useEffect(() => {
    fetchProductsWithFilters();
  }, [fetchProductsWithFilters]);

  const handleNewProduct = () => {
    openModal(<NuevoProductoModal onClose={closeModal} />, 'Registrar Producto', 'large');
  };

  // Obtener categorías únicas para el filtro (de los productos actuales)
  const categories = Array.from(
    new Set(
      products.map(product => {
        // Extraer nombre de categoría: priorizar relación FK, luego campo legacy
        const catName = product.categoria?.nombre || product.category;
        // Si category es objeto (no debería, pero por seguridad), extraer nombre
        return typeof catName === 'string' ? catName : (catName as any)?.nombre || '';
      }).filter(Boolean)
    )
  ).sort();

  const handleEdit = (productId: string | number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    openModal(
      <EditarProductoModal product={product} onClose={closeModal} />,
      'Editar Producto',
      'large'
    );
  };

  

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await apiService.deleteProduct(productToDelete.productCode);
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar el producto');
      }
      // Actualizar el producto localmente marcándolo como inactivo
      updateProduct(productToDelete.id, { isActive: false });
      showSuccess('Producto eliminado exitosamente');
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('No se pudo eliminar el producto');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const handleActivateProduct = async (product: Product) => {
    try {
      const response = await apiService.updateProductStatus(product.productCode, true);
      if (!response.success) {
        throw new Error(response.message || 'Error al activar el producto');
      }
      updateProduct(product.id, { isActive: true });
      showSuccess('Producto activado exitosamente');
    } catch (error) {
      console.error('Error activating product:', error);
      showError('No se pudo activar el producto');
    }
  };

  

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1); // Resetear a la primera página
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = pagination?.total || products.length;
    const activos = products.filter(p => p.isActive).length;
    const inactivos = products.filter(p => !p.isActive).length;
    const stockBajo = products.filter(p => p.minStock && p.initialStock <= p.minStock).length;
    return { total, activos, inactivos, stockBajo };
  }, [products, pagination]);

  return (
    <Layout title="Lista de Productos">
      <TableContainer>
        <TableHeader>
          <div>
            <PageTitle>Lista de Productos</PageTitle>
            <PageSubtitle>Catálogo de productos, precios, stock y categorías</PageSubtitle>
          </div>
          <SearchBox>
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
            <i className="fas fa-search"></i>
          </SearchBox>
          <div style={{ display: 'flex', gap: SPACING.sm }}>
            <Button $variant="outline" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              {showAdvancedSearch ? 'Ocultar Filtros' : 'Filtros Avanzados'}
            </Button>
            <Button $variant="primary" onClick={handleNewProduct}>
              <i className="fas fa-plus"></i> Nuevo Producto
            </Button>
          </div>
        </TableHeader>

        {/* Tarjetas de Estadísticas */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.total}</StatValue>
            <StatLabel>Total Productos</StatLabel>
          </StatCard>
          <StatCard $color="#28a745">
            <StatValue $color="#28a745">{stats.activos}</StatValue>
            <StatLabel>Activos</StatLabel>
          </StatCard>
          <StatCard $color="#6c757d">
            <StatValue $color="#6c757d">{stats.inactivos}</StatValue>
            <StatLabel>Inactivos</StatLabel>
          </StatCard>
          <StatCard $color="#dc3545">
            <StatValue $color="#dc3545">{stats.stockBajo}</StatValue>
            <StatLabel>Stock Bajo</StatLabel>
          </StatCard>
        </StatsGrid>

        <AdvancedSearchContainer $show={showAdvancedSearch}>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Categoría</FilterLabel>
              <Input
                as="select"
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Input>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Precio Mínimo</FilterLabel>
              <Input
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
                style={{ width: '120px' }}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Precio Máximo</FilterLabel>
              <Input
                type="number"
                placeholder="999.99"
                value={maxPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
                style={{ width: '120px' }}
              />
            </FilterGroup>

            <Button $variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </FilterRow>
        </AdvancedSearchContainer>

        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Categoría</Th>
              <Th>Precio</Th>
              <Th>Stock Inicial</Th>
              <Th>Stock Mín.</Th>
              <Th>Estado</Th>
              <Th>Unidad</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <Tr key={product.productCode}>
                  <Td>{product.productCode}</Td>
                  <Td>{product.productName}</Td>
                  <Td>
                    {product.categoria?.nombre || 
                     (typeof product.category === 'string' ? product.category : (product.category as any)?.nombre) ||
                     '-'}
                  </Td>
                  <Td>{formatPrice(product.price)}</Td>
                  <Td>{product.initialStock}</Td>
                  <Td>{product.minStock ?? '-'}</Td>
                  <Td>
                    <StatusBadge variant={product.isActive ? 'success' : 'default'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {product.unidadMedida?.nombre || 
                     (typeof product.unit === 'string' ? product.unit : (product.unit as any)?.nombre) || 
                     '-'}
                  </Td>
                  <Td>
                    <ActionButton 
                      onClick={() => handleEdit(product.id)}
                      $variant="edit"
                    >
                      Editar
                    </ActionButton>
                    {product.isActive ? (
                      <ActionButton 
                        onClick={() => handleDeleteClick(product as Product)}
                        $variant="delete"
                      >
                        Eliminar
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        onClick={() => handleActivateProduct(product as Product)}
                        $variant="activate"
                      >
                        Activar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={9}>
                  <EmptyStateContainer>
                    {searchTerm ? 
                      'No se encontraron productos que coincidan con la búsqueda.' : 
                      'No hay productos registrados.'
                    }
                  </EmptyStateContainer>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>

        <MobileCardContainer>
          {products.length > 0 ? (
            products.map((product) => (
              <MobileCard key={product.productCode}>
                <MobileCardHeader>
                  <MobileCardTitle>{product.productName}</MobileCardTitle>
                  <MobileCardCode>{product.productCode}</MobileCardCode>
                </MobileCardHeader>
                
                <MobileCardBody>
                  <MobileCardField>
                    <MobileCardLabel>Categoría</MobileCardLabel>
                    <MobileCardValue>
                      {product.categoria?.nombre || 
                       (typeof product.category === 'string' ? product.category : (product.category as any)?.nombre) ||
                       '-'}
                    </MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Precio</MobileCardLabel>
                    <MobileCardValue>{formatPrice(product.price)}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Stock Inicial</MobileCardLabel>
                    <MobileCardValue>{product.initialStock}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Stock Mín.</MobileCardLabel>
                    <MobileCardValue>{product.minStock ?? '-'}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Estado</MobileCardLabel>
                    <MobileCardValue>
                      <StatusBadge variant={product.isActive ? 'success' : 'default'}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
                    </MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Unidad</MobileCardLabel>
                    <MobileCardValue>
                      {product.unidadMedida?.nombre || 
                       (typeof product.unit === 'string' ? product.unit : (product.unit as any)?.nombre) || 
                       '-'}
                    </MobileCardValue>
                  </MobileCardField>


                </MobileCardBody>
                
                <MobileCardActions>
                  <ActionButton 
                    onClick={() => handleEdit(product.id)}
                    $variant="edit"
                  >
                    Editar
                  </ActionButton>
                  {product.isActive ? (
                    <ActionButton 
                      onClick={() => handleDeleteClick(product as Product)}
                      $variant="delete"
                    >
                      Eliminar
                    </ActionButton>
                  ) : (
                    <ActionButton 
                      onClick={() => handleActivateProduct(product as Product)}
                      $variant="activate"
                    >
                      Activar
                    </ActionButton>
                  )}
                </MobileCardActions>
              </MobileCard>
            ))
          ) : (
            <EmptyStateContainer>
              {searchTerm ? 
                'No se encontraron productos que coincidan con la búsqueda.' : 
                'No hay productos registrados.'
              }
            </EmptyStateContainer>
          )}
        </MobileCardContainer>
        
        {/* Paginación */}
        {pagination && pagination.total > 0 && (
          <SharedPaginationContainer>
            <SharedPaginationInfo>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
            </SharedPaginationInfo>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
              <Select
                value={pageSize}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: 'auto' }}
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </Select>
              
              <div style={{ display: 'flex', gap: SPACING.xs }}>
                <PageButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </PageButton>
                
                {Array.from({ length: Math.min(3, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 1) {
                    pageNum = pagination.pages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  return (
                    <PageButton
                      key={pageNum}
                      $active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                
                <PageButton
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={currentPage >= pagination.pages}
                >
                  Siguiente
                </PageButton>
              </div>
            </div>
          </SharedPaginationContainer>
        )}
      </TableContainer>

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteConfirmOpen && productToDelete && (
        <DeleteConfirmModal>
          <DeleteConfirmContent>
            <DeleteConfirmTitle>¿Eliminar Producto?</DeleteConfirmTitle>
            <DeleteConfirmMessage>
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <strong>{productToDelete.productName}</strong>? Esta acción marcará el producto como inactivo.
            </DeleteConfirmMessage>
            <DeleteConfirmActions>
              <Button $variant="outline" onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button $variant="danger" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </DeleteConfirmActions>
          </DeleteConfirmContent>
        </DeleteConfirmModal>
      )}
    </Layout>
  );
};

export default ListaProductos;
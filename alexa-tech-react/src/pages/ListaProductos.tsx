import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useApp } from '../hooks/useApp';
import { media } from '../styles/breakpoints';

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${media.tablet} {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    padding: 15px;
  }
  
  ${media.mobile} {
    padding: 12px;
    gap: 12px;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
  
  ${media.tablet} {
    text-align: center;
    font-size: 22px;
  }
  
  ${media.mobile} {
    font-size: 20px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  ${media.tablet} {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  ${media.mobile} {
    gap: 8px;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  ${media.tablet} {
    width: 200px;
  }
  
  ${media.mobile} {
    width: 150px;
    font-size: 16px; /* Evita zoom en iOS */
    padding: 10px 12px;
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

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 150px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 120px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
  background: white;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #007bff;
    color: white;
  }
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #6c757d;
  border-radius: 4px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #6c757d;
    color: white;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  tr:hover {
    background-color: #f8f9fa;
  }
  
  ${media.mobile} {
    display: none;
  }
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

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'disponible':
        return 'background-color: #d4edda; color: #155724;';
      case 'agotado':
        return 'background-color: #f8d7da; color: #721c24;';
      case 'proximamente':
        return 'background-color: #fff3cd; color: #856404;';
      default:
        return 'background-color: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButton = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 12px;

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    margin: 0 0 16px 0;
    color: #333;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
`;

const ListaProductos: React.FC = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, showSuccess, showError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filtrar productos basado en todos los criterios de búsqueda
  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = searchTerm === '' || 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    const matchesMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);

    return matchesSearchTerm && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  const handleEdit = (productCode: string) => {
    navigate(`/editar-producto/${productCode}`);
  };

  const handleDelete = (productCode: string) => {
    setProductToDelete(productCode);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      try {
        deleteProduct(productToDelete);
        showSuccess('Producto eliminado exitosamente');
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch {
        showError('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
        setShowDeleteModal(false);
        setProductToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'agotado':
        return 'Agotado';
      case 'proximamente':
        return 'Próximamente';
      default:
        return status;
    }
  };

  return (
    <Layout title="Lista de Productos">
      <TableContainer>
        <TableHeader>
          <Title>Lista de Productos</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ToggleButton onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              {showAdvancedSearch ? 'Ocultar Filtros' : 'Filtros Avanzados'}
            </ToggleButton>
          </SearchContainer>
        </TableHeader>

        <AdvancedSearchContainer $show={showAdvancedSearch}>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Categoría</FilterLabel>
              <FilterSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Precio Mínimo</FilterLabel>
              <FilterInput
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Precio Máximo</FilterLabel>
              <FilterInput
                type="number"
                placeholder="999.99"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </FilterGroup>

            <FilterButton onClick={clearFilters}>
              Limpiar Filtros
            </FilterButton>
          </FilterRow>
        </AdvancedSearchContainer>

        <Table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.productCode}>
                  <td>{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.initialStock}</td>
                  <td>
                    <StatusBadge $status={product.status}>
                      {getStatusText(product.status)}
                    </StatusBadge>
                  </td>
                  <td>{product.unit}</td>
                  <td>
                    <ActionButton 
                      onClick={() => handleEdit(product.productCode)}
                      $color="#007bff"
                    >
                      Editar
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDelete(product.productCode)}
                      $color="#dc3545"
                    >
                      Eliminar
                    </ActionButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <EmptyState>
                    {searchTerm ? 
                      'No se encontraron productos que coincidan con la búsqueda.' : 
                      'No hay productos registrados.'
                    }
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <MobileCardContainer>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <MobileCard key={product.productCode}>
                <MobileCardHeader>
                  <MobileCardTitle>{product.productName}</MobileCardTitle>
                  <MobileCardCode>{product.productCode}</MobileCardCode>
                </MobileCardHeader>
                
                <MobileCardBody>
                  <MobileCardField>
                    <MobileCardLabel>Categoría</MobileCardLabel>
                    <MobileCardValue>{product.category}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Precio</MobileCardLabel>
                    <MobileCardValue>{formatPrice(product.price)}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Stock</MobileCardLabel>
                    <MobileCardValue>{product.initialStock}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Estado</MobileCardLabel>
                    <MobileCardValue>
                      <StatusBadge $status={product.status}>
                        {getStatusText(product.status)}
                      </StatusBadge>
                    </MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Unidad</MobileCardLabel>
                    <MobileCardValue>{product.unit}</MobileCardValue>
                  </MobileCardField>
                </MobileCardBody>
                
                <MobileCardActions>
                  <ActionButton 
                    onClick={() => handleEdit(product.productCode)}
                    $color="#007bff"
                  >
                    Editar
                  </ActionButton>
                  <ActionButton 
                    onClick={() => handleDelete(product.productCode)}
                    $color="#dc3545"
                  >
                    Eliminar
                  </ActionButton>
                </MobileCardActions>
              </MobileCard>
            ))
          ) : (
            <EmptyState>
              {searchTerm ? 
                'No se encontraron productos que coincidan con la búsqueda.' : 
                'No hay productos registrados.'
              }
            </EmptyState>
          )}
        </MobileCardContainer>
      </TableContainer>

      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este producto?</p>
            <ModalButtons>
              <ModalButton 
                onClick={cancelDelete}
                $color="#6c757d"
              >
                Cancelar
              </ModalButton>
              <ModalButton 
                onClick={confirmDelete}
                $color="#dc3545"
              >
                Eliminar
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};

export default ListaProductos;
/**
 * PÁGINA: PurchaseOrdersPage
 * Gestión completa de Órdenes de Compra
 * Fase 5 - Task 12
 * 
 * Características:
 * - Layout completo con título y breadcrumb
 * - Lista de órdenes (PurchaseOrderList)
 * - Modal crear/editar orden (PurchaseOrderForm)
 * - Modal detalle orden (PurchaseOrderDetail)
 * - Integración con usePurchaseOrders hook
 * - Manejo de estados (loading, error, success)
 * - Notificaciones de acciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import Modal from '../../../components/Modal';
import { PurchaseOrderList, PurchaseOrderForm, PurchaseOrderDetail } from '../components';
import { usePurchaseOrders } from '../hooks';
import { useNotification } from '../../../context/NotificationContext';
import type { PurchaseOrder, FilterPurchaseOrderDto } from '../types/purchases.types';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' ? `
    background: #0047b3;
    color: white;
    &:hover:not(:disabled) {
      background: #003d99;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 71, 179, 0.2);
    }
  ` : `
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;
    &:hover:not(:disabled) {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  i {
    font-size: 1rem;
  }
`;

const ErrorContainer = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  color: #c33;
  margin-bottom: 1rem;
`;

// ==================== COMPONENT ====================

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: urlOrderId } = useParams<{ id?: string }>();
  const { showNotification } = useNotification();

  // ==================== HOOKS ====================

  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch,
  } = usePurchaseOrders({
    autoFetch: true,
    onSuccess: () => {
      // Success handled in individual operations
    },
    onError: (err) => {
      showNotification(err.message, 'error');
    },
  });

  // ==================== ESTADOS LOCALES ====================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // ==================== EFFECTS ====================

  // Abrir detalle si viene ID en URL
  useEffect(() => {
    if (urlOrderId) {
      handleView(urlOrderId);
    }
  }, [urlOrderId]);

  // ==================== HANDLERS ====================

  /**
   * Abrir modal crear
   */
  const handleCreate = () => {
    setSelectedOrder(null);
    setShowCreateModal(true);
  };

  /**
   * Abrir modal editar
   */
  const handleEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowEditModal(true);
    }
  };

  /**
   * Abrir modal detalle
   */
  const handleView = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  /**
   * Eliminar orden
   */
  const handleDelete = async (orderId: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta orden de compra?')) {
      return;
    }

    const success = await deleteOrder(orderId);
    
    if (success) {
      showNotification('Orden de compra eliminada exitosamente', 'success');
      refetch();
    }
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    refetch();
    showNotification('Lista actualizada', 'info');
  };

  /**
   * Success al crear
   */
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showNotification('Orden de compra creada exitosamente', 'success');
    refetch();
  };

  /**
   * Success al editar
   */
  const handleEditSuccess = () => {
    setShowEditModal(false);
    showNotification('Orden de compra actualizada exitosamente', 'success');
    refetch();
  };

  /**
   * Cancelar modales
   */
  const handleCancel = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedOrder(null);
    setSelectedOrderId(null);
    
    // Limpiar URL si hay ID
    if (urlOrderId) {
      navigate('/compras/ordenes', { replace: true });
    }
  };

  /**
   * Crear recepción desde detalle
   */
  const handleCreateReceipt = (orderId: string) => {
    setShowDetailModal(false);
    navigate(`/compras/recepciones/crear?ordenId=${orderId}`);
  };

  // ==================== RENDER ====================

  return (
    <Layout title="Órdenes de Compra">
      <Container>
        {/* Header con acciones */}
        <Header>
          <Title>Gestión de Órdenes de Compra</Title>
          <ButtonGroup>
            <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
              <i className="fas fa-sync-alt"></i>
              Actualizar
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              <i className="fas fa-plus"></i>
              Nueva Orden
            </Button>
          </ButtonGroup>
        </Header>

        {/* Error global */}
        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error.message}
          </ErrorContainer>
        )}

        {/* Lista de órdenes */}
        <PurchaseOrderList
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />

        {/* Modal Crear */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCancel}
          title="Nueva Orden de Compra"
          size="large"
        >
          <PurchaseOrderForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
          />
        </Modal>

        {/* Modal Editar */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCancel}
          title="Editar Orden de Compra"
          size="large"
        >
          {selectedOrder && (
            <PurchaseOrderForm
              order={selectedOrder}
              onSuccess={handleEditSuccess}
              onCancel={handleCancel}
            />
          )}
        </Modal>

        {/* Modal Detalle */}
        <Modal
          isOpen={showDetailModal}
          onClose={handleCancel}
          title="Detalle de Orden de Compra"
          size="large"
        >
          {selectedOrderId && (
            <PurchaseOrderDetail
              orderId={selectedOrderId}
              onEdit={handleEdit}
              onCreateReceipt={handleCreateReceipt}
              onClose={handleCancel}
            />
          )}
        </Modal>
      </Container>
    </Layout>
  );
};

export default PurchaseOrdersPage;

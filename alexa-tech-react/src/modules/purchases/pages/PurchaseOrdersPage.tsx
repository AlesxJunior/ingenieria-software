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
import { COLOR_SCALES, SPACING, BORDER_RADIUS } from '../../../styles/theme';
import Layout from '../../../components/Layout';
import Modal from '../../../components/Modal';
import { PurchaseOrderList, PurchaseOrderForm, PurchaseOrderDetail } from '../components';
import { usePurchaseOrders } from '../hooks';
import { useNotification } from '../../../context/NotificationContext';
import type { PurchaseOrder } from '../types/purchases.types';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 0;
`;

const ErrorContainer = styled.div`
  background: ${COLOR_SCALES.danger[50]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  color: ${COLOR_SCALES.danger[700]};
  margin-bottom: ${SPACING.lg};
`;

// ==================== COMPONENT ====================

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: urlOrderId } = useParams<{ id?: string }>();
  const { showNotification } = useNotification();

  // ==================== HOOKS ====================

  const {
    error,
    refetch,
  } = usePurchaseOrders({
    autoFetch: true,
    onSuccess: () => {
      // Success handled in individual operations
    },
    onError: (err) => {
      showNotification('error', 'Error al Cargar', err.message);
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
  const handleEdit = (order: PurchaseOrder) => {
    console.log('📝 [PurchaseOrdersPage] handleEdit called:', { orderId: order.id, estado: order.estado });
    setSelectedOrder(order);
    setShowEditModal(true);
    console.log('📝 [PurchaseOrdersPage] Modal opened for order:', order.codigo);
  };

  /**
   * Abrir modal editar desde detalle (recibe solo orderId)
   */
  const handleEditFromDetail = async (orderId: string) => {
    try {
      // Necesitamos obtener la orden completa para el formulario de edición
      const { purchaseOrderService } = await import('../services');
      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      if (response && response.data) {
        handleEdit(response.data);
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Error al cargar orden para editar:', err);
      showNotification('error', 'Error', 'No se pudo cargar la orden para editar');
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
   * Callback de eliminación del hijo (List ya ejecutó el DELETE)
   */
  const handleDelete = async (_orderId: string) => {
    // ✅ El hijo (PurchaseOrderList) ya ejecutó el DELETE exitosamente
    // Este callback solo debe actualizar el estado del padre si es necesario
    // NO ejecutar deleteOrder() de nuevo para evitar doble petición
    
    // El hijo ya notificó al usuario y actualizó su lista local
    // Solo hacemos refetch si el padre mantiene estado adicional
    // (en este caso no es necesario porque el hijo maneja su propio estado)
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    refetch();
    showNotification('info', 'Lista Actualizada', 'Los datos se han recargado correctamente');
  };

  /**
   * Success al crear
   */
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showNotification('success', 'Orden Creada', 'La orden de compra se ha registrado correctamente');
    refetch();
  };

  /**
   * Success al editar
   */
  const handleEditSuccess = () => {
    setShowEditModal(false);
    showNotification('success', 'Orden Actualizada', 'Los cambios se han guardado correctamente');
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
          onCreate={handleCreate}
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
              onEdit={handleEditFromDetail}
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

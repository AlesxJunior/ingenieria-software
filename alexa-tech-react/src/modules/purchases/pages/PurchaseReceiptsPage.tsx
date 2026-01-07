/**
 * PÁGINA: PurchaseReceiptsPage
 * Gestión completa de Recepciones de Compra
 * Fase 5 - Task 13
 * 
 * Características:
 * - Layout completo con título
 * - Lista de recepciones (PurchaseReceiptList)
 * - Modal crear recepción (PurchaseReceiptForm)
 * - Modal detalle recepción (PurchaseReceiptDetail)
 * - Integración con usePurchaseReceipts hook
 * - Manejo de confirmación/anulación
 * - Notificaciones de acciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { COLOR_SCALES, SPACING, BORDER_RADIUS } from '../../../styles/theme';
import Layout from '../../../components/Layout';
import Modal from '../../../components/Modal';
import { PurchaseReceiptList, PurchaseReceiptForm, PurchaseReceiptDetail } from '../components';
import { usePurchaseReceipts } from '../hooks';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

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

const PurchaseReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: urlReceiptId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Query params
  const preselectedOrderId = searchParams.get('ordenId') || undefined;

  // ==================== HOOKS ====================

  const {
    receipts,
    isLoading,
    error,
    fetchReceipts,
    confirmReceipt,
    cancelReceipt,
    refetch,
  } = usePurchaseReceipts({
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  // Abrir detalle si viene ID en URL
  useEffect(() => {
    if (urlReceiptId) {
      handleView(urlReceiptId);
    }
  }, [urlReceiptId]);

  // Abrir modal crear si viene ordenId en query
  useEffect(() => {
    if (preselectedOrderId && !showCreateModal) {
      setShowCreateModal(true);
    }
  }, [preselectedOrderId]);

  // ==================== HANDLERS ====================

  /**
   * Abrir modal crear
   */
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  /**
   * Abrir modal detalle
   */
  const handleView = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setShowDetailModal(true);
  };

  /**
   * Callback cuando se confirma una recepción (desde PurchaseReceiptList)
   * La confirmación ya fue realizada por el componente hijo
   */
  const handleConfirm = async () => {
    // Solo refrescar datos - la confirmación ya fue hecha por el componente hijo
    refetch();
  };

  /**
   * Callback cuando se anula una recepción (desde PurchaseReceiptList)
   * La anulación ya fue realizada por el componente hijo
   */
  const handleCancel = async () => {
    // Solo refrescar datos - la anulación ya fue hecha por el componente hijo
    refetch();
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
    showNotification('success', 'Recepción Creada', 'La recepción de compra se ha registrado correctamente');
    refetch();
    
    // Limpiar query params
    if (preselectedOrderId) {
      navigate('/compras/recepciones', { replace: true });
    }
  };

  /**
   * Cancelar modales
   */
  const handleCancelModal = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedReceiptId(null);
    
    // Limpiar URL
    if (urlReceiptId || preselectedOrderId) {
      navigate('/compras/recepciones', { replace: true });
    }
  };

  // ==================== RENDER ====================

  return (
    <Layout title="Recepciones de Compra">
      <Container>
        {/* Error global */}
        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error.message}
          </ErrorContainer>
        )}

        {/* Lista de recepciones */}
        <PurchaseReceiptList
          onCreate={handleCreate}
          onView={handleView}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onRefresh={handleRefresh}
        />

        {/* Modal Crear */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCancelModal}
          title="Nueva Recepción de Compra"
          size="large"
        >
          <PurchaseReceiptForm
            preselectedOrderId={preselectedOrderId}
            onSuccess={handleCreateSuccess}
            onCancel={handleCancelModal}
          />
        </Modal>

        {/* Modal Detalle */}
        <Modal
          isOpen={showDetailModal}
          onClose={handleCancelModal}
          title="Detalle de Recepción de Compra"
          size="large"
        >
          {selectedReceiptId && (
            <PurchaseReceiptDetail
              receiptId={selectedReceiptId}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onClose={handleCancelModal}
            />
          )}
        </Modal>
      </Container>
    </Layout>
  );
};

export default PurchaseReceiptsPage;

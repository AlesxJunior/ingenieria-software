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
      showNotification(err.message, 'error');
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
    showNotification('Lista actualizada', 'info');
  };

  /**
   * Success al crear
   */
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showNotification('Recepción de compra creada exitosamente', 'success');
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
        {/* Header con acciones */}
        <Header>
          <Title>Gestión de Recepciones de Compra</Title>
          <ButtonGroup>
            <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
              <i className="fas fa-sync-alt"></i>
              Actualizar
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              <i className="fas fa-plus"></i>
              Nueva Recepción
            </Button>
          </ButtonGroup>
        </Header>

        {/* Error global */}
        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error.message}
          </ErrorContainer>
        )}

        {/* Lista de recepciones */}
        <PurchaseReceiptList
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

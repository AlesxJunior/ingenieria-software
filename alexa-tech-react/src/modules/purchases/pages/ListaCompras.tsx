import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useClients } from '../../clients/context/ClientContext';
import { useNotification } from '../../../context/NotificationContext';
import { useModal } from '../../../context/ModalContext';
import NuevaCompraModal from '../components/NuevaCompraModal';
import { apiService } from '../../../utils/api';

import { getWarehouseLabel } from '../../../constants/warehouses';
import DetalleCompraModal from '../components/DetalleCompraModal';
import CambiarEstadoModal from '../../../components/CambiarEstadoModal';

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
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 24px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 240px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const PrimaryButton = styled.button`
  background-color: #0047b3;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover { background-color: #003a92; }
`;

const FilterButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover { background-color: #5a6268; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  background: #f1f3f5;
  padding: 10px 12px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #555;
`;

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const StatusBadge = styled.span<{ status: 'Pendiente' | 'Recibida' | 'Cancelada' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background: ${p => p.status === 'Pendiente' ? '#f39c12' : p.status === 'Recibida' ? '#27ae60' : '#c0392b'};
`;

const ActionButton = styled.button<{ $color?: string }>`
  background-color: ${props => props.$color || '#95a5a6'};
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 12px;
  &:hover { opacity: 0.9; }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #fafafa;
`;

const PaginationInfo = styled.span`
  color: #555;
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageButton = styled.button`
  background: #e9ecef;
  border: 1px solid #dee2e6;
  color: #333;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`;

interface PurchaseItem {
  productoId: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Purchase {
  id: string;
  codigoOrden: string;
  proveedorId: string;
  almacenId: string;
  fechaEmision: string;
  tipoComprobante?: string;
  items: PurchaseItem[];
  subtotal: number;
  total: number;
  formaPago?: string;
  fechaEntregaEstimada?: string;
  observaciones?: string;
  usuarioId: string;
  estado: 'Pendiente' | 'Recibida' | 'Cancelada';
  createdAt: string;
  updatedAt: string;
}

const ListaCompras: React.FC = () => {
  const { clients, getClientById, loadClients } = useClients();
  const { showSuccess, showError } = useNotification();
  const { openModal, closeModal } = useModal();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const params = {
        q: q || undefined,
        estado: (estado as any) || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        page,
        limit,
      };
      console.log('Filtro', { fechaInicio, fechaFin, params });
      const response = await apiService.getPurchases(params);
      console.log('API response compras', response);
      if (response.success && response.data) {
        setPurchases(response.data.purchases as Purchase[]);
        setTotal(response.data.total || 0);
      } else {
        showError(response.message || 'Error al cargar las compras');
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      showError('Error al cargar las compras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar clientes para poder mostrar nombres de proveedores
    if (!clients || clients.length === 0) {
      loadClients();
    }
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Actualizar datos cuando cambian page o limit
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleNewPurchase = () => {
    openModal(
      <NuevaCompraModal onClose={() => { closeModal(); fetchPurchases(); }} />,
      'Registrar Compra',
      'large'
    );
  };

  const handleEditPurchase = (purchase: Purchase) => {
    openModal(
      <NuevaCompraModal purchase={purchase} onClose={() => { closeModal(); fetchPurchases(); }} />,
      'Editar Compra',
      'large'
    );
  };

  const handleViewPurchase = (purchaseId: string) => {
    openModal(
      <DetalleCompraModal purchaseId={purchaseId} onClose={() => { closeModal(); }} />,
      'Detalle de Compra',
      'large'
    );
  };

  const openChangeStatus = (purchase: Purchase) => {
    openModal(
      <CambiarEstadoModal
        purchaseId={purchase.id}
        currentStatus={purchase.estado}
        onClose={() => { closeModal(); }}
        onUpdated={() => { fetchPurchases(); }}
      />,
      'Cambiar Estado',
      'medium'
    );
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      if (!window.confirm('¿Eliminar esta compra? Esta acción no se puede deshacer.')) return;
      const response = await apiService.deletePurchase(purchaseId);
      if (!response.success) throw new Error(response.message || 'Error al eliminar compra');
      showSuccess('Compra eliminada');
      await fetchPurchases();
    } catch (err) {
      console.error('Error deleting purchase:', err);
      showError('No se pudo eliminar la compra');
    }
  };

  const applyFilters = async () => {
    setPage(1);
    await fetchPurchases();
  };

  const clearFilters = async () => {
    setQ('');
    setEstado('');
    setFechaInicio('');
    setFechaFin('');
    setPage(1);
    await fetchPurchases();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  };

  const getProveedorName = (proveedorId: string) => {
    const prov = getClientById(proveedorId);
    if (!prov) return proveedorId;
    if (prov.tipoDocumento === 'RUC') return prov.razonSocial || proveedorId;
    return `${prov.nombres || ''} ${prov.apellidos || ''}`.trim() || proveedorId;
  };



  const filteredPurchases = useMemo(() => purchases, [purchases]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
  const rangeStart = useMemo(() => (total === 0 ? 0 : (page - 1) * limit + 1), [page, limit, total]);
  const rangeEnd = useMemo(() => Math.min(page * limit, total), [page, limit, total]);

  return (
    <Layout title="Lista de Compras">
      <TableContainer>
        <TableHeader>
          <Title>Órdenes de Compra</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por código o producto"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Recibida">Recibida</option>
              <option value="Cancelada">Cancelada</option>
            </Select>
            <DateInput type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            <DateInput type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            <Select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </Select>
            <PrimaryButton onClick={applyFilters} disabled={isLoading}>{isLoading ? 'Buscando...' : 'Buscar'}</PrimaryButton>
            <FilterButton onClick={clearFilters}>Limpiar</FilterButton>
            <PrimaryButton data-testid="new-purchase" onClick={handleNewPurchase}>Nueva Compra</PrimaryButton>
          </SearchContainer>
        </TableHeader>

        <Table>
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Proveedor</Th>
              <Th>Almacén</Th>
              <Th>Fecha Emisión</Th>
              <Th>Estado</Th>
              <Th>Subtotal</Th>
              <Th>Total</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((p) => (
                <tr key={p.id}>
                  <Td>{p.codigoOrden}</Td>
                  <Td>{getProveedorName(p.proveedorId)}</Td>
                  <Td>{getWarehouseLabel(p.almacenId)}</Td>
                  <Td>{new Date(p.fechaEmision).toLocaleDateString('es-PE')}</Td>
                  <Td><StatusBadge status={p.estado}>{p.estado}</StatusBadge></Td>
                  <Td>{formatCurrency(p.subtotal)}</Td>
                  <Td>{formatCurrency(p.total)}</Td>
                  <Td>
                    <ActionButton data-testid="view-purchase" $color="#2980b9" onClick={() => handleViewPurchase(p.id)}>Ver</ActionButton>
                    <ActionButton data-testid="edit-purchase" $color="#8e44ad" onClick={() => handleEditPurchase(p)}>Editar</ActionButton>
                    <ActionButton data-testid="delete-purchase" $color="#c0392b" onClick={() => handleDeletePurchase(p.id)}>Eliminar</ActionButton>
                    {p.estado === 'Pendiente' && (
                      <ActionButton data-testid="change-status" $color="#27ae60" onClick={() => openChangeStatus(p)}>Cambiar Estado</ActionButton>
                    )}
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No hay órdenes de compra</Td>
              </tr>
            )}
          </tbody>
        </Table>
        <PaginationContainer>
          <PaginationInfo>
            Mostrando {rangeStart}-{rangeEnd} de {total}
          </PaginationInfo>
          <PaginationControls>
            <PageButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              Anterior
            </PageButton>
            <span style={{ color: '#555', fontSize: 12 }}>Página {page} de {totalPages}</span>
            <PageButton onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Siguiente
            </PageButton>
          </PaginationControls>
        </PaginationContainer>
      </TableContainer>
    </Layout>
  );
};

export default ListaCompras;
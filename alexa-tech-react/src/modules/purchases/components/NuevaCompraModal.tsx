import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useClients } from '../../clients/context/ClientContext';
import { useNotification } from '../../../context/NotificationContext';
import { WAREHOUSE_OPTIONS as WAREHOUSE_SELECT_OPTIONS } from '../../../constants/warehouses';
import { apiService } from '../../../utils/api';
import { useProducts, type Product } from '../../products/context/ProductContext';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  label { font-weight: 500; }
  input, select, textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .error { color: #dc3545; font-size: 12px; }
`;

const ErrorBanner = styled.div`
  background: #fdecea;
  border: 1px solid #f5c2c7;
  color: #842029;
  border-radius: 6px;
  padding: 10px 12px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 500;
  ${p => p.$variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  ` : `
    background: #0047b3;
    border-color: #0047b3;
    color: white;
    &:hover { background: #003a92; border-color: #003a92; }
  `}
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 8px; border: 1px solid #eee; vertical-align: top; }
  thead th { background: #f8f9fa; font-weight: 600; }
  input { width: 100%; box-sizing: border-box; }
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 180px;
  overflow-y: auto;
  background: #fff;
`;

const SuggestionItem = styled.li`
  padding: 8px 10px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
  &:hover { background: #f1f3f5; }
  .code { font-weight: 600; color: #0047b3; }
  .name { flex: 1; }
  .stock { font-size: 12px; color: #555; }
  .price { font-size: 12px; color: #333; }
  .badge { font-size: 11px; padding: 2px 6px; border-radius: 10px; background: #eee; color: #666; }
`;

interface ItemForm {
  productoId: string;
  nombreProducto?: string;
  cantidad: string;
  precioUnitario: string;
}

interface ExistingPurchaseItem {
  productoId: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
}
interface ExistingPurchase {
  id: string;
  proveedorId: string;
  almacenId: string;
  fechaEmision: string; // ISO date
  tipoComprobante?: string;
  formaPago?: string;
  observaciones?: string;
  fechaEntregaEstimada?: string; // ISO date
  descuento?: number;
  items: ExistingPurchaseItem[];
}

interface NuevaCompraModalProps {
  onClose: () => void;
  purchase?: ExistingPurchase;
}

const NuevaCompraModal: React.FC<NuevaCompraModalProps> = ({ onClose, purchase }) => {
  const { clients } = useClients();
  const { products, loadProducts } = useProducts();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [bannerErrors, setBannerErrors] = useState<string[]>([]);
  const [failedFields, setFailedFields] = useState<string[]>([]);
  const [proveedorId, setProveedorId] = useState(purchase?.proveedorId || '');
  const [almacenId, setAlmacenId] = useState(purchase?.almacenId || '');
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>(
    WAREHOUSE_SELECT_OPTIONS.map(o => ({ id: o.value, name: o.label }))
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const [fechaEmision, setFechaEmision] = useState(purchase?.fechaEmision?.slice(0,10) || todayIso);
  const [tipoComprobante, setTipoComprobante] = useState(purchase?.tipoComprobante || '');
  const [formaPago, setFormaPago] = useState(purchase?.formaPago || '');
  const [observaciones, setObservaciones] = useState(purchase?.observaciones || '');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState(purchase?.fechaEntregaEstimada?.slice(0,10) || '');
  const [descuento, setDescuento] = useState<string>(purchase?.descuento != null ? String(purchase.descuento) : '0');
  const [items, setItems] = useState<ItemForm[]>(purchase?.items?.length ? purchase.items.map(it => ({
    productoId: it.productoId,
    nombreProducto: it.nombreProducto,
    cantidad: String(it.cantidad),
    precioUnitario: String(it.precioUnitario)
  })) : [{ productoId: '', cantidad: '1', precioUnitario: '0' }]);

  // Cargar almacenes desde la API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        console.log('[NuevaCompraModal] Warehouses full response:', resp);
        console.log('[NuevaCompraModal] Warehouses resp.data:', resp.data);
        
        // La respuesta puede venir de varias formas según el ResponseHelper del backend
        const respData = resp.data as any;
        let list: any[] = [];
        
        if (respData?.data?.rows) {
          list = respData.data.rows;
        } else if (respData?.rows) {
          list = respData.rows;
        } else if (respData?.warehouses) {
          list = respData.warehouses;
        } else if (Array.isArray(respData)) {
          list = respData;
        }
        
        console.log('[NuevaCompraModal] Parsed warehouse list:', list);
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          // Filtrar solo almacenes activos
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ id: w.id, name: w.nombre })));
          console.log('[NuevaCompraModal] Warehouses loaded:', activeWarehouses.length);
        }
      } catch (e) {
        console.error('[NuevaCompraModal] Error loading warehouses:', e);
        console.warn('[NuevaCompraModal] Usando fallback warehouses');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Estados y refs para el buscador/autocomplete de productos
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | undefined>(undefined);
  const debounceTimerRef = React.useRef<number | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Lista de proveedores activos (Proveedor o Ambos)
  const proveedores = useMemo(() => {
    return clients.filter(c => (c.tipoEntidad === 'Proveedor' || c.tipoEntidad === 'Ambos') && c.isActive);
  }, [clients]);

  // Subtotal y total derivados de los items y descuento
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.cantidad) * Number(it.precioUnitario)), 0);
  }, [items]);

  const total = useMemo(() => {
    const d = Number(descuento);
    const t = subtotal - (Number.isFinite(d) ? d : 0);
    return t < 0 ? 0 : t;
  }, [subtotal, descuento]);

  // Build all validation errors for the current form state
  const buildValidationErrors = (): Record<string, string | undefined> => {
    const errs: Record<string, string | undefined> = {};
    if (!proveedorId) errs.proveedorId = 'Proveedor requerido';
    if (!almacenId) errs.almacenId = 'Almacén requerido';
    if (!fechaEmision) errs.fechaEmision = 'Fecha de emisión es requerida';
    // formaPago requerido ahora
    if (!formaPago) errs.formaPago = 'Forma de pago requerida';
    if (!items.length) errs.items = 'Mínimo 1 item requerido';
    items.forEach((it, idx) => {
      if (!it.productoId) errs[`items.${idx}.productoId`] = 'Producto requerido';
      const product = products.find(p => p.productCode === it.productoId);
      if (product && !product.isActive) errs[`items.${idx}.productoId`] = 'Producto descontinuado';
      const c = Number(it.cantidad);
      if (!Number.isFinite(c) || c <= 0) errs[`items.${idx}.cantidad`] = 'Cantidad debe ser > 0';
      const p = Number(it.precioUnitario);
      if (!Number.isFinite(p) || p <= 0) errs[`items.${idx}.precioUnitario`] = 'Precio debe ser > 0';
      // REMOVIDO: Validación incorrecta de stock en compras
      // Las compras AUMENTAN el stock, no lo consumen
    });
    const d = Number(descuento);
    if (!Number.isFinite(d) || d < 0) errs.descuento = 'Descuento debe ser ≥ 0';
    return errs;
  };

  // Validate only a subset of fields (smart retry)
  const validateSpecific = (fields: string[]): boolean => {
    const allErrs = buildValidationErrors();
    const filtered: Record<string, string | undefined> = {};
    fields.forEach(k => { if (allErrs[k]) filtered[k] = allErrs[k]; });
    setErrors(prev => ({ ...prev, ...filtered }));
    const hasErr = Object.keys(filtered).length > 0;
    if (hasErr) {
      Object.entries(filtered).forEach(([campo, error]) => {
        const valor = campo.startsWith('items.') ? (() => {
          const [, idx, field] = campo.split('.');
          const i = Number(idx);
          const f = field as keyof ItemForm;
          return items[i]?.[f];
        })() : (campo === 'proveedorId' ? proveedorId : campo === 'almacenId' ? almacenId : campo === 'fechaEmision' ? fechaEmision : campo === 'fechaEntregaEstimada' ? fechaEntregaEstimada : campo === 'tipoComprobante' ? tipoComprobante : campo === 'formaPago' ? formaPago : campo === 'descuento' ? descuento : undefined);
        console.log('Validación fallida:', { campo, error, valor });
      });
    }
    return !hasErr;
  };

  // Full validation (sets all errors and failedFields)
  const validateFull = (): boolean => {
    const errs = buildValidationErrors();
    setErrors(errs);
    const hasErr = Object.keys(errs).length > 0;
    if (hasErr) {
      setFailedFields(Object.keys(errs));
      Object.entries(errs).forEach(([campo, error]) => {
        const valor = campo.startsWith('items.') ? (() => {
          const [, idx, field] = campo.split('.');
          const i = Number(idx);
          const f = field as keyof ItemForm;
          return items[i]?.[f];
        })() : (campo === 'proveedorId' ? proveedorId : campo === 'almacenId' ? almacenId : campo === 'fechaEmision' ? fechaEmision : campo === 'fechaEntregaEstimada' ? fechaEntregaEstimada : campo === 'tipoComprobante' ? tipoComprobante : campo === 'formaPago' ? formaPago : campo === 'descuento' ? descuento : undefined);
        console.log('Validación fallida:', { campo, error, valor });
      });
    }
    return !hasErr;
  };

  const handleAddItem = () => {
    // En nueva estructura, el agregado se realiza vía autocomplete global
    searchInputRef.current?.focus();
    setIsSuggestOpen(true);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemForm, value: string) => {
    if (field !== 'cantidad') return; // Solo cantidad es editable
    const nextItems = items.map((it, i) => i === index ? { ...it, cantidad: value } : it);
    setItems(nextItems);
    setErrors(prev => {
      const next = { ...prev };
      const c = Number(value);
      if (!Number.isFinite(c) || c <= 0) {
        next[`items.${index}.cantidad`] = 'Cantidad debe ser > 0';
      } else {
        // REMOVIDO: Validación incorrecta de stock en compras
        // Las compras AUMENTAN el stock, no lo consumen
        delete next[`items.${index}.cantidad`];
      }
      return next;
    });
  };

  // Debounce + búsqueda remota
  const triggerRemoteSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSuggestLoading(false);
      setSuggestError(undefined);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSuggestLoading(true);
    setSuggestError(undefined);
    try {
      await loadProducts({ q: query, estado: true, signal: controller.signal });
    } catch (e) {
      // loadProducts maneja AbortError internamente
    } finally {
      setIsSuggestLoading(false);
    }
  }, [loadProducts]);

  useEffect(() => {
    if (!isSuggestOpen) return; // buscar solo si dropdown está abierto
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      triggerRemoteSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, isSuggestOpen, triggerRemoteSearch]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const filteredProductSuggestions = (query: string): Product[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    // Usar resultados remotos del contexto (ya filtrados en backend)
    return products.slice(0, 8);
  };

  // Selección de producto desde autocomplete (no duplicar; incrementa cantidad si existe)
  const selectProduct = (product: Product) => {
    if (!product.isActive) {
      setErrors(prev => ({ ...prev, suggest: 'Producto descontinuado' }));
      setIsSuggestOpen(false);
      return;
    }
    const existingIdx = items.findIndex(it => it.productoId === product.productCode);
    if (existingIdx >= 0) {
      setItems(prev => prev.map((it, i) => i === existingIdx ? {
        ...it,
        cantidad: String(Number(it.cantidad || '0') + 1)
      } : it));
      setSearchQuery('');
      setIsSuggestOpen(false);
      setErrors(prev => { const next = { ...prev }; delete next.suggest; return next; });
      return;
    }
    setItems(prev => [...prev, {
      productoId: product.productCode,
      nombreProducto: product.productName,
      cantidad: '1',
      precioUnitario: String(product.price || 0)
    }]);
    setSearchQuery('');
    setIsSuggestOpen(false);
    setErrors(prev => { const next = { ...prev }; delete next.suggest; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reintento inteligente: primero validar solo campos previamente fallados
    if (failedFields.length > 0) {
      const okPrev = validateSpecific(failedFields);
      if (!okPrev) return;
    }
    // Validación completa si pasó la específica o no había fallos previos
    if (!validateFull()) return;
    try {
      setIsSubmitting(true);
      const payload = {
        proveedorId,
        almacenId,
        fechaEmision,
        tipoComprobante: tipoComprobante || undefined,
        items: items.map(it => ({
          productoId: it.productoId,
          nombreProducto: it.nombreProducto || undefined,
          cantidad: Number(it.cantidad),
          precioUnitario: Number(it.precioUnitario)
        })),
        formaPago: formaPago || undefined,
        observaciones: observaciones || undefined,
        fechaEntregaEstimada: fechaEntregaEstimada || undefined,
        descuento: Number(descuento) || 0,
      };
      console.log('Forma de pago enviada:', formaPago);
      console.log('Datos enviados:', JSON.stringify(payload, null, 2));
      const response = purchase
        ? await apiService.updatePurchase(purchase.id, payload)
        : await apiService.createPurchase(payload);
      if (!response.success) {
        console.log('Respuesta error:', response);
        const raw = (response as any)?.data;
        const backendData = raw && typeof raw === 'object' ? raw : undefined;
        const backendErrors = backendData?.errors || backendData?.fieldErrors;
        const nextErrors: Record<string, string | undefined> = {};
        if (backendErrors && typeof backendErrors === 'object') {
          Object.entries(backendErrors).forEach(([key, val]) => {
            if (typeof val === 'string') nextErrors[key] = val;
            else if (Array.isArray(val)) nextErrors[key] = val[0];
          });
          setErrors(nextErrors);
          setFailedFields(Object.keys(nextErrors));
          const bannerMsgs = Object.values(nextErrors).filter(Boolean) as string[];
          setBannerErrors(bannerMsgs);
        }
        const errorMsg = backendData?.error || backendData?.message || (response as any)?.message || (purchase ? 'Error al actualizar compra' : 'Error al registrar compra');
        console.log('Error específico:', errorMsg);
        showError(errorMsg);
        return;
      }
      showSuccess(purchase ? 'Compra actualizada' : 'Compra registrada');
      onClose();
    } catch (err) {
      const backendData = (err as any)?.response?.data;
      const backendErrors = backendData?.errors || backendData?.fieldErrors;
      const nextErrors: Record<string, string | undefined> = {};
      if (backendErrors && typeof backendErrors === 'object') {
        Object.entries(backendErrors).forEach(([key, val]) => {
          if (typeof val === 'string') nextErrors[key] = val;
          else if (Array.isArray(val)) nextErrors[key] = val[0];
        });
        setErrors(nextErrors);
        setFailedFields(Object.keys(nextErrors));
        const bannerMsgs = Object.values(nextErrors).filter(Boolean) as string[];
        setBannerErrors(bannerMsgs);
      }
      const errorMsg = backendData?.error || backendData?.message || (err as any)?.message || (purchase ? 'Error al actualizar compra' : 'Error al registrar compra');
      console.log('Response error (catch):', backendData || err);
      console.log('Error específico:', errorMsg);
      showError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {bannerErrors.length > 0 && (
        <ErrorBanner data-testid="validation-banner">
          <strong>Errores de validación:</strong>
          <ul style={{ margin: '8px 0 0 16px' }}>
            {bannerErrors.map((msg, i) => (<li key={i}>{msg}</li>))}
          </ul>
        </ErrorBanner>
      )}
      <FormGrid>
        <FormGroup>
          <label htmlFor="proveedorId">Proveedor *</label>
          <select id="proveedorId" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
            <option value="">Selecciona proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.razonSocial || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || p.email}</option>
            ))}
          </select>
          {errors.proveedorId && <span className="error">{errors.proveedorId}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="almacenId">Almacén *</label>
          <select id="almacenId" value={almacenId} onChange={e => setAlmacenId(e.target.value)}>
            <option value="">Selecciona almacén</option>
            {warehouseOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          {errors.almacenId && <span className="error">{errors.almacenId}</span>}
        </FormGroup>

        <FormGroup>
          <label htmlFor="fechaEmision">Fecha de Emisión *</label>
          <input id="fechaEmision" type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
          {errors.fechaEmision && <span className="error">{errors.fechaEmision}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="fechaEntregaEstimada">Fecha de Entrega Estimada</label>
          <input id="fechaEntregaEstimada" type="date" value={fechaEntregaEstimada} onChange={e => setFechaEntregaEstimada(e.target.value)} />
          {errors.fechaEntregaEstimada && <span className="error">{errors.fechaEntregaEstimada}</span>}
        </FormGroup>

        <FormGroup>
          <label htmlFor="tipoComprobante">Tipo de Comprobante</label>
          <select id="tipoComprobante" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="Factura">Factura</option>
            <option value="Boleta">Boleta</option>
          </select>
          {errors.tipoComprobante && <span className="error">{errors.tipoComprobante}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="formaPago">Forma de Pago *</label>
          <select id="formaPago" value={formaPago} onChange={e => setFormaPago(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          {errors.formaPago && <span className="error">{errors.formaPago}</span>}
        </FormGroup>
      </FormGrid>

      <div>
        <h4>Items de Compra</h4>
        {errors.items && <span className="error">{errors.items}</span>}
        
        {/* Buscador global de productos */}
        <FormGroup>
          <label htmlFor="items-global-search">Buscar producto</label>
          <input
            id="items-global-search"
            data-testid="items-global-search"
            ref={searchInputRef}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setIsSuggestOpen(true); setErrors(prev => ({ ...prev, suggest: undefined })); }}
            onFocus={() => setIsSuggestOpen(true)}
            placeholder="Código o nombre"
          />
          {errors.suggest && <span className="error">{errors.suggest}</span>}
          {isSuggestOpen && !!searchQuery && (
            <SuggestionList data-testid="items-global-suggestions">
              {isSuggestLoading && (
                <li data-testid="global-loading" style={{ padding: 8, color: '#555' }}>Cargando...</li>
              )}
              {suggestError && (
                <li data-testid="global-error" style={{ padding: 8, color: '#c0392b' }}>Error cargando productos</li>
              )}
              {!isSuggestLoading && !suggestError && filteredProductSuggestions(searchQuery).map(p => (
                <SuggestionItem
                  key={p.productCode}
                  data-testid={`global-suggestion-${p.productCode}`}
                  onMouseDown={() => p.isActive ? selectProduct(p) : setErrors(prev => ({ ...prev, suggest: 'Producto descontinuado' }))}
                  style={{ cursor: p.isActive ? 'pointer' : 'not-allowed', opacity: p.isActive ? 1 : 0.7 }}
                >
                  <span className="code">{p.productCode}</span>
                  <span className="name">{p.productName}</span>
                  <span className="stock">Stock: {p.currentStock}</span>
                  {p.currentStock === 0 && (<span className="badge" data-testid={`suggestion-${p.productCode}-no-stock`}>Sin stock</span>)}
                  {!p.isActive && (<span className="badge" data-testid={`suggestion-${p.productCode}-inactive`}>Descontinuado</span>)}
                  <span className="price">Precio: {Number(p.price || 0).toFixed(2)}</span>
                </SuggestionItem>
              ))}
              {!isSuggestLoading && !suggestError && filteredProductSuggestions(searchQuery).length === 0 && (
                <li data-testid="global-suggestion-empty" style={{ padding: 8 }}>Sin resultados</li>
              )}
            </SuggestionList>
          )}
        </FormGroup>

        <ItemsTable>
          <thead>
            <tr>
              <th>Producto ID</th>
              <th>Nombre Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ border: (errors[`items.${idx}.productoId`] || errors[`items.${idx}.cantidad`] || errors[`items.${idx}.precioUnitario`]) ? '2px solid #dc3545' : undefined }}>
                <td>
                  <input data-testid={`item-${idx}-productoId`} value={it.productoId} disabled readOnly />
                  {errors[`items.${idx}.productoId`] && <span className="error">{errors[`items.${idx}.productoId`]}</span>}
                </td>
                <td>
                  <input data-testid={`item-${idx}-nombreProducto`} value={it.nombreProducto || ''} disabled readOnly />
                </td>
                <td>
                  <input data-testid={`item-${idx}-cantidad`} type="number" min={1} value={it.cantidad} onChange={e => handleItemChange(idx, 'cantidad', e.target.value)} />
                  {errors[`items.${idx}.cantidad`] && <span className="error" data-testid={`item-${idx}-cantidad-error`}>{errors[`items.${idx}.cantidad`]}</span>}
                </td>
                <td>
                  <input data-testid={`item-${idx}-precioUnitario`} value={Number(it.precioUnitario).toFixed(2)} disabled readOnly />
                  {errors[`items.${idx}.precioUnitario`] && <span className="error" data-testid={`item-${idx}-precio-error`}>{errors[`items.${idx}.precioUnitario`]}</span>}
                </td>
                <td>
                  <input data-testid={`item-${idx}-subtotal`} value={(Number(it.cantidad) * Number(it.precioUnitario)).toFixed(2)} readOnly />
                </td>
                <td>
                  <Button data-testid={`item-${idx}-remove`} type="button" $variant="secondary" onClick={() => handleRemoveItem(idx)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </ItemsTable>
        <Button data-testid="add-item" type="button" $variant="secondary" onClick={handleAddItem}>Agregar Item</Button>
      </div>

      <FormGrid>
        <FormGroup>
          <label>Subtotal</label>
          <input data-testid="totals-subtotal" value={subtotal.toFixed(2)} readOnly />
        </FormGroup>
        <FormGroup>
          <label>Descuento</label>
          <input id="descuento" type="number" min={0} step="0.01" value={descuento} onChange={e => setDescuento(e.target.value)} />
          {errors.descuento && <span className="error">{errors.descuento}</span>}
        </FormGroup>
        <FormGroup>
          <label>Total Final</label>
          <input data-testid="totals-final" value={total.toFixed(2)} readOnly />
        </FormGroup>
      </FormGrid>

      <FormGroup>
        <label htmlFor="observaciones">Observaciones</label>
        <textarea id="observaciones" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
      </FormGroup>

      <Actions>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>{isSubmitting ? (purchase ? 'Actualizando...' : 'Guardando...') : (purchase ? 'Actualizar' : 'Registrar')}</Button>
      </Actions>
    </Form>
  );
};

export default NuevaCompraModal;
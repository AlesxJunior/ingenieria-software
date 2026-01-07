/**
 * BARREL EXPORT: Componentes del Módulo de Compras
 * Facilita la importación de componentes en páginas
 * 
 * Uso:
 * import { PurchaseOrderList, PurchaseOrderForm } from '@/modules/purchases/components';
 */

// Fase 2: Componentes de Órdenes de Compra
export { default as PurchaseOrderList } from './PurchaseOrderList';
export { default as PurchaseOrderForm } from './PurchaseOrderForm';
export { default as PurchaseOrderDetail } from './PurchaseOrderDetail';

// Fase 3: Componentes de Recepciones
export { default as PurchaseReceiptList } from './PurchaseReceiptList';
export { default as PurchaseReceiptForm } from './PurchaseReceiptForm';
export { default as PurchaseReceiptDetail } from './PurchaseReceiptDetail';

// Fase 6: Componentes UI reutilizables
export { StatusBadge, ActionButton, ActionButtonsGroup, SearchFilters } from './common';
// export { default as ActionButtons } from './ActionButtons';
// export { default as SearchFilters } from './SearchFilters';

/**
 * BARREL EXPORT: Servicios del Módulo de Compras
 * Facilita la importación de servicios en componentes
 * 
 * Uso:
 * import { purchaseOrderService, purchaseReceiptService } from '@/modules/purchases/services';
 */

// Servicios principales
export { purchaseOrderService } from './purchaseOrderService';
export { purchaseReceiptService } from './purchaseReceiptService';
export { auxiliaryEntitiesService } from './auxiliaryEntitiesService';

// Clases para testing
export { default as PurchaseOrderService } from './purchaseOrderService';
export { default as PurchaseReceiptService } from './purchaseReceiptService';
export { default as AuxiliaryEntitiesService } from './auxiliaryEntitiesService';

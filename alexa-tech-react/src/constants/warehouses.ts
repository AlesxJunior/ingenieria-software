// ... existing code ...
import type { Warehouse } from '../types/inventario';

export const WAREHOUSES: Warehouse[] = [
  { id: 'WH-PRINCIPAL', label: 'Almacén Principal' },
  { id: 'WH-SECUNDARIO', label: 'Almacén Secundario' },
];

export const getWarehouseLabel = (id: string): string => {
  const warehouse = WAREHOUSES.find(w => w.id === id);
  return warehouse?.label || id;
};

export const WAREHOUSE_OPTIONS = WAREHOUSES.map(warehouse => ({
  value: warehouse.id,
  label: warehouse.label
}));
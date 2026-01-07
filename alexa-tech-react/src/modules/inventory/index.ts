// Módulo de Inventario
export { InventoryProvider } from './context/InventoryContext';
export { useInventario } from './hooks/useInventario';
export * from './services/inventarioApi';
export * from './services/almacenesApi';
export * from './services/movementReasonsApi';
// Páginas
export { default as Kardex } from './pages/Inventario/Kardex';
export { default as ListadoStock } from './pages/Inventario/ListadoStock';
export { default as ListaAlmacenes } from './pages/Inventario/ListaAlmacenes';
export { default as ListaMotivosMovimiento } from './pages/Inventario/ListaMotivosMovimiento';
export { default as TabInventario } from './pages/Inventario/TabInventario';
// Componentes
export { default as TablaKardex } from './components/Inventario/TablaKardex';
export { default as TablaStock } from './components/Inventario/TablaStock';
export { default as FiltersKardex } from './components/Inventario/FiltersKardex';
export { default as FiltersStock } from './components/Inventario/FiltersStock';
export { default as ModalAjuste } from './components/Inventario/ModalAjuste';

// Módulo de Inventario
export { InventoryProvider } from './context/InventoryContext';
export { useInventario } from './hooks/useInventario';
export * from './services/inventarioApi';
export * from './services/almacenesApi';
export * from './services/movementReasonsApi';
// Páginas
export { default as InventarioKardex } from './pages/Inventario/InventarioKardex';
export { default as InventarioMovimientos } from './pages/Inventario/InventarioMovimientos';
export { default as InventarioStock } from './pages/Inventario/InventarioStock';
// Componentes
export { default as KardexTable } from './components/Inventario/KardexTable';
export { default as MovimientosTable } from './components/Inventario/MovimientosTable';
export { default as StockTable } from './components/Inventario/StockTable';

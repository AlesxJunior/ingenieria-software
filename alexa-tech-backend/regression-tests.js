const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURACIÓN DE PRUEBAS DE REGRESIÓN
// ============================================================================

const REGRESSION_CONFIG = {
  // Productos de prueba para verificar funcionalidad
  testProducts: [
    'prod-test-001',
    'prod-test-002', 
    'prod-test-003'
  ],
  
  // Almacenes de prueba
  testWarehouses: [
    'wh-test-001',
    'wh-test-002'
  ],
  
  // Usuario de prueba
  testUserId: 'user-test-001',
  
  // Límites de rendimiento (ms)
  performanceLimits: {
    stockQuery: 1000,
    kardexQuery: 2000,
    stockAdjustment: 500,
    consistencyCheck: 3000
  },
  
  // Configuración de datos de prueba
  testDataConfig: {
    productsCount: 10,
    warehousesCount: 3,
    initialStock: 100,
    adjustmentRange: [-50, 50]
  }
};

// ============================================================================
// UTILIDADES DE PRUEBA
// ============================================================================

class RegressionTestUtils {
  static generateTestId(prefix = 'test') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static async measureExecutionTime(asyncFunction) {
    const start = Date.now();
    const result = await asyncFunction();
    const duration = Date.now() - start;
    return { result, duration };
  }
  
  static logResult(testName, status, details = {}) {
    const timestamp = new Date().toISOString();
    const result = {
      timestamp,
      test: testName,
      status,
      details
    };
    
    console.log(`[${status.toUpperCase()}] ${testName}:`, details);
    return result;
  }
  
  static async cleanupTestData() {
    try {
      // Limpiar movimientos de inventario de prueba
      await prisma.inventoryMovement.deleteMany({
        where: {
          OR: [
            { productId: { startsWith: 'test-' } },
            { warehouseId: { startsWith: 'test-' } },
            { userId: { startsWith: 'test-' } }
          ]
        }
      });
      
      // Limpiar stock de prueba
      await prisma.stockByWarehouse.deleteMany({
        where: {
          OR: [
            { productId: { startsWith: 'test-' } },
            { warehouseId: { startsWith: 'test-' } }
          ]
        }
      });
      
      // Limpiar productos de prueba
      await prisma.product.deleteMany({
        where: { id: { startsWith: 'test-' } }
      });
      
      // Limpiar almacenes de prueba
      await prisma.warehouse.deleteMany({
        where: { id: { startsWith: 'test-' } }
      });
      
      // Limpiar usuarios de prueba
      await prisma.user.deleteMany({
        where: { id: { startsWith: 'test-' } }
      });
      
      console.log('✓ Test data cleanup completed');
    } catch (error) {
      console.error('✗ Test data cleanup failed:', error.message);
    }
  }
}

// ============================================================================
// PRUEBAS DE REGRESIÓN PRINCIPALES
// ============================================================================

class InventoryRegressionTests {
  constructor() {
    this.results = [];
    this.testData = {
      products: [],
      warehouses: [],
      users: [],
      stockRecords: []
    };
  }
  
  // ==========================================================================
  // SETUP Y TEARDOWN
  // ==========================================================================
  
  async setupTestData() {
    try {
      console.log('Setting up test data...');
      
      // Crear usuarios de prueba
      const userId = RegressionTestUtils.generateTestId('user');
      const testUser = await prisma.user.create({
        data: {
          id: userId,
          username: `regression-test-user-${userId}`,
          email: `test-${userId}@regression.com`,
          password: 'test-password',
          firstName: 'Test',
          lastName: 'User',
          isActive: true
        }
      });
      this.testData.users.push(testUser);
      
      // Crear almacenes de prueba
      for (let i = 0; i < REGRESSION_CONFIG.testDataConfig.warehousesCount; i++) {
        const warehouseId = RegressionTestUtils.generateTestId('wh');
        const warehouse = await prisma.warehouse.create({
          data: {
            id: warehouseId,
            codigo: `WH-TEST-${warehouseId}`,
            nombre: `Almacén Test ${i + 1}`,
            activo: true
          }
        });
        this.testData.warehouses.push(warehouse);
      }
      
      // Crear productos de prueba
      for (let i = 0; i < REGRESSION_CONFIG.testDataConfig.productsCount; i++) {
        const productId = RegressionTestUtils.generateTestId('prod');
        const product = await prisma.product.create({
          data: {
            id: productId,
            codigo: `PROD-TEST-${productId}`,
            nombre: `Producto Test ${i + 1}`,
            descripcion: `Descripción del producto test ${i + 1}`,
            categoria: 'Test Category',
            precioVenta: 100.00,
            minStock: 10,
            stock: REGRESSION_CONFIG.testDataConfig.initialStock,
            trackInventory: true,
            estado: true,
            unidadMedida: 'UND'
          }
        });
        this.testData.products.push(product);
        
        // Crear stock inicial en cada almacén
        for (const warehouse of this.testData.warehouses) {
          const stockRecord = await prisma.stockByWarehouse.create({
            data: {
              productId: product.id,
              warehouseId: warehouse.id,
              quantity: Math.floor(REGRESSION_CONFIG.testDataConfig.initialStock / this.testData.warehouses.length),
              minStock: 10
            }
          });
          this.testData.stockRecords.push(stockRecord);
        }
      }
      
      console.log(`✓ Test data created: ${this.testData.products.length} products, ${this.testData.warehouses.length} warehouses`);
      return true;
    } catch (error) {
      console.error('✗ Test data setup failed:', error.message);
      return false;
    }
  }
  
  async teardownTestData() {
    try {
      await RegressionTestUtils.cleanupTestData();
      return true;
    } catch (error) {
      console.error('✗ Test data teardown failed:', error.message);
      return false;
    }
  }
  
  // ==========================================================================
  // PRUEBAS DE FUNCIONALIDAD BÁSICA
  // ==========================================================================
  
  async testBasicStockQueries() {
    try {
      const { result: stockData, duration } = await RegressionTestUtils.measureExecutionTime(async () => {
        return await prisma.stockByWarehouse.findMany({
          where: { productId: { startsWith: 'test-' } },
          include: { product: true, warehouse: true },
          take: 20
        });
      });
      
      const passed = stockData.length > 0 && duration < REGRESSION_CONFIG.performanceLimits.stockQuery;
      
      this.results.push(RegressionTestUtils.logResult(
        'Basic Stock Queries',
        passed ? 'PASS' : 'FAIL',
        { recordsFound: stockData.length, duration, limit: REGRESSION_CONFIG.performanceLimits.stockQuery }
      ));
      
      return passed;
    } catch (error) {
      this.results.push(RegressionTestUtils.logResult(
        'Basic Stock Queries',
        'ERROR',
        { error: error.message }
      ));
      return false;
    }
  }
  
  async testBasicKardexQueries() {
    try {
      const { result: kardexData, duration } = await RegressionTestUtils.measureExecutionTime(async () => {
        return await prisma.inventoryMovement.findMany({
          where: { productId: { startsWith: 'test-' } },
          include: { product: true, warehouse: true, user: true },
          take: 20,
          orderBy: { createdAt: 'desc' }
        });
      });
      
      const passed = duration < REGRESSION_CONFIG.performanceLimits.kardexQuery;
      
      this.results.push(RegressionTestUtils.logResult(
        'Basic Kardex Queries',
        passed ? 'PASS' : 'FAIL',
        { recordsFound: kardexData.length, duration, limit: REGRESSION_CONFIG.performanceLimits.kardexQuery }
      ));
      
      return passed;
    } catch (error) {
      this.results.push(RegressionTestUtils.logResult(
        'Basic Kardex Queries',
        'ERROR',
        { error: error.message }
      ));
      return false;
    }
  }
  
  // ==========================================================================
  // PRUEBAS DE AJUSTES DE STOCK
  // ==========================================================================
  
  async testStockAdjustments() {
    try {
      const testProduct = this.testData.products[0];
      const testWarehouse = this.testData.warehouses[0];
      const testUser = this.testData.users[0];
      
      // Obtener stock inicial
      const initialStock = await prisma.stockByWarehouse.findUnique({
        where: { productId_warehouseId: { productId: testProduct.id, warehouseId: testWarehouse.id } }
      });
      
      const adjustmentAmount = 15;
      const expectedFinalStock = (initialStock?.quantity || 0) + adjustmentAmount;
      
      // Realizar ajuste
      const { duration } = await RegressionTestUtils.measureExecutionTime(async () => {
        return await prisma.$transaction(async (tx) => {
          // Actualizar stock
          const updatedStock = await tx.stockByWarehouse.upsert({
            where: { productId_warehouseId: { productId: testProduct.id, warehouseId: testWarehouse.id } },
            update: { quantity: expectedFinalStock, updatedAt: new Date() },
            create: {
              productId: testProduct.id,
              warehouseId: testWarehouse.id,
              quantity: expectedFinalStock,
              minStock: 10
            }
          });
          
          // Crear movimiento
          await tx.inventoryMovement.create({
            data: {
              productId: testProduct.id,
              warehouseId: testWarehouse.id,
              type: 'AJUSTE',
              quantity: adjustmentAmount, // Usar delta correcto
              stockBefore: initialStock?.quantity || 0,
              stockAfter: expectedFinalStock,
              reason: 'ErrorConteo',
              userId: testUser.id,
              documentRef: null
            }
          });
          
          // Actualizar stock global
          const totalStock = await tx.stockByWarehouse.aggregate({
            where: { productId: testProduct.id },
            _sum: { quantity: true }
          });
          
          await tx.product.update({
            where: { id: testProduct.id },
            data: { stock: totalStock._sum.quantity || 0, updatedAt: new Date() }
          });
          
          return updatedStock;
        });
      });
      
      // Verificar resultado
      const finalStock = await prisma.stockByWarehouse.findUnique({
        where: { productId_warehouseId: { productId: testProduct.id, warehouseId: testWarehouse.id } }
      });
      
      const passed = finalStock?.quantity === expectedFinalStock && 
                    duration < REGRESSION_CONFIG.performanceLimits.stockAdjustment;
      
      this.results.push(RegressionTestUtils.logResult(
        'Stock Adjustments',
        passed ? 'PASS' : 'FAIL',
        { 
          initialStock: initialStock?.quantity || 0,
          adjustment: adjustmentAmount,
          expectedFinal: expectedFinalStock,
          actualFinal: finalStock?.quantity,
          duration,
          limit: REGRESSION_CONFIG.performanceLimits.stockAdjustment
        }
      ));
      
      return passed;
    } catch (error) {
      this.results.push(RegressionTestUtils.logResult(
        'Stock Adjustments',
        'ERROR',
        { error: error.message }
      ));
      return false;
    }
  }
  
  // ==========================================================================
  // PRUEBAS DE CONSISTENCIA DE DATOS
  // ==========================================================================
  
  async testDataConsistency() {
    try {
      const { result: consistencyIssues, duration } = await RegressionTestUtils.measureExecutionTime(async () => {
        const issues = [];
        
        // Verificar consistencia de stock global vs stock por almacén
        const products = await prisma.product.findMany({
          where: { id: { startsWith: 'test-' } },
          include: { stockByWarehouses: true }
        });
        
        for (const product of products) {
          const calculatedStock = product.stockByWarehouses.reduce((sum, stock) => sum + stock.quantity, 0);
          if (product.stock !== calculatedStock) {
            issues.push({
              type: 'STOCK_MISMATCH',
              productId: product.id,
              globalStock: product.stock,
              calculatedStock
            });
          }
        }
        
        // Verificar que no hay stocks negativos
        const negativeStocks = await prisma.stockByWarehouse.findMany({
          where: {
            productId: { startsWith: 'test-' },
            quantity: { lt: 0 }
          }
        });
        
        for (const negativeStock of negativeStocks) {
          issues.push({
            type: 'NEGATIVE_STOCK',
            productId: negativeStock.productId,
            warehouseId: negativeStock.warehouseId,
            quantity: negativeStock.quantity
          });
        }
        
        // Verificar integridad de movimientos
        const movements = await prisma.inventoryMovement.findMany({
          where: { productId: { startsWith: 'test-' } },
          orderBy: { createdAt: 'asc' }
        });
        
        const stockByProductWarehouse = new Map();
        
        for (const movement of movements) {
          const key = `${movement.productId}-${movement.warehouseId}`;
          const currentStock = stockByProductWarehouse.get(key) || 0;
          
          if (movement.stockBefore !== currentStock) {
            issues.push({
              type: 'MOVEMENT_INCONSISTENCY',
              movementId: movement.id,
              expectedStockBefore: currentStock,
              actualStockBefore: movement.stockBefore
            });
          }
          
          const expectedStockAfter = movement.stockBefore + movement.quantity;
          if (movement.stockAfter !== expectedStockAfter) {
            issues.push({
              type: 'CALCULATION_ERROR',
              movementId: movement.id,
              expectedStockAfter,
              actualStockAfter: movement.stockAfter
            });
          }
          
          stockByProductWarehouse.set(key, movement.stockAfter);
        }
        
        return issues;
      });
      
      const passed = consistencyIssues.length === 0 && 
                    duration < REGRESSION_CONFIG.performanceLimits.consistencyCheck;
      
      this.results.push(RegressionTestUtils.logResult(
        'Data Consistency',
        passed ? 'PASS' : 'FAIL',
        { 
          issuesFound: consistencyIssues.length,
          issues: consistencyIssues.slice(0, 5), // Mostrar solo los primeros 5
          duration,
          limit: REGRESSION_CONFIG.performanceLimits.consistencyCheck
        }
      ));
      
      return passed;
    } catch (error) {
      this.results.push(RegressionTestUtils.logResult(
        'Data Consistency',
        'ERROR',
        { error: error.message }
      ));
      return false;
    }
  }
  
  // ==========================================================================
  // PRUEBAS DE RENDIMIENTO
  // ==========================================================================
  
  async testPerformance() {
    try {
      const performanceResults = {};
      
      // Prueba de consulta de stock con filtros
      const { duration: stockQueryTime } = await RegressionTestUtils.measureExecutionTime(async () => {
        return await prisma.stockByWarehouse.findMany({
          where: {
            productId: { startsWith: 'test-' },
            quantity: { gte: 10 }
          },
          include: { product: true, warehouse: true },
          take: 50
        });
      });
      performanceResults.stockQuery = stockQueryTime;
      
      // Prueba de consulta de kardex con filtros
      const { duration: kardexQueryTime } = await RegressionTestUtils.measureExecutionTime(async () => {
        return await prisma.inventoryMovement.findMany({
          where: {
            productId: { startsWith: 'test-' },
            type: 'AJUSTE',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          },
          include: { product: true, warehouse: true, user: true },
          take: 50,
          orderBy: { createdAt: 'desc' }
        });
      });
      performanceResults.kardexQuery = kardexQueryTime;
      
      // Prueba de múltiples ajustes concurrentes
      const concurrentAdjustments = 5;
      const { duration: concurrentTime } = await RegressionTestUtils.measureExecutionTime(async () => {
        const promises = [];
        for (let i = 0; i < concurrentAdjustments; i++) {
          const product = this.testData.products[i % this.testData.products.length];
          const warehouse = this.testData.warehouses[i % this.testData.warehouses.length];
          const user = this.testData.users[0];
          
          promises.push(
            prisma.$transaction(async (tx) => {
              const currentStock = await tx.stockByWarehouse.findUnique({
                where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } }
              });
              
              const adjustment = (i % 2 === 0) ? 5 : -3;
              const newQuantity = (currentStock?.quantity || 0) + adjustment;
              
              if (newQuantity >= 0) {
                await tx.stockByWarehouse.upsert({
                  where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
                  update: { quantity: newQuantity },
                  create: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                    quantity: newQuantity,
                    minStock: 10
                  }
                });
                
                await tx.inventoryMovement.create({
                  data: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                    type: 'AJUSTE',
                    quantity: adjustment,
                    stockBefore: currentStock?.quantity || 0,
                    stockAfter: newQuantity,
                    reason: 'ErrorConteo',
                    userId: user.id
                  }
                });
              }
            })
          );
        }
        
        return await Promise.all(promises);
      });
      performanceResults.concurrentAdjustments = concurrentTime;
      
      const allWithinLimits = 
        performanceResults.stockQuery < REGRESSION_CONFIG.performanceLimits.stockQuery &&
        performanceResults.kardexQuery < REGRESSION_CONFIG.performanceLimits.kardexQuery &&
        performanceResults.concurrentAdjustments < (REGRESSION_CONFIG.performanceLimits.stockAdjustment * concurrentAdjustments);
      
      this.results.push(RegressionTestUtils.logResult(
        'Performance Tests',
        allWithinLimits ? 'PASS' : 'FAIL',
        { 
          results: performanceResults,
          limits: REGRESSION_CONFIG.performanceLimits,
          concurrentOperations: concurrentAdjustments
        }
      ));
      
      return allWithinLimits;
    } catch (error) {
      this.results.push(RegressionTestUtils.logResult(
        'Performance Tests',
        'ERROR',
        { error: error.message }
      ));
      return false;
    }
  }
  
  // ==========================================================================
  // EJECUCIÓN PRINCIPAL
  // ==========================================================================
  
  async runAllTests() {
    console.log('🚀 Starting Inventory Module Regression Tests...\n');
    
    const startTime = Date.now();
    let passedTests = 0;
    let totalTests = 0;
    
    try {
      // Setup
      const setupSuccess = await this.setupTestData();
      if (!setupSuccess) {
        throw new Error('Failed to setup test data');
      }
      
      // Ejecutar pruebas
      const tests = [
        () => this.testBasicStockQueries(),
        () => this.testBasicKardexQueries(),
        () => this.testStockAdjustments(),
        () => this.testDataConsistency(),
        () => this.testPerformance()
      ];
      
      for (const test of tests) {
        totalTests++;
        const passed = await test();
        if (passed) passedTests++;
      }
      
    } catch (error) {
      console.error('❌ Regression tests failed:', error.message);
    } finally {
      // Cleanup
      await this.teardownTestData();
    }
    
    const duration = Date.now() - startTime;
    
    // Generar reporte final
    console.log('\n' + '='.repeat(60));
    console.log('📊 REGRESSION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${duration}ms`);
    console.log('='.repeat(60));
    
    // Guardar reporte detallado
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: (passedTests / totalTests) * 100,
        duration,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      config: REGRESSION_CONFIG
    };
    
    const reportPath = path.join(__dirname, 'regression-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    return passedTests === totalTests;
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

async function main() {
  const regressionTests = new InventoryRegressionTests();
  
  try {
    const allPassed = await regressionTests.runAllTests();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Regression test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { InventoryRegressionTests, RegressionTestUtils };
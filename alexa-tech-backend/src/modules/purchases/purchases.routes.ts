import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { PurchasesService } from './purchases.service';
import { PurchaseReceiptsService } from './purchase-receipts.service';

const router = Router();

// Inicializar servicios
const purchasesService = new PurchasesService();
const purchaseReceiptsService = new PurchaseReceiptsService();

// Todas las rutas requieren autenticación
router.use(authenticate);

// ==========================================
// RUTAS: ÓRDENES DE COMPRA (Purchase Orders)
// ==========================================

// Estadísticas (ANTES de /:id para evitar conflicto)
router.get(
  '/ordenes/estadisticas',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      const stats = await purchasesService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Crear orden de compra
router.post(
  '/ordenes',
  requirePermission('purchases.create'),
  async (req: any, res: Response) => {  // ✅ Cambiar Request a any para acceder a user
    try {
      // ✅ Agregar el userId del usuario autenticado
      const orderData = {
        ...req.body,
        creadoPorId: req.user?.userId || req.user?.id,  // Usuario autenticado
      };
      
      const order = await purchasesService.create(orderData);
      res.status(201).json({ success: true, data: order, message: 'Orden de compra creada exitosamente' });
    } catch (error: any) {
      console.error('❌ Error creando orden de compra:', error);  // ✅ Log de error
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Listar órdenes de compra con filtros
router.get(
  '/ordenes',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.estado) filters.estado = req.query.estado;
      if (req.query.proveedorId) filters.proveedorId = req.query.proveedorId as string;
      if (req.query.fechaInicio) filters.fechaDesde = new Date(req.query.fechaInicio as string);
      if (req.query.fechaFin) filters.fechaHasta = new Date(req.query.fechaFin as string);
      
      // ✅ Agregar paginación
      if (req.query.page) filters.page = parseInt(req.query.page as string, 10);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string, 10);
      
      const result = await purchasesService.findAll(filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Obtener orden por ID
router.get(
  '/ordenes/:id',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const order = await purchasesService.findOne(req.params.id);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Generar PDF de orden de compra
router.get(
  '/ordenes/:id/pdf',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const pdfBuffer = await purchasesService.generatePDF(req.params.id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=orden-compra-${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Actualizar orden de compra
router.put(
  '/ordenes/:id',
  requirePermission('purchases.update'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const order = await purchasesService.update(req.params.id, req.body);
      res.json({ success: true, data: order, message: 'Orden de compra actualizada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Cambiar estado
router.patch(
  '/ordenes/:id/estado',
  requirePermission('purchases.update'),
  async (req: any, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const { estado, observaciones } = req.body;
      
      console.log(`[PATCH /ordenes/:id/estado] ID: ${req.params.id}, Estado: ${estado}, Observaciones: ${observaciones}`);
      
      const order = await purchasesService.updateStatus(req.params.id, estado, observaciones);
      res.json({ success: true, data: order, message: `Orden de compra ${estado} exitosamente` });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Eliminar orden de compra (cancelar)
router.delete(
  '/ordenes/:id',
  requirePermission('purchases.delete'),
  async (req: any, res: Response) => {
    try {
      console.log(`🗑️ [DELETE Route] Orden ID: ${req.params.id}`);
      if (!req.params.id) throw new Error('ID requerido');
      
      console.log(`🗑️ [DELETE Route] Buscando orden...`);
      // Obtener orden para validar
      const orden = await purchasesService.findOne(req.params.id);
      console.log(`🗑️ [DELETE Route] Orden encontrada: ${orden.codigo}, Estado: ${orden.estado}`);
      
      // Validar que se puede cancelar
      const estadosPermitidos = ['PENDIENTE', 'ENVIADA'];
      if (!estadosPermitidos.includes(orden.estado)) {
        throw new Error(`No se puede cancelar una orden en estado ${orden.estado}. Solo se pueden cancelar órdenes en estado PENDIENTE o ENVIADA.`);
      }
      
      const motivo = req.body?.motivo || 'Cancelada por usuario';
      console.log(`🗑️ [DELETE Route] Motivo: ${motivo}`);
      
      // Cambiar estado a CANCELADA
      await purchasesService.updateStatus(req.params.id, 'CANCELADA', motivo);
      console.log(`✅ [DELETE Route] Estado cambiado a CANCELADA`);
      
      res.json({ 
        success: true, 
        message: 'Orden de compra cancelada exitosamente',
        data: { estado: 'CANCELADA' }
      });
    } catch (error: any) {
      console.error(`❌ [DELETE Route] Error:`, {
        message: error?.message,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
      });
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// ==========================================
// RUTAS: RECEPCIONES DE COMPRA
// ==========================================

router.post(
  '/recepciones',
  requirePermission('purchases.create'),
  async (req: Request, res: Response) => {
    try {
      const receipt = await purchaseReceiptsService.create(req.body);
      res.status(201).json({ success: true, data: receipt, message: 'Recepción creada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

router.get(
  '/recepciones',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.estado) filters.estado = req.query.estado;
      if (req.query.ordenCompraId) filters.ordenCompraId = req.query.ordenCompraId as string;
      if (req.query.fechaInicio) filters.fechaDesde = new Date(req.query.fechaInicio as string);
      if (req.query.fechaFin) filters.fechaHasta = new Date(req.query.fechaFin as string);
      
      // ✅ Agregar paginación
      if (req.query.page) filters.page = parseInt(req.query.page as string, 10);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string, 10);
      
      const result = await purchaseReceiptsService.findAll(filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Generar PDF de recepción (ANTES de /:id para evitar conflicto)
router.get(
  '/recepciones/:id/pdf',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const pdfBuffer = await purchaseReceiptsService.generatePDF(req.params.id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=recepcion-${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

router.get(
  '/recepciones/:id',
  requirePermission('purchases.read'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const receipt = await purchaseReceiptsService.findOne(req.params.id);
      res.json({ success: true, data: receipt });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  '/recepciones/:id/confirmar',
  requirePermission('purchases.update'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const confirmData = req.body.items ? req.body : { items: [] };
      const receipt = await purchaseReceiptsService.confirm(req.params.id, confirmData);
      res.json({ success: true, data: receipt, message: 'Recepción confirmada. Inventario actualizado.' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  '/recepciones/:id/anular',
  requirePermission('purchases.delete'),
  async (req: Request, res: Response) => {
    try {
      if (!req.params.id) throw new Error('ID requerido');
      const receipt = await purchaseReceiptsService.cancel(req.params.id);
      res.json({ success: true, data: receipt, message: 'Recepción anulada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

export const purchasesRoutes = router;

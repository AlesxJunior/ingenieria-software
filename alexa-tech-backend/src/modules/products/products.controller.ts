import { Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import {
  validateProductCreate,
  validateProductUpdate,
  validateProductStatusUpdate,
  validateProductQueryFilters,
} from '../../utils/validation';
import { productService } from './products.service';
import { AuthenticatedRequest } from '../../types';


export const ProductController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      // Permisos verificados a nivel de ruta mediante middleware

      const result = validateProductCreate(req.body);
      if (!result.isValid) {
        return ResponseHelper.validationError(res, result.errors);
      }

      const userId = req.user?.userId;
      const product = await productService.create(
        {
          codigo: req.body.codigo,
          nombre: req.body.nombre,
          descripcion: req.body.descripcion,
          categoria: req.body.categoria,
          precioVenta: Number(req.body.precioVenta),
          estado: req.body.estado ?? true,
          unidadMedida: req.body.unidadMedida,
          minStock: req.body.minStock !== undefined ? Number(req.body.minStock) : undefined,
          stockInitial: req.body.stockInitial
            ? {
                warehouseId: req.body.stockInitial.warehouseId,
                cantidad: Number(req.body.stockInitial.cantidad ?? 0),
              }
            : undefined,
        },
        userId,
      );

      return ResponseHelper.created(res, product, 'Producto creado');
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return ResponseHelper.conflict(res, 'Código de producto ya existe');
      }
      return ResponseHelper.error(
        res,
        'Error al crear producto',
        500,
        error?.message || String(error),
      );
    }
  },

  async getByCodigo(req: AuthenticatedRequest, res: Response) {
    try {
      // Permisos verificados a nivel de ruta mediante middleware

      const codigo = req.params?.codigo as string;
      const product = await productService.findByCodigo(codigo);
      if (!product) {
        return ResponseHelper.notFound(res, 'Producto no encontrado');
      }

      return ResponseHelper.success(res, product, 'Producto encontrado');
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al obtener producto',
        500,
        error?.message || String(error),
      );
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const result = validateProductQueryFilters(req.query);
      if (!result.isValid) {
        return ResponseHelper.validationError(res, result.errors);
      }

      const {
        categoria,
        estado,
        unidadMedida,
        q,
        minPrecio,
        maxPrecio,
        minStock,
        maxStock,
        page,
        limit,
      } = req.query;

      const filters = {
        categoria: categoria !== undefined ? String(categoria) : undefined,
        estado:
          estado !== undefined
            ? typeof estado === 'string'
              ? estado.toLowerCase() === 'true'
              : Boolean(estado)
            : undefined,
        unidadMedida:
          unidadMedida !== undefined ? String(unidadMedida) : undefined,
        q: q !== undefined ? String(q) : undefined,
        minPrecio: minPrecio !== undefined ? Number(minPrecio) : undefined,
        maxPrecio: maxPrecio !== undefined ? Number(maxPrecio) : undefined,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        maxStock: maxStock !== undefined ? Number(maxStock) : undefined,
      };

      // Paginación
      const currentPage = page !== undefined ? Math.max(1, Number(page)) : 1;
      const pageSize = limit !== undefined ? Math.max(1, Math.min(100, Number(limit))) : 50;
      const offset = (currentPage - 1) * pageSize;

      const { products, total } = await productService.listPaginated(filters, {
        limit: pageSize,
        offset,
      });

      return ResponseHelper.success(
        res,
        {
          products,
          pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            pages: Math.ceil(total / pageSize),
          },
          filters,
        },
        'Productos obtenidos correctamente',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al obtener productos',
        500,
        error?.message || String(error),
      );
    }
  },

  async updateByCodigo(req: AuthenticatedRequest, res: Response) {
    try {
      // Permisos verificados a nivel de ruta mediante middleware

      const result = validateProductUpdate(req.body);
      if (!result.isValid) {
        return ResponseHelper.validationError(res, result.errors);
      }

      const codigo = req.params?.codigo as string;
      const userId = req.user?.userId;
      const product = await productService.updateByCodigo(
        codigo,
        {
          nombre: req.body.nombre,
          descripcion: req.body.descripcion,
          categoria: req.body.categoria,
          precioVenta:
            req.body.precioVenta !== undefined
              ? Number(req.body.precioVenta)
              : undefined,
          estado: req.body.estado,
          unidadMedida: req.body.unidadMedida,
          minStock: req.body.minStock !== undefined ? Number(req.body.minStock) : undefined,
        },
        userId,
      );

      return ResponseHelper.success(res, product, 'Producto actualizado');
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return ResponseHelper.notFound(
          res,
          'Producto no encontrado para actualización',
        );
      }
      return ResponseHelper.error(
        res,
        'Error al actualizar producto',
        500,
        error?.message || String(error),
      );
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      // Permisos verificados a nivel de ruta mediante middleware

      const result = validateProductStatusUpdate(req.body);
      if (!result.isValid) {
        return ResponseHelper.validationError(res, result.errors);
      }

      const codigo = req.params?.codigo as string;
      const userId = req.user?.userId;
      const product = await productService.updateStatusByCodigo(
        codigo,
        Boolean(req.body.estado),
        userId,
      );
      return ResponseHelper.success(
        res,
        product,
        'Estado de producto actualizado',
      );
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return ResponseHelper.notFound(
          res,
          'Producto no encontrado para cambio de estado',
        );
      }
      return ResponseHelper.error(
        res,
        'Error al cambiar estado del producto',
        500,
        error?.message || String(error),
      );
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      // Permisos verificados a nivel de ruta mediante middleware

      const codigo = req.params?.codigo as string;
      const userId = req.user?.userId;
      
      // Soft delete: marcar como inactivo (estado = false)
      const product = await productService.deleteByCodigo(codigo, userId);
      
      return ResponseHelper.success(
        res,
        product,
        'Producto eliminado exitosamente',
      );
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return ResponseHelper.notFound(
          res,
          'Producto no encontrado para eliminación',
        );
      }
      return ResponseHelper.error(
        res,
        'Error al eliminar producto',
        500,
        error?.message || String(error),
      );
    }
  },
};

export default ProductController;

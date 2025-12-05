import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PurchasesService } from '../purchases.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
  FilterPurchaseOrderDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('purchases/ordenes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * POST /purchases/ordenes
   * Crear nueva orden de compra
   * Requiere: ADMIN, COMPRAS_GESTOR, GERENCIA
   * 
   * NOTA: Este controller NestJS NO SE USA.
   * El sistema usa Express routes (purchases.routes.ts)
   * Este código se mantiene solo como referencia.
   */
  @Post()
  @Roles('ADMIN', 'COMPRAS_GESTOR', 'GERENCIA')
  async create(@Body() createDto: any, @Req() req: any) {
    try {
      // Asegurar que solicitadoPorId esté presente
      if (!createDto.solicitadoPorId && req.user?.userId) {
        createDto.solicitadoPorId = req.user.userId;
      }

      // @ts-ignore - Controller NestJS no usado, se usa Express routes
      return await this.purchasesService.create(createDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al crear orden de compra',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /purchases/ordenes
   * Listar órdenes de compra con filtros y paginación
   * Requiere: ADMIN, COMPRAS_GESTOR, COMPRAS_CONSULTA, GERENCIA, ALMACEN_GESTOR
   */
  @Get()
  @Roles(
    'ADMIN',
    'COMPRAS_GESTOR',
    'COMPRAS_CONSULTA',
    'GERENCIA',
    'ALMACEN_GESTOR',
  )
  async findAll(@Query() filterDto: FilterPurchaseOrderDto) {
    try {
      return await this.purchasesService.findAll(filterDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al listar órdenes de compra',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /purchases/ordenes/statistics
   * Obtener estadísticas de órdenes de compra
   * Requiere: ADMIN, COMPRAS_GESTOR, GERENCIA
   */
  @Get('statistics')
  @Roles('ADMIN', 'COMPRAS_GESTOR', 'GERENCIA')
  async getStatistics() {
    try {
      return await this.purchasesService.getStatistics();
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /purchases/ordenes/:id
   * Obtener detalle de una orden de compra
   * Requiere: ADMIN, COMPRAS_GESTOR, COMPRAS_CONSULTA, GERENCIA, ALMACEN_GESTOR
   */
  @Get(':id')
  @Roles(
    'ADMIN',
    'COMPRAS_GESTOR',
    'COMPRAS_CONSULTA',
    'GERENCIA',
    'ALMACEN_GESTOR',
  )
  async findOne(@Param('id') id: string) {
    try {
      const orden = await this.purchasesService.findOne(id);

      if (!orden) {
        throw new HttpException(
          'Orden de compra no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return orden;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al obtener orden de compra',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PATCH /purchases/ordenes/:id
   * Actualizar orden de compra (solo en estado PENDIENTE)
   * Requiere: ADMIN, COMPRAS_GESTOR, GERENCIA
   */
  @Patch(':id')
  @Roles('ADMIN', 'COMPRAS_GESTOR', 'GERENCIA')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ) {
    try {
      return await this.purchasesService.update(id, updateDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al actualizar orden de compra',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * PATCH /purchases/ordenes/:id/estado
   * Cambiar estado de la orden de compra
   * Requiere: ADMIN, COMPRAS_GESTOR, GERENCIA
   */
  @Patch(':id/estado')
  @Roles('ADMIN', 'COMPRAS_GESTOR', 'GERENCIA')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdatePurchaseOrderStatusDto,
    @Req() req: any,
  ) {
    try {
      // Usar el userId del token o el enviado en el DTO
      const userId = statusDto.userId || req.user.userId;

      return await this.purchasesService.updateStatus(
        id,
        statusDto.estado,
        userId,
      );
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al cambiar estado de orden',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * DELETE /purchases/ordenes/:id
   * Eliminar/Anular orden de compra (solo en estado PENDIENTE)
   * Requiere: ADMIN, GERENCIA
   */
  @Delete(':id')
  @Roles('ADMIN', 'GERENCIA')
  async remove(@Param('id') id: string) {
    try {
      await this.purchasesService.delete(id);

      return {
        message: 'Orden de compra eliminada correctamente',
        statusCode: HttpStatus.OK,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al eliminar orden de compra',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

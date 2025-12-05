import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchaseReceiptsService } from '../purchase-receipts.service';
import {
  CreatePurchaseReceiptDto,
  ConfirmReceiptDto,
  FilterPurchaseReceiptDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('purchases/recepciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseReceiptsController {
  constructor(
    private readonly purchaseReceiptsService: PurchaseReceiptsService,
  ) {}

  /**
   * POST /purchases/recepciones
   * Crear nueva recepción de compra
   * Requiere: ADMIN, ALMACEN_GESTOR, COMPRAS_GESTOR
   */
  @Post()
  @Roles('ADMIN', 'ALMACEN_GESTOR', 'COMPRAS_GESTOR')
  async create(@Body() createDto: CreatePurchaseReceiptDto) {
    try {
      return await this.purchaseReceiptsService.create(createDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al crear recepción de compra',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /purchases/recepciones
   * Listar recepciones de compra con filtros
   * Requiere: ADMIN, ALMACEN_GESTOR, COMPRAS_GESTOR, COMPRAS_CONSULTA
   */
  @Get()
  @Roles('ADMIN', 'ALMACEN_GESTOR', 'COMPRAS_GESTOR', 'COMPRAS_CONSULTA')
  async findAll(@Query() filterDto: FilterPurchaseReceiptDto) {
    try {
      return await this.purchaseReceiptsService.findAll(filterDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al listar recepciones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /purchases/recepciones/:id/pdf
   * Generar PDF de recepción de compra
   * Requiere: ADMIN, ALMACEN_GESTOR, COMPRAS_GESTOR, COMPRAS_CONSULTA
   * IMPORTANTE: Este endpoint debe estar ANTES de @Get(':id') para evitar conflictos de rutas
   */
  @Get(':id/pdf')
  @Roles('ADMIN', 'ALMACEN_GESTOR', 'COMPRAS_GESTOR', 'COMPRAS_CONSULTA')
  async generatePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.purchaseReceiptsService.generatePDF(id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recepcion-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al generar PDF de recepción',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /purchases/recepciones/:id
   * Obtener detalle de una recepción
   * Requiere: ADMIN, ALMACEN_GESTOR, COMPRAS_GESTOR, COMPRAS_CONSULTA
   */
  @Get(':id')
  @Roles('ADMIN', 'ALMACEN_GESTOR', 'COMPRAS_GESTOR', 'COMPRAS_CONSULTA')
  async findOne(@Param('id') id: string) {
    try {
      const recepcion = await this.purchaseReceiptsService.findOne(id);

      if (!recepcion) {
        throw new HttpException(
          'Recepción no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return recepcion;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al obtener recepción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /purchases/recepciones/:id/confirmar
   * Confirmar recepción y actualizar stock automáticamente
   * Requiere: ADMIN, ALMACEN_GESTOR, COMPRAS_GESTOR
   * IMPORTANTE: Esta operación es atómica y actualiza:
   * - Estado de la recepción a CONFIRMADA
   * - Stock en StockByWarehouse (incrementa cantidadesAceptadas)
   * - Movimientos de inventario (ENTRADA)
   * - Cantidades en PurchaseOrderItem (recibida, pendiente)
   * - Estado de PurchaseOrder (PARCIAL o COMPLETADA)
   */
  @Post(':id/confirmar')
  @Roles('ADMIN', 'ALMACEN_GESTOR', 'COMPRAS_GESTOR')
  async confirm(@Param('id') id: string, @Body() confirmDto: ConfirmReceiptDto) {
    try {
      return await this.purchaseReceiptsService.confirm(id, confirmDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al confirmar recepción',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * PATCH /purchases/recepciones/:id/cancelar
   * Cancelar una recepción (solo si está en estado PENDIENTE o INSPECCION)
   * Requiere: ADMIN, ALMACEN_GESTOR
   */
  @Patch(':id/cancelar')
  @Roles('ADMIN', 'ALMACEN_GESTOR')
  async cancel(@Param('id') id: string) {
    try {
      return await this.purchaseReceiptsService.cancel(id);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al cancelar recepción',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

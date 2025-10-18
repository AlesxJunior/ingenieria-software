import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  clientService,
  CreateClientData,
  UpdateClientData,
  ClientFilters,
} from '../services/entidadService';
import { userService } from '../services/userService';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendUnauthorized,
  sendError,
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PermissionUtils } from '../utils/permissions';

// Validaciones para clientes
const validateClientCreate = (
  data: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar tipo de entidad
  if (!data.tipoEntidad || typeof data.tipoEntidad !== 'string') {
    errors.push('El tipo de entidad es requerido');
  } else {
    const validEntityTypes = ['Cliente', 'Proveedor', 'Ambos'];
    if (!validEntityTypes.includes(data.tipoEntidad)) {
      errors.push(
        'Tipo de entidad inválido. Debe ser Cliente, Proveedor o Ambos',
      );
    }
  }

  // Validar tipo de documento
  if (!data.tipoDocumento || typeof data.tipoDocumento !== 'string') {
    errors.push('El tipo de documento es requerido');
  } else {
    const validTypes = ['DNI', 'CE', 'RUC'];
    if (!validTypes.includes(data.tipoDocumento)) {
      errors.push('Tipo de documento inválido. Debe ser DNI, CE o RUC');
    }
  }

  // Validar número de documento según tipo
  if (!data.numeroDocumento || typeof data.numeroDocumento !== 'string') {
    errors.push('El número de documento es requerido');
  } else {
    const numDoc = data.numeroDocumento.trim();
    if (data.tipoDocumento === 'DNI') {
      if (!/^\d{8}$/.test(numDoc)) {
        errors.push('El DNI debe tener exactamente 8 dígitos numéricos');
      }
    } else if (data.tipoDocumento === 'CE') {
      if (!/^\d{12}$/.test(numDoc)) {
        errors.push('El CE debe tener exactamente 12 dígitos numéricos');
      }
    } else if (data.tipoDocumento === 'RUC') {
      if (!/^\d{11}$/.test(numDoc)) {
        errors.push('El RUC debe tener exactamente 11 dígitos numéricos');
      }
    } else if (numDoc.length < 6) {
      // Fallback si tipoDocumento no es válido pero hay número
      errors.push('El número de documento debe tener al menos 6 caracteres');
    }
  }

  // Validar campos según tipo de documento
  if (['DNI', 'CE'].includes(data.tipoDocumento)) {
    if (
      !data.nombres ||
      typeof data.nombres !== 'string' ||
      data.nombres.trim().length < 2
    ) {
      errors.push('Los nombres deben tener al menos 2 caracteres');
    }
    if (
      !data.apellidos ||
      typeof data.apellidos !== 'string' ||
      data.apellidos.trim().length < 2
    ) {
      errors.push('Los apellidos deben tener al menos 2 caracteres');
    }
  } else if (data.tipoDocumento === 'RUC') {
    if (
      !data.razonSocial ||
      typeof data.razonSocial !== 'string' ||
      data.razonSocial.trim().length < 2
    ) {
      errors.push('La razón social debe tener al menos 2 caracteres');
    }
  }

  // Validar campos comunes
  if (!data.email || typeof data.email !== 'string') {
    errors.push('El email es requerido');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('El email debe tener un formato válido');
    }
  }

  if (
    !data.telefono ||
    typeof data.telefono !== 'string' ||
    data.telefono.trim().length < 8
  ) {
    errors.push('El teléfono debe tener al menos 8 caracteres');
  }

  if (
    !data.direccion ||
    typeof data.direccion !== 'string' ||
    data.direccion.trim().length < 5
  ) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (
    !data.ciudad ||
    typeof data.ciudad !== 'string' ||
    data.ciudad.trim().length < 2
  ) {
    errors.push('La ciudad debe tener al menos 2 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateClientUpdate = (
  data: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar tipo de entidad si se proporciona
  if (data.tipoEntidad !== undefined) {
    if (typeof data.tipoEntidad !== 'string') {
      errors.push('El tipo de entidad debe ser una cadena de texto');
    } else {
      const validEntityTypes = ['Cliente', 'Proveedor', 'Ambos'];
      if (!validEntityTypes.includes(data.tipoEntidad)) {
        errors.push(
          'Tipo de entidad inválido. Debe ser Cliente, Proveedor o Ambos',
        );
      }
    }
  }

  // Validar tipo de documento si se proporciona
  if (data.tipoDocumento !== undefined) {
    if (typeof data.tipoDocumento !== 'string') {
      errors.push('El tipo de documento debe ser una cadena de texto');
    } else {
      const validTypes = ['DNI', 'CE', 'RUC'];
      if (!validTypes.includes(data.tipoDocumento)) {
        errors.push('Tipo de documento inválido. Debe ser DNI, CE o RUC');
      }
    }
  }

  // Validar número de documento si se proporciona
  if (data.numeroDocumento !== undefined) {
    if (typeof data.numeroDocumento !== 'string') {
      errors.push('El número de documento debe ser una cadena de texto');
    } else {
      const numDoc = data.numeroDocumento.trim();
      // Si se proporciona tipoDocumento, validar longitud exacta
      if (data.tipoDocumento === 'DNI') {
        if (!/^\d{8}$/.test(numDoc)) {
          errors.push('El DNI debe tener exactamente 8 dígitos numéricos');
        }
      } else if (data.tipoDocumento === 'CE') {
        if (!/^\d{12}$/.test(numDoc)) {
          errors.push('El CE debe tener exactamente 12 dígitos numéricos');
        }
      } else if (data.tipoDocumento === 'RUC') {
        if (!/^\d{11}$/.test(numDoc)) {
          errors.push('El RUC debe tener exactamente 11 dígitos numéricos');
        }
      } else if (!/^\d+$/.test(numDoc)) {
        // Si no hay tipoDocumento válido, al menos exigir dígitos
        errors.push('El número de documento debe contener solo dígitos');
      }
    }
  }

  // Validar campos condicionales según tipo de documento
  if (
    data.nombres !== undefined &&
    (typeof data.nombres !== 'string' || data.nombres.trim().length < 2)
  ) {
    errors.push('Los nombres deben tener al menos 2 caracteres');
  }

  if (
    data.apellidos !== undefined &&
    (typeof data.apellidos !== 'string' || data.apellidos.trim().length < 2)
  ) {
    errors.push('Los apellidos deben tener al menos 2 caracteres');
  }

  if (
    data.razonSocial !== undefined &&
    (typeof data.razonSocial !== 'string' || data.razonSocial.trim().length < 2)
  ) {
    errors.push('La razón social debe tener al menos 2 caracteres');
  }

  // Validar campos comunes
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('El email debe ser una cadena de texto');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('El email debe tener un formato válido');
      }
    }
  }

  if (
    data.telefono !== undefined &&
    (typeof data.telefono !== 'string' || data.telefono.trim().length < 8)
  ) {
    errors.push('El teléfono debe tener al menos 8 caracteres');
  }

  if (
    data.direccion !== undefined &&
    (typeof data.direccion !== 'string' || data.direccion.trim().length < 5)
  ) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (
    data.ciudad !== undefined &&
    (typeof data.ciudad !== 'string' || data.ciudad.trim().length < 2)
  ) {
    errors.push('La ciudad debe tener al menos 2 caracteres');
  }

  // Validar estado activo si se proporciona
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('El estado isActive debe ser un booleano');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export class ClientController {
  // GET /clients - Obtener todos los clientes (con filtros)
  static getAllClients = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const {
        search,
        ciudad,
        tipoDocumento,
        tipoEntidad,
        fechaDesde,
        fechaHasta,
      } = req.query;
      const currentUser = req.user;

      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const user = await userService.findById(currentUser.userId);
      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para ver entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          user.permissions || [],
          'commercial_entities.read',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para ver la lista de entidades comerciales',
        );
        return;
      }

      try {
        // Construir filtros
        const filters: ClientFilters = {};

        if (search) {
          filters.search = search as string;
        }

        if (ciudad) {
          filters.ciudad = ciudad as string;
        }

        if (tipoDocumento) {
          filters.tipoDocumento = tipoDocumento as string;
        }

        if (tipoEntidad) {
          filters.tipoEntidad = tipoEntidad as any;
        }

        if (fechaDesde) {
          filters.fechaDesde = fechaDesde as string;
        }

        if (fechaHasta) {
          filters.fechaHasta = fechaHasta as string;
        }

        // Obtener entidades comerciales
        const clients = await clientService.getClients(filters);

        logger.info(
          `Usuario ${currentUser.userId} consultó la lista de entidades comerciales`,
          {
            userId: currentUser.userId,
            filters,
            resultCount: clients.length,
          },
        );

        sendSuccess(
          res,
          {
            clients,
            total: clients.length,
            filters,
          },
          'Entidades comerciales obtenidas exitosamente',
        );
      } catch (error) {
        logger.error('Error al obtener entidades comerciales:', error);
        sendError(
          res,
          'Error interno del servidor al obtener entidades comerciales',
        );
      }
    },
  );

  // GET /clients/:id - Obtener un cliente por ID
  static getClientById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      // Validar que el ID esté presente
      if (!id) {
        sendValidationError(res, [
          'El ID de la entidad comercial es requerido',
        ]);
        return;
      }

      // Verificar autenticación
      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const userById = await userService.findById(currentUser.userId);
      if (!userById) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para ver entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          userById.permissions || [],
          'commercial_entities.read',
        )
      ) {
        sendForbidden(res, 'No tienes permisos para ver entidades comerciales');
        return;
      }

      try {
        const client = await clientService.getClientById(id);

        if (!client) {
          sendNotFound(res, 'Entidad comercial no encontrada');
          return;
        }

        logger.info(
          `Usuario ${currentUser.userId} consultó la entidad comercial ${id}`,
          {
            userId: currentUser.userId,
            clientId: id,
          },
        );

        sendSuccess(res, { client }, 'Entidad comercial obtenida exitosamente');
      } catch (error) {
        logger.error('Error al obtener entidad comercial:', error);
        sendError(
          res,
          'Error interno del servidor al obtener la entidad comercial',
        );
      }
    },
  );

  // POST /clients - Crear un nuevo cliente
  static createClient = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const currentUser = req.user;

      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const user = await userService.findById(currentUser.userId);
      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para crear entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          user.permissions || [],
          'commercial_entities.create',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para crear entidades comerciales',
        );
        return;
      }

      // Validar datos de entrada
      const validation = validateClientCreate(req.body);
      if (!validation.isValid) {
        sendValidationError(
          res,
          validation.errors,
          'Datos de entidad comercial inválidos',
        );
        return;
      }

      try {
        const clientData: CreateClientData = {
          tipoEntidad: req.body.tipoEntidad,
          tipoDocumento: req.body.tipoDocumento,
          numeroDocumento: req.body.numeroDocumento,
          email: req.body.email,
          telefono: req.body.telefono,
          direccion: req.body.direccion,
          ciudad: req.body.ciudad,
        };

        // Agregar campos condicionales según tipo de documento
        if (['DNI', 'CE'].includes(req.body.tipoDocumento)) {
          clientData.nombres = req.body.nombres;
          clientData.apellidos = req.body.apellidos;
        } else if (req.body.tipoDocumento === 'RUC') {
          clientData.razonSocial = req.body.razonSocial;
        }

        const newClient = await clientService.createClient(
          clientData,
          currentUser.userId,
        );

        logger.info(
          `Usuario ${currentUser.userId} creó la entidad comercial ${newClient.id}`,
          {
            userId: currentUser.userId,
            clientId: newClient.id,
            clientEmail: newClient.email,
          },
        );

        sendSuccess(
          res,
          { client: newClient },
          'Entidad comercial creada exitosamente',
          201,
        );
      } catch (error: any) {
        logger.error('Error al crear entidad comercial:', error);

        if (
          error.message.includes('Ya existe un cliente') ||
          error.message.includes('Ya existe una entidad comercial') ||
          error.message.includes('son requeridos') ||
          error.message.includes('deben tener') ||
          error.message.includes('razón social')
        ) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/cliente/gi, 'entidad comercial')
              : 'Error de validación al crear la entidad comercial';
          sendValidationError(res, message);
          return;
        }

        sendError(
          res,
          'Error interno del servidor al crear la entidad comercial',
        );
      }
    },
  );

  // PUT /clients/:id - Actualizar un cliente completo
  static updateClient = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const user = await userService.findById(currentUser.userId);
      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para actualizar entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          user.permissions || [],
          'commercial_entities.update',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para actualizar entidades comerciales',
        );
        return;
      }

      // Validar que se proporcione el ID
      if (!id) {
        sendValidationError(res, [
          'El ID de la entidad comercial es requerido',
        ]);
        return;
      }

      // Validar datos de entrada
      const validation = validateClientUpdate(req.body);
      if (!validation.isValid) {
        sendValidationError(
          res,
          validation.errors,
          'Datos de entidad comercial inválidos',
        );
        return;
      }

      try {
        const updateData: UpdateClientData = {};

        // Solo incluir campos que están presentes en el body
        if (req.body.tipoDocumento !== undefined)
          updateData.tipoDocumento = req.body.tipoDocumento;
        if (req.body.numeroDocumento !== undefined)
          updateData.numeroDocumento = req.body.numeroDocumento;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.telefono !== undefined)
          updateData.telefono = req.body.telefono;
        if (req.body.direccion !== undefined)
          updateData.direccion = req.body.direccion;
        if (req.body.ciudad !== undefined) updateData.ciudad = req.body.ciudad;
        if (req.body.isActive !== undefined)
          updateData.isActive = req.body.isActive;

        // Campos condicionales según tipo de documento
        if (req.body.nombres !== undefined)
          updateData.nombres = req.body.nombres;
        if (req.body.apellidos !== undefined)
          updateData.apellidos = req.body.apellidos;
        if (req.body.razonSocial !== undefined)
          updateData.razonSocial = req.body.razonSocial;

        const updatedClient = await clientService.updateClient(
          id!,
          updateData,
          currentUser.userId!,
        );

        logger.info(
          `Usuario ${currentUser.userId!} actualizó la entidad comercial ${id}`,
          {
            userId: currentUser.userId!,
            clientId: id,
            updatedFields: Object.keys(updateData),
          },
        );

        sendSuccess(
          res,
          { client: updatedClient },
          'Entidad comercial actualizada exitosamente',
        );
      } catch (error: any) {
        logger.error('Error al actualizar entidad comercial:', error);

        if (
          error.message.includes('Cliente no encontrado') ||
          error.message.includes('Entidad comercial no encontrada')
        ) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/Cliente/gi, 'Entidad comercial')
              : 'Entidad comercial no encontrada';
          sendNotFound(res, message);
          return;
        }

        if (
          error.message.includes('Ya existe un cliente') ||
          error.message.includes('Ya existe una entidad comercial')
        ) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/cliente/gi, 'entidad comercial')
              : 'Ya existe una entidad comercial con esos datos';
          sendValidationError(res, message);
          return;
        }

        sendError(
          res,
          'Error interno del servidor al actualizar la entidad comercial',
        );
      }
    },
  );

  // PATCH /clients/:id - Actualización parcial de un cliente
  static patchClient = ClientController.updateClient;

  // POST /clients/:id/reactivate - Reactivar un cliente
  static reactivateClient = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      // Validar que el ID esté presente
      if (!id) {
        sendValidationError(res, [
          'El ID de la entidad comercial es requerido',
        ]);
        return;
      }

      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const user = await userService.findById(currentUser.userId);
      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para reactivar entidades comerciales (usando permiso de update)
      if (
        !PermissionUtils.hasPermission(
          user.permissions || [],
          'commercial_entities.update',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para reactivar entidades comerciales',
        );
        return;
      }

      try {
        const reactivatedClient = await clientService.reactivateClient(
          id,
          currentUser.userId,
        );

        logger.info(
          `Usuario ${currentUser.userId} reactivó la entidad comercial ${id}`,
          {
            userId: currentUser.userId,
            clientId: id,
            clientEmail: reactivatedClient.email,
          },
        );

        sendSuccess(
          res,
          { client: reactivatedClient },
          'Entidad comercial reactivada exitosamente',
        );
      } catch (error: any) {
        logger.error('Error al reactivar entidad comercial:', error);

        if (
          error.message.includes('Cliente no encontrado') ||
          error.message.includes('Entidad comercial no encontrada')
        ) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/Cliente/gi, 'Entidad comercial')
              : 'Entidad comercial no encontrada';
          sendNotFound(res, message);
          return;
        }

        if (
          error.message.includes('ya existe un cliente activo') ||
          error.message.includes('ya existe una entidad comercial activa')
        ) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/cliente/gi, 'entidad comercial')
              : 'Ya existe una entidad comercial activa con esos datos';
          sendValidationError(res, message);
          return;
        }

        if (error.message.includes('ya está activo')) {
          const message =
            typeof error.message === 'string'
              ? error.message.replace(/cliente/gi, 'entidad comercial')
              : 'La entidad comercial ya está activa';
          sendValidationError(res, message);
          return;
        }

        sendError(
          res,
          'Error interno del servidor al reactivar la entidad comercial',
        );
      }
    },
  );

  // GET /clients/stats - Obtener estadísticas de clientes
  static getClientStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const currentUser = req.user;

      // Verificar autenticación
      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const userById = await userService.findById(currentUser.userId);
      if (!userById) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para ver estadísticas de entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          userById.permissions || [],
          'commercial_entities.read',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para ver estadísticas de entidades comerciales',
        );
        return;
      }

      try {
        const stats = await clientService.getClientStats();

        logger.info(
          `Usuario ${currentUser.userId} consultó estadísticas de entidades comerciales`,
          {
            userId: currentUser.userId,
          },
        );

        sendSuccess(
          res,
          { stats },
          'Estadísticas de entidades comerciales obtenidas exitosamente',
        );
      } catch (error) {
        logger.error(
          'Error al obtener estadísticas de entidades comerciales:',
          error,
        );
        sendError(res, 'Error interno del servidor al obtener estadísticas');
      }
    },
  );

  // GET /clients/search/email/:email - Buscar cliente por email
  static getClientByEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { email } = req.params;
      const currentUser = req.user;

      // Validar que el email esté presente
      if (!email) {
        sendValidationError(res, ['El email es requerido']);
        return;
      }

      // Verificar autenticación
      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const userById = await userService.findById(currentUser.userId);
      if (!userById) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para ver entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          userById.permissions || [],
          'commercial_entities.read',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para buscar entidades comerciales',
        );
        return;
      }

      try {
        const client = await clientService.getClientByEmail(email);

        if (!client) {
          sendNotFound(res, 'Entidad comercial no encontrada con ese email');
          return;
        }

        logger.info(
          `Usuario ${currentUser.userId} buscó entidad comercial por email: ${email}`,
          {
            userId: currentUser.userId,
            searchEmail: email,
            foundClientId: client.id,
          },
        );

        sendSuccess(
          res,
          { client },
          'Entidad comercial encontrada exitosamente',
        );
      } catch (error) {
        logger.error('Error al buscar entidad comercial por email:', error);
        sendError(
          res,
          'Error interno del servidor al buscar la entidad comercial',
        );
      }
    },
  );

  // GET /clients/search/document/:numeroDocumento - Buscar cliente por documento
  static getClientByDocument = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { numeroDocumento } = req.params;
      const currentUser = req.user;

      // Validar que el número de documento esté presente
      if (!numeroDocumento) {
        sendValidationError(res, ['El número de documento es requerido']);
        return;
      }

      // Verificar autenticación
      if (!currentUser) {
        sendUnauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Obtener el usuario completo con permisos de la base de datos
      const userById = await userService.findById(currentUser.userId);
      if (!userById) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Verificar permisos para ver entidades comerciales
      if (
        !PermissionUtils.hasPermission(
          userById.permissions || [],
          'commercial_entities.read',
        )
      ) {
        sendForbidden(
          res,
          'No tienes permisos para buscar entidades comerciales',
        );
        return;
      }

      try {
        const client = await clientService.getClientByDocument(numeroDocumento);

        if (!client) {
          sendNotFound(
            res,
            'Entidad comercial no encontrada con ese número de documento',
          );
          return;
        }

        logger.info(
          `Usuario ${currentUser.userId} buscó entidad comercial por documento: ${numeroDocumento}`,
          {
            userId: currentUser.userId,
            searchDocument: numeroDocumento,
            foundClientId: client.id,
          },
        );

        sendSuccess(
          res,
          { client },
          'Entidad comercial encontrada exitosamente',
        );
      } catch (error) {
        logger.error('Error al buscar entidad comercial por documento:', error);
        sendError(
          res,
          'Error interno del servidor al buscar la entidad comercial',
        );
      }
    },
  );
}

export default ClientController;

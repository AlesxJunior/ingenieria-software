import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { clientService, CreateClientData, UpdateClientData, ClientFilters } from '../services/clientService';
import { userService } from '../services/userService';
import { 
  sendSuccess, 
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendUnauthorized,
  sendError 
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Validaciones para clientes
const validateClientCreate = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar tipo de documento
  if (!data.tipoDocumento || typeof data.tipoDocumento !== 'string') {
    errors.push('El tipo de documento es requerido');
  } else {
    const validTypes = ['DNI', 'CE', 'RUC'];
    if (!validTypes.includes(data.tipoDocumento)) {
      errors.push('Tipo de documento inválido. Debe ser DNI, CE o RUC');
    }
  }

  // Validar número de documento
  if (!data.numeroDocumento || typeof data.numeroDocumento !== 'string' || data.numeroDocumento.trim().length < 6) {
    errors.push('El número de documento debe tener al menos 6 caracteres');
  }

  // Validar campos según tipo de documento
  if (['DNI', 'CE'].includes(data.tipoDocumento)) {
    if (!data.nombres || typeof data.nombres !== 'string' || data.nombres.trim().length < 2) {
      errors.push('Los nombres deben tener al menos 2 caracteres');
    }
    if (!data.apellidos || typeof data.apellidos !== 'string' || data.apellidos.trim().length < 2) {
      errors.push('Los apellidos deben tener al menos 2 caracteres');
    }
  } else if (data.tipoDocumento === 'RUC') {
    if (!data.razonSocial || typeof data.razonSocial !== 'string' || data.razonSocial.trim().length < 2) {
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

  if (!data.telefono || typeof data.telefono !== 'string' || data.telefono.trim().length < 8) {
    errors.push('El teléfono debe tener al menos 8 caracteres');
  }

  if (!data.direccion || typeof data.direccion !== 'string' || data.direccion.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (!data.ciudad || typeof data.ciudad !== 'string' || data.ciudad.trim().length < 2) {
    errors.push('La ciudad debe tener al menos 2 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateClientUpdate = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

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
  if (data.numeroDocumento !== undefined && (typeof data.numeroDocumento !== 'string' || data.numeroDocumento.trim().length < 6)) {
    errors.push('El número de documento debe tener al menos 6 caracteres');
  }

  // Validar campos condicionales según tipo de documento
  if (data.nombres !== undefined && (typeof data.nombres !== 'string' || data.nombres.trim().length < 2)) {
    errors.push('Los nombres deben tener al menos 2 caracteres');
  }

  if (data.apellidos !== undefined && (typeof data.apellidos !== 'string' || data.apellidos.trim().length < 2)) {
    errors.push('Los apellidos deben tener al menos 2 caracteres');
  }

  if (data.razonSocial !== undefined && (typeof data.razonSocial !== 'string' || data.razonSocial.trim().length < 2)) {
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

  if (data.telefono !== undefined && (typeof data.telefono !== 'string' || data.telefono.trim().length < 8)) {
    errors.push('El teléfono debe tener al menos 8 caracteres');
  }

  if (data.direccion !== undefined && (typeof data.direccion !== 'string' || data.direccion.trim().length < 5)) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (data.ciudad !== undefined && (typeof data.ciudad !== 'string' || data.ciudad.trim().length < 2)) {
    errors.push('La ciudad debe tener al menos 2 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export class ClientController {
  // GET /clients - Obtener todos los clientes (con filtros)
  static getAllClients = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { search, ciudad, tipoDocumento, fechaDesde, fechaHasta } = req.query;
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

    // Verificar permisos para ver clientes
    if (!user.permissions?.includes('clients.read')) {
      sendForbidden(res, 'No tienes permisos para ver la lista de clientes');
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

      if (fechaDesde) {
        filters.fechaDesde = fechaDesde as string;
      }

      if (fechaHasta) {
        filters.fechaHasta = fechaHasta as string;
      }

      // Obtener clientes
      const clients = await clientService.getClients(filters);

      logger.info(`Usuario ${currentUser.userId} consultó la lista de clientes`, {
        userId: currentUser.userId,
        filters,
        resultCount: clients.length
      });

      sendSuccess(res, {
        clients,
        total: clients.length,
        filters
      }, 'Clientes obtenidos exitosamente');

    } catch (error) {
      logger.error('Error al obtener clientes:', error);
      sendError(res, 'Error interno del servidor al obtener clientes');
    }
  });

  // GET /clients/:id - Obtener un cliente por ID
  static getClientById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    // Validar que el ID esté presente
    if (!id) {
      sendValidationError(res, ['El ID del cliente es requerido']);
      return;
    }

    // Verificar permisos para ver clientes
    if (!currentUser?.permissions?.includes('clients.read')) {
      sendForbidden(res, 'No tienes permisos para ver clientes');
      return;
    }

    try {
      const client = await clientService.getClientById(id);

      if (!client) {
        sendNotFound(res, 'Cliente no encontrado');
        return;
      }

      logger.info(`Usuario ${currentUser.userId} consultó el cliente ${id}`, {
        userId: currentUser.userId,
        clientId: id
      });

      sendSuccess(res, { client }, 'Cliente obtenido exitosamente');

    } catch (error) {
      logger.error('Error al obtener cliente:', error);
      sendError(res, 'Error interno del servidor al obtener el cliente');
    }
  });

  // POST /clients - Crear un nuevo cliente
  static createClient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Verificar permisos para crear clientes
    if (!user.permissions?.includes('clients.create')) {
      sendForbidden(res, 'No tienes permisos para crear clientes');
      return;
    }

    // Validar datos de entrada
    const validation = validateClientCreate(req.body);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors, 'Datos de cliente inválidos');
      return;
    }

    try {
      const clientData: CreateClientData = {
        tipoDocumento: req.body.tipoDocumento,
        numeroDocumento: req.body.numeroDocumento,
        email: req.body.email,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        ciudad: req.body.ciudad
      };

      // Agregar campos condicionales según tipo de documento
      if (['DNI', 'CE'].includes(req.body.tipoDocumento)) {
        clientData.nombres = req.body.nombres;
        clientData.apellidos = req.body.apellidos;
      } else if (req.body.tipoDocumento === 'RUC') {
        clientData.razonSocial = req.body.razonSocial;
      }

      const newClient = await clientService.createClient(clientData, currentUser.userId);

      logger.info(`Usuario ${currentUser.userId} creó el cliente ${newClient.id}`, {
        userId: currentUser.userId,
        clientId: newClient.id,
        clientEmail: newClient.email
      });

      sendSuccess(res, { client: newClient }, 'Cliente creado exitosamente', 201);

    } catch (error: any) {
      logger.error('Error al crear cliente:', error);
      
      if (error.message.includes('Ya existe un cliente') || error.message.includes('son requeridos')) {
        sendValidationError(res, error.message);
        return;
      }
      
      sendError(res, 'Error interno del servidor al crear el cliente');
    }
  });

  // PUT /clients/:id - Actualizar un cliente completo
  static updateClient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Verificar permisos para actualizar clientes
    if (!user.permissions?.includes('clients.update')) {
      sendForbidden(res, 'No tienes permisos para actualizar clientes');
      return;
    }

    // Validar que se proporcione el ID
    if (!id) {
      sendValidationError(res, ['El ID del cliente es requerido']);
      return;
    }

    // Validar datos de entrada
    const validation = validateClientUpdate(req.body);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors, 'Datos de cliente inválidos');
      return;
    }

    try {
      const updateData: UpdateClientData = {};
      
      // Solo incluir campos que están presentes en el body
      if (req.body.tipoDocumento !== undefined) updateData.tipoDocumento = req.body.tipoDocumento;
      if (req.body.numeroDocumento !== undefined) updateData.numeroDocumento = req.body.numeroDocumento;
      if (req.body.email !== undefined) updateData.email = req.body.email;
      if (req.body.telefono !== undefined) updateData.telefono = req.body.telefono;
      if (req.body.direccion !== undefined) updateData.direccion = req.body.direccion;
      if (req.body.ciudad !== undefined) updateData.ciudad = req.body.ciudad;
      
      // Campos condicionales según tipo de documento
      if (req.body.nombres !== undefined) updateData.nombres = req.body.nombres;
      if (req.body.apellidos !== undefined) updateData.apellidos = req.body.apellidos;
      if (req.body.razonSocial !== undefined) updateData.razonSocial = req.body.razonSocial;

      const updatedClient = await clientService.updateClient(id!, updateData, currentUser.userId!);

      logger.info(`Usuario ${currentUser.userId!} actualizó el cliente ${id}`, {
        userId: currentUser.userId!,
        clientId: id,
        updatedFields: Object.keys(updateData)
      });

      sendSuccess(res, { client: updatedClient }, 'Cliente actualizado exitosamente');

    } catch (error: any) {
      logger.error('Error al actualizar cliente:', error);
      
      if (error.message.includes('Cliente no encontrado')) {
        sendNotFound(res, error.message);
        return;
      }
      
      if (error.message.includes('Ya existe un cliente')) {
        sendValidationError(res, error.message);
        return;
      }
      
      sendError(res, 'Error interno del servidor al actualizar el cliente');
    }
  });

  // PATCH /clients/:id - Actualización parcial de un cliente
  static patchClient = ClientController.updateClient;



  // POST /clients/:id/reactivate - Reactivar un cliente
  static reactivateClient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    // Validar que el ID esté presente
    if (!id) {
      sendValidationError(res, ['El ID del cliente es requerido']);
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

    // Verificar permisos para reactivar clientes (usando permiso de update)
    if (!user.permissions?.includes('clients.update')) {
      sendForbidden(res, 'No tienes permisos para reactivar clientes');
      return;
    }

    try {
      const reactivatedClient = await clientService.reactivateClient(id, currentUser.userId);

      logger.info(`Usuario ${currentUser.userId} reactivó el cliente ${id}`, {
        userId: currentUser.userId,
        clientId: id,
        clientEmail: reactivatedClient.email
      });

      sendSuccess(res, { client: reactivatedClient }, 'Cliente reactivado exitosamente');

    } catch (error: any) {
      logger.error('Error al reactivar cliente:', error);
      
      if (error.message.includes('Cliente no encontrado')) {
        sendNotFound(res, error.message);
        return;
      }
      
      if (error.message.includes('ya existe un cliente activo')) {
        sendValidationError(res, error.message);
        return;
      }
      
      if (error.message.includes('ya está activo')) {
        sendValidationError(res, error.message);
        return;
      }
      
      sendError(res, 'Error interno del servidor al reactivar el cliente');
    }
  });

  // GET /clients/stats - Obtener estadísticas de clientes
  static getClientStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const currentUser = req.user;

    // Verificar permisos para ver estadísticas de clientes
    if (!currentUser?.permissions?.includes('clients.read')) {
      sendForbidden(res, 'No tienes permisos para ver estadísticas de clientes');
      return;
    }

    try {
      const stats = await clientService.getClientStats();

      logger.info(`Usuario ${currentUser.userId} consultó estadísticas de clientes`, {
        userId: currentUser.userId
      });

      sendSuccess(res, { stats }, 'Estadísticas de clientes obtenidas exitosamente');

    } catch (error) {
      logger.error('Error al obtener estadísticas de clientes:', error);
      sendError(res, 'Error interno del servidor al obtener estadísticas');
    }
  });

  // GET /clients/search/email/:email - Buscar cliente por email
  static getClientByEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email } = req.params;
    const currentUser = req.user;

    // Validar que el email esté presente
    if (!email) {
      sendValidationError(res, ['El email es requerido']);
      return;
    }

    // Verificar permisos para ver clientes
    if (!currentUser?.permissions?.includes('clients.read')) {
      sendForbidden(res, 'No tienes permisos para buscar clientes');
      return;
    }

    try {
      const client = await clientService.getClientByEmail(email);

      if (!client) {
        sendNotFound(res, 'Cliente no encontrado con ese email');
        return;
      }

      logger.info(`Usuario ${currentUser.userId} buscó cliente por email: ${email}`, {
        userId: currentUser.userId,
        searchEmail: email,
        foundClientId: client.id
      });

      sendSuccess(res, { client }, 'Cliente encontrado exitosamente');

    } catch (error) {
      logger.error('Error al buscar cliente por email:', error);
      sendError(res, 'Error interno del servidor al buscar el cliente');
    }
  });

  // GET /clients/search/document/:numeroDocumento - Buscar cliente por documento
  static getClientByDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { numeroDocumento } = req.params;
    const currentUser = req.user;

    // Validar que el número de documento esté presente
    if (!numeroDocumento) {
      sendValidationError(res, ['El número de documento es requerido']);
      return;
    }

    // Verificar permisos para ver clientes
    if (!currentUser?.permissions?.includes('clients.read')) {
      sendForbidden(res, 'No tienes permisos para buscar clientes');
      return;
    }

    try {
      const client = await clientService.getClientByDocument(numeroDocumento);

      if (!client) {
        sendNotFound(res, 'Cliente no encontrado con ese número de documento');
        return;
      }

      logger.info(`Usuario ${currentUser.userId} buscó cliente por documento: ${numeroDocumento}`, {
        userId: currentUser.userId,
        searchDocument: numeroDocumento,
        foundClientId: client.id
      });

      sendSuccess(res, { client }, 'Cliente encontrado exitosamente');

    } catch (error) {
      logger.error('Error al buscar cliente por documento:', error);
      sendError(res, 'Error interno del servidor al buscar el cliente');
    }
  });
}

export default ClientController;
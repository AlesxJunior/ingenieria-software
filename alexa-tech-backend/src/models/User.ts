import bcrypt from 'bcrypt';
import { User, UserCreateInput, UserUpdateInput, UserResponse } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

// Tipo interno que incluye la contraseña para el modelo
interface UserWithPassword extends User {
  password: string;
}

// Simulación de base de datos en memoria (temporal)
let users: UserWithPassword[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@alexatech.com',
    firstName: 'Admin',
    lastName: 'User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // admin123
    isActive: true,
    permissions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    username: 'supervisor',
    email: 'supervisor@alexatech.com',
    firstName: 'Supervisor',
    lastName: 'User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // supervisor123
    isActive: true,
    permissions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    username: 'vendedor',
    email: 'vendedor@alexatech.com',
    firstName: 'Vendedor',
    lastName: 'User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // vendedor123
    isActive: true,
    permissions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

let nextId = 4;

export class UserModel {
  // Obtener todos los usuarios
  static async findAll(): Promise<User[]> {
    logger.database('SELECT', 'users');
    return users.map(user => this.toResponse(user));
  }

  // Obtener usuario por ID
  static async findById(id: string): Promise<User | null> {
    logger.database('SELECT BY ID', 'users');
    const user = users.find(u => u.id === id);
    return user ? this.toResponse(user) : null;
  }

  // Obtener usuario por email
  static async findByEmail(email: string): Promise<User | null> {
    logger.database('SELECT BY EMAIL', 'users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? this.toResponse(user) : null;
  }

  // Obtener usuario por username
  static async findByUsername(username: string): Promise<User | null> {
    logger.database('SELECT BY USERNAME', 'users');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user ? this.toResponse(user) : null;
  }

  // Métodos internos que devuelven UserWithPassword para autenticación
  static async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    logger.database('SELECT BY EMAIL WITH PASSWORD', 'users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  // Crear nuevo usuario
  static async create(userData: UserCreateInput): Promise<User> {
    logger.database('INSERT', 'users');
    
    // Verificar si el email ya existe
    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds);

    const newUser: UserWithPassword = {
      id: nextId.toString(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: hashedPassword,

      isActive: true,
      permissions: userData.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    nextId++;

    logger.info('User created', { userId: newUser.id, email: newUser.email });
    return this.toResponse(newUser);
  }

  // Actualizar usuario
  static async update(id: string, updateData: UserUpdateInput): Promise<User | null> {
    logger.database('UPDATE', 'users');
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return null;
    }

    const user = users[userIndex];
    if (!user) {
      return null;
    }

    // Verificar email único si se está actualizando
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.findByEmail(updateData.email);
      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }
    }

    // Verificar username único si se está actualizando
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await this.findByUsername(updateData.username);
      if (existingUsername) {
        throw new Error('El nombre de usuario ya está registrado');
      }
    }

    // Hash de la nueva contraseña si se proporciona
    let hashedPassword = user.password;
    if (updateData.password) {
      hashedPassword = await bcrypt.hash(updateData.password, config.bcryptRounds);
    }

    const updatedUser: UserWithPassword = {
      ...user,
      username: updateData.username || user.username,
      email: updateData.email?.toLowerCase() || user.email,
      firstName: updateData.firstName || user.firstName,
      lastName: updateData.lastName || user.lastName,
      password: hashedPassword,

      isActive: updateData.isActive !== undefined ? updateData.isActive : user.isActive,
      permissions: updateData.permissions !== undefined ? updateData.permissions : user.permissions,
      updatedAt: new Date()
    };

    users[userIndex] = updatedUser;

    logger.info('User updated', { userId: updatedUser.id, email: updatedUser.email });
    return this.toResponse(updatedUser);
  }

  // Eliminar usuario (soft delete)
  static async delete(id: string): Promise<boolean> {
    logger.database('SOFT DELETE', 'users');
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return false;
    }

    const currentUser = users[userIndex];
    if (!currentUser) {
      return false;
    }
    
    const updatedUser: UserWithPassword = {
      ...currentUser,
      isActive: false,
      updatedAt: new Date()
    };
    
    users[userIndex] = updatedUser;

    logger.info('User soft deleted', { userId: id });
    return true;
  }

  // Eliminar usuario permanentemente
  static async hardDelete(id: string): Promise<boolean> {
    logger.database('HARD DELETE', 'users');
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return false;
    }

    users.splice(userIndex, 1);

    logger.info('User hard deleted', { userId: id });
    return true;
  }

  // Verificar contraseña
  static async verifyPassword(user: UserWithPassword, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // Convertir User a UserResponse (sin contraseña)
  static toResponse(user: UserWithPassword): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      permissions: user.permissions || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // Obtener usuarios activos
  static async findActive(): Promise<User[]> {
    logger.database('SELECT ACTIVE', 'users');
    return users.filter(u => u.isActive).map(user => this.toResponse(user));
  }



  // Contar usuarios
  static async count(): Promise<number> {
    logger.database('COUNT', 'users');
    return users.length;
  }

  // Contar usuarios activos
  static async countActive(): Promise<number> {
    logger.database('COUNT ACTIVE', 'users');
    return users.filter(u => u.isActive).length;
  }

  // Buscar usuarios (por username o email)
  static async search(query: string): Promise<User[]> {
    logger.database('SEARCH', 'users');
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      u.isActive && (
        u.username.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
      )
    ).map(user => this.toResponse(user));
  }
}

export default UserModel;
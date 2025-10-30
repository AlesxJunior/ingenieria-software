// Tipos relacionados con usuarios y autenticación

// Roles de usuario - const object en vez de enum para compatibilidad
export const UserRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastAccess: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  role?: UserRole;
  permissions?: string[];
  isActive?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

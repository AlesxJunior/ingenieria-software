import { PrismaClient, User } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { userService } from '../users.service';
import { prisma } from '../../../config/database';
import * as bcrypt from 'bcrypt';
import { config } from '../../../config'; // Import config

jest.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock('bcrypt');

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('User Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
    (bcrypt.hash as jest.Mock).mockClear();
  });

  describe('findById', () => {
    it('should return a user when a valid ID is provided', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastAccess: new Date(),
        permissions: ['users.read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const user = await userService.findById('user-123');

      expect(user).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when an invalid ID is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userService.findById('invalid-id');

      expect(user).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const userInput = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      permissions: ['users.read'],
    };

    const createdUser: User = {
      id: 'new-user-id',
      ...userInput,
      isActive: true,
      lastAccess: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user successfully', async () => {
      // Arrange: No existing user, hash resolves, create resolves
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      prismaMock.user.create.mockResolvedValue(createdUser);

      // Act
      const user = await userService.create(userInput);

      // Assert
      expect(user).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        userInput.password,
        config.bcryptRounds, // Use config value
      );
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...userInput,
          password: 'hashed_password',
        },
      });
    });

    it('should throw an error if the email already exists', async () => {
      // Arrange: Mock that a user with the email exists
      prismaMock.user.findUnique.mockResolvedValueOnce(createdUser);

      // Act & Assert
      await expect(userService.create(userInput)).rejects.toThrow(
        'El email ya está registrado',
      );
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: userInput.email },
      });
    });

    it('should throw an error if the username already exists', async () => {
      // Arrange: Mock no user by email, but one with the username
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // for email check
        .mockResolvedValueOnce(createdUser); // for username check

      // Act & Assert
      await expect(userService.create(userInput)).rejects.toThrow(
        'El nombre de usuario ya está en uso',
      );
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: userInput.email },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: userInput.username },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user when a valid email is provided', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastAccess: new Date(),
        permissions: ['users.read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const user = await userService.findByEmail('test@example.com');

      expect(user).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when an invalid email is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userService.findByEmail('invalid-email');

      expect(user).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUsername', () => {
    it('should return a user when a valid username is provided', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastAccess: new Date(),
        permissions: ['users.read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const user = await userService.findByUsername('testuser');

      expect(user).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null when an invalid username is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userService.findByUsername('invalid-username');

      expect(user).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const existingUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      lastAccess: new Date(),
      permissions: ['users.read'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...existingUser, ...updateData };
      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const user = await userService.update('user-123', updateData);

      expect(user).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
      });
    });

    it('should return null if the user to update does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userService.update('non-existent-id', updateData);

      expect(user).toBeNull();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw an error if updating with an existing email', async () => {
      const anotherUser: User = { ...existingUser, id: 'user-456', email: 'another@example.com' };
      // Mock por argumentos para evitar dependencia del orden de llamadas
      (prismaMock.user.findUnique as any).mockImplementation((args: any) => {
        if (args?.where?.id === 'user-123') return Promise.resolve(existingUser);
        if (args?.where?.email === 'another@example.com') return Promise.resolve(anotherUser);
        return Promise.resolve(null);
      });

      await expect(userService.update('user-123', { email: 'another@example.com' })).rejects.toThrow(
        'El email ya está registrado',
      );
    });

    it('should throw an error if updating with an existing username', async () => {
      const anotherUser: User = { ...existingUser, id: 'user-456', username: 'anotheruser' };
      // Mock por argumentos para evitar dependencia del orden de llamadas
      (prismaMock.user.findUnique as any).mockImplementation((args: any) => {
        if (args?.where?.id === 'user-123') return Promise.resolve(existingUser);
        if (args?.where?.username === 'anotheruser') return Promise.resolve(anotherUser);
        return Promise.resolve(null);
      });
      prismaMock.user.update.mockResolvedValue(existingUser);

      await expect(userService.update('user-123', { username: 'anotheruser' })).rejects.toThrow(
        'El nombre de usuario ya está en uso',
      );
    });

    it('should hash the password if it is provided', async () => {
      const passwordUpdate = { password: 'newpassword123' };
      const updatedUser = { ...existingUser, password: 'hashed_new_password' };
      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');
      prismaMock.user.update.mockResolvedValue(updatedUser);

      await userService.update('user-123', passwordUpdate);

      expect(bcrypt.hash).toHaveBeenCalledWith(passwordUpdate.password, config.bcryptRounds);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashed_new_password' },
      });
    });
  });

  describe('verifyPassword', () => {
    const user: User = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      lastAccess: new Date(),
      permissions: ['users.read'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return true for a correct password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.verifyPassword(user, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
    });

    it('should return false for an incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.verifyPassword(user, 'wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      const existingUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastAccess: new Date(),
        permissions: ['users.read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      const result = await userService.delete('user-123');

      expect(result).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should return false if user to delete is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await userService.delete('non-existent-id');

      expect(result).toBe(false);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('updateLastAccess', () => {
    it('should update the lastAccess field of a user', async () => {
      await userService.updateLastAccess('user-123');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { lastAccess: expect.any(Date) },
      });
    });
  });

  describe('findActiveUsers', () => {
    it('should return only active users', async () => {
      const activeUsers: User[] = [
        { id: 'user-1', isActive: true, email: 'a@a.com', username: 'a', password: 'a', firstName: 'a', lastName: 'a', lastAccess: new Date(), permissions: [], createdAt: new Date(), updatedAt: new Date() },
        { id: 'user-2', isActive: true, email: 'b@b.com', username: 'b', password: 'b', firstName: 'b', lastName: 'b', lastAccess: new Date(), permissions: [], createdAt: new Date(), updatedAt: new Date() },
      ];
      prismaMock.user.findMany.mockResolvedValue(activeUsers);

      const users = await userService.findActiveUsers();

      expect(users.length).toBe(2);
      expect(users.every(u => u.isActive)).toBe(true);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findAllWithFilters', () => {
    it('should call findMany with correct filters', async () => {
      const options = {
        filters: { isActive: true },
        search: 'test',
        limit: 10,
        offset: 0,
      };
      prismaMock.user.findMany.mockResolvedValue([]);

      await userService.findAllWithFilters(options);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { username: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
            { firstName: { contains: 'test', mode: 'insensitive' } },
            { lastName: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('countUsers', () => {
    it('should call count with correct filters', async () => {
      prismaMock.user.count.mockResolvedValue(5);

      const count = await userService.countUsers({ isActive: true }, 'test');

      expect(count).toBe(5);
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { username: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
            { firstName: { contains: 'test', mode: 'insensitive' } },
            { lastName: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user and return the user', async () => {
      const existingUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        lastAccess: new Date(),
        permissions: ['users.read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const deletedUser = { ...existingUser, isActive: false };
      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.user.update.mockResolvedValue(deletedUser);

      const result = await userService.softDelete('user-123');

      expect(result).toEqual(deletedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should return null if user to soft delete is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await userService.softDelete('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call findMany and count with correct parameters', async () => {
      const options = { page: 1, limit: 10, search: 'test', isActive: true };
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await userService.findAll(options);

      const expectedWhere = {
        isActive: true,
        OR: [
          { username: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } },
          { firstName: { contains: 'test', mode: 'insensitive' } },
          { lastName: { contains: 'test', mode: 'insensitive' } },
        ],
      };

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });

      expect(prismaMock.user.count).toHaveBeenCalledWith({ where: expectedWhere });
    });
  });
});

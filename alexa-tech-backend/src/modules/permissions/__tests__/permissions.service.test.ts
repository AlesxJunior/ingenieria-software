import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionsService } from '../permissions.service';
import { PermissionUtils } from '../../../utils/permissions';
import { userService } from '../../../services/userService';

// Mock dependencies
vi.mock('../../../utils/permissions', () => ({
  PermissionUtils: {
    getAvailablePermissions: vi.fn(),
    isValidPermission: vi.fn(),
    hasAllPermissions: vi.fn(),
    hasAnyPermission: vi.fn(),
    hasPermission: vi.fn(),
    filterValidPermissions: vi.fn(),
  },
}));

vi.mock('../../../services/userService', () => ({
  userService: {
    findById: vi.fn(),
  },
}));

const PermissionUtilsMock = PermissionUtils as any;
const userServiceMock = userService as any;

describe('PermissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPermissions', () => {
    const mockPermissions = [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'products.create',
      'products.read',
      'inventory.read',
      'inventory.update',
    ];

    it('should return all permissions with grouped structure', () => {
      // Arrange
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue(
        mockPermissions,
      );

      // Act
      const result = PermissionsService.getAllPermissions();

      // Assert
      expect(PermissionUtilsMock.getAvailablePermissions).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual({
        permissions: mockPermissions,
        groupedPermissions: {
          users: ['users.create', 'users.read', 'users.update', 'users.delete'],
          products: ['products.create', 'products.read'],
          inventory: ['inventory.read', 'inventory.update'],
        },
        totalCount: 8,
      });
    });

    it('should return empty structure when no permissions available', () => {
      // Arrange
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue([]);

      // Act
      const result = PermissionsService.getAllPermissions();

      // Assert
      expect(result).toEqual({
        permissions: [],
        groupedPermissions: {},
        totalCount: 0,
      });
    });

    it('should handle permissions without category correctly', () => {
      // Arrange
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue([
        'users.read',
        'invalid_permission', // Sin punto - se agrupa bajo su propio nombre
      ]);

      // Act
      const result = PermissionsService.getAllPermissions();

      // Assert
      expect(result.groupedPermissions).toEqual({
        users: ['users.read'],
        invalid_permission: ['invalid_permission'],
      });
      expect(result.totalCount).toBe(2);
    });
  });

  describe('getPermissionsByCategory', () => {
    it('should return permissions grouped by category', () => {
      // Arrange
      const mockPermissions = [
        'users.create',
        'users.read',
        'products.create',
        'inventory.read',
      ];
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue(
        mockPermissions,
      );

      // Act
      const result = PermissionsService.getPermissionsByCategory();

      // Assert
      expect(result).toEqual({
        users: ['users.create', 'users.read'],
        products: ['products.create'],
        inventory: ['inventory.read'],
      });
    });

    it('should return empty object when no permissions available', () => {
      // Arrange
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue([]);

      // Act
      const result = PermissionsService.getPermissionsByCategory();

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('validatePermission', () => {
    it('should validate existing permission successfully', () => {
      // Arrange
      PermissionUtilsMock.isValidPermission.mockReturnValue(true);

      // Act
      const result = PermissionsService.validatePermission('users.read');

      // Assert
      expect(PermissionUtilsMock.isValidPermission).toHaveBeenCalledWith(
        'users.read',
      );
      expect(result).toEqual({
        permission: 'users.read',
        isValid: true,
        availablePermissions: undefined,
      });
    });

    it('should return available permissions when permission is invalid', () => {
      // Arrange
      const availablePermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.isValidPermission.mockReturnValue(false);
      PermissionUtilsMock.getAvailablePermissions.mockReturnValue(
        availablePermissions,
      );

      // Act
      const result = PermissionsService.validatePermission('invalid.permission');

      // Assert
      expect(result).toEqual({
        permission: 'invalid.permission',
        isValid: false,
        availablePermissions,
      });
    });

    it('should throw error when permission parameter is missing', () => {
      // Act & Assert
      expect(() => PermissionsService.validatePermission('')).toThrow(
        'Permiso requerido',
      );
    });
  });

  describe('validateUserPermissions', () => {
    it('should validate user has all required permissions (requireAll=true)', () => {
      // Arrange
      const userPermissions = ['users.read', 'users.create', 'users.update'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAllPermissions.mockReturnValue(true);

      // Act
      const result = PermissionsService.validateUserPermissions(
        userPermissions,
        requiredPermissions,
        true,
      );

      // Assert
      expect(PermissionUtilsMock.hasAllPermissions).toHaveBeenCalledWith(
        userPermissions,
        requiredPermissions,
      );
      expect(result).toEqual({
        hasPermission: true,
        userPermissions,
        requiredPermissions,
        requireAll: true,
        missingPermissions: [],
      });
    });

    it('should validate user has any required permission (requireAll=false)', () => {
      // Arrange
      const userPermissions = ['users.read'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAnyPermission.mockReturnValue(true);

      // Act
      const result = PermissionsService.validateUserPermissions(
        userPermissions,
        requiredPermissions,
        false,
      );

      // Assert
      expect(PermissionUtilsMock.hasAnyPermission).toHaveBeenCalledWith(
        userPermissions,
        requiredPermissions,
      );
      expect(result).toEqual({
        hasPermission: true,
        userPermissions,
        requiredPermissions,
        requireAll: false,
        missingPermissions: undefined,
      });
    });

    it('should identify missing permissions when requireAll=true', () => {
      // Arrange
      const userPermissions = ['users.read'];
      const requiredPermissions = ['users.read', 'users.create', 'users.update'];
      PermissionUtilsMock.hasAllPermissions.mockReturnValue(false);

      // Act
      const result = PermissionsService.validateUserPermissions(
        userPermissions,
        requiredPermissions,
        true,
      );

      // Assert
      expect(result.hasPermission).toBe(false);
      expect(result.missingPermissions).toEqual(['users.create', 'users.update']);
    });

    it('should throw error when userPermissions is not an array', () => {
      // Act & Assert
      expect(() =>
        PermissionsService.validateUserPermissions(
          'not-an-array' as any,
          ['users.read'],
          false,
        ),
      ).toThrow('userPermissions y requiredPermissions deben ser arrays');
    });

    it('should throw error when requiredPermissions is not an array', () => {
      // Act & Assert
      expect(() =>
        PermissionsService.validateUserPermissions(
          ['users.read'],
          'not-an-array' as any,
          false,
        ),
      ).toThrow('userPermissions y requiredPermissions deben ser arrays');
    });

    it('should default to requireAll=false when not specified', () => {
      // Arrange
      const userPermissions = ['users.read'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAnyPermission.mockReturnValue(true);

      // Act
      const result = PermissionsService.validateUserPermissions(
        userPermissions,
        requiredPermissions,
      );

      // Assert
      expect(result.requireAll).toBe(false);
      expect(PermissionUtilsMock.hasAnyPermission).toHaveBeenCalled();
      expect(PermissionUtilsMock.hasAllPermissions).not.toHaveBeenCalled();
    });
  });

  describe('checkUserPermission', () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      permissions: ['users.read', 'users.create', 'products.read'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should verify user has specific permission successfully', async () => {
      // Arrange
      PermissionUtilsMock.isValidPermission.mockReturnValue(true);
      userServiceMock.findById.mockResolvedValue(mockUser);
      PermissionUtilsMock.hasPermission.mockReturnValue(true);

      // Act
      const result = await PermissionsService.checkUserPermission(
        'user-1',
        'users.read',
      );

      // Assert
      expect(PermissionUtilsMock.isValidPermission).toHaveBeenCalledWith(
        'users.read',
      );
      expect(userServiceMock.findById).toHaveBeenCalledWith('user-1');
      expect(PermissionUtilsMock.hasPermission).toHaveBeenCalledWith(
        mockUser.permissions,
        'users.read',
      );
      expect(result).toEqual({
        hasPermission: true,
        permissionId: 'users.read',
        isValidPermission: true,
        userId: 'user-1',
      });
    });

    it('should return false when user does not have permission', async () => {
      // Arrange
      PermissionUtilsMock.isValidPermission.mockReturnValue(true);
      userServiceMock.findById.mockResolvedValue(mockUser);
      PermissionUtilsMock.hasPermission.mockReturnValue(false);

      // Act
      const result = await PermissionsService.checkUserPermission(
        'user-1',
        'users.delete',
      );

      // Assert
      expect(result.hasPermission).toBe(false);
    });

    it('should throw error when userId is missing', async () => {
      // Act & Assert
      await expect(
        PermissionsService.checkUserPermission('', 'users.read'),
      ).rejects.toThrow('Usuario no autenticado');
    });

    it('should throw error when permissionId is missing', async () => {
      // Act & Assert
      await expect(
        PermissionsService.checkUserPermission('user-1', ''),
      ).rejects.toThrow('ID de permiso requerido');
    });

    it('should throw error when permission is invalid', async () => {
      // Arrange
      PermissionUtilsMock.isValidPermission.mockReturnValue(false);

      // Act & Assert
      await expect(
        PermissionsService.checkUserPermission('user-1', 'invalid.permission'),
      ).rejects.toThrow('Permiso no válido');
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      PermissionUtilsMock.isValidPermission.mockReturnValue(true);
      userServiceMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        PermissionsService.checkUserPermission('invalid-user', 'users.read'),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should handle user with no permissions array', async () => {
      // Arrange
      const userWithoutPermissions = { ...mockUser, permissions: undefined };
      PermissionUtilsMock.isValidPermission.mockReturnValue(true);
      userServiceMock.findById.mockResolvedValue(userWithoutPermissions);
      PermissionUtilsMock.hasPermission.mockReturnValue(false);

      // Act
      const result = await PermissionsService.checkUserPermission(
        'user-1',
        'users.read',
      );

      // Assert
      expect(PermissionUtilsMock.hasPermission).toHaveBeenCalledWith(
        [],
        'users.read',
      );
      expect(result.hasPermission).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      permissions: ['users.read', 'users.create', 'products.read'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user permissions successfully', async () => {
      // Arrange
      userServiceMock.findById.mockResolvedValue(mockUser);

      // Act
      const result = await PermissionsService.getUserPermissions('user-1');

      // Assert
      expect(userServiceMock.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser.permissions);
    });

    it('should return empty array when user has no permissions', async () => {
      // Arrange
      const userWithoutPermissions = { ...mockUser, permissions: undefined };
      userServiceMock.findById.mockResolvedValue(userWithoutPermissions);

      // Act
      const result = await PermissionsService.getUserPermissions('user-1');

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error when userId is missing', async () => {
      // Act & Assert
      await expect(PermissionsService.getUserPermissions('')).rejects.toThrow(
        'ID de usuario requerido',
      );
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      userServiceMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        PermissionsService.getUserPermissions('invalid-user'),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('filterValidPermissions', () => {
    it('should filter valid permissions from list', () => {
      // Arrange
      const permissions = [
        'users.read',
        'invalid.permission',
        'products.create',
      ];
      const validPermissions = ['users.read', 'products.create'];
      PermissionUtilsMock.filterValidPermissions.mockReturnValue(
        validPermissions,
      );

      // Act
      const result = PermissionsService.filterValidPermissions(permissions);

      // Assert
      expect(PermissionUtilsMock.filterValidPermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(result).toEqual(validPermissions);
    });

    it('should return empty array for invalid input', () => {
      // Arrange
      PermissionUtilsMock.filterValidPermissions.mockReturnValue([]);

      // Act
      const result = PermissionsService.filterValidPermissions([]);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      // Arrange
      const userPermissions = ['users.read', 'users.create', 'users.update'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAllPermissions.mockReturnValue(true);

      // Act
      const result = PermissionsService.hasAllPermissions(
        userPermissions,
        requiredPermissions,
      );

      // Assert
      expect(PermissionUtilsMock.hasAllPermissions).toHaveBeenCalledWith(
        userPermissions,
        requiredPermissions,
      );
      expect(result).toBe(true);
    });

    it('should return false when user is missing some permissions', () => {
      // Arrange
      const userPermissions = ['users.read'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAllPermissions.mockReturnValue(false);

      // Act
      const result = PermissionsService.hasAllPermissions(
        userPermissions,
        requiredPermissions,
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one required permission', () => {
      // Arrange
      const userPermissions = ['users.read'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAnyPermission.mockReturnValue(true);

      // Act
      const result = PermissionsService.hasAnyPermission(
        userPermissions,
        requiredPermissions,
      );

      // Assert
      expect(PermissionUtilsMock.hasAnyPermission).toHaveBeenCalledWith(
        userPermissions,
        requiredPermissions,
      );
      expect(result).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      // Arrange
      const userPermissions = ['products.read'];
      const requiredPermissions = ['users.read', 'users.create'];
      PermissionUtilsMock.hasAnyPermission.mockReturnValue(false);

      // Act
      const result = PermissionsService.hasAnyPermission(
        userPermissions,
        requiredPermissions,
      );

      // Assert
      expect(result).toBe(false);
    });
  });
});

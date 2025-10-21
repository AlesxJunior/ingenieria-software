import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserInfo from './UserInfo';
import AuthContext from '../context/AuthContext'; // Correct default import
import type { AuthContextType } from '../context/AuthContext';

// Define a minimal User type for testing purposes
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions?: string[];
}

describe('UserInfo Component', () => {
  it('should display username and initials when user is logged in', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      permissions: [],
    };

    // Mock the full context value, including functions
    const mockContextValue: AuthContextType = {
      user: mockUser,
      login: async (_email: string, _password: string) => true,
      logout: async () => {},
      isLoading: false,
      isAuthenticated: true,
      updateUser: (_userData) => {},
      hasPermission: (_permission: string) => true,
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <UserInfo />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Check for username
    expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();

    // Check link destination
    expect(screen.getByRole('link')).toHaveAttribute('href', '/perfil');

    // Check for initials in the avatar
    const initials = mockUser.username.substring(0, 2).toUpperCase();
    expect(screen.getByText(initials)).toBeInTheDocument();
  });

  it('should render nothing when user is not logged in', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: async (_email: string, _password: string) => true,
      logout: async () => {},
      isLoading: false,
      isAuthenticated: false,
      updateUser: (_userData) => {},
      hasPermission: (_permission: string) => false,
    };

    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <UserInfo />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull();
  });
});

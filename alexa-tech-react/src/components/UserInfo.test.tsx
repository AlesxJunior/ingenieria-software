import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserInfo from './UserInfo';
import AuthContext from '../context/AuthContext'; // Correct default import

// Define a minimal User type for testing purposes
interface User {
  id: string;
  username: string;
  email: string;
  permissions?: string[];
}

describe('UserInfo Component', () => {
  it('should display username and initials when user is logged in', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      permissions: [],
    };

    // Mock the full context value, including functions
    const mockContextValue = {
      user: mockUser,
      login: async () => true,
      logout: async () => {},
      isLoading: false,
      isAuthenticated: true,
      updateUser: () => {},
      hasPermission: () => true,
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

    // Check for initials in the avatar
    const initials = mockUser.username.substring(0, 2).toUpperCase();
    expect(screen.getByText(initials)).toBeInTheDocument();
  });

  it('should render nothing when user is not logged in', () => {
    const mockContextValue = {
      user: null,
      login: async () => true,
      logout: async () => {},
      isLoading: false,
      isAuthenticated: false,
      updateUser: () => {},
      hasPermission: () => false,
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

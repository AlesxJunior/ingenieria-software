import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { ModalProvider } from './ModalContext';
import { UIProvider } from './UIContext';
import { ProductProvider } from './ProductContext';
import { ClientProvider } from './ClientContext';
import { SalesProvider } from './SalesContext';

/**
 * AppProvider es un componente que anida todos los proveedores de contexto de la aplicación.
 * Esto simplifica el árbol de componentes en App.tsx y centraliza la gestión de contextos.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
          <UIProvider>
            <ProductProvider>
              <ClientProvider>
                <SalesProvider>
                  {children}
                </SalesProvider>
              </ClientProvider>
            </ProductProvider>
          </UIProvider>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

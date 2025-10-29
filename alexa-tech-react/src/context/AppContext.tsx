import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { ModalProvider } from './ModalContext';
import { UIProvider } from './UIContext';
import { ProductProvider } from './ProductContext';
import { ClientProvider } from './ClientContext';
import { SalesProvider } from './SalesContext';
import { InventoryProvider } from './InventoryContext';

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
                <InventoryProvider>
                  <SalesProvider>
                    {children}
                  </SalesProvider>
                </InventoryProvider>
              </ClientProvider>
            </ProductProvider>
          </UIProvider>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

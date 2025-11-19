import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ConfiguracionContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  empresa: any;
  setEmpresa: React.Dispatch<React.SetStateAction<any>>;
  comprobantes: any[];
  setComprobantes: React.Dispatch<React.SetStateAction<any[]>>;
  metodosPago: any[];
  setMetodosPago: React.Dispatch<React.SetStateAction<any[]>>;
}

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export const ConfiguracionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState<any>(null);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);

  return (
    <ConfiguracionContext.Provider
      value={{
        loading,
        setLoading,
        empresa,
        setEmpresa,
        comprobantes,
        setComprobantes,
        metodosPago,
        setMetodosPago,
      }}
    >
      {children}
    </ConfiguracionContext.Provider>
  );
};

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error('useConfiguracion debe ser usado dentro de ConfiguracionProvider');
  }
  return context;
};
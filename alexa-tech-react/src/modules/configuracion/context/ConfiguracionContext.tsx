import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import configuracionApi, { type EmpresaData, type ComprobanteData, type MetodoPagoData } from '../services/configuracionApi';

interface ConfiguracionContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  empresa: EmpresaData | null;
  setEmpresa: React.Dispatch<React.SetStateAction<EmpresaData | null>>;
  comprobantes: ComprobanteData[];
  setComprobantes: React.Dispatch<React.SetStateAction<ComprobanteData[]>>;
  metodosPago: MetodoPagoData[];
  setMetodosPago: React.Dispatch<React.SetStateAction<MetodoPagoData[]>>;
  // ✅ Funciones para recargar datos
  reloadEmpresa: () => Promise<void>;
  reloadComprobantes: () => Promise<void>;
  reloadMetodosPago: () => Promise<void>;
  reloadAll: () => Promise<void>;
}

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export const ConfiguracionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [comprobantes, setComprobantes] = useState<ComprobanteData[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoData[]>([]);

  // ✅ Cargar empresa
  const reloadEmpresa = async () => {
    try {
      const data = await configuracionApi.getEmpresa();
      setEmpresa(data);
    } catch (error) {
      console.error('Error al cargar empresa:', error);
    }
  };

  // ✅ Cargar comprobantes
  const reloadComprobantes = async () => {
    try {
      const data = await configuracionApi.getComprobantes();
      setComprobantes(data);
      console.log('🔄 Comprobantes recargados en Context:', data.length);
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
    }
  };

  // ✅ Cargar métodos de pago
  const reloadMetodosPago = async () => {
    try {
      const data = await configuracionApi.getMetodosPago();
      setMetodosPago(data);
      console.log('🔄 Métodos de pago recargados en Context:', data.length);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  // ✅ Recargar todo
  const reloadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        reloadEmpresa(),
        reloadComprobantes(),
        reloadMetodosPago(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Carga inicial (solo si hay token)
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      reloadAll();
    }
  }, []);

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
        reloadEmpresa,
        reloadComprobantes,
        reloadMetodosPago,
        reloadAll,
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
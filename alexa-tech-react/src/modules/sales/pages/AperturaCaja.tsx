import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AperturaCaja - Redirige a GestionCaja
 * 
 * Este componente simplemente redirige a /gestion-caja donde está
 * implementada toda la funcionalidad de apertura/cierre de caja.
 * Mantenemos esta ruta por compatibilidad con el menú de navegación.
 */
const AperturaCaja: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a Gestión de Caja que tiene la funcionalidad completa
    navigate('/gestion-caja', { replace: true });
  }, [navigate]);

  // No renderizar nada durante la redirección
  return null;
};

export default AperturaCaja;

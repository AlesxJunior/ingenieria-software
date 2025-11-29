import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../utils/api';

// ============================================
// INTERFACES
// ============================================

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (clientId: string, clientData: ClientFormData) => void;
  initialSearchTerm?: string;
  defaultTipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
}

interface ClientFormData {
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'RUC' | 'CE' | 'Pasaporte';
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  direccion: string;
}

interface SunatRucData {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  estado: string;
  condicion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

interface ReniecDniData {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface Departamento { id: string; nombre: string; }
interface Provincia { id: string; nombre: string; departamentoId: string; }
interface Distrito { id: string; nombre: string; provinciaId: string; }

// ============================================
// STYLED COMPONENTS
// ============================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const DocumentSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const DocumentTypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const DocumentTypeButton = styled.button<{ $selected?: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  color: ${props => props.$selected ? '#1d4ed8' : '#6b7280'};
  font-weight: ${props => props.$selected ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const DocumentInputRow = styled.div`
  display: flex;
  gap: 10px;
`;

const DocumentInput = styled.input`
  flex: 1;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1.1rem;
  letter-spacing: 1px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
    letter-spacing: normal;
  }
`;

const SearchButton = styled.button<{ $loading?: boolean }>`
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;

  ${props => props.$type === 'success' && `
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
  `}

  ${props => props.$type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  `}

  ${props => props.$type === 'info' && `
    background: #e0f2fe;
    color: #075985;
    border: 1px solid #7dd3fc;
  `}
`;

const FormGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const FormRow = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 2 ? '1fr 1fr' : props.$columns === 3 ? '1fr 1fr 1fr' : '1fr'};
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:read-only {
    background: #f9fafb;
    color: #6b7280;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.95rem;
  color: #374151;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.8rem;
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #e5e7eb;
    color: #6b7280;

    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerDark = styled(Spinner)`
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
`;

// ============================================
// COMPONENT
// ============================================

export const QuickClientModal: React.FC<QuickClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
  initialSearchTerm,
  defaultTipoEntidad,
}) => {
  // Estados del formulario
  const [tipoEntidad, setTipoEntidad] = useState<'Cliente' | 'Proveedor' | 'Ambos'>(defaultTipoEntidad || 'Cliente');
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'RUC' | 'CE' | 'Pasaporte'>('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Estados de ubigeo
  const [departamentoId, setDepartamentoId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [distritoId, setDistritoId] = useState('');
  
  // Datos de ubigeo
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  // Estados de UI
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchStatus, setSearchStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [dataFound, setDataFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar departamentos
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadDeps = async () => {
      setLoadingDeps(true);
      try {
        const res = await apiService.getDepartamentos();
        if (res.success && res.data && active) {
          setDepartamentos(res.data);
        }
      } catch (err) {
        console.error('Error cargando departamentos:', err);
      }
      setLoadingDeps(false);
    };
    loadDeps();
    return () => { active = false; };
  }, [isOpen]);

  // Cargar provincias cuando cambia departamento
  useEffect(() => {
    if (!departamentoId) {
      setProvincias([]);
      setDistritos([]);
      return;
    }
    let active = true;
    const loadProv = async () => {
      setLoadingProv(true);
      try {
        const res = await apiService.getProvincias(departamentoId);
        if (res.success && res.data && active) {
          setProvincias(res.data);
        }
      } catch (err) {
        console.error('Error cargando provincias:', err);
      }
      setLoadingProv(false);
    };
    loadProv();
    return () => { active = false; };
  }, [departamentoId]);

  // Cargar distritos cuando cambia provincia
  useEffect(() => {
    if (!provinciaId) {
      setDistritos([]);
      return;
    }
    let active = true;
    const loadDist = async () => {
      setLoadingDist(true);
      try {
        const res = await apiService.getDistritos(provinciaId);
        if (res.success && res.data && active) {
          setDistritos(res.data);
        }
      } catch (err) {
        console.error('Error cargando distritos:', err);
      }
      setLoadingDist(false);
    };
    loadDist();
    return () => { active = false; };
  }, [provinciaId]);

  // Auto-seleccionar ubigeo por nombre (desde SUNAT)
  const autoSelectUbigeo = useCallback(async (depName?: string, provName?: string, distName?: string) => {
    if (!depName) return;
    
    console.log('🔍 autoSelectUbigeo llamado con:', { depName, provName, distName });
    
    // Función helper para normalizar texto (quitar tildes y caracteres especiales)
    const normalize = (text: string) => {
      return text
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .replace(/Ñ/g, 'N');
    };
    
    // Cargar departamentos si no están disponibles
    let deps = departamentos;
    if (deps.length === 0) {
      console.log('📡 Cargando departamentos...');
      const resDeps = await apiService.getDepartamentos();
      if (resDeps.success && resDeps.data) {
        deps = resDeps.data;
        setDepartamentos(deps);
      } else {
        console.error('❌ Error cargando departamentos');
        return;
      }
    }
    
    // Buscar departamento por nombre
    const depNormalized = normalize(depName);
    console.log('🔎 Buscando departamento:', depNormalized);
    const foundDep = deps.find(d => {
      const dNorm = normalize(d.nombre);
      return dNorm.includes(depNormalized) || depNormalized.includes(dNorm);
    });
    
    if (foundDep) {
      console.log('✅ Departamento encontrado:', foundDep.nombre, foundDep.id);
      setDepartamentoId(foundDep.id);
      
      // Cargar provincias y buscar
      if (provName) {
        const resP = await apiService.getProvincias(foundDep.id);
        if (resP.success && resP.data) {
          setProvincias(resP.data);
          const provNormalized = normalize(provName);
          console.log('🔎 Buscando provincia:', provNormalized);
          const foundProv = resP.data.find((p: Provincia) => {
            const pNorm = normalize(p.nombre);
            return pNorm.includes(provNormalized) || provNormalized.includes(pNorm);
          });
          
          if (foundProv) {
            console.log('✅ Provincia encontrada:', foundProv.nombre, foundProv.id);
            setProvinciaId(foundProv.id);
            
            // Cargar distritos y buscar
            if (distName) {
              const resD = await apiService.getDistritos(foundProv.id);
              if (resD.success && resD.data) {
                setDistritos(resD.data);
                const distNormalized = normalize(distName);
                console.log('🔎 Buscando distrito:', distNormalized);
                const foundDist = resD.data.find((d: Distrito) => {
                  const dNorm = normalize(d.nombre);
                  return dNorm.includes(distNormalized) || distNormalized.includes(dNorm);
                });
                if (foundDist) {
                  console.log('✅ Distrito encontrado:', foundDist.nombre, foundDist.id);
                  setDistritoId(foundDist.id);
                } else {
                  console.log('⚠️ Distrito no encontrado:', distNormalized);
                  console.log('   Distritos disponibles:', resD.data.map((d: Distrito) => d.nombre).join(', '));
                }
              }
            }
          } else {
            console.log('⚠️ Provincia no encontrada:', provNormalized);
            console.log('   Provincias disponibles:', resP.data.map((p: Provincia) => p.nombre).join(', '));
          }
        }
      }
    } else {
      console.log('⚠️ Departamento no encontrado:', depNormalized);
    }
  }, [departamentos]);

  // Pre-rellenar documento si se proporciona
  useEffect(() => {
    if (isOpen && initialSearchTerm) {
      // Detectar si es RUC (11 dígitos) o DNI (8 dígitos)
      const cleanTerm = initialSearchTerm.replace(/\D/g, '');
      if (cleanTerm.length === 11) {
        setTipoDocumento('RUC');
        setNumeroDocumento(cleanTerm);
        // Auto-buscar RUC después de 200ms
        setTimeout(() => {
          console.log('🔍 Auto-buscando RUC:', cleanTerm);
          handleSearch();
        }, 200);
      } else if (cleanTerm.length === 8) {
        setTipoDocumento('DNI');
        setNumeroDocumento(cleanTerm);
        // Auto-buscar DNI después de 200ms
        setTimeout(() => {
          console.log('🔍 Auto-buscando DNI:', cleanTerm);
          handleSearch();
        }, 200);
      } else {
        setNumeroDocumento(initialSearchTerm);
      }
    }
  }, [isOpen, initialSearchTerm]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setTipoDocumento('DNI');
      setNumeroDocumento('');
      setNombres('');
      setApellidos('');
      setRazonSocial('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setDepartamentoId('');
      setProvinciaId('');
      setDistritoId('');
      setSearchStatus(null);
      setDataFound(false);
      setErrors({});
    }
  }, [isOpen]);

  // Buscar en SUNAT/RENIEC
  const handleSearch = async () => {
    const doc = numeroDocumento.trim();
    
    // Validaciones
    if (tipoDocumento === 'DNI' && doc.length !== 8) {
      setSearchStatus({ type: 'error', message: 'El DNI debe tener 8 dígitos' });
      return;
    }
    if (tipoDocumento === 'RUC' && doc.length !== 11) {
      setSearchStatus({ type: 'error', message: 'El RUC debe tener 11 dígitos' });
      return;
    }

    setIsSearching(true);
    setSearchStatus(null);

    try {
      const endpoint = tipoDocumento === 'RUC' 
        ? `/sunat/ruc/${doc}` 
        : `/sunat/dni/${doc}`;

      const response = await apiService.get<any>(endpoint);

      if (response.success && response.data) {
        if (tipoDocumento === 'RUC') {
          const data = response.data as SunatRucData;
          setRazonSocial(data.razonSocial || '');
          setDireccion(data.direccion || '');
          
          // Autocompletar ubigeo desde SUNAT
          if (data.departamento || data.provincia || data.distrito) {
            autoSelectUbigeo(data.departamento, data.provincia, data.distrito);
          }
          
          setSearchStatus({ 
            type: 'success', 
            message: `✅ Empresa encontrada: ${data.razonSocial}` 
          });
        } else {
          const data = response.data as ReniecDniData;
          setNombres(data.nombres || '');
          setApellidos(`${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim());
          setSearchStatus({ 
            type: 'success', 
            message: `✅ Persona encontrada: ${data.nombres} ${data.apellidoPaterno}` 
          });
        }
        setDataFound(true);
      } else {
        setSearchStatus({ 
          type: 'error', 
          message: response.message || 'No se encontró información' 
        });
        setDataFound(false);
      }
    } catch (error: any) {
      console.error('Error al buscar:', error);
      setSearchStatus({ 
        type: 'error', 
        message: error.message || 'Error al conectar con el servicio' 
      });
      setDataFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'Requerido';
    } else {
      if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(numeroDocumento)) {
        newErrors.numeroDocumento = 'DNI debe tener 8 dígitos';
      }
      if (tipoDocumento === 'RUC' && !/^\d{11}$/.test(numeroDocumento)) {
        newErrors.numeroDocumento = 'RUC debe tener 11 dígitos';
      }
    }

    if (tipoDocumento === 'RUC') {
      if (!razonSocial.trim()) newErrors.razonSocial = 'Razón social requerida';
    } else {
      if (!nombres.trim()) newErrors.nombres = 'Nombres requeridos';
      if (!apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';
    }

    if (!email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!telefono.trim()) {
      newErrors.telefono = 'Teléfono requerido';
    } else if (!/^\d{9}$/.test(telefono)) {
      newErrors.telefono = 'Debe tener 9 dígitos';
    }

    if (!direccion.trim()) newErrors.direccion = 'Dirección requerida';
    if (!departamentoId) newErrors.departamentoId = 'Seleccione departamento';
    if (!provinciaId) newErrors.provinciaId = 'Seleccione provincia';
    if (!distritoId) newErrors.distritoId = 'Seleccione distrito';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cliente
  const handleSave = async () => {
    if (!validateForm()) {
      setSearchStatus({ type: 'error', message: 'Por favor complete todos los campos requeridos' });
      return;
    }

    setIsSaving(true);
    setSearchStatus(null);

    try {
      const clientData = {
        tipoEntidad: 'Cliente' as const,
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        ...(tipoDocumento === 'RUC' 
          ? { razonSocial: razonSocial.trim() }
          : { 
              nombres: nombres.trim(), 
              apellidos: apellidos.trim() 
            }
        ),
        email: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        departamentoId,
        provinciaId,
        distritoId,
        isActive: true,
      };

      const response = await apiService.createClient(clientData);

      if (response.success && response.data) {
        setSearchStatus({ type: 'success', message: '✅ Cliente creado exitosamente' });
        
        // El backend devuelve { client: newClient }
        const clientId = response.data.client?.id || response.data.id;
        console.log('📤 QuickClientModal: Llamando onClientCreated con ID:', clientId);
        console.log('📦 Response completo:', response.data);
        
        // Llamar callback inmediatamente (el padre maneja el cierre del modal)
        onClientCreated(clientId, {
          tipoDocumento,
          numeroDocumento: numeroDocumento.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          razonSocial: razonSocial.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
        });
      } else {
        throw new Error(response.message || 'Error al crear cliente');
      }
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      setSearchStatus({ 
        type: 'error', 
        message: error.message || 'Error al guardar el cliente' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Validar si puede guardar
  const canSave = tipoDocumento === 'RUC'
    ? numeroDocumento.trim().length === 11 && razonSocial.trim().length > 0 && departamentoId && provinciaId && distritoId
    : numeroDocumento.trim().length >= 6 && nombres.trim().length > 0 && departamentoId && provinciaId && distritoId;

  // Validar documento para búsqueda (solo DNI y RUC)
  const canSearch = (tipoDocumento === 'DNI' && numeroDocumento.length === 8) ||
                    (tipoDocumento === 'RUC' && numeroDocumento.length === 11);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <div>
            <h2>👤 Crear Cliente Rápido</h2>
            <p>Busca con DNI o RUC para autocompletar</p>
          </div>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <DocumentSection>
            <DocumentTypeSelector>
              <DocumentTypeButton
                $selected={tipoDocumento === 'DNI'}
                onClick={() => { setTipoDocumento('DNI'); setNumeroDocumento(''); setDataFound(false); }}
              >
                🪪 DNI
              </DocumentTypeButton>
              <DocumentTypeButton
                $selected={tipoDocumento === 'RUC'}
                onClick={() => { setTipoDocumento('RUC'); setNumeroDocumento(''); setDataFound(false); }}
              >
                🏢 RUC
              </DocumentTypeButton>
              <DocumentTypeButton
                $selected={tipoDocumento === 'CE'}
                onClick={() => { setTipoDocumento('CE'); setNumeroDocumento(''); setDataFound(false); }}
              >
                🌍 CE
              </DocumentTypeButton>
              <DocumentTypeButton
                $selected={tipoDocumento === 'Pasaporte'}
                onClick={() => { setTipoDocumento('Pasaporte'); setNumeroDocumento(''); setDataFound(false); }}
              >
                🛂 Pasaporte
              </DocumentTypeButton>
            </DocumentTypeSelector>

            <DocumentInputRow>
              <DocumentInput
                type="text"
                placeholder={
                  tipoDocumento === 'DNI' ? '8 dígitos...' :
                  tipoDocumento === 'RUC' ? '11 dígitos...' :
                  tipoDocumento === 'CE' ? 'Carnet de extranjería...' :
                  'Número de pasaporte...'
                }
                value={numeroDocumento}
                onChange={(e) => {
                  // Pasaporte permite alfanumérico, los demás solo números
                  const val = tipoDocumento === 'Pasaporte' 
                    ? e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                    : e.target.value.replace(/\D/g, '');
                  const max = tipoDocumento === 'RUC' ? 11 : tipoDocumento === 'DNI' ? 8 : 20;
                  setNumeroDocumento(val.slice(0, max));
                  setDataFound(false);
                }}
                maxLength={tipoDocumento === 'RUC' ? 11 : tipoDocumento === 'DNI' ? 8 : 20}
              />
              {(tipoDocumento === 'DNI' || tipoDocumento === 'RUC') && (
                <SearchButton
                  onClick={handleSearch}
                  disabled={!canSearch || isSearching}
                  $loading={isSearching}
                >
                  {isSearching ? (
                    <>
                      <SpinnerDark /> Buscando...
                    </>
                  ) : (
                    <>🔍 Buscar</>
                  )}
                </SearchButton>
              )}
            </DocumentInputRow>

            {searchStatus && (
              <StatusMessage $type={searchStatus.type}>
                {searchStatus.message}
              </StatusMessage>
            )}
          </DocumentSection>

          <FormGrid>
            <SectionTitle>🏷️ Tipo de Entidad</SectionTitle>
            <FormGroup>
              <Label>¿Qué tipo de entidad es? *</Label>
              <Select
                value={tipoEntidad}
                onChange={(e) => setTipoEntidad(e.target.value as 'Cliente' | 'Proveedor' | 'Ambos')}
              >
                <option value="Cliente">Cliente</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Ambos">Ambos (Cliente y Proveedor)</option>
              </Select>
            </FormGroup>

            <SectionTitle>📋 Datos {tipoDocumento === 'RUC' ? 'de la Empresa' : 'Personales'}</SectionTitle>
            
            {tipoDocumento === 'RUC' ? (
              <FormGroup>
                <Label>Razón Social *</Label>
                <Input
                  type="text"
                  placeholder="Nombre de la empresa..."
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  readOnly={dataFound}
                />
                {errors.razonSocial && <ErrorText>{errors.razonSocial}</ErrorText>}
              </FormGroup>
            ) : (
              <FormRow $columns={2}>
                <FormGroup>
                  <Label>Nombres *</Label>
                  <Input
                    type="text"
                    placeholder="Nombres..."
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    readOnly={dataFound && tipoDocumento === 'DNI'}
                  />
                  {errors.nombres && <ErrorText>{errors.nombres}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <Label>Apellidos *</Label>
                  <Input
                    type="text"
                    placeholder="Apellidos..."
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    readOnly={dataFound && tipoDocumento === 'DNI'}
                  />
                  {errors.apellidos && <ErrorText>{errors.apellidos}</ErrorText>}
                </FormGroup>
              </FormRow>
            )}

            <FormRow $columns={2}>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>Teléfono *</Label>
                <Input
                  type="tel"
                  placeholder="999 999 999"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                />
                {errors.telefono && <ErrorText>{errors.telefono}</ErrorText>}
              </FormGroup>
            </FormRow>

            {/* Dirección y Ubigeo */}
            <SectionTitle>📍 Ubicación</SectionTitle>

            <FormGroup>
              <Label>Dirección *</Label>
              <Input
                type="text"
                placeholder="Dirección fiscal..."
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                readOnly={dataFound && tipoDocumento === 'RUC'}
              />
              {errors.direccion && <ErrorText>{errors.direccion}</ErrorText>}
            </FormGroup>

            <FormRow $columns={3}>
              <FormGroup>
                <Label>Departamento *</Label>
                <Select
                  value={departamentoId}
                  onChange={(e) => {
                    setDepartamentoId(e.target.value);
                    setProvinciaId('');
                    setDistritoId('');
                  }}
                  disabled={loadingDeps}
                  $hasError={!!errors.departamentoId}
                >
                  <option value="">Seleccione...</option>
                  {departamentos.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                  ))}
                </Select>
                {errors.departamentoId && <ErrorText>{errors.departamentoId}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Provincia *</Label>
                <Select
                  value={provinciaId}
                  onChange={(e) => {
                    setProvinciaId(e.target.value);
                    setDistritoId('');
                  }}
                  disabled={!departamentoId || loadingProv}
                  $hasError={!!errors.provinciaId}
                >
                  <option value="">Seleccione...</option>
                  {provincias.map(prov => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </Select>
                {errors.provinciaId && <ErrorText>{errors.provinciaId}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>Distrito *</Label>
                <Select
                  value={distritoId}
                  onChange={(e) => setDistritoId(e.target.value)}
                  disabled={!provinciaId || loadingDist}
                  $hasError={!!errors.distritoId}
                >
                  <option value="">Seleccione...</option>
                  {distritos.map(dist => (
                    <option key={dist.id} value={dist.id}>{dist.nombre}</option>
                  ))}
                </Select>
                {errors.distritoId && <ErrorText>{errors.distritoId}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormGrid>
        </ModalBody>

        <ModalFooter>
          <Button $variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? (
              <>
                <Spinner /> Guardando...
              </>
            ) : (
              <>✅ Crear Cliente</>
            )}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default QuickClientModal;

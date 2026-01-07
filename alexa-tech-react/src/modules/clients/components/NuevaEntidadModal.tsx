import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../context/ClientContext';
import UbigeoSelector from './UbigeoSelector';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, Z_INDEX } from '../../../styles/theme';
import { Button, ButtonGroup, Label } from '../../../components/shared';

interface ClienteFormData {
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
  numeroDocumento: string;
  // Campos para DNI y CE
  nombres?: string;
  apellidos?: string;
  // Campo para RUC
  razonSocial?: string;
  // Campos comunes
  email: string;
  telefono: string;
  direccion: string;
  // Ubigeo
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface FormErrors {
  [key: string]: string;
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

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.modal};
`;

const ModalContent = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xxl};
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${SHADOWS.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xxl};
`;

const Title = styled.h2`
  color: ${COLORS.text.primary};
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const Form = styled.form`
  display: grid;
  gap: ${SPACING.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: ${SPACING.sm};
  border: 2px solid ${props => props.$hasError ? COLORS.status.danger : COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.md};
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.status.danger : COLOR_SCALES.primary[500]};
  }
`;

const SearchButton = styled.button<{ $loading?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.lg};
  background: linear-gradient(135deg, ${COLORS.status.success} 0%, #059669 100%);
  color: ${COLORS.neutral.white};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  transition: all 0.2s;
  min-width: 140px;
  justify-content: center;
  font-size: ${TYPOGRAPHY.fontSize.sm};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SearchButtonRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${SPACING.md};
  
  > div:first-child {
    flex: 1;
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: ${SPACING.md};
  border-radius: ${BORDER_RADIUS.md};
  margin-top: ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};

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

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 1.5rem 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 0.5rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${SPACING.sm};
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.md};
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
  }

  &:disabled {
    background: ${COLORS.neutral[100]};
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: ${SPACING.sm};
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.md};
  transition: border-color 0.2s;
  width: 100%;
  background: ${COLORS.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
  }

  &:disabled {
    background: ${COLORS.neutral[100]};
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: ${COLORS.neutral[200]};
  color: ${COLORS.text.primary};
  border: none;
  padding: ${SPACING.sm} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.md};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.neutral[300]};
  }
`;

const ErrorMessage = styled.span`
  color: ${COLORS.danger};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin-top: ${SPACING.xs};
`;

const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useNotification();
  const { addClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estados de búsqueda
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [dataFound, setDataFound] = useState(false);
  
  // Datos de ubigeo para autoselección
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [_provincias, setProvincias] = useState<Provincia[]>([]);
  const [_distritos, setDistritos] = useState<Distrito[]>([]);
  
  const [formData, setFormData] = useState<ClienteFormData>({
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    email: '',
    telefono: '',
    direccion: '',
    departamentoId: '',
    provinciaId: '',
    distritoId: ''
  });

  // Cargar departamentos al abrir modal
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadDeps = async () => {
      try {
        const res = await apiService.getDepartamentos();
        if (res.success && res.data && active) {
          setDepartamentos(res.data);
        }
      } catch (err) {
        console.error('Error cargando departamentos:', err);
      }
    };
    loadDeps();
    return () => { active = false; };
  }, [isOpen]);

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
      setFormData(prev => ({ ...prev, departamentoId: foundDep.id }));
      
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
            setFormData(prev => ({ ...prev, provinciaId: foundProv.id }));
            
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
                  setFormData(prev => ({ ...prev, distritoId: foundDist.id }));
                } else {
                  console.log('⚠️ Distrito no encontrado:', distNormalized);
                }
              }
            }
          } else {
            console.log('⚠️ Provincia no encontrada:', provNormalized);
          }
        }
      }
    } else {
      console.log('⚠️ Departamento no encontrado:', depNormalized);
    }
  }, [departamentos]);

  // Reset al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        razonSocial: '',
        email: '',
        telefono: '',
        direccion: '',
        departamentoId: '',
        provinciaId: '',
        distritoId: ''
      });
      setSearchStatus(null);
      setDataFound(false);
      setErrors({});
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Buscar en SUNAT/RENIEC
  const handleSearch = async () => {
    const doc = formData.numeroDocumento.trim();
    
    // Validaciones
    if (formData.tipoDocumento === 'DNI' && doc.length !== 8) {
      setSearchStatus({ type: 'error', message: 'El DNI debe tener 8 dígitos' });
      return;
    }
    if (formData.tipoDocumento === 'RUC' && doc.length !== 11) {
      setSearchStatus({ type: 'error', message: 'El RUC debe tener 11 dígitos' });
      return;
    }

    setIsSearching(true);
    setSearchStatus(null);

    try {
      const endpoint = formData.tipoDocumento === 'RUC' 
        ? `/sunat/ruc/${doc}` 
        : `/sunat/dni/${doc}`;

      const response = await apiService.get<any>(endpoint);

      if (response.success && response.data) {
        if (formData.tipoDocumento === 'RUC') {
          const data = response.data as SunatRucData;
          setFormData(prev => ({
            ...prev,
            razonSocial: data.razonSocial || '',
            direccion: data.direccion || ''
          }));
          
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
          setFormData(prev => ({
            ...prev,
            nombres: data.nombres || '',
            apellidos: `${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim()
          }));
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos según tipo de documento
    if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') {
      if (!formData.nombres?.trim()) {
        newErrors.nombres = 'Los nombres son requeridos';
      }
      if (!formData.apellidos?.trim()) {
        newErrors.apellidos = 'Los apellidos son requeridos';
      }
    } else if (formData.tipoDocumento === 'RUC') {
      if (!formData.razonSocial?.trim()) {
        newErrors.razonSocial = 'La razón social es requerida';
      }
    }

    // Validar número de documento
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
    } else {
      if (formData.tipoDocumento === 'DNI') {
        if (!/^\d{8}$/.test(formData.numeroDocumento)) {
          newErrors.numeroDocumento = 'El DNI debe tener 8 dígitos';
        }
      } else if (formData.tipoDocumento === 'CE') {
        if (!/^\d{12}$/.test(formData.numeroDocumento)) {
          newErrors.numeroDocumento = 'El CE debe tener 12 dígitos';
        }
      } else if (formData.tipoDocumento === 'RUC') {
        if (!/^\d{11}$/.test(formData.numeroDocumento)) {
          newErrors.numeroDocumento = 'El RUC debe tener 11 dígitos';
        }
      } else if (formData.tipoDocumento === 'Pasaporte') {
        if (!/^[A-Za-z][0-9]{7}$/.test(formData.numeroDocumento)) {
          newErrors.numeroDocumento = 'Formato: Letra + 7 dígitos (ej: A1234567)';
        }
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.departamentoId) {
      newErrors.departamentoId = 'El departamento es requerido';
    }

    if (!formData.provinciaId) {
      newErrors.provinciaId = 'La provincia es requerida';
    }

    if (!formData.distritoId) {
      newErrors.distritoId = 'El distrito es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let { value } = e.target as HTMLInputElement;

    // Si cambia el tipo de documento, limpiar campos específicos
    if (name === 'tipoDocumento') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'DNI' | 'CE' | 'RUC' | 'Pasaporte',
        nombres: '',
        apellidos: '',
        razonSocial: '',
        numeroDocumento: ''
      }));
      
      // Limpiar errores relacionados
      setErrors(prev => ({
        ...prev,
        nombres: '',
        apellidos: '',
        razonSocial: '',
        numeroDocumento: ''
      }));
      
      // Reset estado de búsqueda
      setSearchStatus(null);
      setDataFound(false);
    } else {
      // Sanitizar dígitos para documentos numéricos y normalización para Pasaporte
      if (name === 'numeroDocumento') {
        if (['DNI', 'CE', 'RUC'].includes(formData.tipoDocumento)) {
          value = value.replace(/\D+/g, '');
          const maxLen = formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 12 : 11;
          if (value.length > maxLen) value = value.slice(0, maxLen);
        } else if (formData.tipoDocumento === 'Pasaporte') {
          value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          if (value.length > 8) value = value.slice(0, 8);
        }
        // Reset estado de búsqueda al cambiar documento
        setDataFound(false);
        setSearchStatus(null);
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Construir datos del cliente según tipo de documento
      const clientData: any = {
        tipoEntidad: formData.tipoEntidad,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        departamentoId: formData.departamentoId || '',
        provinciaId: formData.provinciaId || '',
        distritoId: formData.distritoId || ''
      };

      // Agregar campos específicos según tipo de documento
      if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') {
        clientData.nombres = formData.nombres;
        clientData.apellidos = formData.apellidos;
      } else if (formData.tipoDocumento === 'RUC') {
        clientData.razonSocial = formData.razonSocial;
      }

      // Llamar al servicio real de creación de clientes
      await addClient(clientData);
      
      // Cerrar modal
      onClose();
      
      // Resetear formulario
      setFormData({
        tipoEntidad: 'Cliente',
        nombres: '',
        apellidos: '',
        razonSocial: '',
        email: '',
        telefono: '',
        direccion: '',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        departamentoId: '',
        provinciaId: '',
        distritoId: ''
      });
    } catch (error) {
      console.error('Error al registrar el cliente:', error);
      showNotification('error', 'Error', 'Error al registrar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Registrar Nueva Entidad Comercial</Title>
          <CloseButton onClick={onClose}>Cerrar</CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <SectionTitle>Documentación</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="tipoEntidad">Tipo de Entidad *</Label>
              <Select
                id="tipoEntidad"
                name="tipoEntidad"
                value={formData.tipoEntidad}
                onChange={handleInputChange}
              >
                <option value="Cliente">Cliente</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Ambos">Ambos</option>
              </Select>
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
              <Select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                $hasError={!!errors.tipoDocumento}
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="RUC">RUC</option>
              </Select>
              {errors.tipoDocumento && <ErrorMessage>{errors.tipoDocumento}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="numeroDocumento">
                Número de {formData.tipoDocumento === 'DNI' ? 'DNI' : 
                          formData.tipoDocumento === 'CE' ? 'Carnet de Extranjería' : 
                          formData.tipoDocumento === 'RUC' ? 'RUC' : formData.tipoDocumento === 'Pasaporte' ? 'Pasaporte' : 'Documento'} *
              </Label>
              <Input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                $hasError={!!errors.numeroDocumento}
                placeholder={
                  formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos' :
                  formData.tipoDocumento === 'CE' ? 'Ingrese 12 dígitos' :
                  formData.tipoDocumento === 'RUC' ? 'Ingrese 11 dígitos' :
                  formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' :
                  'Ingrese el número de documento'
                }
                pattern={formData.tipoDocumento === 'Pasaporte' ? '[A-Za-z][0-9]{7}' : undefined}
                title={formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' : undefined}
              />
              {errors.numeroDocumento && <ErrorMessage>{errors.numeroDocumento}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          {/* Búsqueda automática para DNI y RUC */}
          {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'RUC') && (
            <SearchButtonRow>
              <div>
                <SearchButton
                  type="button"
                  onClick={handleSearch}
                  disabled={
                    isSearching ||
                    (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length !== 8) ||
                    (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length !== 11)
                  }
                  $loading={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Spinner /> Buscando...
                    </>
                  ) : (
                    <>🔍 Buscar en {formData.tipoDocumento === 'RUC' ? 'SUNAT' : 'RENIEC'}</>
                  )}
                </SearchButton>
              </div>
            </SearchButtonRow>
          )}

          {searchStatus && (
            <StatusMessage $type={searchStatus.type}>
              {searchStatus.message}
            </StatusMessage>
          )}

          <SectionTitle>Información Personal</SectionTitle>
          
          {/* Campos para DNI, CE y Pasaporte */}
          {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') && (
            <FormRow>
              <FormGroup>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres || ''}
                  onChange={handleInputChange}
                  $hasError={!!errors.nombres}
                  placeholder="Ingrese los nombres"
                  readOnly={dataFound && formData.tipoDocumento === 'DNI'}
                />
                {errors.nombres && <ErrorMessage>{errors.nombres}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos || ''}
                  onChange={handleInputChange}
                  $hasError={!!errors.apellidos}
                  placeholder="Ingrese los apellidos"
                  readOnly={dataFound && formData.tipoDocumento === 'DNI'}
                />
                {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          )}

          {/* Campo para RUC */}
          {formData.tipoDocumento === 'RUC' && (
            <FormGroup>
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                type="text"
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial || ''}
                onChange={handleInputChange}
                $hasError={!!errors.razonSocial}
                placeholder="Ingrese la razón social"
                readOnly={dataFound && formData.tipoDocumento === 'RUC'}
              />
              {errors.razonSocial && <ErrorMessage>{errors.razonSocial}</ErrorMessage>}
            </FormGroup>
          )}

          <FormRow>
            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                $hasError={!!errors.email}
                placeholder="Ingrese el email"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                $hasError={!!errors.telefono}
                placeholder="Ingrese el teléfono (9 dígitos)"
              />
              {errors.telefono && <ErrorMessage>{errors.telefono}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <SectionTitle>Dirección</SectionTitle>

          <FormGroup>
            <Label htmlFor="direccion">Dirección *</Label>
            <TextArea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              $hasError={!!errors.direccion}
              placeholder="Ingrese la dirección completa"
              readOnly={dataFound && formData.tipoDocumento === 'RUC'}
            />
            {errors.direccion && <ErrorMessage>{errors.direccion}</ErrorMessage>}
          </FormGroup>

          <SectionTitle>Ubigeo</SectionTitle>

          <UbigeoSelector
            value={{
              departamentoId: formData.departamentoId,
              provinciaId: formData.provinciaId,
              distritoId: formData.distritoId,
            }}
            errors={{
              departamentoId: errors.departamentoId,
              provinciaId: errors.provinciaId,
              distritoId: errors.distritoId,
            }}
            onChange={(vals) => {
              setFormData(prev => ({
                ...prev,
                departamentoId: vals.departamentoId,
                provinciaId: vals.provinciaId,
                distritoId: vals.distritoId,
              }));
              setErrors(prev => ({
                ...prev,
                departamentoId: '',
                provinciaId: '',
                distritoId: '',
              }));
            }}
          />

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Entidad'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevoClienteModal;
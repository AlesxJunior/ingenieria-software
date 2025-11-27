import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useClients } from '../context/ClientContext';
import { useNotification } from '../context/NotificationContext';
import { media } from '../styles/breakpoints';
import UbigeoSelector from '../components/UbigeoSelector';
import { apiService } from '../utils/api';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  
  ${media.tablet} {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  ${media.mobile} {
    padding: 1rem;
    margin: 0 0.5rem;
    border-radius: 8px;
  }
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  
  ${media.tablet} {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  ${media.mobile} {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  ${media.tablet} {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  ${media.mobile} {
    gap: 0.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &:invalid {
    border-color: #e74c3c;
  }
  
  ${media.mobile} {
    padding: 0.875rem;
    font-size: 16px; /* Evita zoom en iOS */
    min-height: 44px; /* Tamaño mínimo de toque */
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
  
  ${media.mobile} {
    padding: 0.875rem;
    font-size: 16px; /* Evita zoom en iOS */
    min-height: 44px; /* Tamaño mínimo de toque */
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;

  ${media.tablet} {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  ${media.mobile} {
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  ${props => props.$variant === 'primary' ? `
    background: #3498db;
    color: white;

    &:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }
  ` : `
    background: #95a5a6;
    color: white;

    &:hover {
      background: #7f8c8d;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  ${media.mobile} {
    padding: 0.875rem 1.5rem;
    font-size: 16px;
    min-height: 48px; /* Tamaño mínimo de toque */
    min-width: 100%;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const SearchButton = styled.button<{ $loading?: boolean }>`
  padding: 0.75rem 1.5rem;
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
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${media.mobile} {
    padding: 0.875rem 1rem;
    font-size: 14px;
    min-height: 44px;
  }
`;

const DocumentInputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  
  ${media.mobile} {
    flex-direction: column;
  }
`;

const DocumentInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
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

interface SunatRucData {
  ruc: string;
  razonSocial: string;
  direccion?: string;
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

interface FormData {
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
  ciudad: string;
  // Ubigeo
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface FormErrors {
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  numeroDocumento?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  // Ubigeo
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

const RegistroEntidad: React.FC = () => {
  const navigate = useNavigate();
  const { addClient } = useClients();
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamentoId: '',
    provinciaId: '',
    distritoId: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [dataFound, setDataFound] = useState(false);

  // Buscar en SUNAT/RENIEC
  const handleSearch = useCallback(async () => {
    const doc = formData.numeroDocumento.trim();
    const tipoDoc = formData.tipoDocumento;
    
    if (tipoDoc === 'DNI' && doc.length !== 8) {
      setSearchStatus({ type: 'error', message: 'El DNI debe tener 8 dígitos' });
      return;
    }
    if (tipoDoc === 'RUC' && doc.length !== 11) {
      setSearchStatus({ type: 'error', message: 'El RUC debe tener 11 dígitos' });
      return;
    }

    setIsSearching(true);
    setSearchStatus(null);

    try {
      const endpoint = tipoDoc === 'RUC' 
        ? `/sunat/ruc/${doc}` 
        : `/sunat/dni/${doc}`;

      const response = await apiService.get<any>(endpoint);

      if (response.success && response.data) {
        if (tipoDoc === 'RUC') {
          const data = response.data as SunatRucData;
          setFormData(prev => ({
            ...prev,
            razonSocial: data.razonSocial || '',
            direccion: data.direccion || prev.direccion,
          }));
          setSearchStatus({ 
            type: 'success', 
            message: `✅ Empresa encontrada: ${data.razonSocial}` 
          });
          
          // Autocompletar ubigeo si viene en la respuesta
          if (data.departamento || data.provincia || data.distrito) {
            await autoSelectUbigeo(data.departamento, data.provincia, data.distrito);
          }
        } else {
          const data = response.data as ReniecDniData;
          setFormData(prev => ({
            ...prev,
            nombres: data.nombres || '',
            apellidos: `${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim(),
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
  }, [formData.numeroDocumento, formData.tipoDocumento]);

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
    
    try {
      // Cargar departamentos
      const resDeps = await apiService.getDepartamentos();
      if (!resDeps.success || !resDeps.data) {
        console.error('❌ Error cargando departamentos');
        return;
      }
      
      const deps = resDeps.data;
      const depNormalized = normalize(depName);
      console.log('🔎 Buscando departamento:', depNormalized);
      
      const foundDep = deps.find((d: any) => {
        const dNorm = normalize(d.nombre);
        return dNorm.includes(depNormalized) || depNormalized.includes(dNorm);
      });
      
      if (!foundDep) {
        console.log('⚠️ Departamento no encontrado:', depNormalized);
        return;
      }
      
      console.log('✅ Departamento encontrado:', foundDep.nombre, foundDep.id);
      
      if (!provName) {
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: '', distritoId: '' }));
        return;
      }
      
      // Cargar y buscar provincia
      const resP = await apiService.getProvincias(foundDep.id);
      if (!resP.success || !resP.data) {
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: '', distritoId: '' }));
        return;
      }
      
      const provNormalized = normalize(provName);
      console.log('🔎 Buscando provincia:', provNormalized);
      
      const foundProv = resP.data.find((p: any) => {
        const pNorm = normalize(p.nombre);
        return pNorm.includes(provNormalized) || provNormalized.includes(pNorm);
      });
      
      if (!foundProv) {
        console.log('⚠️ Provincia no encontrada:', provNormalized);
        console.log('   Provincias disponibles:', resP.data.map((p: any) => p.nombre).join(', '));
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: '', distritoId: '' }));
        return;
      }
      
      console.log('✅ Provincia encontrada:', foundProv.nombre, foundProv.id);
      
      if (!distName) {
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: foundProv.id, distritoId: '' }));
        return;
      }
      
      // Cargar y buscar distrito
      const resD = await apiService.getDistritos(foundProv.id);
      if (!resD.success || !resD.data) {
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: foundProv.id, distritoId: '' }));
        return;
      }
      
      const distNormalized = normalize(distName);
      console.log('🔎 Buscando distrito:', distNormalized);
      
      const foundDist = resD.data.find((d: any) => {
        const dNorm = normalize(d.nombre);
        return dNorm.includes(distNormalized) || distNormalized.includes(dNorm);
      });
      
      if (!foundDist) {
        console.log('⚠️ Distrito no encontrado:', distNormalized);
        console.log('   Distritos disponibles:', resD.data.map((d: any) => d.nombre).join(', '));
        setFormData(prev => ({ ...prev, departamentoId: foundDep.id, provinciaId: foundProv.id, distritoId: '' }));
        return;
      }
      
      console.log('✅ Distrito encontrado:', foundDist.nombre, foundDist.id);
      setFormData(prev => ({ 
        ...prev, 
        departamentoId: foundDep.id, 
        provinciaId: foundProv.id, 
        distritoId: foundDist.id 
      }));
      
    } catch (error) {
      console.error('Error en autoSelectUbigeo:', error);
    }
  }, []);

  // Validar si puede buscar
  const canSearch = (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length === 8) ||
                    (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length === 11);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos según tipo de documento
    if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') {
      // Validar nombres
      if (!formData.nombres?.trim()) {
        newErrors.nombres = 'Los nombres son requeridos';
      } else if (formData.nombres.trim().length < 2) {
        newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
      }

      // Validar apellidos
      if (!formData.apellidos?.trim()) {
        newErrors.apellidos = 'Los apellidos son requeridos';
      } else if (formData.apellidos.trim().length < 2) {
        newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      }
    } else if (formData.tipoDocumento === 'RUC') {
      // Validar razón social
      if (!formData.razonSocial?.trim()) {
        newErrors.razonSocial = 'La razón social es requerida';
      } else if (formData.razonSocial.trim().length < 2) {
        newErrors.razonSocial = 'La razón social debe tener al menos 2 caracteres';
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
        if (!/^[A-Z][0-9]{7}$/.test(formData.numeroDocumento.trim().toUpperCase())) {
          newErrors.numeroDocumento = 'El Pasaporte debe ser Letra + 7 dígitos (ej: A1234567)';
        }
      }
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    // Validar Ubigeo
    if (!formData.departamentoId?.trim()) {
      newErrors.departamentoId = 'El departamento es requerido';
    }
    if (!formData.provinciaId?.trim()) {
      newErrors.provinciaId = 'La provincia es requerida';
    }
    if (!formData.distritoId?.trim()) {
      newErrors.distritoId = 'El distrito es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target as HTMLInputElement;

    // Sanitizar dígitos para documentos numéricos
    if (name === 'numeroDocumento' && ['DNI', 'CE', 'RUC'].includes(formData.tipoDocumento)) {
      value = value.replace(/\D+/g, '');
      const maxLen = formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 12 : 11;
      if (value.length > maxLen) value = value.slice(0, maxLen);
    }
    // Normalización y límites para Pasaporte
    if (name === 'numeroDocumento' && formData.tipoDocumento === 'Pasaporte') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (value.length > 8) value = value.slice(0, 8);
    }

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
        nombres: undefined,
        apellidos: undefined,
        razonSocial: undefined,
        numeroDocumento: undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir payload alineado con el backend
      const clientData: any = {
        tipoEntidad: formData.tipoEntidad,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        departamentoId: formData.departamentoId || '',
        provinciaId: formData.provinciaId || '',
        distritoId: formData.distritoId || ''
      };

      if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') {
        clientData.nombres = formData.nombres?.trim();
        clientData.apellidos = formData.apellidos?.trim();
      } else if (formData.tipoDocumento === 'RUC') {
        clientData.razonSocial = formData.razonSocial?.trim();
      }

      // Esperar la creación para confirmar éxito o error
      await addClient(clientData);

      addNotification('success', 'Registro Exitoso', 'Entidad registrada exitosamente');

      // Resetear formulario
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
        ciudad: '',
        departamentoId: '',
        provinciaId: '',
        distritoId: ''
      });

      // Navegar a la lista de entidades después de un breve delay
      setTimeout(() => {
        navigate('/lista-entidades');
      }, 1500);

    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Error al registrar la entidad';
      addNotification('error', 'Error de Registro', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/lista-entidades');
  };

  return (
    <Layout title="Registro de Entidad Comercial">
      <FormContainer>
        <Title>Registrar Nueva Entidad Comercial</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="tipoEntidad">Tipo de Entidad *</Label>
              <Select
                id="tipoEntidad"
                name="tipoEntidad"
                value={formData.tipoEntidad}
                onChange={handleInputChange}
                required
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
                required
              >
                <option value="DNI">DNI</option>
                <option value="CE">CE (Carnet de Extranjería)</option>
                <option value="RUC">RUC</option>
                <option value="Pasaporte">Pasaporte</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <DocumentInputRow>
                <DocumentInputWrapper>
                  <Input
                    type="text"
                    id="numeroDocumento"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => {
                      handleInputChange(e);
                      setDataFound(false);
                      setSearchStatus(null);
                    }}
                    placeholder={
                      formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos' :
                      formData.tipoDocumento === 'CE' ? 'Ingrese 12 dígitos' :
                      formData.tipoDocumento === 'RUC' ? 'Ingrese 11 dígitos' :
                      formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' :
                      'Ingrese el número de documento'
                    }
                    pattern={formData.tipoDocumento === 'Pasaporte' ? '^[A-Z][0-9]{7}$' : undefined}
                    title={formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' : undefined}
                    required
                  />
                  {errors.numeroDocumento && <ErrorMessage>{errors.numeroDocumento}</ErrorMessage>}
                </DocumentInputWrapper>
                {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'RUC') && (
                  <SearchButton
                    type="button"
                    onClick={handleSearch}
                    disabled={!canSearch || isSearching}
                    $loading={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Spinner /> Buscando...
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
            </FormGroup>
          </FormRow>

          {/* Campos dinámicos según tipo de documento */}
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
                  placeholder="Ingrese los nombres"
                  required
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
                  placeholder="Ingrese los apellidos"
                  required
                />
                {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          )}

          {formData.tipoDocumento === 'RUC' && (
            <FormGroup>
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                type="text"
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial || ''}
                onChange={handleInputChange}
                placeholder="Ingrese la razón social"
                required
              />
              {errors.razonSocial && <ErrorMessage>{errors.razonSocial}</ErrorMessage>}
            </FormGroup>
          )}

          <FormRow>
            <FormGroup>
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="987654321"
                maxLength={9}
                required
              />
              {errors.telefono && <ErrorMessage>{errors.telefono}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="entidad@ejemplo.com"
                required
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ingrese la dirección completa"
                required
              />
              {errors.direccion && <ErrorMessage>{errors.direccion}</ErrorMessage>}
            </FormGroup>

            <UbigeoSelector
              value={{
                departamentoId: formData.departamentoId || '',
                provinciaId: formData.provinciaId || '',
                distritoId: formData.distritoId || ''
              }}
              errors={{
                departamentoId: errors.departamentoId,
                provinciaId: errors.provinciaId,
                distritoId: errors.distritoId
              }}
              onChange={({ departamentoId, provinciaId, distritoId }) => {
                setFormData(prev => ({
                  ...prev,
                  departamentoId,
                  provinciaId,
                  distritoId
                }));
                setErrors(prev => ({
                  ...prev,
                  departamentoId: undefined,
                  provinciaId: undefined,
                  distritoId: undefined
                }));
              }}
            />
          </FormRow>

          <ButtonContainer>
            <Button type="submit" $variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Entidad'}
            </Button>
            <Button type="button" $variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          </ButtonContainer>
        </Form>
      </FormContainer>
    </Layout>
  );
};

export default RegistroEntidad;
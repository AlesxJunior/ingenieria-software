import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../context/ClientContext';
import UbigeoSelector from './UbigeoSelector';

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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  `}

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
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

const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useNotification();
  const { addClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
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
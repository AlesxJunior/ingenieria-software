import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useClients } from '../context/ClientContext';
import { useNotification } from '../context/NotificationContext';
import { media } from '../styles/breakpoints';

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

interface FormData {
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'CE' | 'RUC';
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
    ciudad: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos según tipo de documento
    if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE') {
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

    // Validar ciudad
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
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

    // Si cambia el tipo de documento, limpiar campos específicos
    if (name === 'tipoDocumento') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'DNI' | 'CE' | 'RUC',
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
        ciudad: formData.ciudad.trim()
      };

      if (formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE') {
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
        ciudad: ''
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
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                placeholder={
                  formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos' :
                  formData.tipoDocumento === 'CE' ? 'Ingrese 12 dígitos' :
                  'Ingrese 11 dígitos'
                }
                required
              />
              {errors.numeroDocumento && <ErrorMessage>{errors.numeroDocumento}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          {/* Campos dinámicos según tipo de documento */}
          {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE') && (
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

            <FormGroup>
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Ingrese la ciudad"
                required
              />
              {errors.ciudad && <ErrorMessage>{errors.ciudad}</ErrorMessage>}
            </FormGroup>
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
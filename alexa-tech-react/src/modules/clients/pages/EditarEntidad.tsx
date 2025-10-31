import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useClients } from '../context/ClientContext';
import UbigeoSelector from '../components/UbigeoSelector';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &.error {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &.error {
    border-color: #dc3545;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
  display: block;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &.primary {
    background-color: #007bff;
    color: white;

    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: #545b62;
    }
  }
`;

interface FormData {
  tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
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
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  // Ubigeo
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

const EditarEntidad: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateClient, getClientById } = useClients();
  
  const [formData, setFormData] = useState<FormData>({
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const client = getClientById(id);
      if (client) {
        setFormData({
          tipoDocumento: client.tipoDocumento,
          numeroDocumento: client.numeroDocumento,
          nombres: client.nombres || '',
          apellidos: client.apellidos || '',
          razonSocial: client.razonSocial || '',
          email: client.email,
          telefono: client.telefono,
          direccion: client.direccion,
          ciudad: client.ciudad,
          departamentoId: client.departamentoId || '',
          provinciaId: client.provinciaId || '',
          distritoId: client.distritoId || ''
        });
        setIsLoading(false);
      } else {
        console.error('Entidad no encontrada');
        navigate('/lista-entidades');
      }
    }
  }, [id, getClientById, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target as HTMLInputElement;

    // Si cambia el tipo de documento, limpiar campos específicos
    if (name === 'tipoDocumento') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'DNI' | 'CE' | 'RUC' | 'Pasaporte',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        razonSocial: ''
      }));
    } else {
      // Sanitizar dígitos para documentos numéricos
      if (name === 'numeroDocumento' && ['DNI', 'CE', 'RUC'].includes(formData.tipoDocumento)) {
        value = value.replace(/\D+/g, '');
        const maxLen = formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 12 : 11;
        if (value.length > maxLen) value = value.slice(0, maxLen);
      }
      if (name === 'numeroDocumento' && formData.tipoDocumento === 'Pasaporte') {
        value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 8) value = value.slice(0, 8);
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar tipo de documento
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
    }

    // Validaciones de formato por tipo de documento
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

    // Validar campos según tipo de documento
    if (['DNI', 'CE', 'Pasaporte'].includes(formData.tipoDocumento)) {
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

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    // Validar Ubigeo
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (id) {
        // Preparar datos para actualizar
        const updateData: any = {
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          departamentoId: formData.departamentoId || '',
          provinciaId: formData.provinciaId || '',
          distritoId: formData.distritoId || ''
        };

        // Agregar campos condicionales según tipo de documento
        if (['DNI', 'CE', 'Pasaporte'].includes(formData.tipoDocumento)) {
          updateData.nombres = formData.nombres;
          updateData.apellidos = formData.apellidos;
        } else if (formData.tipoDocumento === 'RUC') {
          updateData.razonSocial = formData.razonSocial;
        }

        updateClient(id, updateData);
        console.log('Entidad actualizada exitosamente');
        navigate('/lista-entidades');
      }
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
    }
  };

  const handleCancel = () => {
    navigate('/lista-entidades');
  };

  if (isLoading) {
    return (
      <Layout title="Editar Entidad">
        <FormContainer>
          <Title>Cargando...</Title>
        </FormContainer>
      </Layout>
    );
  }

  return (
    <Layout title="Editar Entidad">
      <FormContainer>
        <Title>Editar Entidad</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
            <Select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleInputChange}
              className={errors.numeroDocumento ? 'error' : ''}
            >
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
              <option value="RUC">RUC</option>
              <option value="Pasaporte">Pasaporte</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="numeroDocumento">Número de Documento</Label>
            <Input
              type="text"
              id="numeroDocumento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleInputChange}
              className={errors.numeroDocumento ? 'error' : ''}
              placeholder={
                formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos' :
                formData.tipoDocumento === 'CE' ? 'Ingrese 12 dígitos' :
                formData.tipoDocumento === 'RUC' ? 'Ingrese 11 dígitos' :
                formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' :
                'Ingrese el número de documento'
              }
              pattern={formData.tipoDocumento === 'Pasaporte' ? '^[A-Z][0-9]{7}$' : undefined}
              title={formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' : undefined}
            />
            {errors.numeroDocumento && <ErrorMessage>{errors.numeroDocumento}</ErrorMessage>}
          </FormGroup>

          {/* Campos condicionales según tipo de documento */}
          {['DNI', 'CE', 'Pasaporte'].includes(formData.tipoDocumento) && (
            <FormRow>
              <FormGroup>
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres || ''}
                  onChange={handleInputChange}
                  className={errors.nombres ? 'error' : ''}
                  placeholder="Ingrese los nombres"
                />
                {errors.nombres && <ErrorMessage>{errors.nombres}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos || ''}
                  onChange={handleInputChange}
                  className={errors.apellidos ? 'error' : ''}
                  placeholder="Ingrese los apellidos"
                />
                {errors.apellidos && <ErrorMessage>{errors.apellidos}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          )}

          {formData.tipoDocumento === 'RUC' && (
            <FormGroup>
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                type="text"
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial || ''}
                onChange={handleInputChange}
                className={errors.razonSocial ? 'error' : ''}
                placeholder="Ingrese la razón social"
              />
              {errors.razonSocial && <ErrorMessage>{errors.razonSocial}</ErrorMessage>}
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Ingrese el email"
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className={errors.telefono ? 'error' : ''}
              placeholder="Ingrese el teléfono"
            />
            {errors.telefono && <ErrorMessage>{errors.telefono}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={errors.direccion ? 'error' : ''}
                placeholder="Ingrese la dirección"
              />
              {errors.direccion && <ErrorMessage>{errors.direccion}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Ubigeo</Label>
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
                    departamentoId: undefined,
                    provinciaId: undefined,
                    distritoId: undefined,
                  }));
                }}
              />
            </FormGroup>
          </FormRow>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="primary">
              Actualizar Entidad
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Layout>
  );
};

export default EditarEntidad;
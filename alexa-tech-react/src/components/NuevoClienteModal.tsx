import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';

interface ClienteFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  estado: 'activo' | 'inactivo';
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

const FormRowThree = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    estado: 'activo'
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = 'El tipo de documento es requerido';
    }

    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!formData.genero) {
      newErrors.genero = 'El género es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('success', 'Éxito', 'Cliente registrado exitosamente');
      onClose();
      
      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigoPostal: '',
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        genero: '',
        estado: 'activo'
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
          <Title>Registrar Nuevo Cliente</Title>
          <CloseButton onClick={onClose}>Cerrar</CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <SectionTitle>Información Personal</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                $hasError={!!errors.nombre}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <ErrorMessage>{errors.nombre}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                $hasError={!!errors.apellido}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && <ErrorMessage>{errors.apellido}</ErrorMessage>}
            </FormGroup>
          </FormRow>

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
                placeholder="Ingrese el teléfono"
              />
              {errors.telefono && <ErrorMessage>{errors.telefono}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRowThree>
            <FormGroup>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
              <Input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                $hasError={!!errors.fechaNacimiento}
              />
              {errors.fechaNacimiento && <ErrorMessage>{errors.fechaNacimiento}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="genero">Género *</Label>
              <Select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                $hasError={!!errors.genero}
              >
                <option value="">Seleccione género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </Select>
              {errors.genero && <ErrorMessage>{errors.genero}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            </FormGroup>
          </FormRowThree>

          <SectionTitle>Documentación</SectionTitle>

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
                <option value="">Seleccione tipo</option>
                <option value="cedula">Cédula de Ciudadanía</option>
                <option value="cedula_extranjeria">Cédula de Extranjería</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="tarjeta_identidad">Tarjeta de Identidad</option>
              </Select>
              {errors.tipoDocumento && <ErrorMessage>{errors.tipoDocumento}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                $hasError={!!errors.numeroDocumento}
                placeholder="Ingrese el número de documento"
              />
              {errors.numeroDocumento && <ErrorMessage>{errors.numeroDocumento}</ErrorMessage>}
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

          <FormRow>
            <FormGroup>
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                $hasError={!!errors.ciudad}
                placeholder="Ingrese la ciudad"
              />
              {errors.ciudad && <ErrorMessage>{errors.ciudad}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                placeholder="Ingrese el código postal"
              />
            </FormGroup>
          </FormRow>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Cliente'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevoClienteModal;
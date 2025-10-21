import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../context/NotificationContext';
import UbigeoSelector from './UbigeoSelector';

interface Client {
  id: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
  numeroDocumento: string;
  isActive: boolean;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface ClienteFormData {
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  direccion: string;
  // Ubigeo
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientData: Partial<Client>) => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
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
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  ${props => props.$variant === 'primary' ? `
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
    }
  `}
`;

const EditarClienteModal: React.FC<EditarClienteModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave
}) => {
  const { showNotification } = useNotification();
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
    distritoId: '',
  });
  const [errors, setErrors] = useState<{ departamentoId?: string; provinciaId?: string; distritoId?: string }>({});

  useEffect(() => {
    if (client) {
      setFormData({
        tipoEntidad: client.tipoEntidad,
        tipoDocumento: client.tipoDocumento,
        numeroDocumento: client.numeroDocumento,
        nombres: client.nombres || '',
        apellidos: client.apellidos || '',
        razonSocial: client.razonSocial || '',
        email: client.email,
        telefono: client.telefono,
        direccion: client.direccion,
        departamentoId: client.departamentoId || '',
        provinciaId: client.provinciaId || '',
        distritoId: client.distritoId || ''
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { departamentoId?: string; provinciaId?: string; distritoId?: string } = {};
    if (!formData.departamentoId) newErrors.departamentoId = 'El departamento es requerido';
    if (!formData.provinciaId) newErrors.provinciaId = 'La provincia es requerida';
    if (!formData.distritoId) newErrors.distritoId = 'El distrito es requerido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('error', 'Validación', 'Complete los campos de Ubigeo');
      return;
    }
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

      await onSave(clientData);
      showNotification('success', 'Entidad Actualizada', 'La entidad ha sido actualizada exitosamente.');
      onClose();
    } catch (error) {
      showNotification('error', 'Error', 'Error al actualizar el cliente');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let { value } = e.target as HTMLInputElement;
    
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
    } else {
      // Sanitizar dígitos para documentos numéricos
      if (name === 'numeroDocumento' && ['DNI', 'CE', 'RUC'].includes(formData.tipoDocumento)) {
        value = value.replace(/\D+/g, '');
        const maxLen = formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 12 : 11;
        if (value.length > maxLen) value = value.slice(0, maxLen);
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Editar Entidad Comercial</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="tipoEntidad">Tipo de Entidad</Label>
              <Select
                id="tipoEntidad"
                name="tipoEntidad"
                value={formData.tipoEntidad}
                onChange={handleChange}
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
              <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
              <Select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                required
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="RUC">RUC</option>
                <option value="Pasaporte">Pasaporte</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="numeroDocumento">
                Número de {formData.tipoDocumento === 'DNI' ? 'DNI' : 
                          formData.tipoDocumento === 'CE' ? 'Carnet de Extranjería' : 
                          formData.tipoDocumento === 'RUC' ? 'RUC' : 
                          formData.tipoDocumento === 'Pasaporte' ? 'Pasaporte' : 'Documento'}
              </Label>
              <Input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                placeholder={
                  formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos' :
                  formData.tipoDocumento === 'CE' ? 'Ingrese 12 dígitos' :
                  formData.tipoDocumento === 'RUC' ? 'Ingrese 11 dígitos' :
                  formData.tipoDocumento === 'Pasaporte' ? 'Letra + 7 dígitos (ej: A1234567)' :
                  'Ingrese el número de documento'
                }
                required
              />
            </FormGroup>
          </FormRow>

          {/* Campos para DNI, CE y Pasaporte */}
          {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'CE' || formData.tipoDocumento === 'Pasaporte') && (
            <FormRow>
              <FormGroup>
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
          )}

          {/* Campo para RUC */}
          {formData.tipoDocumento === 'RUC' && (
            <FormGroup>
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                type="text"
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                required
              />
            </FormGroup>
          )}
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese 9 dígitos"
                required
              />
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label htmlFor="direccion">Dirección</Label>
            <TextArea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
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
                  departamentoId: '',
                  provinciaId: '',
                  distritoId: '',
                }));
              }}
            />
          </FormGroup>
          
          {/* Campo de ciudad eliminado en favor de Ubigeo */}
          
          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary">
              Guardar Cambios
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarClienteModal;
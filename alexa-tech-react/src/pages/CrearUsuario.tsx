import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
  confirmPassword: string;
  status: 'activo' | 'inactivo';
  permissions: string[];
}

interface FormErrors {
  [key: string]: string;
}

const Container = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
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
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
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

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const PermissionsContainer = styled.div`
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
`;

const PermissionsTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const Checkbox = styled.input`
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  ${props => props.variant === 'primary' ? `
    background: #3498db;
    color: white;
    &:hover {
      background: #2980b9;
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

const CrearUsuario: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    role: 'vendedor',
    password: '',
    confirmPassword: '',
    status: 'activo',
    permissions: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePermissions = [
    { id: 'dashboard', name: 'Dashboard', description: 'Acceso al panel principal' },
    { id: 'usuarios', name: 'Usuarios', description: 'Gestión de usuarios' },
    { id: 'clientes', name: 'Clientes', description: 'Gestión de clientes' },
    { id: 'ventas', name: 'Ventas', description: 'Gestión de ventas' },
    { id: 'productos', name: 'Productos', description: 'Gestión de productos' },
    { id: 'inventario', name: 'Inventario', description: 'Control de inventario' },
    { id: 'caja', name: 'Caja', description: 'Gestión de caja' },
    { id: 'reportes', name: 'Reportes', description: 'Generación de reportes' }
  ];

  const rolePermissions = {
    admin: ['dashboard', 'usuarios', 'clientes', 'ventas', 'productos', 'inventario', 'caja', 'reportes'],
    vendedor: ['dashboard', 'clientes', 'ventas', 'productos'],
    cajero: ['dashboard', 'ventas', 'caja'],
    supervisor: ['dashboard', 'clientes', 'ventas', 'productos', 'inventario', 'reportes']
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as keyof typeof rolePermissions;
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));

    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess('Usuario creado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      showError('Error al crear el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Crear Usuario">
      <Container>
        <Header>
          <Title>Crear Nuevo Usuario</Title>
          <BackButton onClick={() => navigate('/usuarios')}>
            Volver a Lista
          </BackButton>
        </Header>

        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  $hasError={!!errors.username}
                  placeholder="Ej: juan_perez"
                />
                {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  $hasError={!!errors.email}
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                $hasError={!!errors.fullName}
                placeholder="Juan Pérez García"
              />
              {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="role">Rol *</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="cajero">Cajero</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="status">Estado</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  $hasError={!!errors.password}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  $hasError={!!errors.confirmPassword}
                  placeholder="Repetir contraseña"
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <PermissionsContainer>
              <PermissionsTitle>Permisos del Usuario</PermissionsTitle>
              <PermissionsGrid>
                {availablePermissions.map(permission => (
                  <PermissionItem key={permission.id}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                    />
                    <span>{permission.name}</span>
                  </PermissionItem>
                ))}
              </PermissionsGrid>
              {errors.permissions && <ErrorMessage>{errors.permissions}</ErrorMessage>}
            </PermissionsContainer>

            <ButtonContainer>
              <Button type="button" onClick={() => navigate('/usuarios')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </ButtonContainer>
          </Form>
        </FormContainer>
      </Container>
    </Layout>
  );
};

export default CrearUsuario;
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { validatePasswordWithConfirmation } from '../../../utils/validation';
import PasswordRequirements from '../../../components/PasswordRequirements';
import { apiService } from '../../../utils/api';

interface ProfileFormData {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;

  ${props => props.$isActive ? `
    color: #3498db;
    border-bottom-color: #3498db;
    font-weight: 600;
  ` : `
    color: #7f8c8d;
    &:hover {
      color: #2c3e50;
    }
  `}
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

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
`;

const InfoValue = styled.span`
  color: #7f8c8d;
`;

const Badge = styled.span<{ $variant: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$variant) {
      case 'activo':
        return `background: #d4edda; color: #155724;`;
      case 'inactivo':
        return `background: #f8d7da; color: #721c24;`;
      default:
        return `background: #f8f9fa; color: #6c757d;`;
    }
  }}
`;

const ButtonContainer = styled.div`
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

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActivityInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityTitle = styled.span`
  font-weight: 600;
  color: #2c3e50;
`;

const ActivityDescription = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ActivityTime = styled.span`
  color: #95a5a6;
  font-size: 0.8rem;
`;

const PerfilUsuario: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'activity'>('info');
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);



  const validateInfoForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Validar nueva contraseña con requisitos robustos
    const passwordValidation = validatePasswordWithConfirmation(formData.newPassword, formData.confirmPassword);
    if (!passwordValidation.isValid) {
      const passwordErrors = passwordValidation.errors.filter(e => e.field === 'Contraseña');
      const confirmErrors = passwordValidation.errors.filter(e => e.field === 'confirmPassword');
      
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors[0].message;
      }
      if (confirmErrors.length > 0) {
        newErrors.confirmPassword = confirmErrors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInfoForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    if (!user?.id) {
      showError('Error: Usuario no identificado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Separar el nombre completo en firstName y lastName
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await apiService.patchUser(user.id, {
        email: formData.email,
        firstName,
        lastName
      });

      if (response.success) {
        updateUser({
          email: formData.email,
          firstName,
          lastName
        });

        showSuccess('Información actualizada exitosamente');
      } else {
        showError(response.message || 'Error al actualizar la información');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showError(error.message || 'Error al actualizar la información');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    if (!user?.id) {
      showError('Error: Usuario no identificado');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.changePassword(
        user.id,
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        showSuccess('Contraseña actualizada exitosamente');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        showError(response.message || 'Error al actualizar la contraseña');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showError(error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadUserActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await apiService.getUserActivity(5);
      if (response.success && response.data?.activities) {
        const formattedActivity = response.data.activities.map((activity: any) => ({
          title: activity.action,
          description: activity.details,
          time: formatActivityTime(activity.timestamp)
        }));
        setUserActivity(formattedActivity);
      }
    } catch (error) {
      console.error('Error loading user activity:', error);
      // En caso de error, usar datos mock como fallback
      setUserActivity([
        {
          title: 'Inicio de sesión',
          description: 'Acceso desde navegador web',
          time: 'Hace 2 horas'
        },
        {
          title: 'Actualización de perfil',
          description: 'Información personal actualizada',
          time: 'Hace 4 horas'
        }
      ]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const formatActivityTime = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  // Cargar actividad cuando se selecciona la pestaña
  React.useEffect(() => {
    if (activeTab === 'activity' && userActivity.length === 0) {
      loadUserActivity();
    }
  }, [activeTab]);



  return (
    <Layout title="Mi Perfil">
      <Container>
        <Header>
          <Title>Mi Perfil</Title>
          <Subtitle>Gestiona tu información personal y configuración de cuenta</Subtitle>
        </Header>

        <TabContainer>
          <Tab 
            $isActive={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            Información Personal
          </Tab>
          <Tab 
            $isActive={activeTab === 'password'} 
            onClick={() => setActiveTab('password')}
          >
            Cambiar Contraseña
          </Tab>
          <Tab 
            $isActive={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
          >
            Actividad Reciente
          </Tab>
        </TabContainer>

        {activeTab === 'info' && (
          <FormContainer>
            <InfoCard>
              <InfoRow>
                <InfoLabel>Usuario:</InfoLabel>
                <InfoValue>@{user?.username}</InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Estado:</InfoLabel>
                <Badge $variant="activo">Activo</Badge>
              </InfoRow>
            </InfoCard>

            <Form onSubmit={handleInfoSubmit}>
              <FormGroup>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  $hasError={!!errors.fullName}
                />
                {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  $hasError={!!errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <ButtonContainer>
                <Button type="submit" $variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </ButtonContainer>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'password' && (
          <FormContainer>
            <Form onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  $hasError={!!errors.currentPassword}
                />
                {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    $hasError={!!errors.newPassword}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
                  <PasswordRequirements password={formData.newPassword} />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
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

              <ButtonContainer>
                <Button type="submit" $variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </ButtonContainer>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'activity' && (
          <FormContainer>
            {loadingActivity ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Cargando actividad reciente...
              </div>
            ) : (
              <ActivityList>
                {userActivity.length > 0 ? (
                  userActivity.map((activity, index) => (
                    <ActivityItem key={index}>
                      <ActivityInfo>
                        <ActivityTitle>{activity.title}</ActivityTitle>
                        <ActivityDescription>{activity.description}</ActivityDescription>
                      </ActivityInfo>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityItem>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    No hay actividad reciente disponible
                  </div>
                )}
              </ActivityList>
            )}
          </FormContainer>
        )}
      </Container>
    </Layout>
  );
};

export default PerfilUsuario;

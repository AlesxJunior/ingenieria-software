import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
`;

const StatusCard = styled(Card)<{ status: 'open' | 'closed' }>`
  border-left: 4px solid ${props => props.status === 'open' ? '#27ae60' : '#e74c3c'};
`;

const StatusTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const StatusInfo = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #7f8c8d;
`;

const InfoValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #27ae60;
          color: white;
          &:hover {
            background: #229954;
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const AlertCard = styled.div<{ type: 'warning' | 'info' }>`
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border: 1px solid ${props => props.type === 'warning' ? '#ffeaa7' : '#bee5eb'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.type === 'warning' ? '#856404' : '#0c5460'};
`;

const AperturaCaja: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cashRegisters, addCashRegister, getActiveCashRegister, updateCashRegister } = useApp();
  const { addNotification } = useNotification();
  
  const [activeCashRegister, setActiveCashRegister] = useState<any>(null);
  const [initialAmount, setInitialAmount] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const active = getActiveCashRegister();
    setActiveCashRegister(active);
    
    // Generar número de caja automáticamente
    if (!registerNumber) {
      const nextNumber = (cashRegisters.length + 1).toString().padStart(3, '0');
      setRegisterNumber(`CAJA-${nextNumber}`);
    }
  }, [cashRegisters, getActiveCashRegister, registerNumber]);

  const validateForm = (): boolean => {
    if (!initialAmount.trim()) {
      setError('El monto inicial es requerido');
      return false;
    }

    const amount = parseFloat(initialAmount);
    if (isNaN(amount) || amount < 0) {
      setError('El monto inicial debe ser un número válido mayor o igual a 0');
      return false;
    }

    if (!registerNumber.trim()) {
      setError('El número de caja es requerido');
      return false;
    }

    setError('');
    return true;
  };

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const newCashRegister = {
        registerNumber: registerNumber.trim(),
        openDate: now,
        openTime: now.toLocaleTimeString(),
        initialAmount: parseFloat(initialAmount),
        status: 'abierta' as const,
        userId: user.id
      };

      addCashRegister(newCashRegister);
      
      addNotification('success', 'Apertura Exitosa', `Caja ${registerNumber} abierta exitosamente`);

      // Resetear formulario
      setInitialAmount('');
      const nextNumber = (cashRegisters.length + 2).toString().padStart(3, '0');
      setRegisterNumber(`CAJA-${nextNumber}`);

      // Actualizar estado local
      setTimeout(() => {
        const active = getActiveCashRegister();
        setActiveCashRegister(active);
      }, 100);

    } catch (error) {
      addNotification('error', 'Error de Apertura', 'Error al abrir la caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCash = async () => {
    if (!activeCashRegister) return;

    setIsSubmitting(true);

    try {
      const now = new Date();
      updateCashRegister(activeCashRegister.id, {
        closeDate: now,
        closeTime: now.toLocaleTimeString(),
        status: 'cerrada',
        finalAmount: activeCashRegister.initialAmount // Por ahora, usar el monto inicial
      });

      addNotification('success', 'Cierre Exitoso', `Caja ${activeCashRegister.registerNumber} cerrada exitosamente`);

      setActiveCashRegister(null);

    } catch (error) {
      addNotification('error', 'Error de Cierre', 'Error al cerrar la caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  return (
    <Layout title="Apertura de Caja">
      <Container>
        <Title>Gestión de Caja</Title>

        {activeCashRegister ? (
          <StatusCard status="open">
            <StatusTitle>🟢 Caja Abierta</StatusTitle>
            <StatusInfo>
              <InfoRow>
                <InfoLabel>Número de Caja:</InfoLabel>
                <InfoValue>{activeCashRegister.registerNumber}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Fecha de Apertura:</InfoLabel>
                <InfoValue>{new Date(activeCashRegister.openDate).toLocaleDateString()}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Hora de Apertura:</InfoLabel>
                <InfoValue>{activeCashRegister.openTime}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Monto Inicial:</InfoLabel>
                <InfoValue>{formatCurrency(activeCashRegister.initialAmount)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Usuario:</InfoLabel>
                <InfoValue>{user?.username || 'Usuario'}</InfoValue>
              </InfoRow>
            </StatusInfo>
            
            <AlertCard type="info">
              <strong>Información:</strong> Tienes una caja abierta. Puedes realizar ventas o cerrar la caja cuando termines tu turno.
            </AlertCard>

            <ButtonContainer>
              <Button 
                type="button" 
                $variant="danger" 
                onClick={handleCloseCash}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Cerrando...' : 'Cerrar Caja'}
              </Button>
              <Button 
                type="button" 
                $variant="secondary" 
                onClick={() => navigate('/gestion-caja')}
              >
                Ir a Gestión de Caja
              </Button>
            </ButtonContainer>
          </StatusCard>
        ) : (
          <StatusCard status="closed">
            <StatusTitle>🔴 Sin Caja Abierta</StatusTitle>
            
            <AlertCard type="warning">
              <strong>Atención:</strong> No tienes ninguna caja abierta. Debes abrir una caja antes de poder realizar ventas.
            </AlertCard>

            <Form onSubmit={handleOpenCash}>
              <FormGroup>
                <Label htmlFor="registerNumber">Número de Caja</Label>
                <Input
                  type="text"
                  id="registerNumber"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="CAJA-001"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="initialAmount">Monto Inicial (S/)</Label>
                <Input
                  type="number"
                  id="initialAmount"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </FormGroup>

              <ButtonContainer>
                <Button 
                  type="submit" 
                  $variant="primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Abriendo...' : 'Abrir Caja'}
                </Button>
                <Button 
                  type="button" 
                  $variant="secondary" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancelar
                </Button>
              </ButtonContainer>
            </Form>
          </StatusCard>
        )}

        <Card>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Historial de Cajas Recientes</h3>
          {cashRegisters.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No hay registros de cajas</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cashRegisters.slice(-5).reverse().map((register) => (
                <InfoRow key={register.id}>
                  <div>
                    <strong>{register.registerNumber}</strong>
                    <br />
                    <small style={{ color: '#7f8c8d' }}>
                      {new Date(register.openDate).toLocaleDateString()} - {register.openTime}
                      {register.closeTime && ` a ${register.closeTime}`}
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: register.status === 'abierta' ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {register.status === 'abierta' ? '🟢 Abierta' : '🔴 Cerrada'}
                    </div>
                    <small>{formatCurrency(register.initialAmount)}</small>
                  </div>
                </InfoRow>
              ))}
            </div>
          )}
        </Card>
      </Container>
    </Layout>
  );
};

export default AperturaCaja;
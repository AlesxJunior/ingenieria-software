import React, { useState } from 'react';
import styled from 'styled-components';
import { useClients, type Client } from '../../clients/context/ClientContext';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../../../styles/theme';
import { Button as SharedButton } from '../../../components/shared/Button';

interface ConvertProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Client | null;
  onConverted: (updatedClient: Client) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 28px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { 
      transform: translateY(20px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const IconWarning = styled.div`
  font-size: 36px;
  color: #ff9800;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
`;

const Content = styled.div`
  margin-bottom: 24px;
`;

const ProviderInfo = styled.div`
  background: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
`;

const ProviderName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #e65100;
  margin-bottom: 4px;
`;

const ProviderDetail = styled.div`
  font-size: 14px;
  color: #666;
`;

const Message = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 16px 0;
`;

const OptionBox = styled.div<{ $selected?: boolean }>`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e3f2fd;
    border-color: #2196f3;
  }

  ${props => props.$selected && `
    background: #e3f2fd;
    border-color: #2196f3;
  `}
`;

const OptionTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionDescription = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

const RadioButton = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }
  ` : `
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const ConvertProviderModal: React.FC<ConvertProviderModalProps> = ({
  isOpen,
  onClose,
  provider,
  onConverted
}) => {
  const { updateClient } = useClients();
  const { showNotification } = useNotification();
  const [selectedOption, setSelectedOption] = useState<'Cliente' | 'Ambos'>('Ambos');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!provider) return;

    setIsConverting(true);
    try {
      const updatedData = {
        tipoEntidad: selectedOption
      };

      // Actualizar en el backend (esto ya recarga la lista de clientes)
      await updateClient(provider.id, updatedData);

      // Crear objeto Client actualizado para pasar al callback
      const updatedClient: Client = {
        ...provider,
        tipoEntidad: selectedOption
      };

      // Llamar callback DESPUÉS de que se actualice
      onConverted(updatedClient);
      onClose();
    } catch (error) {
      console.error('Error al convertir proveedor:', error);
      showNotification(
        'error',
        'Error',
        'No se pudo convertir la entidad. Intente nuevamente.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen || !provider) return null;

  const providerName = provider.tipoDocumento === 'RUC' 
    ? provider.razonSocial 
    : `${provider.nombres} ${provider.apellidos}`;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <IconWarning>⚠️</IconWarning>
          <Title>Entidad Registrada como Proveedor</Title>
        </Header>

        <Content>
          <ProviderInfo>
            <ProviderName>{providerName}</ProviderName>
            <ProviderDetail>
              {provider.tipoDocumento}: {provider.numeroDocumento}
            </ProviderDetail>
            <ProviderDetail style={{ marginTop: '4px', fontSize: '13px' }}>
              Tipo actual: <strong>Proveedor</strong>
            </ProviderDetail>
          </ProviderInfo>

          <Message>
            Esta entidad está registrada únicamente como <strong>Proveedor</strong> y no puede realizar ventas.
            Para continuar, selecciona una opción:
          </Message>

          <OptionBox 
            $selected={selectedOption === 'Ambos'}
            onClick={() => setSelectedOption('Ambos')}
          >
            <OptionTitle>
              <RadioButton
                type="radio"
                name="convertOption"
                checked={selectedOption === 'Ambos'}
                onChange={() => setSelectedOption('Ambos')}
              />
              Convertir a <strong>Ambos</strong> (Recomendado)
            </OptionTitle>
            <OptionDescription>
              La entidad podrá ser usada tanto como cliente (ventas) y como proveedor (compras).
            </OptionDescription>
          </OptionBox>

          <OptionBox 
            $selected={selectedOption === 'Cliente'}
            onClick={() => setSelectedOption('Cliente')}
          >
            <OptionTitle>
              <RadioButton
                type="radio"
                name="convertOption"
                checked={selectedOption === 'Cliente'}
                onChange={() => setSelectedOption('Cliente')}
              />
              Convertir a <strong>Cliente</strong>
            </OptionTitle>
            <OptionDescription>
              La entidad solo podrá ser usada para ventas. Ya no estará disponible como proveedor.
            </OptionDescription>
          </OptionBox>
        </Content>

        <ButtonGroup>
          <SharedButton $variant="outline" onClick={onClose} disabled={isConverting}>
            Cancelar
          </SharedButton>
          <SharedButton $variant="primary" onClick={handleConvert} disabled={isConverting}>
            {isConverting ? (
              <>
                <LoadingSpinner />
                Convirtiendo...
              </>
            ) : (
              `Convertir a ${selectedOption}`
            )}
          </SharedButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

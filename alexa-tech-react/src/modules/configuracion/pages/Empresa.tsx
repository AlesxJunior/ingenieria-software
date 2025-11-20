import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type EmpresaData } from '../services/configuracionApi';
import Layout from '../../../components/Layout';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

// El header principal se renderiza desde Layout

// Título desde Layout

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 14px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled(Button)`
  background-color: #6b7280;

  &:hover {
    background-color: #4b5563;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Alert = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #f59e0b;
  background-color: #fef3c7;
  color: #92400e;
`;

const Empresa: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { empresa, setEmpresa, loading, setLoading, reloadEmpresa } = useConfiguracion();
  
  const [formData, setFormData] = useState<EmpresaData>({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    email: '',
    website: '',
    logo: '',
    igvActivo: true,
    igvPorcentaje: 18,
    moneda: 'PEN',
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    codigoPostal: '',
    sunatUsuario: '',
    sunatClave: '',
    sunatServidor: 'homologacion',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadEmpresaData();
  }, []);

  const loadEmpresaData = async () => {
    setLoading(true);
    try {
      const data = await configuracionApi.getEmpresa();
      setEmpresa(data);
      setFormData(data);
    } catch (error) {
      showError('Error al cargar datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await configuracionApi.updateEmpresa(formData);
      await reloadEmpresa(); // ✅ Recargar para sincronizar con otros componentes (RealizarVenta)
      showSuccess('Datos de la empresa actualizados exitosamente');
      setIsEditing(false);
    } catch (error) {
      showError('Error al actualizar datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (empresa) {
      setFormData(empresa);
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Layout title="Configuración: Empresa">
      <Container>
        <Subtitle>Configura la información de tu empresa y datos SUNAT</Subtitle>

      <Alert>
        <strong>Importante:</strong> Los datos de SUNAT son necesarios para la emisión de comprobantes electrónicos.
      </Alert>

      <Card>
        <CardTitle>Información General</CardTitle>
        <FormGrid>
          <FormGroup>
            <Label>RUC *</Label>
            <Input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="20123456789"
            />
          </FormGroup>

          <FormGroup>
            <Label>Razón Social *</Label>
            <Input
              type="text"
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="RAZON SOCIAL S.A.C."
            />
          </FormGroup>

          <FormGroup>
            <Label>Nombre Comercial</Label>
            <Input
              type="text"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Nombre Comercial"
            />
          </FormGroup>

          <FormGroup>
            <Label>Dirección *</Label>
            <Input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Av. Principal 123"
            />
          </FormGroup>

          <FormGroup>
            <Label>Teléfono *</Label>
            <Input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="01-2345678"
            />
          </FormGroup>

          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="empresa@ejemplo.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>Sitio Web</Label>
            <Input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="www.empresa.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>Código Postal</Label>
            <Input
              type="text"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="15001"
            />
          </FormGroup>
        </FormGrid>
      </Card>

      <Card>
        <CardTitle>Configuración de Impuestos</CardTitle>
        <FormGrid>
          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                name="igvActivo"
                checked={formData.igvActivo}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              IGV Activo
            </CheckboxLabel>
          </FormGroup>

          <FormGroup>
            <Label>Porcentaje IGV (%)</Label>
            <Input
              type="number"
              name="igvPorcentaje"
              value={formData.igvPorcentaje}
              onChange={handleInputChange}
              disabled={!isEditing}
              min="0"
              max="100"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Moneda</Label>
            <Select
              name="moneda"
              value={formData.moneda}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="PEN">PEN - Sol Peruano</option>
              <option value="USD">USD - Dólar Americano</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </Card>

      <Card>
        <CardTitle>Configuración SUNAT</CardTitle>
        <FormGrid>
          <FormGroup>
            <Label>Usuario SOL *</Label>
            <Input
              type="text"
              name="sunatUsuario"
              value={formData.sunatUsuario}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="USUARIO_SOL"
            />
          </FormGroup>

          <FormGroup>
            <Label>Clave SOL *</Label>
            <Input
              type="password"
              name="sunatClave"
              value={formData.sunatClave}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="••••••••"
            />
          </FormGroup>

          <FormGroup>
            <Label>Servidor SUNAT</Label>
            <Select
              name="sunatServidor"
              value={formData.sunatServidor}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="homologacion">Homologación (Pruebas)</option>
              <option value="produccion">Producción</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </Card>

      {isEditing ? (
        <ButtonGroup>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <ButtonSecondary onClick={handleCancel}>
            Cancelar
          </ButtonSecondary>
        </ButtonGroup>
      ) : (
        <Button onClick={() => setIsEditing(true)}>
          Editar Datos
        </Button>
      )}
      </Container>
    </Layout>
  );
};

export default Empresa;
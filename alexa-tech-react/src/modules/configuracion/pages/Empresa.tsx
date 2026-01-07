import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type EmpresaData } from '../services/configuracionApi';
import Layout from '../../../components/Layout';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button, 
  Input, 
  Select, 
  Label, 
  FormGroup
} from '../../../components/shared';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: 0;
`;

const SectionCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.xl};
  margin-bottom: ${SPACING.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
  margin: 0 0 ${SPACING.lg} 0;
  padding-bottom: ${SPACING.md};
  border-bottom: 1px solid ${COLORS.neutral[200]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${SPACING.lg};
`;

const Checkbox = styled.input`
  margin-right: ${SPACING.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.primary};
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  margin-top: ${SPACING['2xl']};
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
      // Asegurar que no haya valores null para evitar inputs uncontrolled
      setFormData({
        ruc: data.ruc || '',
        razonSocial: data.razonSocial || '',
        nombreComercial: data.nombreComercial || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        website: data.website || '',
        logo: data.logo || '',
        igvActivo: data.igvActivo ?? true,
        igvPorcentaje: data.igvPorcentaje ?? 18,
        moneda: data.moneda || 'PEN',
        pais: data.pais || 'Perú',
        departamento: data.departamento || '',
        provincia: data.provincia || '',
        distrito: data.distrito || '',
        codigoPostal: data.codigoPostal || '',
        sunatUsuario: data.sunatUsuario || '',
        sunatClave: data.sunatClave || '',
        sunatServidor: data.sunatServidor || 'homologacion',
      });
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
      setFormData({
        ruc: empresa.ruc || '',
        razonSocial: empresa.razonSocial || '',
        nombreComercial: empresa.nombreComercial || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        website: empresa.website || '',
        logo: empresa.logo || '',
        igvActivo: empresa.igvActivo ?? true,
        igvPorcentaje: empresa.igvPorcentaje ?? 18,
        moneda: empresa.moneda || 'PEN',
        pais: empresa.pais || 'Perú',
        departamento: empresa.departamento || '',
        provincia: empresa.provincia || '',
        distrito: empresa.distrito || '',
        codigoPostal: empresa.codigoPostal || '',
        sunatUsuario: empresa.sunatUsuario || '',
        sunatClave: empresa.sunatClave || '',
        sunatServidor: empresa.sunatServidor || 'homologacion',
      });
    }
    setIsEditing(false);
  };

  if (loading && !empresa) {
    return (
      <Layout title="Empresa">
        <Container>
          <Header>
            <Title>Configuración de Empresa</Title>
          </Header>
          <SectionCard>
            <div style={{ textAlign: 'center', padding: SPACING.xl }}>
              ⏳ Cargando datos de la empresa...
            </div>
          </SectionCard>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Empresa">
      <Container>
        <Header>
          <div>
            <Title>Configuración de Empresa</Title>
            <Subtitle>Configura la información de tu empresa y datos SUNAT</Subtitle>
          </div>
          {!isEditing && (
            <Button $variant="primary" onClick={() => setIsEditing(true)}>
              Editar Datos
            </Button>
          )}
        </Header>

        <SectionCard>
          <SectionTitle>Información General</SectionTitle>
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
        </SectionCard>

        <SectionCard>
          <SectionTitle>Configuración de Impuestos</SectionTitle>
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
        </SectionCard>

        <SectionCard>
          <SectionTitle>Configuración SUNAT</SectionTitle>
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
        </SectionCard>

        {isEditing && (
          <ButtonGroup>
            <Button $variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button $variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          </ButtonGroup>
        )}
      </Container>
    </Layout>
  );
};

export default Empresa;
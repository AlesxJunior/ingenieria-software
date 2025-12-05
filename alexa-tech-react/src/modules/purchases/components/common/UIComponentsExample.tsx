/**
 * EJEMPLO DE USO: Componentes UI Reutilizables
 * Demostración de integración de StatusBadge, ActionButtons y SearchFilters
 * 
 * Este archivo muestra cómo usar los componentes comunes en páginas reales
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { StatusBadge, ActionButton, ActionButtonsGroup, SearchFilters } from '../common';
import { PurchaseOrderStatus, PurchaseReceiptStatus } from '../../types/purchases.types';

const ExampleContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Section = styled.section`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const CodeBlock = styled.pre`
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

// ==================== COMPONENT ====================

const UIComponentsExample: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Ejemplo de datos
  const statusOptions = [
    { value: '', label: 'Todos', count: 25 },
    { value: 'PENDIENTE', label: 'Pendiente', count: 8 },
    { value: 'ENVIADA', label: 'Enviada', count: 5 },
    { value: 'RECIBIDA', label: 'Recibida', count: 7 },
    { value: 'COMPLETADA', label: 'Completada', count: 3 },
    { value: 'ANULADA', label: 'Anulada', count: 2 },
  ];

  const handleAction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert('Acción ejecutada!');
  };

  return (
    <ExampleContainer>
      {/* StatusBadge Examples */}
      <Section>
        <SectionTitle>1. StatusBadge - Badges de Estado</SectionTitle>
        
        <h3>Purchase Order Status:</h3>
        <BadgeRow>
          <StatusBadge status="PENDIENTE" />
          <StatusBadge status="ENVIADA" />
          <StatusBadge status="RECIBIDA" />
          <StatusBadge status="COMPLETADA" />
          <StatusBadge status="ANULADA" />
          <StatusBadge status="PARCIAL" />
        </BadgeRow>

        <h3>Purchase Receipt Status:</h3>
        <BadgeRow>
          <StatusBadge status="PENDIENTE" />
          <StatusBadge status="CONFIRMADA" />
          <StatusBadge status="ANULADA" />
        </BadgeRow>

        <h3>Diferentes tamaños:</h3>
        <BadgeRow>
          <StatusBadge status="COMPLETADA" size="small" />
          <StatusBadge status="COMPLETADA" size="medium" />
          <StatusBadge status="COMPLETADA" size="large" />
        </BadgeRow>

        <CodeBlock>{`<StatusBadge status="COMPLETADA" size="medium" />`}</CodeBlock>
      </Section>

      {/* ActionButton Examples */}
      <Section>
        <SectionTitle>2. ActionButton - Botones de Acción</SectionTitle>

        <h3>Variantes:</h3>
        <BadgeRow>
          <ActionButton label="Primary" variant="primary" icon="fa-check" />
          <ActionButton label="Secondary" variant="secondary" icon="fa-cog" />
          <ActionButton label="Danger" variant="danger" icon="fa-trash" />
          <ActionButton label="Success" variant="success" icon="fa-check-circle" />
          <ActionButton label="Warning" variant="warning" icon="fa-exclamation-triangle" />
          <ActionButton label="Info" variant="info" icon="fa-info-circle" />
        </BadgeRow>

        <h3>Estados:</h3>
        <BadgeRow>
          <ActionButton 
            label="Normal" 
            variant="primary" 
            icon="fa-save"
            onClick={handleAction}
          />
          <ActionButton 
            label="Disabled" 
            variant="primary" 
            icon="fa-save"
            disabled 
          />
          <ActionButton 
            label="Loading" 
            variant="primary" 
            loading={loading}
            onClick={handleAction}
          />
        </BadgeRow>

        <h3>Con Tooltips:</h3>
        <BadgeRow>
          <ActionButton 
            label="Guardar" 
            variant="success" 
            icon="fa-save"
            tooltip="Guardar cambios"
          />
          <ActionButton 
            label="Eliminar" 
            variant="danger" 
            icon="fa-trash"
            tooltip="Eliminar permanentemente"
          />
        </BadgeRow>

        <h3>ActionButtonsGroup:</h3>
        <ActionButtonsGroup
          buttons={[
            { label: 'Editar', variant: 'primary', icon: 'fa-edit' },
            { label: 'Eliminar', variant: 'danger', icon: 'fa-trash' },
            { label: 'Cancelar', variant: 'secondary', icon: 'fa-times' },
          ]}
          align="left"
        />

        <CodeBlock>{`<ActionButton 
  label="Guardar" 
  variant="success" 
  icon="fa-save"
  tooltip="Guardar cambios"
  onClick={handleSave}
/>`}</CodeBlock>
      </Section>

      {/* SearchFilters Examples */}
      <Section>
        <SectionTitle>3. SearchFilters - Filtros de Búsqueda</SectionTitle>

        <h3>Filtros con búsqueda y estado:</h3>
        <SearchFilters
          onSearchChange={(search) => setSearchTerm(search)}
          onStatusChange={(status) => setSelectedStatus(status)}
          statusOptions={statusOptions}
          searchPlaceholder="Buscar órdenes de compra..."
          showSearch
          showStatusFilter
        />

        <h3>Filtros con rango de fechas:</h3>
        <SearchFilters
          onSearchChange={(search) => setSearchTerm(search)}
          onDateRangeChange={(from, to) => console.log('Fechas:', from, to)}
          searchPlaceholder="Buscar recepciones..."
          showSearch
          showDateFilters
        />

        <h3>Filtros completos:</h3>
        <SearchFilters
          onSearchChange={(search) => setSearchTerm(search)}
          onStatusChange={(status) => setSelectedStatus(status)}
          onDateRangeChange={(from, to) => console.log('Fechas:', from, to)}
          statusOptions={statusOptions}
          searchPlaceholder="Buscar..."
          showSearch
          showStatusFilter
          showDateFilters
        />

        <CodeBlock>{`<SearchFilters
  onSearchChange={(search) => console.log(search)}
  onStatusChange={(status) => console.log(status)}
  statusOptions={[
    { value: '', label: 'Todos', count: 25 },
    { value: 'PENDIENTE', label: 'Pendiente', count: 8 }
  ]}
  searchPlaceholder="Buscar..."
  showSearch
  showStatusFilter
/>`}</CodeBlock>

        <p><strong>Valores actuales:</strong></p>
        <p>Búsqueda: {searchTerm || '(vacío)'}</p>
        <p>Estado: {selectedStatus || '(todos)'}</p>
      </Section>

      {/* Integración Real */}
      <Section>
        <SectionTitle>4. Ejemplo de Integración Real</SectionTitle>
        
        <SearchFilters
          onSearchChange={(search) => setSearchTerm(search)}
          onStatusChange={(status) => setSelectedStatus(status)}
          statusOptions={statusOptions}
          searchPlaceholder="Buscar órdenes..."
          showSearch
          showStatusFilter
        />

        <div style={{ marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Código</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Proveedor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '0.75rem' }}>OC-2025-001</td>
                <td style={{ padding: '0.75rem' }}>Proveedor A</td>
                <td style={{ padding: '0.75rem' }}>
                  <StatusBadge status="ENVIADA" size="small" />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <ActionButtonsGroup
                    buttons={[
                      { label: 'Ver', variant: 'info', icon: 'fa-eye', size: 'small' },
                      { label: 'Editar', variant: 'primary', icon: 'fa-edit', size: 'small' },
                    ]}
                    gap="0.5rem"
                  />
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '0.75rem' }}>OC-2025-002</td>
                <td style={{ padding: '0.75rem' }}>Proveedor B</td>
                <td style={{ padding: '0.75rem' }}>
                  <StatusBadge status="COMPLETADA" size="small" />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <ActionButtonsGroup
                    buttons={[
                      { label: 'Ver', variant: 'info', icon: 'fa-eye', size: 'small' },
                      { label: 'PDF', variant: 'secondary', icon: 'fa-file-pdf', size: 'small' },
                    ]}
                    gap="0.5rem"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </ExampleContainer>
  );
};

export default UIComponentsExample;

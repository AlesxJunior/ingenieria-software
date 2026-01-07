import styled from 'styled-components';
import { COLORS, SHADOWS, SPACING } from '../../styles/theme';

/**
 * COMPONENTES DE TARJETAS ESTANDARIZADOS
 * 
 * Basados en el patrón definido en TemplateUI.tsx
 * Uso consistente en todos los módulos del proyecto
 * 
 * NOTA: StatCard, StatsGrid, StatValue, StatLabel ya existen en StatCard.tsx
 * Este archivo provee componentes adicionales de tarjetas genéricas
 */

/**
 * Card básica - Contenedor general con padding, border y shadow
 * Uso: Contenedores generales, secciones de formulario, módulos de configuración
 */
export const Card = styled.div`
  background: ${COLORS.white};
  padding: ${SPACING.xl};
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
  box-shadow: ${SHADOWS.sm};
`;

/**
 * FiltersCard - Para secciones de filtros
 * Uso: Filtros de búsqueda, formularios de filtrado
 */
export const FiltersCard = styled(Card)`
  margin-bottom: ${SPACING.xl};
`;

/**
 * SummaryCard - Tarjeta para resúmenes en reportes
 * Uso: Tarjetas de resumen en módulo de reportes
 */
export const SummaryCard = styled(Card)`
  /* Estilo consistente con Card base del patrón TemplateUI */
`;

/**
 * SummaryCards - Grid para organizar múltiples SummaryCards
 * Uso: Reportes, dashboards de resumen
 */
export const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING['2xl']};
`;

/**
 * CardTitle - Título para Card/SummaryCard
 */
export const CardTitle = styled.h3`
  margin: 0 0 ${SPACING.sm} 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text.secondary};
`;

/**
 * CardValue - Valor destacado dentro de SummaryCard
 */
export const CardValue = styled.p`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${COLORS.text.primary};
`;

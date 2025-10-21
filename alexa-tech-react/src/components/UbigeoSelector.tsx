import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../utils/api';
import type { ApiResponse } from '../utils/api';

interface Departamento { id: string; nombre: string; }
interface Provincia { id: string; nombre: string; departamentoId: string; }
interface Distrito { id: string; nombre: string; provinciaId: string; }

export interface UbigeoValue {
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
}

interface UbigeoSelectorProps {
  value: UbigeoValue;
  onChange: (value: { departamentoId: string; provinciaId: string; distritoId: string }) => void;
  errors?: {
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
  };
  disabled?: boolean;
  compact?: boolean;
}

const FormRow = styled.div<{ $compact?: boolean }>`
  display: ${props => props.$compact ? 'flex' : 'grid'};
  ${props => props.$compact ? `
    gap: 15px;
    flex-wrap: wrap;
  ` : `
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `}
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ $compact?: boolean }>`
  font-weight: 500;
  color: #2c3e50;
  font-size: ${props => props.$compact ? '12px' : '0.9rem'};
`;

const Select = styled.select<{ $hasError?: boolean; $compact?: boolean }>`
  padding: ${props => props.$compact ? '8px' : '0.75rem'};
  border: ${props => props.$hasError ? (props.$compact ? '1px solid #e74c3c' : '2px solid #e74c3c') : (props.$compact ? '1px solid #e1e8ed' : '2px solid #e1e8ed')};
  border-radius: ${props => props.$compact ? '4px' : '8px'};
  font-size: ${props => props.$compact ? '14px' : '1rem'};
  background: white;
  transition: border-color 0.2s;
  width: ${props => props.$compact ? '200px' : '100%'};

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

const UbigeoSelector: React.FC<UbigeoSelectorProps> = ({ value, onChange, errors, disabled, compact = false }) => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  // Cargar departamentos al montar
  useEffect(() => {
    let active = true;
    const loadDeps = async () => {
      setLoadingDeps(true);
      const res: ApiResponse<Departamento[]> = await apiService.getDepartamentos();
      if (res.success && res.data && active) {
        setDepartamentos(res.data);
      }
      setLoadingDeps(false);
    };
    loadDeps();
    return () => { active = false; };
  }, []);

  // Cargar provincias cuando cambia el departamento
  useEffect(() => {
    let active = true;
    const depId = value.departamentoId;
    if (!depId) {
      setProvincias([]);
      setDistritos([]);
      return;
    }
    const loadProvs = async () => {
      setLoadingProv(true);
      const res: ApiResponse<Provincia[]> = await apiService.getProvincias(depId);
      if (res.success && res.data && active) {
        setProvincias(res.data);
      }
      setLoadingProv(false);
    };
    loadProvs();
    // Si cambia el departamento, limpiar provincia y distrito si no coinciden
    return () => { active = false; };
  }, [value.departamentoId]);

  // Cargar distritos cuando cambia la provincia
  useEffect(() => {
    let active = true;
    const provId = value.provinciaId;
    if (!provId) {
      setDistritos([]);
      return;
    }
    const loadDists = async () => {
      setLoadingDist(true);
      const res: ApiResponse<Distrito[]> = await apiService.getDistritos(provId);
      if (res.success && res.data && active) {
        setDistritos(res.data);
      }
      setLoadingDist(false);
    };
    loadDists();
    return () => { active = false; };
  }, [value.provinciaId]);

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depId = e.target.value || undefined;
    onChange({ departamentoId: depId || '', provinciaId: '', distritoId: '' });
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value || undefined;
    onChange({ departamentoId: value.departamentoId || '', provinciaId: provId || '', distritoId: '' });
  };

  const handleDistritoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value || undefined;
    onChange({ departamentoId: value.departamentoId || '', provinciaId: value.provinciaId || '', distritoId: distId || '' });
  };

  return (
    <FormRow $compact={compact}>
      <FormGroup>
        <Label $compact={compact} htmlFor="departamentoId">Departamento *</Label>
        <Select
          $compact={compact}
          id="departamentoId"
          value={value.departamentoId || ''}
          onChange={handleDepartamentoChange}
          disabled={disabled || loadingDeps}
          $hasError={!!errors?.departamentoId}
        >
          <option value="">Seleccione un departamento</option>
          {departamentos.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.nombre}</option>
          ))}
        </Select>
        {errors?.departamentoId && <ErrorMessage>{errors.departamentoId}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label $compact={compact} htmlFor="provinciaId">Provincia *</Label>
        <Select
          $compact={compact}
          id="provinciaId"
          value={value.provinciaId || ''}
          onChange={handleProvinciaChange}
          disabled={disabled || !value.departamentoId || loadingProv}
          $hasError={!!errors?.provinciaId}
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map(prov => (
            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
          ))}
        </Select>
        {errors?.provinciaId && <ErrorMessage>{errors.provinciaId}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label $compact={compact} htmlFor="distritoId">Distrito *</Label>
        <Select
          $compact={compact}
          id="distritoId"
          value={value.distritoId || ''}
          onChange={handleDistritoChange}
          disabled={disabled || !value.provinciaId || loadingDist}
          $hasError={!!errors?.distritoId}
        >
          <option value="">Seleccione un distrito</option>
          {distritos.map(dist => (
            <option key={dist.id} value={dist.id}>{dist.nombre}</option>
          ))}
        </Select>
        {errors?.distritoId && <ErrorMessage>{errors.distritoId}</ErrorMessage>}
      </FormGroup>
    </FormRow>
  );
};

export default UbigeoSelector;
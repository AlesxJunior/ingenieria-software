/**
 * COMPONENTE: SearchFilters
 * Filtros de búsqueda reutilizables
 * Fase 6 - Task 17
 * 
 * Características:
 * - Input de búsqueda con debounce
 * - Selector de estado con chips
 * - Date pickers (desde/hasta)
 * - Clear all filters
 * - Contador de filtros activos
 * - Responsive design
 * - Callbacks para cambios
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// ==================== TIPOS ====================

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchFiltersProps {
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: string) => void;
  onDateRangeChange?: (from: string, to: string) => void;
  statusOptions?: FilterOption[];
  showSearch?: boolean;
  showStatusFilter?: boolean;
  showDateFilters?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
  className?: string;
}

// ==================== STYLED COMPONENTS ====================

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 0.875rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #0047b3;
    box-shadow: 0 0 0 3px rgba(0, 71, 179, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const StatusChipsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const StatusChip = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#0047b3' : '#dee2e6'};
  background: ${props => props.$active ? '#0047b3' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover {
    background: ${props => props.$active ? '#003d99' : '#f8f9fa'};
    border-color: ${props => props.$active ? '#003d99' : '#adb5bd'};
    transform: translateY(-1px);
  }

  .count {
    background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : '#e9ecef'};
    padding: 0.125rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const DateFiltersWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const DateInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DateLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  padding: 0.625rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #0047b3;
    box-shadow: 0 0 0 3px rgba(0, 71, 179, 0.1);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover {
    background: #dc3545;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
  }

  i {
    font-size: 0.75rem;
  }
`;

const ActiveFiltersCount = styled.span`
  padding: 0.375rem 0.75rem;
  background: #0047b3;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

// ==================== COMPONENT ====================

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  statusOptions = [],
  showSearch = true,
  showStatusFilter = true,
  showDateFilters = false,
  searchPlaceholder = 'Buscar...',
  debounceMs = 500,
  className,
}) => {
  // ==================== ESTADOS ====================

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ==================== DEBOUNCE SEARCH ====================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, onSearchChange]);

  // ==================== HANDLERS ====================

  const handleStatusClick = (status: string) => {
    const newStatus = selectedStatus === status ? '' : status;
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);
    if (onDateRangeChange) {
      onDateRangeChange(newDateFrom, dateTo);
    }
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTo = e.target.value;
    setDateTo(newDateTo);
    if (onDateRangeChange) {
      onDateRangeChange(dateFrom, newDateTo);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');

    if (onSearchChange) onSearchChange('');
    if (onStatusChange) onStatusChange('');
    if (onDateRangeChange) onDateRangeChange('', '');
  };

  // ==================== ACTIVE FILTERS COUNT ====================

  const activeFiltersCount = [
    searchTerm !== '',
    selectedStatus !== '',
    dateFrom !== '' || dateTo !== '',
  ].filter(Boolean).length;

  // ==================== RENDER ====================

  return (
    <FiltersContainer className={className}>
      <FilterRow>
        {/* Search Input */}
        {showSearch && (
          <SearchInputWrapper>
            <i className="fas fa-search"></i>
            <SearchInput
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <FilterActions>
            <ActiveFiltersCount>
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
            </ActiveFiltersCount>
            <ClearButton onClick={handleClearFilters}>
              <i className="fas fa-times"></i>
              Limpiar
            </ClearButton>
          </FilterActions>
        )}
      </FilterRow>

      {/* Status Filter Chips */}
      {showStatusFilter && statusOptions.length > 0 && (
        <FilterRow>
          <StatusChipsContainer>
            {statusOptions.map((option) => (
              <StatusChip
                key={option.value}
                $active={selectedStatus === option.value}
                onClick={() => handleStatusClick(option.value)}
              >
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span className="count">{option.count}</span>
                )}
              </StatusChip>
            ))}
          </StatusChipsContainer>
        </FilterRow>
      )}

      {/* Date Range Filters */}
      {showDateFilters && (
        <FilterRow>
          <DateFiltersWrapper>
            <DateInputGroup>
              <DateLabel>Desde</DateLabel>
              <DateInput
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </DateInputGroup>
            <DateInputGroup>
              <DateLabel>Hasta</DateLabel>
              <DateInput
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                min={dateFrom}
              />
            </DateInputGroup>
          </DateFiltersWrapper>
        </FilterRow>
      )}
    </FiltersContainer>
  );
};

export default SearchFilters;

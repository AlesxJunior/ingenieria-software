// Tipos comunes y utilidades

export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditableEntity extends Entity {
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
}

export interface SoftDeletable {
  isActive: boolean;
  deletedAt?: Date;
}

export type ID = string;

export type Timestamp = Date | string;

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface DateFilter {
  from?: Date;
  to?: Date;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

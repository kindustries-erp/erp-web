import type { Role } from "../../domain/entities/role";

export type RoleDto = Role;

export interface RoleListResultDto {
  items: RoleDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ColumnOptionsResultDto {
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}

export interface RoleEnvelopeDto {
  message?: string;
  data: RoleDto;
}

export interface RolePayloadDto {
  name: string;
  description?: string;
}

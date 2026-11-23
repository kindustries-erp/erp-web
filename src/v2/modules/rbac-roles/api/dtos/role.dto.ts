import type { Role } from "../../domain/entities/role";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";

export type RoleDto = Role;

/** Response danh sách chuẩn v2: `items` và `pagination` */
export type RoleListResultDto = V2PaginatedResponse<RoleDto>;

/** Response column-options chuẩn v2: `items` và `pagination` (có next/previous) */
export type ColumnOptionsResultDto = V2PaginatedResponse<{
  label: string;
  value: string;
}>;

export interface RoleEnvelopeDto {
  message?: string;
  data: RoleDto;
}

export interface RolePayloadDto {
  name: string;
  description?: string;
}

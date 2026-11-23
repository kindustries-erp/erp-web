import axiosInstance from "@/core/api/axiosInstance";
import {
  AUTH_SESSIONS_PATH,
  refreshSession,
  type AuthSessionsEnvelope,
} from "@/v2/shared/api/authSessionsApi";

// ── Domain types ───────────────────────────────────────────────────────────

export interface PermissionDetail {
  action: string;
  fields: string[] | null;
  permissions: Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
}

export interface CollectionPermission {
  collection: string;
  actions: string[];
  details: PermissionDetail[];
}

export interface EffectivePermissionDetail extends PermissionDetail {
  source: "role" | "custom";
}

export interface EffectiveCollectionPermission {
  collection: string;
  actions: string[];
  details: EffectivePermissionDetail[];
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: string;
    name: string;
    icon: string;
    description: string | null;
  } | null;
}

// ── Impersonation types ────────────────────────────────────────────────────

export interface ImpersonationActor {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export type ImpersonationMetadata =
  | { active: false }
  | { active: true; actor: ImpersonationActor };

export interface AuthProfileResponse {
  profile: UserProfile;
  employee: Employee | null;
  rolePermissions: CollectionPermission[];
  customPermissions: CollectionPermission[];
  effectivePermissions: EffectiveCollectionPermission[];
  impersonation: ImpersonationMetadata;
}

export interface Department {
  id: string;
  department_code: string;
  department_name: string;
  parent_department_id: string | null;
  manager_employee_id: string | null;
  description: string;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface Position {
  id: string;
  position_code: string;
  position_name: string;
  department_group: string;
  approval_level: number;
  description: string;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  department_id: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  manager_employee_id: string | null;
  business_partner_id: string | null;
  employment_status: string;
  hire_date: string | null;
  resign_date: string | null;
  signature_file_id: string | null;
  notes: string | null;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  department_id: Department;
  position_id: Position;
  branch_id?:
    | string
    | { id?: string; branch_code?: string; branch_name?: string }
    | null;
}

export interface UpdateProfileRequest {
  employee_code?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  manager_employee_id?: string | null;
  business_partner_id?: string | null;
  employment_status?: string;
  hire_date?: string | null;
  resign_date?: string | null;
  signature_file_id?: string | null;
  notes?: string | null;
  is_active?: boolean;
  department_id?: string;
  position_id?: string;
  branch_id?: string | null;
  role_id?: string | null;
  policy_id?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface SelfUpdateProfileRequest {
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface SelfUpdateProfileData {
  id: string;
  full_name: string;
  phone: string | null;
  notes: string | null;
}

export interface EmployeeApiResponse {
  message: string;
  data: Employee;
}

// ── Auth types ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  employee: Employee;
  access_token: string;
  refresh_token: string;
  expires: number; // seconds until expiry
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires: number; // seconds
}

export interface ImpersonateRequest {
  target_user_id: string;
}

export interface ImpersonateResponse {
  impersonation_token: string;
  expires: number; // seconds
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<
    AuthSessionsEnvelope<LoginResponse>
  >(`${AUTH_SESSIONS_PATH}/login`, payload, { _silentSuccess: true });
  return data.data;
}

export async function logoutApi(
  payload: LogoutRequest,
): Promise<LogoutResponse> {
  const { data } = await axiosInstance.post<LogoutResponse>(
    `${AUTH_SESSIONS_PATH}/logout`,
    { refreshToken: payload.refresh_token },
    { _silentSuccess: true },
  );
  return data;
}

export async function refreshTokenApi(
  payload: RefreshRequest,
): Promise<RefreshResponse> {
  return refreshSession(
    axiosInstance.defaults.baseURL ?? "",
    payload.refresh_token,
  );
}

export async function impersonateApi(
  payload: ImpersonateRequest,
): Promise<ImpersonateResponse> {
  const { data } = await axiosInstance.post<
    AuthSessionsEnvelope<ImpersonateResponse>
  >(
    `${AUTH_SESSIONS_PATH}/impersonate`,
    { targetUserId: payload.target_user_id },
    { _silentSuccess: true },
  );
  return data.data;
}

export async function updateProfileApi(
  id: string,
  payload: UpdateProfileRequest,
): Promise<Employee> {
  const { data } = await axiosInstance.patch<EmployeeApiResponse>(
    `/api/v1/employees/${id}`,
    payload,
  );
  return data.data;
}

export async function getEmployeeApi(id: string): Promise<Employee> {
  const { data } = await axiosInstance.get<EmployeeApiResponse>(
    `/api/v1/employees/${id}`,
  );
  return data.data;
}

export async function changePasswordApi(
  payload: ChangePasswordRequest,
): Promise<{ message: string }> {
  const { data } = await axiosInstance.post<{ message: string }>(
    `${AUTH_SESSIONS_PATH}/change-password`,
    payload,
  );
  return data;
}

export async function getProfileApi(): Promise<AuthProfileResponse> {
  const { data } = await axiosInstance.get<
    AuthSessionsEnvelope<AuthProfileResponse>
  >(`${AUTH_SESSIONS_PATH}/profile`);
  return data.data;
}

export async function selfUpdateProfileApi(
  payload: SelfUpdateProfileRequest,
): Promise<SelfUpdateProfileData> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: {
      id: string;
      fullName: string;
      phone: string | null;
      notes: string | null;
    };
  }>(`${AUTH_SESSIONS_PATH}/profile`, {
    email: payload.email,
    fullName: payload.full_name,
    phone: payload.phone,
    notes: payload.notes,
  });
  const result = data.data;
  return {
    id: result.id,
    full_name: result.fullName,
    phone: result.phone,
    notes: result.notes,
  };
}

// ── Permission helpers ─────────────────────────────────────────────────────

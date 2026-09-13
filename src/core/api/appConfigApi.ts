import axiosInstance from "./axiosInstance";

export interface AppPublicConfig {
  appEnv: string;
  appName: string;
  version: string;
}

export interface UserPreferencesData {
  id?: string;
  userId?: string;
  theme?: string;
  language?: string;
  tableConfigs?: Record<string, any>;
  uiConfigs?: Record<string, any>;
}

export async function getAppConfigApi(): Promise<AppPublicConfig> {
  const res = await axiosInstance.get<AppPublicConfig>("/api/v1/app/config", {
    _silentError: true,
  });
  return res.data;
}

export async function getUserPreferencesApi(): Promise<UserPreferencesData> {
  const res = await axiosInstance.get<{
    message: string;
    data: UserPreferencesData;
  }>("/api/v1/app/preferences", {
    _silentError: true,
  });
  return res.data.data;
}

export async function updateUserPreferencesApi(
  payload: Partial<UserPreferencesData>,
): Promise<UserPreferencesData> {
  const res = await axiosInstance.patch<{
    message: string;
    data: UserPreferencesData;
  }>("/api/v1/app/preferences", payload, {
    _silentSuccess: true,
    _silentError: true,
  });
  return res.data.data;
}

export interface ChangelogItemDto {
  type: "feature" | "enhancement" | "fix";
  textVi: string;
  textEn: string;
}

export interface ChangelogReleaseDto {
  version: string;
  date: string;
  tag?: string;
  isLatest?: boolean;
  titleVi: string;
  titleEn: string;
  items: ChangelogItemDto[];
}

export interface PaginatedChangelogResponse {
  items: ChangelogReleaseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface GetChangelogParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getChangelogApi(
  params: GetChangelogParams = {},
): Promise<PaginatedChangelogResponse> {
  const res = await axiosInstance.get<PaginatedChangelogResponse>(
    "/api/v1/app/changelog",
    {
      params,
      _silentError: true,
    },
  );
  return res.data;
}

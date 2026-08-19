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

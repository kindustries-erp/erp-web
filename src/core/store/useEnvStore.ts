import { create } from "zustand";
import { AppEnvironment } from "../constants/environments";
import { getAppConfigApi } from "../api/appConfigApi";

interface EnvFlags {
  env: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isLocal: boolean;
  isLocalProdData: boolean;
  isKlotus: boolean;
  isGreenway: boolean;
  isBlueway: boolean;
  envPrefix: string;
  envSuffix: string;
}

interface EnvState extends EnvFlags {
  isFetched: boolean;
  setAppEnv: (env: string) => void;
  fetchAppConfig: () => Promise<void>;
}

export function computeEnvFlags(rawEnv: string): EnvFlags {
  const envLower = (rawEnv || AppEnvironment.DEVELOPMENT).toLowerCase();
  const parts = envLower.split("-");
  const prefix = parts[0];
  const suffix = parts.length > 1 ? parts.slice(1).join("-") : "";

  const isLocalProdData =
    envLower.endsWith("production-development") ||
    envLower.endsWith("prod-dev");

  const isProduction =
    !isLocalProdData &&
    (envLower === AppEnvironment.PRODUCTION ||
      envLower.endsWith(AppEnvironment.PRODUCTION) ||
      envLower.endsWith("-production") ||
      envLower === AppEnvironment.KLOTUS_PRODUCTION ||
      envLower === AppEnvironment.GREENWAY_PRODUCTION);

  const isLocal = envLower.includes("local");

  const isDevelopment =
    !isProduction &&
    (envLower === AppEnvironment.DEVELOPMENT ||
      envLower === "local" ||
      envLower.endsWith("-development") ||
      envLower.endsWith("-dev"));

  return {
    env: rawEnv,
    isProduction,
    isDevelopment,
    isLocal,
    isLocalProdData,
    isKlotus: envLower.startsWith("klotus"),
    isGreenway: envLower.startsWith("greenway"),
    isBlueway: envLower.startsWith("blueway"),
    envPrefix: prefix,
    envSuffix: suffix,
  };
}

const initialEnv =
  typeof __APP_ENV__ !== "undefined" ? __APP_ENV__ : AppEnvironment.DEVELOPMENT;

export const useEnvStore = create<EnvState>((set) => ({
  ...computeEnvFlags(initialEnv),
  isFetched: false,

  setAppEnv: (env: string) => {
    set({
      ...computeEnvFlags(env),
      isFetched: true,
    });
  },

  fetchAppConfig: async () => {
    try {
      const config = await getAppConfigApi();
      if (config?.appEnv) {
        set({
          ...computeEnvFlags(config.appEnv),
          isFetched: true,
        });
      }
    } catch {
      // Non-blocking, fallback to existing state
    }
  },
}));

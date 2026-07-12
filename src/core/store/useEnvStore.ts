import { create } from "zustand";
import { AppEnvironment } from "../constants/environments";

interface EnvState {
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

// Determine the current environment globally once
const rawEnv =
  typeof __APP_ENV__ !== "undefined" ? __APP_ENV__ : AppEnvironment.DEVELOPMENT;
const envLower = rawEnv.toLowerCase();

// Parse prefix/suffix if hyphenated (e.g., klotus-staging)
const parts = envLower.split("-");
const prefix = parts[0];
const suffix = parts.length > 1 ? parts.slice(1).join("-") : "";

export const useEnvStore = create<EnvState>(() => ({
  env: rawEnv,
  isProduction:
    envLower === AppEnvironment.PRODUCTION ||
    envLower.endsWith(AppEnvironment.PRODUCTION),
  isDevelopment:
    envLower === AppEnvironment.DEVELOPMENT || envLower === "local",
  isLocal: envLower.includes("local"),
  isLocalProdData:
    envLower.endsWith("production-development") ||
    envLower.endsWith("prod-dev"),
  isKlotus: envLower.startsWith("klotus-"),
  isGreenway: envLower.startsWith("greenway-"),
  isBlueway: envLower.startsWith("blueway-"),
  envPrefix: prefix,
  envSuffix: suffix,
}));

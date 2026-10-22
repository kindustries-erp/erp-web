import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useEnvStore } from "@/core/store/useEnvStore";
import { AppEnvironment } from "@/core/constants/environments";
import { V2EnvStampProps } from "./V2EnvStamp.type";

export const V2EnvStamp: React.FC<V2EnvStampProps> = ({
  forcedEnv,
  customLabel,
  className,
  ...props
}) => {
  const envState = useEnvStore();

  const isProduction =
    !forcedEnv &&
    (envState.isProduction ||
      envState.env === AppEnvironment.KLOTUS_PRODUCTION ||
      envState.env === AppEnvironment.GREENWAY_PRODUCTION);

  if (isProduction) {
    return null;
  }

  const isLocalProdData = forcedEnv === "prod-dev" || envState.isLocalProdData;
  const isLocal = forcedEnv === "local" || envState.isLocal;
  const isKlotus = forcedEnv === "klotus" || envState.isKlotus;
  const isGreenway = forcedEnv === "greenway" || envState.isGreenway;
  const isBlueway = forcedEnv === "blueway" || envState.isBlueway;
  const isDevelopment = forcedEnv === "dev" || envState.isDevelopment;

  let text: string;
  if (customLabel) {
    text = customLabel;
  } else if (isLocalProdData) {
    const name = envState.envPrefix
      ? envState.envPrefix.toUpperCase()
      : "LOCAL";
    text = `⚠️ ${name} (PROD DATA)`;
  } else if (isLocal) {
    const name = envState.envPrefix
      ? envState.envPrefix.toUpperCase()
      : "LOCAL";
    text = `💻 ${name} LOCAL`;
  } else if (envState.env === AppEnvironment.KLOTUS_STAGING) {
    text = "Klotus Demo";
  } else if (envState.env === AppEnvironment.GREENWAY_STAGING) {
    text = "Greenway Demo";
  } else if (isDevelopment) {
    text = "Development";
  } else {
    const name = envState.envPrefix
      ? envState.envPrefix.charAt(0).toUpperCase() + envState.envPrefix.slice(1)
      : "Demo";
    text = `${name} Demo`;
  }

  let bgClass = "bg-amber-500/90";
  let borderClass = "border-amber-400/50";

  if (isLocalProdData) {
    bgClass = "bg-red-600 shadow-md shadow-red-500/40";
    borderClass = "border-red-500";
  } else if (isLocal) {
    bgClass = "bg-teal-600/90 shadow-md shadow-teal-500/40";
    borderClass = "border-teal-500/50";
  } else if (isKlotus) {
    bgClass = "bg-purple-600/90";
    borderClass = "border-purple-500/50";
  } else if (isGreenway) {
    bgClass = "bg-emerald-600/90";
    borderClass = "border-emerald-500/50";
  } else if (isBlueway) {
    // Tuân thủ No Blue Mandate: sử dụng sky token thay cho blue-*
    bgClass = "bg-sky-600/90";
    borderClass = "border-sky-500/50";
  }

  return (
    <div
      data-testid="v2-env-stamp"
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-2.5 py-1 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md rounded-b-md shadow-sm border-b border-x transition-all select-none",
        bgClass,
        borderClass,
        className,
      )}
      {...props}
    >
      {text}
    </div>
  );
};

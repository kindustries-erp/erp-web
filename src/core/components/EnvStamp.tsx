import React from "react";
import { useEnvStore } from "../store/useEnvStore";
import { AppEnvironment } from "../constants/environments";

export function EnvStamp() {
  const {
    env,
    isProduction,
    isDevelopment,
    isLocalProdData,
    isKlotus,
    isGreenway,
    isBlueway,
    envPrefix,
  } = useEnvStore();

  if (isProduction || env === AppEnvironment.KLOTUS_PRODUCTION) {
    return null;
  }

  let text: string;
  if (isLocalProdData) {
    const name = envPrefix ? envPrefix.toUpperCase() : "LOCAL";
    text = `⚠️ ${name} (PROD DATA)`;
  } else if (isDevelopment) {
    text = "Development";
  } else if (env === AppEnvironment.KLOTUS_STAGING) {
    text = "Klotus Demo";
  } else if (env === AppEnvironment.GREENWAY_STAGING) {
    text = "Greenway Demo";
  } else {
    // Generic fallback: takes the first word before the dash and capitalizes it
    const name = envPrefix.charAt(0).toUpperCase() + envPrefix.slice(1);
    text = `${name} Demo`;
  }

  let bgClass = "bg-amber-500/90";
  let borderClass = "border-amber-400/50";

  if (isLocalProdData) {
    bgClass = "bg-red-600 shadow-md shadow-red-500/40";
    borderClass = "border-red-500";
  } else if (isKlotus) {
    bgClass = "bg-purple-600/90";
    borderClass = "border-purple-500/50";
  } else if (isGreenway) {
    bgClass = "bg-green-600/90";
    borderClass = "border-green-500/50";
  } else if (isBlueway) {
    bgClass = "bg-blue-600/90";
    borderClass = "border-blue-500/50";
  }

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-2.5 py-1 ${bgClass} text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md rounded-b-md shadow-sm border-b border-x ${borderClass} transition-all`}
    >
      {text}
    </div>
  );
}

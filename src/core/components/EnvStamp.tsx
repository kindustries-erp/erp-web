import React from "react";
import { useEnvStore } from "../store/useEnvStore";
import { AppEnvironment } from "../constants/environments";

export function EnvStamp() {
  const {
    env,
    isProduction,
    isDevelopment,
    isKlotus,
    isGreenway,
    isBlueway,
    envPrefix,
  } = useEnvStore();

  if (isProduction || env === AppEnvironment.KLOTUS_PRODUCTION) {
    return null;
  }

  let text: string;
  if (isDevelopment) {
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

  if (isKlotus) {
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
      className={`fixed top-1/2 right-0 -translate-y-1/2 z-[9999] pointer-events-none px-1.5 py-4 ${bgClass} text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md rounded-r-xl shadow-md border-y border-r ${borderClass} transition-all rotate-180 [writing-mode:vertical-rl]`}
    >
      {text}
    </div>
  );
}

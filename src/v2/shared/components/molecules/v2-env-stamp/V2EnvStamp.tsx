import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { GLASS_BACKDROP_FILTER_CLASS } from "@/v2/shared/ui";
import { V2Text } from "@/v2/shared/components/atoms";
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

  const isLocalProdData = forcedEnv
    ? forcedEnv === "prod-dev"
    : envState.isLocalProdData;
  const isLocal = forcedEnv ? forcedEnv === "local" : envState.isLocal;
  const isKlotus = forcedEnv ? forcedEnv === "klotus" : envState.isKlotus;
  const isGreenway = forcedEnv ? forcedEnv === "greenway" : envState.isGreenway;
  const isBlueway = forcedEnv ? forcedEnv === "blueway" : envState.isBlueway;
  const isDevelopment = forcedEnv
    ? forcedEnv === "dev"
    : envState.isDevelopment;

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

  let variantClass =
    "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:bg-amber-950/60 dark:border-amber-400/30 dark:text-amber-300";

  if (isLocalProdData) {
    variantClass =
      "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:bg-rose-950/70 dark:border-rose-400/35 dark:text-rose-300";
  } else if (isLocal) {
    variantClass =
      "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:bg-teal-950/60 dark:border-teal-400/30 dark:text-teal-300";
  } else if (isKlotus) {
    variantClass =
      "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:bg-purple-950/60 dark:border-purple-400/30 dark:text-purple-300";
  } else if (isGreenway) {
    variantClass =
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-400/30 dark:text-emerald-300";
  } else if (isBlueway) {
    // Tuân thủ No Blue Mandate: sử dụng sky token thay cho blue-*
    variantClass =
      "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:bg-sky-950/60 dark:border-sky-400/30 dark:text-sky-300";
  }

  const hasEmoji = text.startsWith("⚠️") || text.startsWith("💻");

  return (
    <div
      data-testid="v2-env-stamp"
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-b-md border-b border-x border-t-0 shadow-sm transition-all select-none min-h-[24px]",
        GLASS_BACKDROP_FILTER_CLASS,
        variantClass,
        className,
      )}
      {...props}
    >
      {!hasEmoji && (
        <span className="w-2 h-2 rounded-full bg-current opacity-80 shrink-0" />
      )}
      <V2Text
        as="span"
        color="inherit"
        weight="semibold"
        className="text-[11px] uppercase tracking-wider leading-none select-none"
      >
        {text}
      </V2Text>
    </div>
  );
};

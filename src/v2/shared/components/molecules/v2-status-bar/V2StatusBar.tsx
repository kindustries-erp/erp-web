import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Breadcrumb } from "../v2-breadcrumb";
import { V2BranchBadge } from "../v2-branch-badge";
import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useEnvStore } from "@/core/store/useEnvStore";
import { AppEnvironment } from "@/core/constants/environments";
import { V2StatusBarProps } from "./V2StatusBar.type";

export const V2StatusBar: React.FC<V2StatusBarProps> = ({
  breadcrumbs = [],
  branchName,
  companyName,
  logoUrl,
  onBranchClick,
  statusActions,
  showEnvIndicator = true,
  className,
  ...props
}) => {
  const envState = useEnvStore();

  const isProduction =
    envState.isProduction ||
    envState.env === AppEnvironment.KLOTUS_PRODUCTION ||
    envState.env === AppEnvironment.GREENWAY_PRODUCTION;

  const isLocalProdData = envState.isLocalProdData;
  const isLocal = envState.isLocal;

  let envText = "";
  if (!isProduction) {
    if (isLocalProdData) {
      envText = "PROD DATA";
    } else if (isLocal) {
      envText = "LOCAL";
    } else if (envState.env === AppEnvironment.KLOTUS_STAGING) {
      envText = "KLOTUS STAGING";
    } else if (envState.env === AppEnvironment.GREENWAY_STAGING) {
      envText = "GREENWAY STAGING";
    } else if (envState.isDevelopment) {
      envText = "DEV";
    } else if (envState.envPrefix) {
      envText = envState.envPrefix.toUpperCase();
    } else {
      envText = "DEMO";
    }
  }

  return (
    <footer
      data-testid="v2-status-bar"
      className={cn(
        "v2-status-bar flex h-7 min-h-[28px] items-center justify-between gap-3 bg-[color:var(--status-bar-bg,var(--background))] backdrop-blur-md border-t border-[color:var(--status-bar-border,var(--border))] px-4 sm:px-6 select-none flex-shrink-0 transition-colors rounded-b-2xl text-[11px] text-[color:var(--status-bar-muted,var(--muted-fg))]",
        className,
      )}
      {...props}
    >
      {/* Left: Breadcrumbs navigation in status bar */}
      <div className="flex items-center min-w-0 flex-1 overflow-hidden">
        <V2Breadcrumb items={breadcrumbs} />
      </div>

      {/* Right: Environment stamp, Branch badge, Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {showEnvIndicator && !isProduction && envText && (
          <V2Badge
            data-testid="status-bar-env-badge"
            variant={
              isLocalProdData
                ? V2BadgeVariant.DESTRUCTIVE
                : isLocal
                  ? V2BadgeVariant.SUCCESS
                  : V2BadgeVariant.WARNING
            }
            size={V2BadgeSize.XS}
            className={cn(
              "inline-flex items-center gap-1 h-5 px-1.5 rounded select-none font-semibold tracking-wider uppercase border",
              isLocalProdData
                ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                : isLocal
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
            <V2Text
              as="span"
              variant="caption"
              className="text-[10px] font-semibold text-inherit leading-none"
            >
              {envText}
            </V2Text>
          </V2Badge>
        )}

        {branchName && (
          <V2BranchBadge
            branchName={branchName}
            companyName={companyName}
            logoUrl={logoUrl}
            onClick={onBranchClick}
          />
        )}

        {statusActions}
      </div>
    </footer>
  );
};

V2StatusBar.displayName = "V2StatusBar";

import * as React from "react";
import { KeyRound } from "lucide-react";
import { isLocalEnvironment } from "../../../domain/auth.constants";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface V2DevQuickFillProps {
  onQuickFill: () => void;
  disabled?: boolean;
}

export const V2DevQuickFill: React.FC<V2DevQuickFillProps> = ({
  onQuickFill,
  disabled = false,
}) => {
  const { t } = useV2Translation();
  const isLocal = isLocalEnvironment();

  if (!isLocal) return null;

  return (
    <div className="pt-2 text-center">
      <button
        type="button"
        onClick={onQuickFill}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none disabled:opacity-50"
      >
        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t("v2.auth.devAdminFill")}</span>
      </button>
    </div>
  );
};

V2DevQuickFill.displayName = "V2DevQuickFill";

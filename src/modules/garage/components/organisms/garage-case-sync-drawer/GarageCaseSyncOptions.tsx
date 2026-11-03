import React from "react";
import { useTranslation } from "react-i18next";

interface GarageCaseSyncOptionsProps {
  includeDetails: boolean;
  force: boolean;
  setIncludeDetails: (value: boolean) => void;
  setForce: (value: boolean) => void;
}

export function GarageCaseSyncOptions({
  includeDetails,
  force,
  setIncludeDetails,
  setForce,
}: GarageCaseSyncOptionsProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeDetails}
          onChange={(e) => setIncludeDetails(e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
        />
        <span className="text-xs text-foreground font-medium">
          {t(
            "cases.syncDrawer.includeDetails",
            "Bao gồm tải chi tiết vật tư phụ tùng & nhân công",
          )}
        </span>
      </label>
      {includeDetails && (
        <label className="flex items-center gap-2 cursor-pointer select-none ml-6">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-xs text-muted-foreground">
            {t(
              "cases.syncDrawer.forceDetails",
              "Tải lại cả những phiếu đã có chi tiết (force)",
            )}
          </span>
        </label>
      )}
    </div>
  );
}

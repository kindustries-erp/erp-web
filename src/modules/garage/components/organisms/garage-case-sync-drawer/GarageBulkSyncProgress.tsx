import React from "react";
import { useTranslation } from "react-i18next";
import { useGarageBranches } from "../../../hooks/useGarage";
import type { GarageBulkSyncStatus } from "../../../hooks/useGarageBulkSync";

interface GarageBulkSyncProgressProps {
  status?: GarageBulkSyncStatus;
}

export function GarageBulkSyncProgress({
  status,
}: GarageBulkSyncProgressProps) {
  const { t } = useTranslation("garage");
  const { data: branches } = useGarageBranches();

  if (!status || status.status === "idle") return null;

  const isRunning = status.status === "running";
  const failed = status.results.filter((r) => !r.ok);

  const branchLabel = (externalId: string, accountKey: string) => {
    const branch = (branches as any[] | undefined)?.find(
      (b) => b.externalId === externalId,
    );
    const name = branch ? `${branch.name} (${branch.code})` : externalId;
    return `${name} · ${accountKey}`;
  };

  const heading = isRunning
    ? t("cases.syncDrawer.progressRunning", "Đang đồng bộ")
    : status.status === "failed"
      ? t("cases.syncDrawer.progressFailed", "Đồng bộ thất bại")
      : t("cases.syncDrawer.progressDone", "Đã hoàn tất");

  return (
    <div className="rounded-lg border border-border px-3 py-2.5 text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between font-medium text-foreground">
        <span>{heading}</span>
        <span>
          {status.completedBranches}/{status.totalBranches}{" "}
          {t("cases.syncDrawer.branchUnit", "chi nhánh")}
        </span>
      </div>

      {isRunning && status.currentBranch && (
        <div className="text-muted-foreground">
          {t("cases.syncDrawer.currentBranch", "Đang xử lý")}:{" "}
          {branchLabel(
            status.currentBranch.branchExternalId,
            status.currentBranch.accountKey,
          )}
        </div>
      )}

      {!isRunning && status.message && (
        <div className="text-muted-foreground">{status.message}</div>
      )}

      {failed.length > 0 && (
        <ul className="flex flex-col gap-1 text-red-600 dark:text-red-400">
          {failed.map((r) => (
            <li key={`${r.accountKey}-${r.branchExternalId}`}>
              {branchLabel(r.branchExternalId, r.accountKey)}: {r.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

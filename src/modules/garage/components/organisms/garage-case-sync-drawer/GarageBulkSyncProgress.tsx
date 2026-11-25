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
  const failedMonths = status.failedChunks ?? [];
  // Lỗi theo tháng đã liệt kê riêng; chỉ hiện lỗi chi nhánh không gắn tháng.
  const failed = status.results.filter(
    (r) =>
      !r.ok &&
      !failedMonths.some(
        (f) =>
          f.branchExternalId === r.branchExternalId &&
          f.accountKey === r.accountKey,
      ),
  );
  const hasChunks = (status.totalChunks ?? 0) > 0;

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
          {hasChunks
            ? ` · ${status.completedChunks ?? 0}/${status.totalChunks} ${t("cases.syncDrawer.monthUnit", "tháng")}`
            : null}
        </span>
      </div>

      {isRunning && status.currentBranch && (
        <div className="text-muted-foreground">
          {t("cases.syncDrawer.currentBranch", "Đang xử lý")}:{" "}
          {branchLabel(
            status.currentBranch.branchExternalId,
            status.currentBranch.accountKey,
          )}
          {status.currentChunk
            ? ` · ${status.currentChunk.from} → ${status.currentChunk.to}`
            : null}
        </div>
      )}

      {!isRunning && status.message && (
        <div className="text-muted-foreground">{status.message}</div>
      )}

      {failedMonths.length > 0 && (
        <div className="flex flex-col gap-1 text-red-600 dark:text-red-400">
          <span className="font-medium">
            {t("cases.syncDrawer.failedMonths", "Tháng lỗi")}
          </span>
          <ul className="flex flex-col gap-1">
            {failedMonths.map((f) => (
              <li key={`${f.accountKey}-${f.branchExternalId}-${f.from}`}>
                {branchLabel(f.branchExternalId, f.accountKey)} · {f.from} →{" "}
                {f.to}: {f.error}
              </li>
            ))}
          </ul>
        </div>
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

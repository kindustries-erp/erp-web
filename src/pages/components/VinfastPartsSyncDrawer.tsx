import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2SyncProgress } from "@/v2/shared/components/molecules/v2-sync-progress";
import { useVinfastPartsSyncRun } from "../hooks/useVinfastPartsSyncRun";
import {
  VinfastPartsSyncConfigSection,
  type VinfastSyncRange,
} from "./VinfastPartsSyncConfigSection";

interface VinfastPartsSyncDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function VinfastPartsSyncDrawer({
  open,
  onClose,
}: VinfastPartsSyncDrawerProps) {
  const { t } = useTranslation("vinfastParts");

  // Default to current month
  const [dateFrom, setDateFrom] = useState<string | undefined>(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd",
    ),
  );
  const [dateTo, setDateTo] = useState<string | undefined>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [syncRange, setSyncRange] = useState<VinfastSyncRange>("custom");
  const [clearDb, setClearDb] = useState<boolean>(false);

  const { isSyncing, progress, currentItem, logs, status, startSync } =
    useVinfastPartsSyncRun(open);

  return (
    <V2StandardDrawer
      open={open}
      mode="edit"
      onClose={onClose}
      title="Đồng bộ danh mục Vinfast"
      subtitle="Quét hóa đơn nội bộ trong ERP để cập nhật tồn kho và giá vốn FIFO"
      layout="1-column"
      size="sm"
      fillHeight
      leftPanel={
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <VinfastPartsSyncConfigSection
            syncRange={syncRange}
            onSyncRangeChange={setSyncRange}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            clearDb={clearDb}
            onClearDbChange={setClearDb}
            isSyncing={isSyncing}
            onStart={() => startSync({ syncRange, dateFrom, dateTo, clearDb })}
          />

          <DrawerSection
            title={t("SYNC_PROGRESS_TITLE")}
            className="flex min-h-0 flex-1 flex-col"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            <V2SyncProgress
              fillHeight
              status={status}
              progress={progress}
              currentItem={currentItem}
              logs={logs}
              labels={{
                empty: t("SYNC_PROGRESS_EMPTY"),
                currentItem: t("SYNC_PROGRESS_CURRENT_ITEM"),
                running: t("SYNC_PROGRESS_RUNNING"),
                done: t("SYNC_PROGRESS_DONE"),
                error: t("SYNC_PROGRESS_ERROR"),
              }}
            />
          </DrawerSection>
        </div>
      }
    />
  );
}

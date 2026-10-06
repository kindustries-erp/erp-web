import React from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { Button } from "@/shared/components/ui/Button";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { GarageCaseExportHistoryItem } from "../hooks/useGarageCaseExportLogic";

export interface GarageCaseExportHistorySectionProps {
  historyItems: GarageCaseExportHistoryItem[];
  columns: DataTableColumn<GarageCaseExportHistoryItem>[];
  getRowActions: (row: GarageCaseExportHistoryItem) => ActionDropdownItem[];
  onClearHistory: () => void;
}

export const GarageCaseExportHistorySection = React.memo(
  function GarageCaseExportHistorySection({
    historyItems,
    columns,
    getRowActions,
    onClearHistory,
  }: GarageCaseExportHistorySectionProps) {
    const { t } = useTranslation("garage");

    return (
      <div className="space-y-4">
        <DrawerSection
          title={`${t("cases.exportDrawer.historyTitle", "Lịch sử xuất file")} (${historyItems.length})`}
          titleExtra={
            historyItems.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={onClearHistory}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {t("cases.exportDrawer.clearHistory", "Xóa lịch sử")}
              </Button>
            ) : undefined
          }
          collapsible
          defaultCollapsed={false}
        >
          <StandardTable
            tableId="garage-case-export-history"
            variant="spreadsheet"
            enableColumnResizing={true}
            items={historyItems}
            columns={columns}
            actions={getRowActions}
            hideLegacyActionColumn={true}
            enableRowHoverActions={true}
            enableRowContextMenu={true}
            getRowKey={(row) => row.id}
            emptyLabel={t(
              "cases.exportDrawer.emptyHistory",
              "Chưa có file xuất nào trong lịch sử",
            )}
          />
        </DrawerSection>
      </div>
    );
  },
);

import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { useManualCashflowTabContent } from "./ManualCashflowTabContent.hook";
import { ManualCashflowForm } from "./components/ManualCashflowForm";
import { ManualCashflowTable } from "./components/ManualCashflowTable";
import type { ManualCashflowTabContentProps } from "./ManualCashflowTabContent.type";

export function ManualCashflowTabContent(props: ManualCashflowTabContentProps) {
  const {
    editMode = false,
    settlementType,
    baseRemaining,
    manualAmount,
    manualDate,
    manualPartner,
    manualNote,
    onSetManualAmount,
    onSetManualDate,
    onSetManualPartner,
    onSetManualNote,
    onAddManualSettlement,
    manualDraftPending,
  } = props;

  const {
    t,
    domainManualSettlements,
    totalRecordedManualAmount,
    columns,
    summaryRow,
    getRowActions,
  } = useManualCashflowTabContent(props);

  const pendingCount = domainManualSettlements.filter(
    (s: any) => s.isPending,
  ).length;

  const titleExtra = (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
        {money(totalRecordedManualAmount)}
      </span>
      <span className="text-[10px] text-muted-foreground font-normal">
        ({domainManualSettlements.length} GD
        {pendingCount > 0 ? `, ${pendingCount} chờ lưu` : ""})
      </span>
    </div>
  );

  return (
    <div className="space-y-3 pb-2">
      {/* 1. Form nhập liệu thủ công (chỉ hiển thị khi editMode = true) */}
      {editMode && (
        <DrawerSection
          title={t(
            "cases.reconciliation.manualNewTitle",
            "Ghi nhận Dòng tiền Ngoài sổ sách",
          )}
          collapsible={true}
          defaultCollapsed={false}
          className="mb-0 p-3"
          bodyClassName="p-0 space-y-4"
        >
          <ManualCashflowForm
            editMode={editMode}
            settlementType={settlementType}
            baseRemaining={baseRemaining}
            manualAmount={manualAmount}
            manualDate={manualDate}
            manualPartner={manualPartner}
            manualNote={manualNote}
            onSetManualAmount={onSetManualAmount}
            onSetManualDate={onSetManualDate}
            onSetManualPartner={onSetManualPartner}
            onSetManualNote={onSetManualNote}
            onAddManualSettlement={onAddManualSettlement}
            manualDraftPending={manualDraftPending}
          />
        </DrawerSection>
      )}

      {/* 2. Danh sách các khoản dòng tiền ngoài sổ sách */}
      {(domainManualSettlements.length > 0 || !editMode) && (
        <DrawerSection
          title={t(
            "cases.reconciliation.manualListTitle",
            "Danh sách Dòng tiền Ngoài sổ sách đã ghi nhận",
          )}
          titleExtra={
            domainManualSettlements.length > 0 ? titleExtra : undefined
          }
          collapsible={true}
          defaultCollapsed={false}
          className="mb-0 p-3"
          bodyClassName="p-0 space-y-3"
        >
          <ManualCashflowTable
            tableId={`garage-case-manual-cashflow-${editMode ? "edit" : "view"}-${settlementType}`}
            items={domainManualSettlements}
            columns={columns}
            summaryRow={summaryRow}
            rowHoverActions={getRowActions}
            emptyLabel={t(
              "cases.reconciliation.noManualSettlements",
              "Chưa có dòng tiền ngoài sổ sách",
            )}
          />
        </DrawerSection>
      )}
    </div>
  );
}

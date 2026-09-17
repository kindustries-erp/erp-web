import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { readVietnameseCurrency } from "../utils";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  DataTable,
  TableDateCell,
  TableText,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { ManualCashflowTabContentProps } from "../types";

export function ManualCashflowTabContent({
  editMode = false,
  activeSettlements = [],
  onRemoveSettlement,
  settlementType,
  baseRemaining,
  manualAmount,
  manualCategory,
  manualDate,
  manualPartner,
  manualNote,
  onSetManualAmount,
  onSetManualCategory,
  onSetManualDate,
  onSetManualPartner,
  onSetManualNote,
}: ManualCashflowTabContentProps) {
  const { t } = useTranslation(["garage", "common"]);

  // Filter recorded manual settlements for the current settlement direction (RECEIPT vs PAYMENT)
  const domainManualSettlements = useMemo(() => {
    return (activeSettlements || []).filter((s: any) => {
      const isReceipt =
        s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
      const targetType = settlementType === "RECEIPT";
      if (isReceipt !== targetType) return false;

      const isManual =
        (s.source_channel || s.sourceChannel) === "OFF_SYSTEM_MANUAL" ||
        s.category === "TIEN_MAT_NGOAI" ||
        s.category === "CHUYEN_KHOAN_CA_NHAN" ||
        s.category === "KHAC" ||
        (!s.bank_transaction_id && !s.bankTransactionId);

      return isManual;
    });
  }, [activeSettlements, settlementType]);

  const totalRecordedManualAmount = useMemo(() => {
    return domainManualSettlements.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0,
    );
  }, [domainManualSettlements]);

  // Standardized Table Columns following /standardize-table
  const columns: DataTableColumn<any>[] = useMemo(() => {
    const baseCols: DataTableColumn<any>[] = [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "transDate",
        header: t("cases.reconciliation.transDate", "Ngày phát sinh"),
        size: 130,
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.transDate || row.trans_date || row.createdAt}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "category",
        header: t("cases.reconciliation.channel", "Phương thức"),
        size: 160,
        className: "text-center",
        enableResizing: true,
        cell: (row) => {
          const categoryLabel =
            row.category === "TIEN_MAT_NGOAI"
              ? t("cases.reconciliation.channelCash", "💵 Tiền mặt ngoài")
              : row.category === "CHUYEN_KHOAN_CA_NHAN"
                ? t("cases.reconciliation.channelBankPersonal", "🏦 CK Cá nhân")
                : t("cases.reconciliation.channelOther", "✨ Hình thức khác");

          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[140px]">
              {categoryLabel}
            </span>
          );
        },
      },
      {
        key: "partnerName",
        header: t("cases.reconciliation.payerOrReceiver", "Người nộp / nhận"),
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={
              row.partnerName ||
              row.partner_name ||
              row.correspondentName ||
              "—"
            }
            tooltip={true}
            enableCopy={true}
          />
        ),
      },
      {
        key: "amount",
        header: t("cases.reconciliation.amount", "Số tiền (VNĐ)"),
        size: 150,
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "tabular-nums font-semibold",
              settlementType === "RECEIPT"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {money(Number(row.amount || 0))}
          </span>
        ),
      },
      {
        key: "note",
        header: t("cases.reconciliation.manualNote", "Ghi chú & Diễn giải"),
        size: 240,
        enableResizing: true,
        cell: (row) => <TableText text={row.note || "—"} tooltip={true} />,
      },
    ];

    if (editMode && onRemoveSettlement) {
      baseCols.push({
        key: "action",
        header: "",
        size: 44,
        className: "text-center",
        enableResizing: false,
        cell: (row) => (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemoveSettlement(row.id || row.tempId)}
            className="h-6 w-6 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
            title={t("cases.actions.delete", "Xóa")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        ),
      });
    }

    return baseCols;
  }, [editMode, onRemoveSettlement, settlementType, t]);

  const summaryRow = useMemo(() => {
    if (domainManualSettlements.length === 0) return undefined;
    return {
      partnerName: (
        <div className="text-right w-full font-semibold">
          {t("cases.reconciliation.total", "Tổng cộng")}:
        </div>
      ),
      amount: (
        <div
          className={cn(
            "text-right font-bold tabular-nums",
            settlementType === "RECEIPT"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400",
          )}
        >
          {money(totalRecordedManualAmount)}
        </div>
      ),
    };
  }, [
    domainManualSettlements.length,
    settlementType,
    totalRecordedManualAmount,
    t,
  ]);

  // Row actions for context menu & quick actions
  const getRowActions = useMemo(() => {
    if (!editMode || !onRemoveSettlement) return undefined;
    return (row: any): ActionDropdownItem[] => [
      {
        groupLabel: "THAO TÁC",
        items: [
          {
            label: t("cases.actions.delete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
            variant: "danger",
            onClick: () => onRemoveSettlement(row.id || row.tempId),
          },
        ],
      },
    ];
  }, [editMode, onRemoveSettlement, t]);

  // ─── 1. VIEW MODE: READ-ONLY STANDARDIZED SPREADSHEET TABLE OR SHARED EMPTY STATE ───
  if (!editMode) {
    return (
      <div className="space-y-3 pb-2">
        <DrawerSection
          title={t(
            "cases.reconciliation.manualTitle",
            "Thông tin chi tiết Dòng tiền Ngoài sổ sách",
          )}
          titleExtra={
            domainManualSettlements.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {money(totalRecordedManualAmount)}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  ({domainManualSettlements.length} GD)
                </span>
              </div>
            ) : undefined
          }
          collapsible={true}
          defaultCollapsed={false}
          className="mb-0 p-3"
          bodyClassName="p-0 space-y-3"
        >
          {domainManualSettlements.length > 0 ? (
            <DataTable
              tableId={`garage-case-manual-cashflow-view-${settlementType}`}
              items={domainManualSettlements}
              columns={columns}
              variant="spreadsheet"
              enableColumnResizing={true}
              summaryRow={summaryRow}
              emptyLabel={t(
                "cases.reconciliation.noManualSettlements",
                "Chưa có dòng tiền ngoài sổ sách",
              )}
            />
          ) : (
            <EmptyState
              size="md"
              message={t(
                "cases.reconciliation.noManualSettlements",
                "Chưa có dòng tiền ngoài sổ sách",
              )}
              description={t(
                "cases.reconciliation.noManualSettlementsDesc",
                'Chưa ghi nhận khoản thu/chi tiền mặt hoặc chuyển khoản cá nhân ngoài hệ thống ERP. Bấm nút "Chỉnh sửa" ở góc trên bên phải để ghi nhận thêm.',
              )}
            />
          )}
        </DrawerSection>
      </div>
    );
  }

  // ─── 2. EDIT MODE: ENTRY FORM + STANDARDIZED SPREADSHEET TABLE WITH DELETE ACTION ───
  return (
    <div className="space-y-3 pb-2">
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
        {/* Quick % Selection Buttons */}
        {baseRemaining > 0 && (
          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {t(
                  "cases.reconciliation.quickPick",
                  "Gợi ý chọn nhanh số tiền",
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSetManualAmount(baseRemaining)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-800 dark:text-slate-200 hover:text-primary transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {settlementType === "RECEIPT"
                    ? t(
                        "cases.reconciliation.allReceiptRemaining",
                        "Toàn bộ thu còn lại:",
                      )
                    : t(
                        "cases.reconciliation.allPaymentRemaining",
                        "Toàn bộ chi còn lại:",
                      )}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    settlementType === "RECEIPT"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {money(baseRemaining)}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onSetManualAmount(Math.round(baseRemaining * 0.5))
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
              >
                50% ({money(Math.round(baseRemaining * 0.5))})
              </button>
              <button
                type="button"
                onClick={() =>
                  onSetManualAmount(Math.round(baseRemaining * 0.3))
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
              >
                30% ({money(Math.round(baseRemaining * 0.3))})
              </button>
            </div>
          </div>
        )}

        {/* Visual Radio Cards for Channel */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t(
              "cases.reconciliation.channel",
              "Phương thức Dòng tiền Ngoài sổ sách *",
            )}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              onClick={() => onSetManualCategory("TIEN_MAT_NGOAI")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "TIEN_MAT_NGOAI"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t("cases.reconciliation.channelCash", "💵 Tiền mặt ngoài")}
                </span>
                {manualCategory === "TIEN_MAT_NGOAI" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelCashDesc",
                  "Thu/chi tiền mặt trực tiếp không qua sổ quỹ công ty",
                )}
              </span>
            </div>

            <div
              onClick={() => onSetManualCategory("CHUYEN_KHOAN_CA_NHAN")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "CHUYEN_KHOAN_CA_NHAN"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t(
                    "cases.reconciliation.channelBankPersonal",
                    "🏦 CK Cá nhân",
                  )}
                </span>
                {manualCategory === "CHUYEN_KHOAN_CA_NHAN" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelBankPersonalDesc",
                  "Tài khoản ngân hàng cá nhân ngoài hệ thống ERP",
                )}
              </span>
            </div>

            <div
              onClick={() => onSetManualCategory("KHAC")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "KHAC"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t("cases.reconciliation.channelOther", "✨ Hình thức khác")}
                </span>
                {manualCategory === "KHAC" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelOtherDesc",
                  "Cấn trừ nợ đối ứng, bù trừ dịch vụ đặc thù",
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                {t("cases.reconciliation.amount", "Số tiền ghi nhận (VNĐ) *")}
              </span>
              {Number(manualAmount) > 0 && (
                <span className="text-[11px] text-primary font-medium italic">
                  {readVietnameseCurrency(Number(manualAmount))}
                </span>
              )}
            </label>
            <Input
              type="number"
              value={manualAmount}
              onChange={(e) => onSetManualAmount(e.target.value)}
              placeholder="0"
              min={0}
              className="font-mono text-base font-bold text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.transDate",
                "Ngày phát sinh giao dịch *",
              )}
            </label>
            <Input
              type="date"
              value={manualDate}
              onChange={(e) => onSetManualDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.payerOrReceiver",
                "Người nộp / Người nhận / Đối tác liên quan",
              )}
            </label>
            <Input
              value={manualPartner}
              onChange={(e) => onSetManualPartner(e.target.value)}
              placeholder={t(
                "cases.reconciliation.payerOrReceiverPlaceholder",
                "Ví dụ: Anh Nam (Tài xế), Chị Hương...",
              )}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.manualNote",
                "Ghi chú & Diễn giải chi tiết",
              )}
            </label>
            <Textarea
              value={manualNote}
              onChange={(e) => onSetManualNote(e.target.value)}
              placeholder={t(
                "cases.reconciliation.manualNotePlaceholder",
                "Nhập lý do thu/chi ngoài sổ sách...",
              )}
              rows={3}
            />
          </div>
        </div>
      </DrawerSection>

      {/* List of previously recorded off-book settlements (with delete action in edit mode) */}
      {domainManualSettlements.length > 0 && (
        <DrawerSection
          title={t(
            "cases.reconciliation.manualListTitle",
            "Danh sách Dòng tiền Ngoài sổ sách đã ghi nhận",
          )}
          titleExtra={
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {money(totalRecordedManualAmount)}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                ({domainManualSettlements.length} GD)
              </span>
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
          className="mb-0 p-3"
          bodyClassName="p-0 space-y-3"
        >
          <DataTable
            tableId={`garage-case-manual-cashflow-edit-${settlementType}`}
            items={domainManualSettlements}
            columns={columns}
            variant="spreadsheet"
            enableColumnResizing={true}
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

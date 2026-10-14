import React, { useState, useMemo } from "react";
import { AlertTriangle, ShieldCheck, User } from "lucide-react";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type {
  MonthlyReceivablesGroupItem,
  ReceivablesVatWarningSummary,
} from "../../../../api/garageDashboardApi";
import { useInvoicePartnerColumns } from "./useInvoicePartnerColumns";

interface MonthInvoicePartnerTableProps {
  insuranceCompanies: MonthlyReceivablesGroupItem[];
  customerPartners: MonthlyReceivablesGroupItem[];
  allGroups: MonthlyReceivablesGroupItem[];
  warning?: ReceivablesVatWarningSummary;
  totalBilled?: number;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
}

export const MonthInvoicePartnerTable: React.FC<
  MonthInvoicePartnerTableProps
> = ({
  insuranceCompanies,
  customerPartners,
  allGroups,
  warning,
  totalBilled = 0,
  onSelectGroup,
}) => {
  const [subTab, setSubTab] = useState<
    "all" | "insurance" | "customer" | "vat_warning"
  >("all");

  const tableId = "garage_month_invoice_partners_table";
  const tableHook = useTableColumnState(tableId);

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items: allGroups,
        defaultAlign: "center",
      }),
    [tableHook, allGroups],
  );

  const columns = useInvoicePartnerColumns({
    headerFilter,
    onSelectGroup,
  });

  // 1. Phân loại theo subTab
  const baseItems = useMemo(() => {
    switch (subTab) {
      case "insurance":
        return insuranceCompanies;
      case "customer":
        return customerPartners;
      case "vat_warning":
        return allGroups.filter((g) => g.vatWarning);
      case "all":
      default:
        return allGroups;
    }
  }, [subTab, insuranceCompanies, customerPartners, allGroups]);

  // 2. Lọc client filter
  const filteredItems = useMemo(
    () => filterClientItems(baseItems, tableHook),
    [baseItems, tableHook],
  );

  // 3. Summary row
  const summaryRow = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;
    let caseCount = 0;
    filteredItems.forEach((r) => {
      billed += r.billed;
      paid += r.paid;
      remaining += r.remaining;
      caseCount += r.caseCount;
    });
    const shareRate = totalBilled > 0 ? (billed / totalBilled) * 100 : 0;

    return {
      index: (
        <span className="font-bold text-center block text-muted-foreground">
          Σ
        </span>
      ),
      payerType: "",
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
          TỔNG CỘNG ({filteredItems.length} nhóm đối tượng)
        </span>
      ),
      hasInvoice: "",
      caseCount: (
        <span className="font-bold text-center block font-mono text-xs text-foreground">
          {caseCount}
        </span>
      ),
      billed: (
        <span className="font-bold text-right block font-mono tabular-nums text-foreground text-xs">
          {money(billed)}
        </span>
      ),
      paid: (
        <span className="font-bold text-right block font-mono tabular-nums text-emerald-600 dark:text-emerald-400 text-xs">
          {money(paid)}
        </span>
      ),
      remaining: (
        <span
          className={cn(
            "font-bold text-right block font-mono tabular-nums text-xs",
            remaining > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground/60",
          )}
        >
          {remaining > 0 ? money(remaining) : "—"}
        </span>
      ),
      shareRate: (
        <span className="font-bold text-center block font-mono text-xs text-foreground">
          {shareRate.toFixed(1)}%
        </span>
      ),
      actions: "",
    };
  }, [filteredItems, totalBilled]);

  const warnCount = allGroups.filter((g) => g.vatWarning).length;

  // ── PillTab Items chuẩn theo phong cách erp-invoice ─────────────
  const pillItems = useMemo<
    PillTabItem<"all" | "insurance" | "customer" | "vat_warning">[]
  >(() => {
    const items: PillTabItem<
      "all" | "insurance" | "customer" | "vat_warning"
    >[] = [
      {
        value: "all",
        label: "Tất cả",
        badgeCount: allGroups.length,
      },
      {
        value: "insurance",
        label: "Từng Cty Bảo hiểm",
        icon: ShieldCheck,
        badgeCount: insuranceCompanies.length,
        accentColor: "indigo",
      },
      {
        value: "customer",
        label: "Khách hàng",
        icon: User,
        badgeCount: customerPartners.length,
      },
    ];

    if (warnCount > 0) {
      items.push({
        value: "vat_warning",
        label: "Có VAT chưa xuất HĐ",
        icon: AlertTriangle,
        badgeCount: warnCount,
        badgeVariant: "warning",
        accentColor: "amber",
        dot: true,
        dotColor: "amber",
      });
    }

    return items;
  }, [
    allGroups.length,
    insuranceCompanies.length,
    customerPartners.length,
    warnCount,
  ]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ⚠️ Alert Banner Cảnh báo VAT chưa xuất HĐ */}
      {warning?.hasVatWithoutInvoice && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Cảnh báo VAT:</strong> Có{" "}
              <strong>{warning.casesWithVatNoInvoiceCount} vụ việc</strong> có
              thuế GTGT (tổng tiền thuế:{" "}
              <strong className="font-mono">
                {money(warning.totalVatWithoutInvoice)}
              </strong>
              ) chưa được xuất hoặc đính kèm hóa đơn điện tử!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSubTab("vat_warning")}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold text-[11px] shrink-0 transition-colors"
          >
            Lọc vụ việc chưa xuất HĐ ({warnCount})
          </button>
        </div>
      )}

      {/* PillTabs điều hướng lọc chuẩn erp-invoice */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-0.5">
        <PillTabs<"all" | "insurance" | "customer" | "vat_warning">
          size="sm"
          variant="segmented"
          value={subTab}
          onValueChange={setSubTab}
          items={pillItems}
        />

        {tableHook.activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => tableHook.resetFilters()}
            className="text-[11px] font-medium text-destructive hover:underline bg-destructive/10 px-2.5 py-1 rounded-full shrink-0"
          >
            Xóa lọc cột ({tableHook.activeFilterCount})
          </button>
        )}
      </div>

      {/* Bảng DataTable Đối tượng Hóa đơn */}
      <DataTable
        items={filteredItems}
        getRowKey={(row) => row.key}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel="Không tìm thấy đối tượng hóa đơn phù hợp"
        enableColumnResizing={true}
        tableId="garage_month_invoice_partners_table"
        onRowClick={(row) => onSelectGroup?.(row)}
      />
    </div>
  );
};

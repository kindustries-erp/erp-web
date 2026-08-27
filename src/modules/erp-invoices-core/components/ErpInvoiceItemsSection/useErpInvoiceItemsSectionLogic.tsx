import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Building2 } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceItemRow,
} from "../../api/erpInvoicesCoreApi";
import { useErpInvoiceItemsList } from "../../hooks/useErpInvoiceItemsList";
import { useItemColumns } from "./components/itemColumns";
import type { ErpInvoiceItemsSectionProps } from "./types";

export function useErpInvoiceItemsSectionLogic({
  direction,
  instanceIndex = 1,
  canEditInvoice = true,
  partnerTaxCode,
  handleOpenInternal,
}: ErpInvoiceItemsSectionProps) {
  const { t } = useTranslation("erpInvoices");
  const [isExporting, setIsExporting] = useState(false);

  const listHook = useErpInvoiceItemsList({
    direction,
    instanceIndex,
    partnerTaxCode,
  });

  const tableId =
    direction === "IN"
      ? "erp-invoices-in-items-table"
      : "erp-invoices-out-items-table";

  const getSortState = useCallback(
    (key: string) => {
      if (listHook.sorts.includes(key)) return "asc" as const;
      if (listHook.sorts.includes(`-${key}`)) return "desc" as const;
      return "none" as const;
    },
    [listHook.sorts],
  );

  const fetchColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await erpInvoicesCoreApi.getItemColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
        direction,
      );
      return {
        items: res.items.map((it) =>
          typeof it === "string" ? { label: it, value: it } : it,
        ),
        total: res.total,
        next: pageParam < res.totalPages ? pageParam + 1 : null,
      };
    },
    [direction],
  );

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await erpInvoicesCoreApi.exportItemsExcel({
        direction,
        search: listHook.search || undefined,
        invoice_subcategory:
          listHook.subcategoryFilter !== "ALL"
            ? listHook.subcategoryFilter
            : undefined,
        date_from: listHook.dateFrom
          ? `${listHook.dateFrom}T00:00:00`
          : undefined,
        date_to: listHook.dateTo ? `${listHook.dateTo}T23:59:59` : undefined,
        column_filters:
          Object.keys(listHook.columnFilters).length > 0
            ? JSON.stringify(listHook.columnFilters)
            : undefined,
        column_search:
          Object.keys(listHook.columnSearch).length > 0
            ? JSON.stringify(listHook.columnSearch)
            : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dong_hoa_don_${direction.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Failed to export items excel", e);
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useItemColumns({
    direction,
    t,
    listHook,
    getSortState,
    fetchColumnOptions,
    handleOpenInternal,
  });

  const rowActions = useCallback(
    (row: ErpInvoiceItemRow): ActionDropdownItem[] => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("actionDetail", "Xem chi tiết hóa đơn"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () =>
              handleOpenInternal(
                { id: row.invoiceId, invoiceNo: row.invoiceNo },
                "view",
              ),
          },
          {
            label: t("actionPartnerTransactions", "Giao dịch đối tác"),
            icon: <Building2 className="w-4 h-4" />,
            onClick: () =>
              handleOpenInternal(
                { id: row.invoiceId, invoiceNo: row.invoiceNo },
                "view",
                "partner",
              ),
          },
        ],
      },
      {
        groupLabel: "THAO TÁC",
        items: [
          ...(canEditInvoice && row.status !== "CANCELLED"
            ? [
                {
                  label: t("actionEdit", "Chỉnh sửa hóa đơn"),
                  icon: <Pencil className="w-4 h-4" />,
                  onClick: () =>
                    handleOpenInternal(
                      { id: row.invoiceId, invoiceNo: row.invoiceNo },
                      "edit",
                    ),
                },
              ]
            : []),
        ],
      },
    ],
    [canEditInvoice, handleOpenInternal, t],
  );

  return {
    t,
    tableId,
    listHook,
    columns,
    rowActions,
    isExporting,
    handleExportExcel,
  };
}

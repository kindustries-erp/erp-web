import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Pencil,
  Building2,
  Download,
  KeyRound,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
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
  onOpenPortalAuth,
}: ErpInvoiceItemsSectionProps) {
  const { t } = useTranslation("erpInvoices");
  const { openCustomFieldsDrawer } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-options"],
    queryFn: getBranchOptionsApi,
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      noDefaultPeriod: true,
      custom: [
        {
          key: "tag_id",
          label: t("tag", "Thẻ nhãn"),
          placeholder: t("allTags", "Tất cả thẻ"),
          options: allTags.map((tag) => ({ value: tag.id, label: tag.name })),
          type: "combobox" as const,
        },
      ],
    }),
    [t, allTags],
  );

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
    branches,
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
            label: t("actionObjectDetails", "Chi tiết theo đối tượng"),
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

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupTraCuu", "Tra cứu"),
        items: [
          {
            label: t("exportExcel", "Xuất Excel"),
            icon: <Download className="w-4 h-4 text-green-600" />,
            onClick: () => void handleExportExcel(),
          },
        ],
      },
      ...(canEditInvoice && onOpenPortalAuth
        ? [
            {
              groupLabel: t("groupThaoTac", "Thao tác"),
              items: [
                {
                  label: t("loginTaxPortal", "Đăng nhập Cổng Thuế"),
                  icon: <KeyRound className="w-4 h-4 text-primary" />,
                  onClick: () => onOpenPortalAuth(),
                },
              ],
            },
          ]
        : []),
      {
        groupLabel: t("groupCauHinh", "Cấu hình"),
        items: [
          {
            label: t("invoiceConfig.customFields", "Cấu hình trường tùy chỉnh"),
            icon: <Settings className="w-4 h-4 text-violet-500" />,
            onClick: () => openCustomFieldsDrawer("INVOICE", "Hóa đơn"),
          },
        ],
      },
    ],
    [
      t,
      canEditInvoice,
      onOpenPortalAuth,
      handleExportExcel,
      openCustomFieldsDrawer,
    ],
  );

  return {
    t,
    tableId,
    listHook,
    columns,
    rowActions,
    createActions,
    filterConfig,
    isExporting,
    handleExportExcel,
  };
}

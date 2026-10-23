import React, { useMemo } from "react";
import {
  FileSpreadsheet,
  DownloadCloud,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  SupplierDebtItem,
  CreateSupplierCashflowParams,
} from "./GaragePayablesTable.type";

interface UseGaragePayablesActionsParams {
  t: any;
  canSyncGarage?: boolean;
  onSyncCases?: () => void;
  onOpenExport: () => void;
  onOpenCustomerDetail?: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
    debtType?: "receivables" | "payables";
  }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
  onCreateCashflow?: (params: CreateSupplierCashflowParams) => void;
}

export function useGaragePayablesActions({
  t,
  canSyncGarage,
  onSyncCases,
  onOpenExport,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
  onCreateCashflow,
}: UseGaragePayablesActionsParams) {
  const canCreateCashflow = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.CREATE,
  );

  const handleOpenDetail = (row: SupplierDebtItem) => {
    if (onOpenCustomerDetail) {
      onOpenCustomerDetail({
        code: row.customerCode,
        name: row.customerName,
        debtType: "payables",
      });
    } else if (onOpenSupplierDetail) {
      onOpenSupplierDetail({
        id: row.id,
        code: row.customerCode,
        name: row.customerName,
      });
    }
  };

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("debts.actions.exportGroup", "Báo cáo & Xuất file"),
        items: [
          {
            label: t("debts.exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: onOpenExport,
          },
        ],
      },
      ...(canSyncGarage && onSyncCases
        ? [
            {
              groupLabel: t("cases.actions.syncOptions", "Tùy chọn đồng bộ"),
              items: [
                {
                  label: t("cases.actions.syncCases", "Đồng bộ phiếu dịch vụ"),
                  icon: <DownloadCloud className="w-4 h-4 text-sky-600" />,
                  onClick: onSyncCases,
                },
              ],
            },
          ]
        : []),
    ],
    [canSyncGarage, onSyncCases, onOpenExport, t],
  );

  const getRowActions = (row: SupplierDebtItem): ActionDropdownItem[] => [
    {
      groupLabel: t("common:search", "TRA CỨU"),
      items: [
        {
          label: t("customers.actions.viewDetail", "Xem chi tiết khách hàng"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => handleOpenDetail(row),
        },
      ],
    },
    ...(canCreateCashflow && onCreateCashflow
      ? [
          {
            groupLabel: t("debts.actions.cashflowGroup", "PHIẾU THU / CHI"),
            items: [
              {
                label: t("debts.actions.createPayment", "Tạo phiếu chi"),
                icon: <ArrowUpRight className="w-4 h-4 text-rose-600" />,
                onClick: () =>
                  onCreateCashflow({
                    voucherType: "PAYMENT",
                    partnerName: row.supplierName || row.customerName,
                    licensePlate: row.licensePlate || row.bienSoXe,
                    supplierId: row.supplierId,
                    customerCode: row.customerCode,
                    amount:
                      row.balanceAmount > 0 ? row.balanceAmount : undefined,
                  }),
              },
              {
                label: t("debts.actions.createReceipt", "Tạo phiếu thu"),
                icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600" />,
                onClick: () =>
                  onCreateCashflow({
                    voucherType: "RECEIPT",
                    partnerName: row.supplierName || row.customerName,
                    licensePlate: row.licensePlate || row.bienSoXe,
                    supplierId: row.supplierId,
                    customerCode: row.customerCode,
                    amount: undefined,
                  }),
              },
            ],
          },
        ]
      : []),
  ];

  return { createActions, getRowActions, handleOpenDetail };
}

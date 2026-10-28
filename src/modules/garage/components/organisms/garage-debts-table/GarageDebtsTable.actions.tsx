import React from "react";
import { Eye, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  CustomerDebtItem,
  CreateCustomerCashflowParams,
} from "./GarageDebtsTable.type";

interface UseGarageDebtsActionsParams {
  t: any;
  onOpenCustomerDetail: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
  }) => void;
  onCreateCashflow?: (params: CreateCustomerCashflowParams) => void;
}

export function useGarageDebtsActions({
  t,
  onOpenCustomerDetail,
  onCreateCashflow,
}: UseGarageDebtsActionsParams) {
  const canCreateCashflow = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.CREATE,
  );

  const getRowActions = (row: CustomerDebtItem): ActionDropdownItem[] => [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: t("customers.viewDetail", "Xem chi tiết công nợ"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () =>
            onOpenCustomerDetail({
              code: row.customerCode,
              name: row.customerName,
              licensePlate: row.licensePlate,
            }),
        },
      ],
    },
    ...(canCreateCashflow && onCreateCashflow
      ? [
          {
            groupLabel: t("debts.actions.cashflowGroup", "PHIẾU THU / CHI"),
            items: [
              {
                label: t("debts.actions.createReceipt", "Tạo phiếu thu"),
                icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600" />,
                onClick: () =>
                  onCreateCashflow({
                    voucherType: "RECEIPT",
                    customerCode: row.customerCode,
                    partnerName: row.customerName,
                    licensePlate: row.licensePlate,
                    amount:
                      row.balanceAmount > 0 ? row.balanceAmount : undefined,
                  }),
              },
              {
                label: t("debts.actions.createPayment", "Tạo phiếu chi"),
                icon: <ArrowUpRight className="w-4 h-4 text-rose-600" />,
                onClick: () =>
                  onCreateCashflow({
                    voucherType: "PAYMENT",
                    customerCode: row.customerCode,
                    partnerName: row.customerName,
                    licensePlate: row.licensePlate,
                    amount: undefined,
                  }),
              },
            ],
          },
        ]
      : []),
  ];

  return { getRowActions };
}

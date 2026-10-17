import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { useT } from "@/core/i18n";
import {
  garageCashflowApi,
  type GarageCashflowTopTransactionItem,
} from "../../../api/garageCashflowApi";

export function useGarageCashflowDashboard(
  onOpenCaseDetailProp?: (caseCode: string) => void,
) {
  const t = useT();
  const queryClient = useQueryClient();

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "branchId",
          label: t("bankStatement.filters.branch", "Chi nhánh"),
          placeholder: t(
            "bankStatement.filters.allBranches",
            "Tất cả chi nhánh",
          ),
          options: branches.map((b: any) => ({ value: b.id, label: b.name })),
        },
        {
          key: "paymentMethod",
          label: t("garage.cashflow.table.paymentMethod", "Phương thức"),
          placeholder: t("common.all", "Tất cả"),
          options: [
            {
              value: "TIEN_MAT",
              label: t("garage.cashflow.method.cash", "Tiền mặt"),
            },
            {
              value: "CHUYEN_KHOAN",
              label: t("garage.cashflow.method.transfer", "Chuyển khoản"),
            },
            { value: "THE", label: t("garage.cashflow.method.card", "Thẻ") },
            {
              value: "DONG_TIEN",
              label: t("garage.cashflow.method.fund", "Dòng tiền"),
            },
          ],
        },
        {
          key: "paymentStatus",
          label: t("garage.cashflow.table.paymentStatus", "Trạng thái"),
          placeholder: t("common.all", "Tất cả"),
          options: [
            {
              value: "PAID",
              label: t("garage.cashflow.status.paid", "Đã thanh toán"),
            },
            {
              value: "APPROVED",
              label: t("garage.cashflow.status.approved", "Đã duyệt"),
            },
            {
              value: "PENDING",
              label: t("garage.cashflow.status.pending", "Chờ duyệt"),
            },
          ],
        },
      ],
    };
  }, [branches, t]);

  const filter = useFilterPanel(filterConfig, () => {});

  const queryParams = useMemo(() => {
    return {
      dateFrom: filter.state.dateFrom,
      dateTo: filter.state.dateTo,
      branchId: filter.state.custom.branchId as string | undefined,
      paymentMethod: filter.state.custom.paymentMethod as string | undefined,
      paymentStatus: filter.state.custom.paymentStatus as string | undefined,
    };
  }, [
    filter.state.dateFrom,
    filter.state.dateTo,
    filter.state.custom.branchId,
    filter.state.custom.paymentMethod,
    filter.state.custom.paymentStatus,
  ]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["garage-cashflow-dashboard", queryParams],
    queryFn: () => garageCashflowApi.getDashboard(queryParams),
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["garage-cashflow-dashboard"] });
  }, [queryClient]);

  const handleOpenItem = useCallback(
    (item: GarageCashflowTopTransactionItem) => {
      setSelectedVoucher({
        id: item.id,
        voucherCode: item.voucherCode,
        amount: item.amount,
        transDate: item.transDate,
        partnerName: item.partnerName,
        licensePlate: item.licensePlate,
        paymentMethod: item.paymentMethod,
        paymentContent: item.paymentContent,
        paymentStatus: item.paymentStatus,
      });
    },
    [],
  );

  const handleOpenCase = useCallback(
    (caseCode: string) => {
      if (onOpenCaseDetailProp) {
        onOpenCaseDetailProp(caseCode);
      } else {
        setSelectedCaseCode(caseCode);
      }
    },
    [onOpenCaseDetailProp],
  );

  return {
    t,
    filterConfig,
    filter,
    data,
    isLoading: isLoading || isFetching,
    isFetching,
    handleRefresh,
    selectedVoucher,
    setSelectedVoucher,
    selectedCaseCode,
    setSelectedCaseCode,
    handleOpenItem,
    handleOpenCase,
  };
}

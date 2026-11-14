import { useState, useMemo } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  addMonths,
  AmortizationMethod,
  generatePortfolioAmortizationSchedule,
  type PortfolioLoanItem,
  type PortfolioSimulationResult,
} from "@/v2/core/loans";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { useCreateBatchLoansMutation, type CreateLoanPayload } from "../../api";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export const DEFAULT_PORTFOLIO_LOANS: PortfolioLoanItem[] = [
  {
    id: "loan-1",
    name: "Khoản vay 1 (Dự án)",
    enabled: true,
    principalAmount: 500_000_000,
    annualInterestRate: 8.5,
    tenorMonths: 24,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    startDate: new Date().toISOString().split("T")[0],
    lenderName: "Ngân hàng TMCP Ngoại thương (VCB)",
  },
];

export const DRAFT_SIMULATION_KEY = "loan_draft_simulation_portfolio";

export function useLoanSimulatorPage(props: LoanSimulatorPageProps) {
  const { t } = useV2Translation();
  const showToast = useV2ToastStore((s) => s.showToast);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = Boolean(accessToken);

  const [loans, setLoans] = useState<PortfolioLoanItem[]>(() => [
    {
      ...DEFAULT_PORTFOLIO_LOANS[0],
      name: t("v2.loans.simulator.defaultLoanName", "Khoản vay 1 (Dự án)"),
      lenderName: t(
        "v2.loans.simulator.defaultLenderName",
        "Ngân hàng TMCP Ngoại thương (VCB)",
      ),
    },
  ]);
  const batchCreateMutation = useCreateBatchLoansMutation();

  const portfolioResult: PortfolioSimulationResult = useMemo(() => {
    return generatePortfolioAmortizationSchedule(loans);
  }, [loans]);

  const handleAddLoan = () => {
    const nextIdx = loans.length + 1;
    const prefix = t("v2.loans.simulator.newLoanPrefix", "Khoản vay");
    const newLoan: PortfolioLoanItem = {
      id: `loan-${Date.now()}`,
      name: `${prefix} ${nextIdx}`,
      enabled: true,
      principalAmount: 200_000_000,
      annualInterestRate: 9.0,
      tenorMonths: 12,
      amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
      startDate: new Date().toISOString().split("T")[0],
      lenderName: "",
    };
    setLoans((prev) => [...prev, newLoan]);
  };

  const handleUpdateLoan = (id: string, patch: Partial<PortfolioLoanItem>) => {
    setLoans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleRemoveLoan = (id: string) => {
    setLoans((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleLoan = (id: string) => {
    setLoans((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const handleReset = () => {
    setLoans([
      {
        ...DEFAULT_PORTFOLIO_LOANS[0],
        name: t("v2.loans.simulator.defaultLoanName", "Khoản vay 1 (Dự án)"),
        lenderName: t(
          "v2.loans.simulator.defaultLenderName",
          "Ngân hàng TMCP Ngoại thương (VCB)",
        ),
      },
    ]);
  };

  const handleSaveToErp = async () => {
    const activeLoans = loans.filter((l) => l.enabled && l.principalAmount > 0);
    if (activeLoans.length === 0) {
      showToast({
        title: t(
          "v2.loans.portfolio.noActiveLoans",
          "Vui lòng bật ít nhất 1 khoản vay hợp lệ để lưu.",
        ),
        variant: "warning",
      });
      return;
    }

    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DRAFT_SIMULATION_KEY, JSON.stringify(loans));
        window.location.href = "/login?redirect=/loans-tool";
      }
      return;
    }

    const payload: CreateLoanPayload[] = activeLoans.map((l) => ({
      title: l.name,
      lenderName:
        l.lenderName || t("v2.loans.simulator.unknownLender", "Chưa xác định"),
      principalAmount: l.principalAmount,
      annualInterestRate: l.annualInterestRate,
      tenorMonths: l.tenorMonths,
      amortizationMethod: l.amortizationMethod,
      startDate: l.startDate,
      firstPaymentDate: addMonths(l.startDate, 1),
    }));

    try {
      await batchCreateMutation.mutateAsync({ loans: payload });
      showToast({
        title: t("v2.loans.portfolio.saveSuccess", {
          count: payload.length,
        }),
        variant: "success",
      });
      props.onSaved?.();
    } catch {
      showToast({
        title: t(
          "v2.loans.portfolio.saveError",
          "Có lỗi xảy ra khi lưu khoản vay vào ERP.",
        ),
        variant: "destructive",
      });
    }
  };

  return {
    loans,
    portfolioResult,
    isAuthenticated,
    isSaving: batchCreateMutation.isPending,
    handleAddLoan,
    handleUpdateLoan,
    handleRemoveLoan,
    handleToggleLoan,
    handleReset,
    handleSaveToErp,
  };
}

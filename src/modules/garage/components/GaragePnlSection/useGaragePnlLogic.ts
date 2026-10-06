import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { ComboboxOption } from "@/shared/components/Combobox";
import {
  garageOpexApi,
  type GaragePnlReportResponse,
} from "../../api/garageOpexApi";
import { useAppStore } from "@/core/config/appStore";

export function useGaragePnlLogic() {
  const { t } = useTranslation("garage");
  const { navigate } = useAppStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultPeriod);

  // Sinh 24 tháng gần nhất cho Combobox kỳ báo cáo
  const periodOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = [];
    const d = new Date(currentYear, currentMonth - 1, 1);
    for (let i = 0; i < 24; i++) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const val = `${y}-${String(m).padStart(2, "0")}`;
      options.push({
        value: val,
        label: `Tháng ${String(m).padStart(2, "0")}/${y}`,
        searchText: `Thang ${m} ${y} T${m}/${y}`,
      });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, [currentYear, currentMonth]);

  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = (selectedPeriod || defaultPeriod).split("-");
    return [
      parseInt(parts[0], 10) || currentYear,
      parseInt(parts[1], 10) || currentMonth,
    ];
  }, [selectedPeriod, defaultPeriod, currentYear, currentMonth]);

  const [exporting, setExporting] = useState<boolean>(false);

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const prev2Month = prevMonth === 1 ? 12 : prevMonth - 1;
  const prev2Year = prevMonth === 1 ? prevYear - 1 : prevYear;

  const {
    data: report,
    isLoading,
    refetch: refetchReport,
  } = useQuery<GaragePnlReportResponse>({
    queryKey: ["garage-pnl-report", selectedYear, selectedMonth],
    queryFn: () =>
      garageOpexApi.getPnlReport({
        year: selectedYear,
        month: selectedMonth,
      }),
  });

  const {
    data: prevReport,
    isLoading: isLoadingPrev,
    refetch: refetchPrev,
  } = useQuery<GaragePnlReportResponse>({
    queryKey: ["garage-pnl-report", prevYear, prevMonth],
    queryFn: () =>
      garageOpexApi.getPnlReport({
        year: prevYear,
        month: prevMonth,
      }),
  });

  const {
    data: prev2Report,
    isLoading: isLoadingPrev2,
    refetch: refetchPrev2,
  } = useQuery<GaragePnlReportResponse>({
    queryKey: ["garage-pnl-report", prev2Year, prev2Month],
    queryFn: () =>
      garageOpexApi.getPnlReport({
        year: prev2Year,
        month: prev2Month,
      }),
  });

  const refetch = () => {
    refetchReport();
    refetchPrev();
    refetchPrev2();
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await garageOpexApi.exportPnlExcel({
        year: selectedYear,
        month: selectedMonth,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Garage_PNL_Report_${String(selectedMonth).padStart(2, "0")}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(
        t("pnl.exportSuccess", "Đã tải xuống file báo cáo Excel P&L"),
      );
    } catch (err: any) {
      toast.error(err?.message || "Không thể xuất file Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleGoToOpex = () => {
    navigate("garage-opex");
  };

  return {
    t,
    report,
    prevReport,
    prev2Report,
    isLoading,
    isLoadingPrev,
    isLoadingPrev2,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    selectedYear,
    selectedMonth,
    prevYear,
    prevMonth,
    prev2Year,
    prev2Month,
    exporting,
    handleExportExcel,
    handleGoToOpex,
    refetch,
  };
}

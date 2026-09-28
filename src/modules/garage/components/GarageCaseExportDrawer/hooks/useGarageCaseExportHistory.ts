import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export interface GarageCaseExportHistoryItem {
  id: string;
  createdAt: string;
  dateFrom: string;
  dateTo: string;
  dateType: "completion_date" | "case_date";
  branchId?: string;
  branchName?: string;
  classification?: string;
  status?: string;
  fileName: string;
}

const STORAGE_KEY = "erp_garage_case_export_history";

export function useGarageCaseExportHistory() {
  const { t } = useTranslation("garage");

  const [historyItems, setHistoryItems] = useState<
    GarageCaseExportHistoryItem[]
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (items: GarageCaseExportHistoryItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage error
    }
  };

  const addHistoryItem = (item: GarageCaseExportHistoryItem) => {
    saveHistory([item, ...historyItems].slice(0, 50));
  };

  const handleClearHistory = () => {
    saveHistory([]);
    toast.success(
      t("cases.exportDrawer.historyCleared", "Đã xóa lịch sử xuất file"),
    );
  };

  return {
    historyItems,
    addHistoryItem,
    handleClearHistory,
  };
}

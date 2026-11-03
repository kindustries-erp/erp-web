import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import {
  readBankStatementTab,
  type BankStatementTab,
} from "./bankStatementTab.helper";

/** Nhãn các tab của trang dòng tiền, dùng cho thanh tab trong cả ba màn */
export function useBankStatementPageTabs() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        value: "dashboard",
        label: t("nav.items.cashflowDashboard", {
          defaultValue: "Tổng quan dòng tiền",
        }),
      },
      {
        value: "bank",
        label: t("bankStatement.bankTitle", {
          defaultValue: "Sao kê ngân hàng",
        }),
      },
      {
        value: "cash",
        label: t("bankStatement.cashTitle", {
          defaultValue: "Sổ quỹ tiền mặt",
        }),
      },
    ],
    [t],
  );
}

/**
 * Đồng bộ tab khi `?tab=` trong URL của instance đang mở đổi (ví dụ link mở từ menu khi trang đã hiển thị).
 * Chỉ phản ứng khi store đổi URL, nên không ghi đè tab người dùng vừa bấm.
 */
export function useBankStatementRoutedTab(
  onRoutedTab: (tab: BankStatementTab) => void,
) {
  const routedTab = useAppStore((state) => {
    const current = state.openTabs.find(
      (tab) => tab.instanceId === state.currentInstanceId,
    );
    return readBankStatementTab(current?.url);
  });
  const lastRoutedTabRef = useRef(routedTab);

  useEffect(() => {
    if (routedTab === lastRoutedTabRef.current) return;
    lastRoutedTabRef.current = routedTab;
    if (routedTab) onRoutedTab(routedTab);
  }, [routedTab, onRoutedTab]);
}

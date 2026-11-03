import type { ReactNode } from "react";
import { DrawerSection, type V2TabItemData } from "@/v2/shared/components";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import { CashVoucherSummary } from "../components/molecules/cash-voucher-summary";
import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";
import type { CashDetailTab } from "../domain/rules/resolveDetailTab";

export interface CashDetailTabsInput {
  transaction: CashTransactionDto;
  historyItems: DrawerAuditItem[];
  /** Nội dung tab Hạch toán, dựng ở drawer vì cần state nháp */
  accounting: ReactNode;
  /** Nội dung tab Chứng từ liên kết (sơ đồ truy vết và cấn trừ) */
  traceability: ReactNode;
  /** Nội dung tab Theo đối tượng; không truyền thì tab không hiện */
  partner?: ReactNode;
  t: (key: string, options?: Record<string, unknown>) => string;
}

/** Tab của drawer: Chi tiết, Hạch toán, Theo đối tượng (khi có đối ứng), Chứng từ liên kết, Lịch sử. */
export function buildCashDetailTabs({
  transaction,
  historyItems,
  accounting,
  traceability,
  partner,
  t,
}: CashDetailTabsInput): V2TabItemData[] {
  return [
    {
      key: "details" satisfies CashDetailTab,
      label: t("v2.bankStatements.cashDetail.tabs.details"),
      content: <CashVoucherSummary transaction={transaction} t={t} />,
    },
    {
      key: "accounting" satisfies CashDetailTab,
      label: t("v2.bankStatements.cashDetail.tabs.accounting"),
      content: accounting,
    },
    ...(partner === undefined
      ? []
      : [
          {
            key: "partner" satisfies CashDetailTab,
            label: t("v2.bankStatements.cashDetail.tabs.partner"),
            content: partner,
          },
        ]),
    {
      key: "traceability" satisfies CashDetailTab,
      label: t("v2.bankStatements.cashDetail.tabs.traceability"),
      content: traceability,
    },
    {
      key: "history" satisfies CashDetailTab,
      label: t("v2.bankStatements.cashDetail.tabs.history"),
      badgeCount: historyItems.length || undefined,
      content: (
        <DrawerSection title={t("v2.bankStatements.cashDetail.history.title")}>
          <DrawerAuditTimeline
            items={historyItems}
            emptyMessage={t("v2.bankStatements.cashDetail.history.empty")}
          />
        </DrawerSection>
      ),
    },
  ];
}

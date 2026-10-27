import { DrawerSection, type V2TabItemData } from "@/v2/shared/components";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import { CashVoucherSummary } from "../components/molecules/cash-voucher-summary";
import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";
import type { CashDetailTab } from "../domain/rules/resolveDetailTab";

export interface CashDetailTabsInput {
  transaction: CashTransactionDto;
  historyItems: DrawerAuditItem[];
  t: (key: string, options?: Record<string, unknown>) => string;
}

/** Tab của drawer. Đợt này gồm Chi tiết và Lịch sử; tab đối tượng được thêm ở đợt D. */
export function buildCashDetailTabs({
  transaction,
  historyItems,
  t,
}: CashDetailTabsInput): V2TabItemData[] {
  return [
    {
      key: "details" satisfies CashDetailTab,
      label: t("v2.bankStatements.cashDetail.tabs.details"),
      content: <CashVoucherSummary transaction={transaction} t={t} />,
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

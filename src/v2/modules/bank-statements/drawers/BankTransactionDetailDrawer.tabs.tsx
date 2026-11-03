import type { ReactNode } from "react";
import {
  BookOpen,
  FileText,
  History,
  Link2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  DrawerSection,
  V2TabBar,
  type V2TabItemData,
} from "@/v2/shared/components";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import { BankVoucherPreview } from "../components/molecules/bank-voucher-preview";
import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";
import type {
  BankDetailsSubTabKey,
  BankPartnerSubTabKey,
  BankTopTabKey,
} from "./BankTransactionDetailDrawer.type";

export interface BankDetailTabsInput {
  transaction: CashTransactionDto;
  historyItems: DrawerAuditItem[];
  accounting: ReactNode;
  traceability: ReactNode;
  partnerList?: ReactNode;
  partnerAnalytics?: ReactNode;
  detailsSubTab: BankDetailsSubTabKey;
  onDetailsSubTabChange: (key: BankDetailsSubTabKey) => void;
  partnerSubTab: BankPartnerSubTabKey;
  onPartnerSubTabChange: (key: BankPartnerSubTabKey) => void;
  isPosted: boolean;
  netOffCount: number;
  partnerTotal?: number;
  customTabs?: V2TabItemData[];
  t: (key: string, options?: Record<string, unknown>) => string;
}

/** 3 Top tab chuẩn với thanh sub-tabs 2 tầng theo phong cách erp-invoice */
export function buildBankDetailTabs(
  input: BankDetailTabsInput,
): V2TabItemData[] {
  const {
    transaction,
    historyItems,
    accounting,
    traceability,
    partnerList,
    partnerAnalytics,
    detailsSubTab,
    onDetailsSubTabChange,
    partnerSubTab,
    onPartnerSubTabChange,
    isPosted,
    netOffCount,
    partnerTotal,
    customTabs,
    t,
  } = input;

  if (customTabs && customTabs.length > 0) return customTabs;

  const detailsSubTabs: V2TabItemData[] = [
    {
      key: "details",
      label: t("v2.bankStatements.bankDetail.subTabs.voucherDetails"),
      icon: FileText,
      alwaysShowIcon: true,
    },
    {
      key: "accounting",
      label: t("v2.bankStatements.bankDetail.subTabs.accounting"),
      icon: BookOpen,
      badgeCount: isPosted ? 1 : undefined,
      alwaysShowIcon: true,
    },
    {
      key: "traceability",
      label: t("v2.bankStatements.bankDetail.subTabs.traceability"),
      icon: Link2,
      badgeCount: netOffCount > 0 ? netOffCount : undefined,
      alwaysShowIcon: true,
    },
  ];

  const partnerSubTabs: V2TabItemData[] = [
    {
      key: "list",
      label: t("v2.bankStatements.bankDetail.subTabs.partnerList"),
      icon: FileText,
      badgeCount: partnerTotal && partnerTotal > 0 ? partnerTotal : undefined,
      alwaysShowIcon: true,
    },
    {
      key: "analytics",
      label: t("v2.bankStatements.bankDetail.subTabs.partnerAnalytics"),
      icon: TrendingUp,
      alwaysShowIcon: true,
    },
  ];

  return [
    {
      key: "details" satisfies BankTopTabKey,
      label: t("v2.bankStatements.bankDetail.tabs.details"),
      icon: FileText,
      content: (
        <div className="flex flex-col gap-3 pb-2 flex-1 min-w-0 w-full">
          <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1">
            <V2TabBar
              variant="sub"
              activeTabKey={detailsSubTab}
              onTabChange={(k) =>
                onDetailsSubTabChange(k as BankDetailsSubTabKey)
              }
              tabs={detailsSubTabs}
              className="w-auto pb-0"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            {detailsSubTab === "details" && (
              <BankVoucherPreview transaction={transaction} t={t} />
            )}
            {detailsSubTab === "accounting" && accounting}
            {detailsSubTab === "traceability" && traceability}
          </div>
        </div>
      ),
    },
    ...(partnerList === undefined
      ? []
      : [
          {
            key: "partner" satisfies BankTopTabKey,
            label: t("v2.bankStatements.bankDetail.tabs.partner"),
            icon: Users,
            content: (
              <div className="flex flex-col gap-3 pb-2 flex-1 min-w-0 w-full">
                <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1">
                  <V2TabBar
                    variant="sub"
                    activeTabKey={partnerSubTab}
                    onTabChange={(k) =>
                      onPartnerSubTabChange(k as BankPartnerSubTabKey)
                    }
                    tabs={partnerSubTabs}
                    className="w-auto pb-0"
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
                  {partnerSubTab === "list" && partnerList}
                  {partnerSubTab === "analytics" && partnerAnalytics}
                </div>
              </div>
            ),
          },
        ]),
    {
      key: "history" satisfies BankTopTabKey,
      label: t("v2.bankStatements.bankDetail.tabs.history"),
      icon: History,
      badgeCount: historyItems.length || undefined,
      content: (
        <DrawerSection title={t("v2.bankStatements.bankDetail.history.title")}>
          <DrawerAuditTimeline
            items={historyItems}
            emptyMessage={t("v2.bankStatements.bankDetail.history.empty")}
          />
        </DrawerSection>
      ),
    },
  ];
}

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FileText, Building2, History } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  DrawerAuditTimeline,
  type DrawerTopTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { BankTransactionVoucherPreview } from "@/modules/bank-statements/components/BankTransactionDetailTab/components/BankTransactionVoucherPreview";
import { BankTransactionDetailTabNav } from "./BankTransactionDetailTabNav";
import { BankTransactionAccountingSection } from "./BankTransactionAccountingSection";
import { BankTransactionTraceabilitySection } from "./BankTransactionTraceabilitySection";
import { BankTransactionPartnerSection } from "./BankTransactionPartnerSection";
import type {
  BankTransactionDetailSubTabKey,
  BankTransactionPartnerSubTabKey,
} from "./BankTransactionDetailDrawer.type";

export interface UseBankTransactionDrawerTabsProps {
  transaction: any;
  editMode: boolean;
  isPosted: boolean;
  subTabKey: BankTransactionDetailSubTabKey;
  onSubTabChange: (tab: BankTransactionDetailSubTabKey) => void;
  partnerSubTabKey: BankTransactionPartnerSubTabKey;
  accountingEnabled: boolean;
  onToggleAccounting: () => void;
  postingState: any;
  defaultPostingDate: string;
  baseDescription: string;
  unpostMutation: any;
  onOpenNetoffModal: () => void;
  onUnlinkNode: (node: any) => void;
  auditItems: DrawerAuditLogItem[];
  customTabs?: DrawerTopTabItem[];
  onSelectTransaction?: (id: string) => void;
}

export function useBankTransactionDrawerTabs(
  props: UseBankTransactionDrawerTabsProps,
): DrawerTopTabItem[] {
  const {
    transaction,
    editMode,
    isPosted,
    subTabKey,
    onSubTabChange,
    partnerSubTabKey,
    accountingEnabled,
    onToggleAccounting,
    postingState,
    defaultPostingDate,
    baseDescription,
    unpostMutation,
    onOpenNetoffModal,
    onUnlinkNode,
    auditItems,
    customTabs,
    onSelectTransaction,
  } = props;
  const { t } = useTranslation();

  const partnerName = transaction?.correspondentName?.trim() || "";
  const correspondentAccount = transaction?.correspondentAccount?.trim() || "";

  const { data: partnerCountData } = useQuery({
    queryKey: [
      "partner-bank-transactions-count",
      correspondentAccount,
      partnerName,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page: 1,
        pageSize: 1,
        correspondentAccount: correspondentAccount || undefined,
        correspondentName: partnerName || undefined,
      }),
    enabled: Boolean(correspondentAccount || partnerName),
    staleTime: 60000,
  });

  const partnerTotal = partnerCountData?.total || 0;
  const netOffCount = transaction?.invoiceNetOffs?.length || 0;

  return useMemo(() => {
    if (customTabs) return customTabs;
    if (!transaction) return [];

    return [
      // 1. Top Tab 1: Chi tiết (Gồm 3 sub-tabs: Chi tiết giao dịch | Hạch toán kế toán | Chứng từ liên kết)
      {
        key: "txn_details",
        label: t("bankStatement.tabDetails", { defaultValue: "Chi tiết" }),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
            <BankTransactionDetailTabNav
              subTab={subTabKey}
              onSubTabChange={onSubTabChange}
              accountingBadgeCount={isPosted ? 1 : 0}
              linkedBadgeCount={netOffCount}
            />
            {subTabKey === "details" && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
                <BankTransactionVoucherPreview transaction={transaction} />
              </div>
            )}
            {subTabKey === "accounting" && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
                <BankTransactionAccountingSection
                  transaction={transaction}
                  editMode={editMode}
                  isPosted={isPosted}
                  accountingEnabled={accountingEnabled}
                  onToggleAccounting={onToggleAccounting}
                  postingState={postingState}
                  defaultPostingDate={defaultPostingDate}
                  baseDescription={baseDescription}
                  unpostMutation={unpostMutation}
                />
              </div>
            )}
            {subTabKey === "traceability" && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
                <BankTransactionTraceabilitySection
                  transaction={transaction}
                  editMode={editMode}
                  onOpenNetoffModal={onOpenNetoffModal}
                  onUnlinkNode={onUnlinkNode}
                />
              </div>
            )}
          </div>
        ),
      },

      // 2. Top Tab 2: Chi tiết theo đối tác (kèm badge tổng giao dịch)
      {
        key: "txn_partner",
        label: t("bankStatement.tabPartner", {
          defaultValue: "Chi tiết theo đối tác",
        }),
        icon: <Building2 className="w-3.5 h-3.5" />,
        badgeCount: partnerTotal > 0 ? partnerTotal : undefined,
        content: (
          <BankTransactionPartnerSection
            transaction={transaction}
            defaultSubTab={partnerSubTabKey}
            onSelectTransaction={onSelectTransaction}
          />
        ),
      },

      // 3. Top Tab 3: Lịch sử & Kiểm duyệt
      {
        key: "history",
        label: t("bankStatement.tabHistory", {
          defaultValue: "Lịch sử & Kiểm duyệt",
        }),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="space-y-4">
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {t("bankStatement.tabHistoryTitle", {
                      defaultValue: "Nhật ký kiểm toán & thao tác",
                    })}
                  </span>
                  {auditItems.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {auditItems.length}
                    </Badge>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
                <DrawerAuditTimeline
                  items={auditItems}
                  emptyLabel={t("bankStatement.emptyAuditTimeline", {
                    defaultValue: "Chưa có ghi nhận lịch sử thao tác.",
                  })}
                />
              </div>
            </DrawerSection>
          </div>
        ),
      },
    ];
  }, [
    customTabs,
    transaction,
    t,
    subTabKey,
    onSubTabChange,
    isPosted,
    netOffCount,
    editMode,
    accountingEnabled,
    onToggleAccounting,
    postingState,
    defaultPostingDate,
    baseDescription,
    unpostMutation,
    onOpenNetoffModal,
    onUnlinkNode,
    partnerTotal,
    partnerSubTabKey,
    onSelectTransaction,
    auditItems,
  ]);
}

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Building2, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { V2TabBar, V2Text, type V2TabItemData } from "@/v2/shared/components";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { BankTransactionVoucherPreview } from "./components/BankTransactionVoucherPreview";
import { BankTransactionPartnerSubTab } from "./BankTransactionPartnerSubTab";
import { BankTransactionAnalyticsSubTab } from "./BankTransactionAnalyticsSubTab";

export type BankTransactionDetailViewMode = "details" | "partner" | "analytics";

export interface BankTransactionDetailTabProps {
  transaction: any | null;
  defaultViewMode?: BankTransactionDetailViewMode;
  onViewModeChange?: (mode: BankTransactionDetailViewMode) => void;
  children?: React.ReactNode;
  onSelectTransaction?: (id: string) => void;
}

export const BankTransactionDetailTab = React.memo(
  function BankTransactionDetailTab({
    transaction,
    defaultViewMode = "details",
    onViewModeChange,
    children,
    onSelectTransaction,
  }: BankTransactionDetailTabProps) {
    const { t } = useTranslation();
    const [viewMode, setViewMode] =
      useState<BankTransactionDetailViewMode>(defaultViewMode);

    const handleViewModeChange = useCallback(
      (mode: BankTransactionDetailViewMode) => {
        setViewMode(mode);
        onViewModeChange?.(mode);
      },
      [onViewModeChange],
    );

    const partnerName = transaction?.correspondentName?.trim() || "";
    const correspondentAccount =
      transaction?.correspondentAccount?.trim() || "";

    // Query lightweight total count for badge on "Chi tiết theo đối tượng" tab
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

    const navTabs: V2TabItemData[] = useMemo(
      () => [
        {
          key: "details",
          label: t("bankStatement.subTabDetails", {
            defaultValue: "1. Chi tiết",
          }),
          icon: FileText,
          alwaysShowIcon: true,
        },
        {
          key: "partner",
          label: t("bankStatement.subTabPartner", {
            defaultValue: "2. Chi tiết theo đối tượng",
          }),
          icon: Building2,
          badgeCount: partnerTotal > 0 ? partnerTotal : undefined,
          alwaysShowIcon: true,
        },
        {
          key: "analytics",
          label: t("bankStatement.subTabAnalytics", {
            defaultValue: "3. Biến động",
          }),
          icon: TrendingUp,
          alwaysShowIcon: true,
        },
      ],
      [t, partnerTotal],
    );

    return (
      <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
        {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 w-full">
          <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
            <V2TabBar
              variant="sub"
              activeTabKey={viewMode}
              onTabChange={(key) =>
                handleViewModeChange(key as BankTransactionDetailViewMode)
              }
              tabs={navTabs}
              className="w-auto pb-0"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {viewMode === "partner" && partnerTotal > 0 && (
              <V2Text as="span" variant="body-sm" color="muted">
                {partnerTotal}{" "}
                {t("bankStatement.recordsTransactions", {
                  defaultValue: "giao dịch",
                })}
              </V2Text>
            )}
          </div>
        </div>

        {/* ─── 2. SUB-TAB 1: XEM TRƯỚC CHỨNG TỪ CHI TIẾT ─── */}
        {viewMode === "details" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            {children ?? (
              <BankTransactionVoucherPreview transaction={transaction} />
            )}
          </div>
        )}

        {/* ─── 3. SUB-TAB 2: BẢNG KÊ CHI TIẾT THEO ĐỐI TƯỢNG ─── */}
        {viewMode === "partner" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            <BankTransactionPartnerSubTab
              transaction={transaction}
              onSelectTransaction={onSelectTransaction}
            />
          </div>
        )}

        {/* ─── 4. SUB-TAB 3: BIẾN ĐỘNG DÒNG TIỀN & BIỂU ĐỒ ─── */}
        {viewMode === "analytics" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            <BankTransactionAnalyticsSubTab transaction={transaction} />
          </div>
        )}
      </div>
    );
  },
);

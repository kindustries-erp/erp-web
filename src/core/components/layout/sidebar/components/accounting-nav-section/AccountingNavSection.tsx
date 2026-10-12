import React from "react";
import { useT } from "@/core/i18n";
import {
  Wallet,
  Receipt,
  ReceiptText,
  Target,
  FileText,
  Layers,
} from "lucide-react";
import { NavSection, NavItem } from "../SidebarPrimitives";
import type { AccountingNavSectionProps } from "./AccountingNavSection.type";
import { useAccountingNavSection } from "./AccountingNavSection.hook";

export function AccountingNavSection({
  collapsed,
  currentPage,
  navTo,
}: AccountingNavSectionProps) {
  const t = useT();
  const {
    showAccounting,
    showCashflow,
    canReadInvoices,
    canReadDebts,
    showOpex,
    isCashflowActive,
    isInvoiceActive,
    isDebtsActive,
    isOpexActive,
    isJournalActive,
    isAccountsActive,
    handleNavCashflow,
    handleNavInvoices,
    handleNavDebts,
    handleNavOpex,
    handleNavJournal,
    handleNavAccounts,
  } = useAccountingNavSection({
    currentPage,
    navTo,
  });

  if (!showAccounting) {
    return null;
  }

  return (
    <NavSection
      collapsed={collapsed}
      label={t("nav.sections.accounting", "KẾ TOÁN")}
    >
      {showCashflow && (
        <NavItem
          collapsed={collapsed}
          icon={<Wallet className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.cashflow", "Dòng tiền")}
          active={isCashflowActive}
          onClick={handleNavCashflow}
          contextPage="cashflow"
        />
      )}
      {canReadInvoices && (
        <NavItem
          collapsed={collapsed}
          icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.erpInvoices", "Hóa đơn")}
          active={isInvoiceActive}
          onClick={handleNavInvoices}
          contextPage="erp-invoices"
        />
      )}
      {canReadDebts && (
        <NavItem
          collapsed={collapsed}
          icon={<ReceiptText className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.partnerDebts", "Công nợ theo đối tượng")}
          active={isDebtsActive}
          onClick={handleNavDebts}
          contextPage="invoice-debts"
        />
      )}
      {showOpex && (
        <NavItem
          collapsed={collapsed}
          icon={<Target className="w-4 h-4 opacity-65 flex-shrink-0" />}
          label={t("nav.items.operatingExpenses", "Chi phí vận hành")}
          active={isOpexActive}
          onClick={handleNavOpex}
          contextPage="opex"
        />
      )}
      <NavItem
        collapsed={collapsed}
        icon={<FileText className="w-4 h-4 opacity-65 flex-shrink-0" />}
        label={t("nav.items.reportJournal", "Sổ nhật ký chung")}
        active={isJournalActive}
        onClick={handleNavJournal}
        contextPage="journal-entry"
      />
      <NavItem
        collapsed={collapsed}
        icon={<Layers className="w-4 h-4 opacity-65 flex-shrink-0" />}
        label={t("nav.items.catalogAccounts", "Hệ thống tài khoản")}
        active={isAccountsActive}
        onClick={handleNavAccounts}
        contextPage="settings-accounts"
      />
    </NavSection>
  );
}

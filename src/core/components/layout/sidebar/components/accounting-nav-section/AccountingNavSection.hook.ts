import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { PageKey } from "@/shared/types";
import type { AccountingNavSectionProps } from "./AccountingNavSection.type";

export function useAccountingNavSection({
  currentPage,
  navTo,
}: Pick<AccountingNavSectionProps, "currentPage" | "navTo">) {
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const canReadInvoices = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.READ,
  );
  const canReadDebts =
    useHasPermission(ErpResource.INVOICE_DEBTS, ErpAction.READ) ||
    canReadInvoices;
  const canReadBankStatements = useHasPermission(
    ErpResource.BANK_STATEMENTS,
    ErpAction.READ,
  );
  const canReadCashStatements = useHasPermission(
    ErpResource.CASH_STATEMENTS,
    ErpAction.READ,
  );

  const showCashflow = canReadBankStatements || canReadCashStatements;
  const showOpex = canReadBankStatements && isAdminEmail;
  const showAccounting = canReadInvoices || canReadDebts || showCashflow;

  const isCashflowActive =
    currentPage === "cashflow" ||
    currentPage === "bank-statement" ||
    currentPage === "cash-statement";

  const isInvoiceActive =
    currentPage === "erp-invoices" ||
    currentPage === "erp-invoices-in" ||
    currentPage === "erp-invoices-out" ||
    currentPage === "erp-invoices-draft" ||
    currentPage === "invoice-dashboard";

  const isDebtsActive = currentPage === "invoice-debts";
  const isOpexActive = currentPage === "opex";
  const isJournalActive =
    currentPage === "journal" || currentPage === "journal-entry";
  const isAccountsActive = currentPage === "settings-accounts";

  const handleNavCashflow = () => navTo("cashflow");
  const handleNavInvoices = () => navTo("erp-invoices");
  const handleNavDebts = () => navTo("invoice-debts");
  const handleNavOpex = () => navTo("opex" as PageKey);
  const handleNavJournal = () => navTo("journal-entry" as PageKey);
  const handleNavAccounts = () => navTo("settings-accounts" as PageKey);

  return {
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
  };
}

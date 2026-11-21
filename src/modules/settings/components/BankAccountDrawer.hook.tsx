import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/core/config/appStore";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getChartOfAccountsApi } from "@/modules/accounting/api/catalogApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useBanksCatalog } from "@/v2/modules/transfer-qr-bank-statements";
import { getBankLogoUrl } from "@/v2/core/transfer-qr-core/domain/constants/defaultBankOptions";
import { V2Image } from "@/v2/shared/components/atoms";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import {
  type BankAccountFormState,
  type UseBankAccountDrawerProps,
  DEFAULT_BANK_ACCOUNT_STATE,
} from "./BankAccountDrawer.type";

export type { BankAccountFormState } from "./BankAccountDrawer.type";

export function useBankAccountDrawer({
  open,
  bankAccount,
  onSuccess,
  onClose,
}: UseBankAccountDrawerProps) {
  const queryClient = useQueryClient();
  const { currentBranchId } = useAppStore();
  const [form, setForm] = useState<BankAccountFormState>(
    DEFAULT_BANK_ACCOUNT_STATE,
  );

  const setField = <K extends keyof BankAccountFormState>(
    field: K,
    value: BankAccountFormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const { data: branchOptions = [] } = useQuery({
    queryKey: ["branchOptions"],
    queryFn: getBranchOptionsApi,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["chartOfAccounts-flat"],
    queryFn: getChartOfAccountsApi,
  });

  const {
    banks,
    onScrollBottom: handleBankScrollBottom,
    onSearchChange: handleBankSearchChange,
    loading: isBanksLoading,
  } = useBanksCatalog();

  const accountOptions: V2ComboboxOption[] = useMemo(() => {
    const list = Array.isArray(accounts)
      ? accounts
      : (accounts as any)?.items || [];
    const b112 = list.filter((a: any) =>
      (a.accountCode || a.account_code || "").startsWith("112"),
    );
    const others = list.filter(
      (a: any) => !(a.accountCode || a.account_code || "").startsWith("112"),
    );
    return [...b112, ...others].map((a: any) => ({
      value: a.id,
      label: `${a.accountCode || a.account_code} - ${a.accountName || a.account_name}`,
    }));
  }, [accounts]);

  const bankComboboxOptions: V2ComboboxOption[] = useMemo(
    () =>
      banks.map((b) => ({
        value: b.code,
        label: `${b.code} - ${b.shortName}`,
        description: b.name,
        icon: (
          <V2Image
            src={getBankLogoUrl(b.code)}
            alt={b.code}
            className="h-4 w-4 object-contain rounded-sm"
            loading="lazy"
          />
        ),
      })),
    [banks],
  );

  useEffect(() => {
    if (bankAccount) {
      setForm({
        selectedBranchId: bankAccount.branchId ?? currentBranchId ?? "",
        accountingAccountId: bankAccount.accountingAccountId ?? "",
        bankCode: bankAccount.bankCode ?? "",
        bankName: bankAccount.bankName ?? "",
        accountNumber: bankAccount.accountNumber ?? "",
        accountName: bankAccount.accountName ?? "",
        currency: bankAccount.currency ?? "VND",
        isActive: bankAccount.isActive ?? true,
        openingBalance: bankAccount.openingBalance ?? 0,
        periodDate: bankAccount.periodDate ?? "",
      });
    } else {
      setForm({
        ...DEFAULT_BANK_ACCOUNT_STATE,
        selectedBranchId: currentBranchId || "",
      });
    }
  }, [bankAccount, open, currentBranchId]);

  const handleBankSelect = (code: string | null) => {
    const cleanCode = code || "";
    const found = banks.find(
      (b) => b.code.toUpperCase() === cleanCode.toUpperCase(),
    );
    setForm((prev) => ({
      ...prev,
      bankCode: cleanCode,
      bankName: found ? found.shortName || found.name : prev.bankName,
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!form.selectedBranchId) throw new Error("Branch ID is required");
      if (!form.accountingAccountId)
        throw new Error("Tài khoản kế toán là bắt buộc");
      const payload = {
        branchId: form.selectedBranchId,
        accountingAccountId: form.accountingAccountId,
        bankCode: form.bankCode.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountName: form.accountName.trim(),
        currency: form.currency || "VND",
        isActive: form.isActive,
        openingBalance: form.openingBalance || 0,
        periodDate: form.periodDate || undefined,
      };
      if (bankAccount)
        return bankStatementApi.updateBankAccount(bankAccount.id, payload);
      return bankStatementApi.createBankAccount(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      onSuccess();
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err.message),
  });

  const canSave = Boolean(
    !isPending &&
    form.bankName.trim() &&
    form.accountNumber.trim() &&
    form.accountName.trim() &&
    form.selectedBranchId &&
    form.accountingAccountId,
  );

  return {
    form,
    setField,
    branchOptions,
    accountOptions,
    bankComboboxOptions,
    handleBankSelect,
    handleBankScrollBottom,
    handleBankSearchChange,
    isBanksLoading,
    handleSave: mutate,
    isPending,
    canSave,
  };
}

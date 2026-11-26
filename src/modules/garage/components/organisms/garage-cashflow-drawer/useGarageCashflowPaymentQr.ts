import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import {
  toTransferQrAccountOptions,
  type TransferQrBankStatementsAccount,
} from "@/v2/modules/transfer-qr-bank-statements";
import { useBanksCatalog } from "@/v2/modules/transfer-qr-bank-statements/hooks/useBanksCatalog";
import { VIETQR_BANKS } from "@/v2/core/transfer-qr-core";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import {
  buildVoucherTransferContent,
  generateVietQrDataUrl,
} from "./useGarageCashflowPaymentQr.helper";

export interface UseGarageCashflowPaymentQrParams {
  voucher: GarageCashflowVoucher | null;
  formData: Partial<CreateGarageCashflowVoucherDto>;
}

export function useGarageCashflowPaymentQr({
  voucher,
  formData,
}: UseGarageCashflowPaymentQrParams) {
  const { data: companyProfile } = useCompanyProfile();
  const {
    bankOptions,
    onScrollBottom,
    onSearchChange,
    loading: isBanksLoading,
  } = useBanksCatalog();

  const { data: rawAccounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => bankStatementApi.getBankAccounts(),
    staleTime: 5 * 60 * 1000,
  });

  const companyAccounts = useMemo(
    () =>
      toTransferQrAccountOptions(
        rawAccounts as TransferQrBankStatementsAccount[],
      ),
    [rawAccounts],
  );

  const isReceipt =
    (
      voucher?.voucherType ||
      formData.voucherType ||
      "RECEIPT"
    ).toUpperCase() === "RECEIPT";

  const [accountId, setAccountId] = useState<string | null>(null);
  const [bin, setBin] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const rawAmount = formData.amount ?? voucher?.amount;
    setAmount(rawAmount ? Number(rawAmount) : null);
    setContent(buildVoucherTransferContent(voucher, formData));
  }, [voucher, formData.amount, formData.voucherCode, formData.licensePlate]);

  useEffect(() => {
    if (isReceipt && companyAccounts.length > 0 && !accountId) {
      const first = companyAccounts[0];
      setAccountId(first.id);
      setBin(first.bin);
      setBankCode(first.bankCode);
      setAccountNumber(first.accountNumber);
      setAccountName(companyProfile?.company_name || first.accountName);
    }
  }, [isReceipt, companyAccounts, accountId, companyProfile?.company_name]);

  const handleSelectCompanyAccount = useCallback(
    (id: string) => {
      setAccountId(id);
      const acc = companyAccounts.find((a) => a.id === id);
      if (acc) {
        setBin(acc.bin);
        setBankCode(acc.bankCode);
        setAccountNumber(acc.accountNumber);
        setAccountName(companyProfile?.company_name || acc.accountName);
      }
    },
    [companyAccounts, companyProfile?.company_name],
  );

  const handleSelectPartnerBank = useCallback((selectedBin: string) => {
    setBin(selectedBin);
    const bank = VIETQR_BANKS.find((b) => b.bin === selectedBin);
    setBankCode(bank?.code || "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    generateVietQrDataUrl({ bin, accountNumber, amount, content }).then(
      (url) => {
        if (!cancelled) setQrDataUrl(url);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [bin, accountNumber, amount, content]);

  const qrBankHint = useMemo(() => {
    if (!bankCode && !accountNumber) return null;
    return `${bankCode || "BANK"} - ${accountNumber}`;
  }, [bankCode, accountNumber]);

  return {
    isReceipt,
    companyAccounts,
    bankOptions,
    isBanksLoading,
    onScrollBottom,
    onSearchChange,
    accountId,
    handleSelectCompanyAccount,
    bin,
    bankCode,
    handleSelectPartnerBank,
    accountNumber,
    setAccountNumber,
    accountName,
    setAccountName,
    amount,
    setAmount,
    content,
    setContent,
    qrDataUrl,
    qrBankHint,
  };
}

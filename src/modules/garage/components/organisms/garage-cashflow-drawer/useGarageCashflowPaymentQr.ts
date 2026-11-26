import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
  GarageCashflowQrFields,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import {
  buildVoucherTransferContent,
  EMPTY_QR_BANK_FIELDS,
  formatQrBankHint,
  generateVietQrDataUrl,
  hasSavedQrInfo,
  isQrAccountNumberInvalid,
  normalizeAccountNumber,
  resolveVoucherQrInfo,
  toQrPatchFields,
  type VoucherQrInfo,
} from "./useGarageCashflowPaymentQr.helper";

type FormData = Partial<CreateGarageCashflowVoucherDto>;

export interface UseGarageCashflowPaymentQrParams {
  voucher: GarageCashflowVoucher | null;
  formData: FormData;
  /** Ghi thông tin thanh toán vào form để lưu cùng phiếu. Thiếu thì chỉ xem. */
  setFormData?: Dispatch<SetStateAction<FormData>>;
  /** Không ở chế độ sửa: khóa mọi thay đổi. */
  readOnly?: boolean;
}

export const GARAGE_BANK_ACCOUNTS_QUERY_KEY = ["bank-accounts"] as const;

/** Tài khoản công ty nhận tiền (dùng chung cho drawer và bản in). */
export function useGarageCompanyAccounts() {
  const { data: rawAccounts = [] } = useQuery({
    queryKey: GARAGE_BANK_ACCOUNTS_QUERY_KEY,
    queryFn: () => bankStatementApi.getBankAccounts(),
    staleTime: 5 * 60 * 1000,
  });
  return useMemo(
    () =>
      toTransferQrAccountOptions(
        rawAccounts as TransferQrBankStatementsAccount[],
      ),
    [rawAccounts],
  );
}

export function useGarageCashflowPaymentQr({
  voucher,
  formData,
  setFormData,
  readOnly = false,
}: UseGarageCashflowPaymentQrParams) {
  const { data: companyProfile } = useCompanyProfile();
  const banks = useBanksCatalog();
  const companyAccounts = useGarageCompanyAccounts();
  const companyName = companyProfile?.company_name;
  const canEdit = !readOnly && Boolean(setFormData);

  const isReceipt =
    (
      voucher?.voucherType ||
      formData.voucherType ||
      "RECEIPT"
    ).toUpperCase() === "RECEIPT";

  const saved: GarageCashflowQrFields = useMemo(
    () => ({ ...(voucher ?? {}), ...formData }),
    [voucher, formData],
  );
  const info = useMemo(
    () =>
      resolveVoucherQrInfo({
        isReceipt,
        saved,
        defaultContent: buildVoucherTransferContent(voucher, formData),
        companyAccounts,
        companyName,
      }),
    [isReceipt, saved, voucher, formData, companyAccounts, companyName],
  );
  const amount = Number(formData.amount ?? voucher?.amount) || null;

  // Ghi đúng field vừa sửa, tính từ form mới nhất (`prev`). Chưa có thông tin đã lưu thì chốt
  // thông tin ngân hàng đang hiển thị; nội dung CK chỉ ghi khi người dùng tự sửa.
  const update = useCallback(
    (patch: Partial<VoucherQrInfo>) => {
      if (!canEdit || !setFormData) return;
      setFormData((prev) => {
        const merged = { ...(voucher ?? {}), ...prev };
        if (hasSavedQrInfo(merged))
          return { ...prev, ...toQrPatchFields(patch) };
        const shown = resolveVoucherQrInfo({
          isReceipt,
          saved: merged,
          defaultContent: "",
          companyAccounts,
          companyName,
        });
        const { accountId, bin, bankCode, accountNumber, accountName } = shown;
        return {
          ...prev,
          ...toQrPatchFields({
            accountId,
            bin,
            bankCode,
            accountNumber,
            accountName,
          }),
          ...toQrPatchFields(patch),
        };
      });
    },
    [canEdit, setFormData, voucher, isReceipt, companyAccounts, companyName],
  );

  // Phiếu mới đổi loại thu/chi: thông tin ngân hàng không khớp loại (phiếu chi giữ tài khoản
  // công ty, phiếu thu giữ ngân hàng đối tác) thì bỏ để điền lại theo loại mới.
  const bankMismatch =
    !voucher &&
    canEdit &&
    (isReceipt
      ? hasSavedQrInfo(formData) && !formData.qrCompanyAccountId
      : Boolean(formData.qrCompanyAccountId));
  useEffect(() => {
    if (bankMismatch && setFormData)
      setFormData((prev) => ({ ...prev, ...EMPTY_QR_BANK_FIELDS }));
  }, [bankMismatch, setFormData]);

  // Phiếu mới: ghi tài khoản mặc định vào form để lưu cùng phiếu.
  const shouldSeedDefault =
    !voucher && canEdit && !hasSavedQrInfo(saved) && Boolean(info.bin);
  useEffect(() => {
    if (shouldSeedDefault) update({});
  }, [shouldSeedDefault, update]);

  const handleSelectCompanyAccount = useCallback(
    (id: string) => {
      const acc = companyAccounts.find((a) => a.id === id);
      if (!acc) return;
      update({
        accountId: acc.id,
        bin: acc.bin,
        bankCode: acc.bankCode,
        accountNumber: acc.accountNumber,
        accountName: companyName || acc.accountName,
      });
    },
    [companyAccounts, companyName, update],
  );

  const handleSelectPartnerBank = useCallback(
    (bin: string) => {
      const bank = VIETQR_BANKS.find((b) => b.bin === bin);
      update({ accountId: null, bin, bankCode: bank?.code || "" });
    },
    [update],
  );

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    generateVietQrDataUrl({
      bin: info.bin,
      accountNumber: info.accountNumber,
      amount,
      content: info.content,
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [info.bin, info.accountNumber, info.content, amount]);

  return {
    isReceipt,
    readOnly: !canEdit,
    companyAccounts,
    bankOptions: banks.bankOptions,
    isBanksLoading: banks.loading,
    onScrollBottom: banks.onScrollBottom,
    onSearchChange: banks.onSearchChange,
    accountId: info.accountId,
    handleSelectCompanyAccount,
    bin: info.bin,
    bankCode: info.bankCode,
    handleSelectPartnerBank,
    accountNumber: info.accountNumber,
    setAccountNumber: (v: string) =>
      update({ accountNumber: normalizeAccountNumber(v) }),
    accountNumberInvalid: isQrAccountNumberInvalid(info.accountNumber),
    accountName: info.accountName,
    setAccountName: (v: string) => update({ accountName: v }),
    amount,
    content: info.content,
    setContent: (v: string) => update({ content: v }),
    qrDataUrl,
    qrBankHint: formatQrBankHint(info),
  };
}

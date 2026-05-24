import { useState, type Dispatch, type SetStateAction } from "react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import {
  createPaymentVoucherApi,
  createVoucherAttachmentApi,
  deletePaymentVoucherApi,
  getCashBankTagPresetsApi,
  getPaymentVouchersPagedApi,
  submitPaymentVoucherApi,
  updatePaymentVoucherApi,
  uploadFileApi,
  type CashFund,
  type CounterpartySource,
  type CreatePaymentVoucherDto,
  type PaymentVoucher,
  type VoucherStatus,
  type VoucherType,
  type AttachmentType,
  type CashBankTagPreset,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { Employee } from "@/modules/auth/api/auth";
import {
  TODAY,
  buildForm,
  emptyForm,
  formatMoneyInput,
  moneyToVietnameseWords,
  parseMoneyInput,
  periodLastDay,
  todayIsoDate,
  voucherNoFromToday,
} from "@/modules/finance/utils/financeHelpers";
import type { CashVoucherForm } from "@/modules/finance/types/voucherForm";

interface LoadVouchersParams {
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  channelFilter: string;
  channelParam: "cash_fund_id";
  voucherChannel: "CASH";
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

interface DashboardParams {
  voucherChannel: "CASH";
  channelParam: "cash_fund_id";
  channelFilter: string;
  receiptType: "CASH_RECEIPT";
  paymentType: "CASH_PAYMENT";
}

interface UseCashVoucherHandlersParams {
  cashFunds: CashFund[];
  partners: BusinessPartner[];
  employees: Employee[];
  vouchers: PaymentVoucher[];
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  fundFilter: string;
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  attachmentFiles: File[];
  attachmentType: AttachmentType;
  attachmentNote: string;
  editing: PaymentVoucher | null;
  drawerEditMode: boolean;
  setDrawerEditMode: Dispatch<SetStateAction<boolean>>;
  setSaving: Dispatch<SetStateAction<boolean>>;
  setSaveError: Dispatch<SetStateAction<string | null>>;
  setAttachmentFiles: Dispatch<SetStateAction<File[]>>;
  setAttachmentNote: Dispatch<SetStateAction<string>>;
  openDrawerForNew: () => void;
  openDrawerForEdit: (voucher: PaymentVoucher) => void;
  closeDrawer: () => void;
  resetPeriod: () => void;
  resetAmounts: () => void;
  setPage: Dispatch<SetStateAction<number>>;
  loadVouchers: (
    params: LoadVouchersParams,
  ) => Promise<PaymentVoucher[] | undefined>;
  loadVoucherAttachments: (items: PaymentVoucher[]) => Promise<void>;
  loadSummary: (
    from: string,
    to: string,
    params: DashboardParams,
  ) => Promise<void>;
  loadOpeningBalanceAndChart: (
    from: string,
    chartEndDate: string,
    params: DashboardParams,
  ) => Promise<void>;
}

const cashDashboardParams: DashboardParams = {
  voucherChannel: "CASH",
  channelParam: "cash_fund_id",
  channelFilter: "",
  receiptType: "CASH_RECEIPT",
  paymentType: "CASH_PAYMENT",
};

export function useCashVoucherHandlers({
  cashFunds,
  partners,
  employees,
  vouchers,
  page,
  pageSize,
  search,
  statusFilter,
  fundFilter,
  sortCol,
  dateFrom,
  dateTo,
  amountMin,
  amountMax,
  attachmentFiles,
  attachmentType,
  attachmentNote,
  editing,
  drawerEditMode,
  setDrawerEditMode,
  setSaving,
  setSaveError,
  setAttachmentFiles,
  setAttachmentNote,
  openDrawerForNew,
  openDrawerForEdit,
  closeDrawer,
  resetPeriod,
  resetAmounts,
  setPage,
  loadVouchers,
  loadVoucherAttachments,
  loadSummary,
  loadOpeningBalanceAndChart,
}: UseCashVoucherHandlersParams) {
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();
  const [form, setForm] = useState<CashVoucherForm>(emptyForm("CASH_RECEIPT"));
  const [postingDateTouched, setPostingDateTouched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentVoucher | null>(null);
  const [tagPresets, setTagPresets] = useState<CashBankTagPreset[]>([]);
  const [deleting, setDeleting] = useState(false);

  function currentLoadParams(): LoadVouchersParams {
    return {
      page,
      pageSize,
      search,
      statusFilter,
      channelFilter: fundFilter,
      channelParam: "cash_fund_id",
      voucherChannel: "CASH",
      sortCol,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
    };
  }

  function currentDashboardParams(): DashboardParams {
    return { ...cashDashboardParams, channelFilter: fundFilter };
  }

  function reloadAll() {
    loadVouchers(currentLoadParams()).then((items) => {
      if (items) loadVoucherAttachments(items);
    });
    const dash = currentDashboardParams();
    loadSummary(dateFrom, dateTo, dash);
    loadOpeningBalanceAndChart(dateFrom, dateTo || TODAY, dash);
  }

  function handleReset() {
    resetPeriod();
    resetAmounts();
    setPage(1);
  }

  function voucherPrefix(vtype: VoucherType) {
    return vtype === "CASH_RECEIPT" ? "PT" : "PC";
  }

  async function generateVoucherNo(vtype: VoucherType) {
    const today = todayIsoDate();
    const monthEnd = periodLastDay(today.slice(0, 7));
    try {
      const res = await getPaymentVouchersPagedApi({
        page: 1,
        pageSize: 1,
        voucher_channel: "CASH",
        voucher_type: vtype,
        posting_date_from: `${today.slice(0, 7)}-01`,
        posting_date_to: monthEnd,
      });
      return voucherNoFromToday((res.total ?? 0) + 1, voucherPrefix(vtype));
    } catch {
      return voucherNoFromToday(1, voucherPrefix(vtype));
    }
  }

  async function loadTagPresets(vtype: "CASH_RECEIPT" | "CASH_PAYMENT") {
    try {
      setTagPresets(
        await getCashBankTagPresetsApi({
          voucher_channel: "CASH",
          voucher_direction: vtype === "CASH_PAYMENT" ? "OUT" : "IN",
        }),
      );
    } catch {
      setTagPresets([]);
    }
  }

  async function openNew(vtype: "CASH_RECEIPT" | "CASH_PAYMENT") {
    setForm(emptyForm(vtype));
    setPostingDateTouched(false);
    openDrawerForNew(); // Open immediately

    // Background load
    const vno = await generateVoucherNo(vtype);
    setForm((f) => ({ ...f, voucher_no: vno }));
    await loadTagPresets(vtype);
  }

  function openEdit(voucher: PaymentVoucher) {
    setForm(buildForm(voucher));
    setPostingDateTouched(true);
    openDrawerForEdit(voucher);
    loadTagPresets(voucher.voucher_type as "CASH_RECEIPT" | "CASH_PAYMENT");
  }

  const setField = <K extends keyof CashVoucherForm>(
    key: K,
    value: CashVoucherForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  function handleDocumentDateChange(date: string) {
    setForm((current) => ({
      ...current,
      document_date: date,
      posting_date: postingDateTouched ? current.posting_date : date,
    }));
  }

  function handlePostingDateChange(date: string) {
    setPostingDateTouched(true);
    setField("posting_date", date);
  }

  function handleAmountChange(value: string) {
    const digits = value.replace(/\D/g, "");
    const amount = digits ? Number(digits) : 0;
    setForm((current) => ({
      ...current,
      amount: digits ? formatMoneyInput(String(amount)) : "",
      amount_in_words: amount ? moneyToVietnameseWords(amount) : "",
    }));
  }

  function handleCashFundChange(fundId: string) {
    setForm((current) => ({
      ...current,
      cash_fund_id: fundId,
    }));
  }

  function handlePartnerChange(partnerId: string) {
    const partner = partners.find((item) => item.id === partnerId);
    setForm((current) => ({
      ...current,
      counterparty_id: partnerId,
      employee_id: "",
      counterparty_name_snapshot: partner?.name ?? "",
      counterparty_tax_code_snapshot: partner?.tax_code ?? "",
      counterparty_phone_snapshot: partner?.phone ?? "",
      counterparty_identity_no_snapshot: "",
    }));
  }

  function handleTagPresetSelect(preset: CashBankTagPreset) {
    // Preset codes có chứa CUSTOMER hoặc PAYMENT => đối tượng là đối tác ngoài (EXTERNAL)
    const needsExternal = /CUSTOMER|PAYMENT/.test(preset.code ?? "");
    setForm((current) => ({
      ...current,
      cash_bank_tag_preset_id: preset.id,
      description: current.description || preset.label,
      ...(needsExternal ? { counterparty_source: "EXTERNAL" as const } : {}),
    }));
  }

  function handleEmployeeChange(employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId);
    setForm((current) => ({
      ...current,
      employee_id: employeeId,
      counterparty_id: "",
      counterparty_name_snapshot: emp?.full_name ?? "",
      counterparty_phone_snapshot: emp?.phone ?? "",
      counterparty_identity_no_snapshot: "",
      counterparty_tax_code_snapshot: "",
    }));
  }

  function handleToggleEditMode() {
    if (drawerEditMode && editing) {
      setForm(buildForm(editing));
      setAttachmentFiles([]);
      setAttachmentNote("");
    }
    setDrawerEditMode((current) => !current);
    setSaveError(null);
  }

  async function handleSave(statusAction?: VoucherStatus) {
    if (!form.voucher_no.trim()) {
      setSaveError("Số chứng từ là bắt buộc.");
      return;
    }
    if (!form.document_date || !form.posting_date) {
      setSaveError("Ngày chứng từ và ngày hạch toán là bắt buộc.");
      return;
    }
    if (form.counterparty_source === "INTERNAL" && !form.employee_id) {
      setSaveError("Vui lòng chọn nhân viên.");
      return;
    }
    if (form.counterparty_source === "EXTERNAL" && !form.counterparty_id) {
      setSaveError("Vui lòng chọn đối tác.");
      return;
    }
    const amountValue = parseMoneyInput(form.amount);
    if (!form.amount || amountValue <= 0) {
      setSaveError("Số tiền không hợp lệ.");
      return;
    }
    if (!form.cash_fund_id) {
      setSaveError("Vui lòng chọn quỹ tiền mặt.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const shouldSubmit = statusAction === "PENDING_APPROVAL";
      const dto: CreatePaymentVoucherDto = {
        voucher_no: form.voucher_no.trim(),
        voucher_channel: "CASH",
        voucher_direction: form.voucher_type === "CASH_PAYMENT" ? "OUT" : "IN",
        voucher_type: form.voucher_type,
        document_date: form.document_date,
        posting_date: form.posting_date,
        counterparty_source: form.counterparty_source as CounterpartySource,
        ...(form.counterparty_source === "INTERNAL"
          ? { employee_id: form.employee_id }
          : { counterparty_id: form.counterparty_id }),
        counterparty_name_snapshot:
          form.counterparty_name_snapshot.trim() ||
          (form.counterparty_source === "INTERNAL"
            ? (employees.find((e) => e.id === form.employee_id)?.full_name ??
              "")
            : (partners.find((p) => p.id === form.counterparty_id)?.name ??
              "")),
        counterparty_tax_code_snapshot:
          form.counterparty_tax_code_snapshot.trim() || undefined,
        cash_fund_id: form.cash_fund_id,
        cash_bank_tag_preset_id: form.cash_bank_tag_preset_id || undefined,
        related_documents: form.related_documents,
        amount: amountValue,
        amount_in_words: form.amount_in_words.trim() || undefined,
        description: form.description.trim() || "-",
        status: shouldSubmit
          ? "DRAFT"
          : statusAction || editing?.status || "DRAFT",
      };
      const saved = editing
        ? await updatePaymentVoucherApi(editing.id, dto)
        : await createPaymentVoucherApi(dto);
      const finalVoucher = shouldSubmit
        ? await submitPaymentVoucherApi(saved.id)
        : saved;
      for (const file of attachmentFiles) {
        const uploaded = await uploadFileApi(file);
        await createVoucherAttachmentApi({
          payment_voucher_id: finalVoucher.id,
          file: uploaded.id,
          attachment_type: attachmentType,
          note: attachmentNote.trim() || undefined,
        });
      }
      showToast({
        title: editing
          ? t("voucher.actions.updateSuccess")
          : t("voucher.actions.createSuccess"),
        description: finalVoucher.voucher_no,
        variant: "success",
      });
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else reloadAll();
    } catch (error) {
      const reason = extractApiError(error);
      setSaveError(reason);
      showToast({
        title: editing
          ? t("voucher.actions.updateFail")
          : t("voucher.actions.createFail"),
        description: reason,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRelatedDocuments() {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await updatePaymentVoucherApi(editing.id, {
        related_documents: form.related_documents,
      });
      showToast({
        title: "Đã cập nhật chứng từ liên quan",
        description: saved.voucher_no,
        variant: "success",
      });
      closeDrawer();
      reloadAll();
    } catch (error) {
      const reason = extractApiError(error);
      setSaveError(reason);
      showToast({
        title: "Cập nhật chứng từ liên quan thất bại",
        description: reason,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const voucherNo = deleteTarget.voucher_no;
      await deletePaymentVoucherApi(deleteTarget.id);
      setDeleteTarget(null);
      showToast({
        title: t("voucher.actions.deleteSuccess"),
        description: voucherNo,
        variant: "success",
      });
      if (vouchers.length === 1 && page > 1) setPage(page - 1);
      else reloadAll();
    } catch (error) {
      showToast({
        title: t("voucher.actions.deleteFail"),
        description: extractApiError(error),
        variant: "destructive",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return {
    form,
    tagPresets,
    deleteTarget,
    deleting,
    setDeleteTarget,
    reloadAll,
    handleReset,
    openNew,
    openEdit,
    setField,
    handleDocumentDateChange,
    handlePostingDateChange,
    handleAmountChange,
    handleCashFundChange,
    handlePartnerChange,
    handleEmployeeChange,
    handleTagPresetSelect,
    handleToggleEditMode,
    handleSave,
    handleSaveRelatedDocuments,
    handleDelete,
  };
}

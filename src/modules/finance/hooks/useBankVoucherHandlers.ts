import { useCallback, useState } from "react";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import type { CompanyBankAccount } from "@/modules/accounting/api/catalogApi";
import type {
  BusinessPartner,
  BusinessPartnerBankAccount,
} from "@/modules/partners/api/partnerApi";
import {
  createPaymentVoucherApi,
  createVoucherAttachmentApi,
  deletePaymentVoucherApi,
  deleteVoucherAttachmentApi,
  getCashBankTagPresetsApi,
  getPaymentVoucherLookupBusinessPartnerBankAccountsApi,
  getPaymentVouchersPagedApi,
  getVoucherAttachmentsApi,
  submitPaymentVoucherApi,
  updatePaymentVoucherApi,
  uploadFileApi,
  type AttachmentType,
  type CashBankTagPreset,
  type CounterpartyRole,
  type CounterpartySource,
  type CreatePaymentVoucherDto,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
  type VoucherType,
} from "@/modules/finance/api/financeApi";
import type { Employee } from "@/modules/auth/api/auth";
import { STATUS_LABELS } from "@/modules/finance/types/voucherForm";
import type { BankVoucherForm } from "@/modules/finance/types/voucherForm";
import {
  TODAY,
  buildBankForm,
  emptyBankForm,
  moneyToVietnameseWords,
  parseMoneyInput,
  periodLastDay,
  todayIsoDate,
  voucherNoFromToday,
} from "@/modules/finance/utils/financeHelpers";

import { bankDashboardParamsBase, partnerRole, type DashboardParams, type LoadVouchersParams, type UseBankVoucherHandlersParams } from "./useBankVoucherHandlersSupport";

export function useBankVoucherHandlers({
  companyBankAccounts,
  partners,
  employees,
  vouchers,
  page,
  pageSize,
  search,
  statusFilter,
  bankFilter,
  sortCol,
  dateFrom,
  dateTo,
  amountMin,
  amountMax,
  coaItemsLength,
  attachmentFileName,
  setPage,
  loadVouchers,
  loadVoucherAttachments,
  loadSummary,
  loadOpeningBalanceAndChart,
  reloadDonutData,
}: UseBankVoucherHandlersParams) {
  const showToast = useUIStore((s) => s.showToast);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentVoucher | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState(false);
  const [form, setForm] = useState<BankVoucherForm>(emptyBankForm("BANK_RECEIPT"));
  const [postingDateTouched, setPostingDateTouched] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] = useState<AttachmentType>("INVOICE");
  const [attachmentNote, setAttachmentNote] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<PaymentVoucherAttachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentVoucher | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [partnerBankAccounts, setPartnerBankAccounts] = useState<BusinessPartnerBankAccount[]>([]);
  const [partnerBankLoading, setPartnerBankLoading] = useState(false);
  const [tagPresets, setTagPresets] = useState<CashBankTagPreset[]>([]);

  const dashboardParams: DashboardParams = {
    ...bankDashboardParamsBase,
    channelFilter: bankFilter,
  };

  const currentLoadParams = useCallback(
    (): LoadVouchersParams => ({
      page,
      pageSize,
      search,
      statusFilter,
      channelFilter: bankFilter,
      channelParam: "company_bank_account_id",
      voucherChannel: "BANK",
      sortCol,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
    }),
    [
      amountMax,
      amountMin,
      bankFilter,
      dateFrom,
      dateTo,
      page,
      pageSize,
      search,
      sortCol,
      statusFilter,
    ],
  );

  const loadPartnerBankAccounts = useCallback(async (partnerId: string) => {
    if (!partnerId) {
      setPartnerBankAccounts([]);
      return;
    }
    setPartnerBankLoading(true);
    try {
      const items = await getPaymentVoucherLookupBusinessPartnerBankAccountsApi(
        partnerId,
        { pageSize: 100 },
      );
      setPartnerBankAccounts(items);
    } catch {
      setPartnerBankAccounts([]);
    } finally {
      setPartnerBankLoading(false);
    }
  }, []);

  const loadExistingAttachments = useCallback(async (voucherId: string) => {
    try {
      setExistingAttachments(await getVoucherAttachmentsApi(voucherId));
    } catch {
      setExistingAttachments([]);
    }
  }, []);

  const reloadCurrentData = useCallback(() => {
    loadVouchers(currentLoadParams()).then((items) => {
      if (items) loadVoucherAttachments(items);
    });
    loadSummary(dateFrom, dateTo, dashboardParams);
    loadOpeningBalanceAndChart(dateFrom, dateTo || TODAY, dashboardParams);
    if (coaItemsLength) reloadDonutData();
  }, [
    coaItemsLength,
    currentLoadParams,
    dashboardParams,
    dateFrom,
    dateTo,
    loadOpeningBalanceAndChart,
    loadSummary,
    loadVoucherAttachments,
    loadVouchers,
    reloadDonutData,
  ]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditing(null);
    setDrawerEditMode(false);
    setAttachmentFiles([]);
    setAttachmentNote("");
    setExistingAttachments([]);
    setSaveError(null);
    setPartnerBankAccounts([]);
  }, []);

  function voucherPrefix(vtype: VoucherType) {
    return vtype === "CUSTOMER_ADVANCE_RECEIPT" ? "DCNH" : vtype === "BANK_RECEIPT" ? "UNT" : "UNC";
  }

  async function generateVoucherNo(vtype: VoucherType) {
    const today = todayIsoDate();
    const monthStart = `${today.slice(0, 7)}-01`;
    const monthEnd = periodLastDay(today.slice(0, 7));
    try {
      const res = await getPaymentVouchersPagedApi({
        page: 1,
        pageSize: 1,
        voucher_channel: "BANK",
        voucher_type: vtype,
        posting_date_from: monthStart,
        posting_date_to: monthEnd,
      });
      return voucherNoFromToday((res.total ?? 0) + 1, voucherPrefix(vtype));
    } catch {
      return voucherNoFromToday(1, voucherPrefix(vtype));
    }
  }

  async function loadTagPresets(vtype: "BANK_RECEIPT" | "BANK_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT") {
    try {
      setTagPresets(await getCashBankTagPresetsApi({
        voucher_channel: "BANK",
        voucher_direction: vtype === "BANK_PAYMENT" ? "OUT" : "IN",
      }));
    } catch {
      setTagPresets([]);
    }
  }

  async function openNew(vtype: "BANK_RECEIPT" | "BANK_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT") {
    // 1. Reset state & Open drawer immediately
    setDrawerOpen(true);
    setEditing(null);
    setDrawerEditMode(true);
    setSaveError(null);
    setAttachmentFiles([]);
    setAttachmentType("INVOICE");
    setAttachmentNote("");
    setExistingAttachments([]);
    setPartnerBankAccounts([]);
    setPostingDateTouched(false);

    // 2. Initial form state (placeholder)
    const nextForm = emptyBankForm(vtype);
    nextForm.document_date = todayIsoDate();
    nextForm.posting_date = todayIsoDate();
    nextForm.voucher_no = "...";
    setForm(nextForm);

    // 3. Async load in background
    try {
      const [vNo, presets] = await Promise.all([
        generateVoucherNo(vtype),
        getCashBankTagPresetsApi({
          voucher_channel: "BANK",
          voucher_direction: vtype === "BANK_PAYMENT" ? "OUT" : "IN",
        }).catch(() => []),
      ]);
      setTagPresets(presets as CashBankTagPreset[]);
      setForm((prev) => ({ ...prev, voucher_no: vNo }));
    } catch {
      // fallback
    }
  }

  function openEdit(voucher: PaymentVoucher) {
    setEditing(voucher);
    setForm(buildBankForm(voucher));
    setSaveError(null);
    setDrawerEditMode(false);
    setDrawerOpen(true);
    setPostingDateTouched(true);
    setAttachmentFiles([]);
    setAttachmentType("INVOICE");
    setAttachmentNote("");
    setExistingAttachments([]);
    loadExistingAttachments(voucher.id);
    if (voucher.counterparty_id) loadPartnerBankAccounts(voucher.counterparty_id);
    loadTagPresets(voucher.voucher_type as "BANK_RECEIPT" | "BANK_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT");
  }

  const setField = <K extends keyof BankVoucherForm>(
    key: K,
    value: BankVoucherForm[K],
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
      amount: digits ? new Intl.NumberFormat("vi-VN").format(amount) : "",
      amount_in_words: amount ? moneyToVietnameseWords(amount) : "",
    }));
  }

  function setCompanyBankAccountFields(current: BankVoucherForm, bankId: string) {
    const accountId =
      companyBankAccounts.find((bank) => bank.id === bankId)
        ?.accounting_account_id ?? "";
    if (!accountId) return current;
    return current.voucher_type !== "BANK_PAYMENT"
      ? { ...current, debit_account_id: accountId }
      : { ...current, credit_account_id: accountId };
  }

  function handleCompanyBankChange(bankId: string) {
    setForm((current) =>
      setCompanyBankAccountFields(
        { ...current, company_bank_account_id: bankId },
        bankId,
      ),
    );
  }

  function handleTagPresetSelect(preset: CashBankTagPreset) {
    setForm((current) => ({
      ...current,
      cash_bank_tag_preset_id: preset.id,
      debit_account_id: preset.debit_account_id || current.debit_account_id,
      credit_account_id: preset.credit_account_id || current.credit_account_id,
      description: current.description || preset.label,
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
      counterparty_address_snapshot: partner?.address ?? "",
      counterparty_phone_snapshot: partner?.phone ?? "",
      counterparty_identity_no_snapshot: "",
      counterparty_role: partnerRole(partner),
      beneficiary_bank_account_id: "",
    }));
    loadPartnerBankAccounts(partnerId);
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
      counterparty_address_snapshot: "",
      counterparty_role: "EMPLOYEE",
      beneficiary_bank_account_id: "",
    }));
  }

  function handleToggleEditMode() {
    if (drawerEditMode && editing) {
      setForm(buildBankForm(editing));
      setAttachmentFiles([]);
      setAttachmentNote("");
    }
    setDrawerEditMode((current) => !current);
    setSaveError(null);
  }

  async function handleDeleteAttachment(item: PaymentVoucherAttachment) {
    if (!editing) return;
    try {
      await deleteVoucherAttachmentApi(item.id);
      await loadExistingAttachments(editing.id);
      await loadVoucherAttachments(vouchers);
      showToast({
        title: "Đã xóa đính kèm",
        description: attachmentFileName(item),
        variant: "success",
      });
    } catch (error) {
      const reason = extractApiError(error);
      setSaveError(reason);
      showToast({
        title: "Xóa đính kèm thất bại",
        description: reason,
        variant: "destructive",
      });
    }
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
    if (!form.company_bank_account_id) {
      setSaveError("Vui lòng chọn tài khoản ngân hàng công ty.");
      return;
    }
    if (!form.debit_account_id || !form.credit_account_id) {
      setSaveError("Tài khoản nợ và có là bắt buộc.");
      return;
    }
    const amountValue = parseMoneyInput(form.amount);
    if (!form.amount || amountValue <= 0) {
      setSaveError("Số tiền không hợp lệ.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const shouldSubmit = statusAction === "PENDING_APPROVAL";
      const dto: CreatePaymentVoucherDto = {
        voucher_no: form.voucher_no.trim(),
        voucher_channel: "BANK",
        voucher_direction: form.voucher_type === "BANK_PAYMENT" ? "OUT" : "IN",
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
            ? (employees.find((e) => e.id === form.employee_id)?.full_name ?? "")
            : (partners.find((p) => p.id === form.counterparty_id)?.name ?? "")),
        counterparty_tax_code_snapshot:
          form.counterparty_tax_code_snapshot.trim() || undefined,
        counterparty_address_snapshot:
          form.counterparty_address_snapshot.trim() || undefined,
        counterparty_role: (form.counterparty_role as CounterpartyRole) || undefined,
        company_bank_account_id: form.company_bank_account_id,
        cash_bank_tag_preset_id: form.cash_bank_tag_preset_id || undefined,
        related_documents: form.related_documents,
        beneficiary_bank_account_id: form.beneficiary_bank_account_id || undefined,
        debit_account_id: form.debit_account_id,
        credit_account_id: form.credit_account_id,
        amount: amountValue,
        amount_in_words: form.amount_in_words.trim() || undefined,
        description: form.description.trim() || "-",
        status: shouldSubmit ? "DRAFT" : statusAction || editing?.status || "DRAFT",
      };
      const savedVoucher = editing
        ? await updatePaymentVoucherApi(editing.id, dto)
        : await createPaymentVoucherApi(dto);
      const finalVoucher = shouldSubmit
        ? await submitPaymentVoucherApi(savedVoucher.id)
        : savedVoucher;
      if (attachmentFiles.length) {
        for (const file of attachmentFiles) {
          const uploaded = await uploadFileApi(file);
          await createVoucherAttachmentApi({
            payment_voucher_id: finalVoucher.id,
            file: uploaded.id,
            attachment_type: attachmentType,
            note: attachmentNote.trim() || undefined,
          });
        }
      }
      showToast({
        title: editing ? "Cập nhật lệnh thành công" : "Tạo lệnh thành công",
        description: `${finalVoucher.voucher_no} - ${
          STATUS_LABELS[finalVoucher.status] ?? finalVoucher.status
        }`,
        variant: "success",
      });
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else reloadCurrentData();
    } catch (error) {
      const reason = extractApiError(error);
      setSaveError(reason);
      showToast({
        title: editing ? "Cập nhật lệnh thất bại" : "Tạo lệnh thất bại",
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
      showToast({ title: "Đã cập nhật chứng từ liên quan", description: saved.voucher_no, variant: "success" });
      closeDrawer();
      reloadCurrentData();
    } catch (error) {
      const reason = extractApiError(error);
      setSaveError(reason);
      showToast({ title: "Cập nhật chứng từ liên quan thất bại", description: reason, variant: "destructive" });
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
        title: "Xóa lệnh thành công",
        description: voucherNo,
        variant: "success",
      });
      if (vouchers.length === 1 && page > 1) setPage(page - 1);
      else {
        loadVouchers(currentLoadParams()).then((items) => {
          if (items) loadVoucherAttachments(items);
        });
      }
    } catch (error) {
      showToast({
        title: "Xóa lệnh thất bại",
        description: extractApiError(error),
        variant: "destructive",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return { drawerOpen, editing, drawerEditMode, form, saving, saveError, attachmentFiles, attachmentType, attachmentNote, existingAttachments, deleteTarget, deleting, partnerBankAccounts, partnerBankLoading, tagPresets, setSaving, setSaveError, reloadCurrentData, closeDrawer, openNew, openEdit, setField, setAttachmentFiles, setAttachmentType, setAttachmentNote, setDeleteTarget, handleDocumentDateChange, handlePostingDateChange, handleAmountChange, handleCompanyBankChange, handlePartnerChange, handleEmployeeChange, handleTagPresetSelect, handleToggleEditMode, handleDeleteAttachment, handleSave, handleSaveRelatedDocuments, handleDelete };
}

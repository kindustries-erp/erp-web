import { cn } from "@/shared/utils";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
  DEFAULT_STACK_OFFSET,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import { PartnerDrawer } from "@/modules/partners/components/PartnerDrawer";
import {
  emptyPartnerForm,
  buildPartnerForm,
  contactDraftFromApi,
  bankDraftFromApi,
} from "@/modules/partners/types";
import {
  getBusinessPartnerContactsPagedApi,
  getBusinessPartnerBankAccountsPagedApi,
  getBusinessPartnerRolesPagedApi,
  updateBusinessPartnerApi,
  createBusinessPartnerApi,
} from "@/modules/partners/api/partnerApi";
import {
  type CounterpartySource,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
  type AttachmentType,
  type CashBankTagPreset,
} from "@/modules/finance/api/financeApi";
import type { CashVoucherForm } from "@/modules/finance/types/voucherForm";
import {
  ATTACHMENT_TYPE_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
import { useUIStore } from "@/core/config/uiStore";
import { useState } from "react";
import { useT } from "@/core/i18n";
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";
import { RelatedDocumentsEditor } from "@/modules/finance/components/RelatedDocumentsEditor";

interface SelectOption {
  value: string;
  label: string;
  original?: any;
}

export interface CashVoucherDrawerProps {
  open: boolean;
  editing: PaymentVoucher | null;
  drawerEditMode: boolean;
  form: CashVoucherForm;
  saving: boolean;
  saveError: string | null;
  existingAttachments: PaymentVoucherAttachment[];
  attachmentFiles: File[];
  attachmentType: AttachmentType;
  attachmentNote: string;
  fundOpts: SelectOption[];
  partnerOpts: SelectOption[];
  employeeOpts: SelectOption[];
  coaOpts: SelectOption[];
  tagPresets: CashBankTagPreset[];
  canUpdateVoucher: boolean;
  onClose: () => void;
  onSave: (status?: VoucherStatus) => void;
  onSaveRelatedDocuments: () => void;
  onStatusTransition: (
    action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL",
    opts?: { cancel_reason?: string },
  ) => void;
  onToggleEditMode: () => void;
  onFieldChange: <K extends keyof CashVoucherForm>(
    k: K,
    v: CashVoucherForm[K],
  ) => void;
  onDocumentDateChange: (date: string) => void;
  onPostingDateChange: (date: string) => void;
  onAmountChange: (value: string) => void;
  onCashFundChange: (fundId: string) => void;
  onPartnerChange: (pid: string) => void;
  onEmployeeChange: (empId: string) => void;
  onTagPresetSelect: (preset: CashBankTagPreset) => void;
  onSourceChange: (src: CounterpartySource) => void;
  onDeleteAttachment: (item: PaymentVoucherAttachment) => void;
  onAttachmentFilesChange: (files: File[]) => void;
  onAttachmentTypeChange: (t: AttachmentType) => void;
  onAttachmentNoteChange: (note: string) => void;
}

/**
 * CashVoucherDrawer — Organism: drawer tạo / xem / chỉnh sửa phiếu thu chi tiền mặt.
 * Bao gồm cả logic actions (nút lưu/duyệt/hạch toán) theo trạng thái.
 * Dành riêng cho kênh CASH; TienGui có BankVoucherDrawer tương tự.
 */
export function CashVoucherDrawer({
  open,
  editing,
  drawerEditMode,
  form,
  saving,
  saveError,
  existingAttachments,
  attachmentFiles,
  attachmentType,
  attachmentNote,
  fundOpts,
  partnerOpts,
  employeeOpts,
  tagPresets,
  canUpdateVoucher,
  onClose,
  onSave,
  onSaveRelatedDocuments,
  onStatusTransition,
  onToggleEditMode,
  onFieldChange,
  onDocumentDateChange,
  onPostingDateChange,
  onAmountChange,
  onCashFundChange,
  onPartnerChange,
  onEmployeeChange,
  onTagPresetSelect,
  onSourceChange,
  onDeleteAttachment,
  onAttachmentFilesChange,
  onAttachmentTypeChange,
  onAttachmentNoteChange,
}: CashVoucherDrawerProps) {
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();
  const viewOnly = !!editing && !drawerEditMode;
  const canEdit =
    !editing || editing.status === "DRAFT" || editing.status === "APPROVED";
  const relatedDocumentsEditable =
    !!editing && editing.status === "APPROVED" && canUpdateVoucher;
  const relatedDocumentsReadOnly = viewOnly && !relatedDocumentsEditable;
  const isDirty = !!form.voucher_no.trim() || !!form.amount;

  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [isPartnerEditing, setIsPartnerEditing] = useState(false);
  const [partnerForm, setPartnerForm] = useState<any>({ ...emptyPartnerForm });
  const [contactRows, setContactRows] = useState<any[]>([]);
  const [bankRows, setBankRows] = useState<any[]>([]);

  const handleEditPartner = async () => {
    if (!form.counterparty_id) return;
    const partnerItem = partnerOpts.find(
      (p: any) => p.value === form.counterparty_id,
    );
    if (!partnerItem) return;

    const partner = partnerItem.original;
    if (!partner) return;

    setIsPartnerEditing(true);
    const baseForm = buildPartnerForm(partner);
    setPartnerForm(baseForm);
    setContactRows([]);
    setBankRows([]);
    setIsPartnerOpen(true);

    try {
      const [contactRes, bankRes, roleRes] = await Promise.all([
        getBusinessPartnerContactsPagedApi({ page: 1, pageSize: 500 }),
        getBusinessPartnerBankAccountsPagedApi({ page: 1, pageSize: 500 }),
        getBusinessPartnerRolesPagedApi({ page: 1, pageSize: 500 }),
      ]);
      const partnerContacts = contactRes.items.filter(
        (c) => c.business_partner_id === partner.id,
      );
      const partnerBanks = bankRes.items.filter(
        (b) => b.business_partner_id === partner.id,
      );
      const partnerRoles = roleRes.items.filter(
        (r) => r.business_partner_id === partner.id,
      );
      const contact =
        partnerContacts.find(
          (c) => c.is_default_receiver || c.is_default_payer,
        ) ?? partnerContacts[0];
      const bank = partnerBanks.find((b) => b.is_default) ?? partnerBanks[0];
      const role = partnerRoles.find((r) => r.is_active) ?? partnerRoles[0];
      setContactRows(
        partnerContacts.length ? partnerContacts.map(contactDraftFromApi) : [],
      );
      setBankRows(
        partnerBanks.length ? partnerBanks.map(bankDraftFromApi) : [],
      );
      setPartnerForm({
        ...baseForm,
        ...(contact
          ? {
              contact_id: contact.id,
              contact_full_name: contact.full_name,
              contact_position: contact.position ?? "",
              contact_phone: contact.phone ?? "",
              contact_email: contact.email ?? "",
              contact_is_default_receiver: contact.is_default_receiver,
              contact_is_default_payer: contact.is_default_payer,
              contact_is_active: contact.is_active,
            }
          : {}),
        ...(bank
          ? {
              bank_id: bank.id,
              bank_name: bank.bank_name,
              bank_account_number: bank.account_number,
              bank_account_holder: bank.account_holder,
              bank_currency: bank.currency ?? "VND",
              bank_is_default: bank.is_default,
              bank_is_active: bank.is_active,
            }
          : {}),
        ...(role
          ? {
              role_id: role.id,
              role_enabled: true,
              role: role.role,
              role_is_active: role.is_active,
            }
          : {}),
      });
    } catch {
      // Keep drawer usable
    }
  };

  const handleCreatePartner = () => {
    setIsPartnerEditing(false);
    setPartnerForm({ ...emptyPartnerForm });
    setContactRows([]);
    setBankRows([]);
    setIsPartnerOpen(true);
  };

  const setPartnerField = (k: string, v: any) =>
    setPartnerForm((f: any) => ({ ...f, [k]: v }));

  async function handlePartnerSave() {
    if (!partnerForm.code.trim() || !partnerForm.name.trim()) return;
    try {
      const dto = {
        code: partnerForm.code.trim(),
        name: partnerForm.name.trim(),
        partner_kind: partnerForm.partner_kind,
        display_name: partnerForm.display_name.trim() || undefined,
        tax_code: partnerForm.tax_code.trim() || undefined,
        phone: partnerForm.phone.trim() || undefined,
        email: partnerForm.email.trim() || undefined,
        address: partnerForm.address.trim() || undefined,
        is_active: partnerForm.is_active,
        note: partnerForm.note.trim() || undefined,
      };
      const partner =
        isPartnerEditing && partnerForm.id
          ? await updateBusinessPartnerApi(partnerForm.id, dto)
          : await createBusinessPartnerApi(dto);

      const partnerId = partner.id;

      setIsPartnerOpen(false);
      onPartnerChange(partnerId);
      showToast({ title: "Đã lưu đối tác", variant: "success" });
    } catch (error) {
      console.error(error);
    }
  }

  // ── Actions по статусу ────────────────────────────────────────────────────
  const actions: DrawerAction[] = (() => {
    if (!editing || drawerEditMode) {
      return [
        { label: "Hủy bỏ", onClick: onClose },
        { label: "Lưu nháp", disabled: saving, onClick: () => onSave("DRAFT") },
        {
          label: "Gửi duyệt",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: () => onSave("PENDING_APPROVAL"),
        },
      ];
    }
    switch (editing.status) {
      case "DRAFT":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                {
                  label: "Hủy phiếu",
                  disabled: saving,
                  onClick: () =>
                    onStatusTransition("CANCEL", {
                      cancel_reason: form.cancel_reason,
                    }),
                },
                {
                  label: "Gửi duyệt",
                  primary: true,
                  loading: saving,
                  disabled: saving,
                  onClick: () => onStatusTransition("SUBMIT"),
                },
              ]
            : []),
        ];
      case "PENDING_APPROVAL":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                {
                  label: "Hủy phiếu",
                  disabled: saving,
                  onClick: () =>
                    onStatusTransition("CANCEL", {
                      cancel_reason: form.cancel_reason,
                    }),
                },
                {
                  label: "Từ chối",
                  disabled: saving,
                  onClick: () => onStatusTransition("REJECT"),
                },
                {
                  label: "Duyệt",
                  primary: true,
                  loading: saving,
                  disabled: saving,
                  onClick: () => onStatusTransition("APPROVE"),
                },
              ]
            : []),
        ];
      case "APPROVED":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                {
                  label: editing?.journal_entry_id
                    ? "Sửa bút toán"
                    : "Ghi nhận bút toán",
                  primary: true,
                  loading: saving,
                  disabled: saving,
                  onClick: () => onStatusTransition("POST"),
                },
                ...(editing?.journal_entry_id
                  ? [
                      {
                        label: "Lưu chứng từ liên quan",
                        loading: saving,
                        disabled: saving,
                        onClick: onSaveRelatedDocuments,
                      },
                    ]
                  : []),
                {
                  label: "Hủy phiếu",
                  disabled: saving,
                  onClick: () =>
                    onStatusTransition("CANCEL", {
                      cancel_reason: form.cancel_reason,
                    }),
                },
              ]
            : []),
        ];
      default:
        return [{ label: "Đóng", onClick: onClose }];
    }
  })();

  const editToggle =
    editing && canEdit && canUpdateVoucher ? (
      <button
        onClick={onToggleEditMode}
        className={cn(
          "px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors",
          drawerEditMode
            ? "border-[color:var(--border)] text-[color:var(--muted-fg)] bg-[color:var(--muted)] hover:bg-surface-hover"
            : "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg",
        )}
      >
        {drawerEditMode ? t("voucher.drawer.cancel") : t("voucher.drawer.edit")}
      </button>
    ) : null;

  const title = editing
    ? form.voucher_type === "CASH_RECEIPT"
      ? t("voucher.drawer.titleEditReceipt").replace("{0}", form.voucher_no)
      : t("voucher.drawer.titleEditPayment").replace("{0}", form.voucher_no)
    : form.voucher_type === "CASH_RECEIPT"
      ? t("voucher.drawer.titleCreateReceipt")
      : t("voucher.drawer.titleCreatePayment");

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      confirmOnClose={drawerEditMode && isDirty && !viewOnly}
      title={title}
      subtitle={editing ? editing.voucher_no : t("voucher.drawer.subtitleEdit")}
      headerExtra={editToggle}
      panelClassName="w-[calc(100vw/3)] max-[1200px]:w-1/2 max-[980px]:w-[calc(100vw-24px)] max-[500px]:w-screen"
      bodyClassName="p-4"
      actions={actions}
    >
      {/* Section 1: Thông tin chứng từ */}
      <DrawerSection title={t("voucher.drawer.sectionInfo")}>
        <div className="grid grid-cols-1 gap-y-1">
          <div className="grid grid-cols-2 gap-x-3">
            <DrawerField label={t("voucher.drawer.voucherNo")} required>
              <input
                type="text"
                disabled={viewOnly}
                className={inputCls}
                value={form.voucher_no}
                onChange={(e) => onFieldChange("voucher_no", e.target.value)}
                placeholder={t("voucher.drawer.voucherNoPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.cashFund")} required>
              <Combobox
                options={fundOpts}
                value={form.cash_fund_id}
                onChange={onCashFundChange}
                placeholder={t("voucher.drawer.cashFundPlaceholder")}
                disabled={viewOnly}
              />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <DrawerField label={t("voucher.drawer.docDate")} required>
              <DatePicker
                value={form.document_date}
                disabled={viewOnly}
                onChange={onDocumentDateChange}
                className="w-full min-w-0"
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.postDate")} required>
              <DatePicker
                value={form.posting_date}
                disabled={viewOnly}
                onChange={onPostingDateChange}
                className="w-full min-w-0"
              />
            </DrawerField>
          </div>
        </div>
      </DrawerSection>

      {/* Section 2: Đối tượng */}
      <DrawerSection title={t("voucher.drawer.sectionPartner")}>
        <DrawerField label="Loại đối tượng" required>
          <Combobox
            options={COUNTERPARTY_SOURCE_OPTS}
            value={form.counterparty_source}
            onChange={(v) =>
              onSourceChange((v as CounterpartySource) || "EXTERNAL")
            }
            disabled={viewOnly}
          />
        </DrawerField>

        {form.counterparty_source === "INTERNAL" ? (
          <DrawerField label="Nhân viên" required>
            <Combobox
              options={employeeOpts}
              value={form.employee_id}
              onChange={onEmployeeChange}
              placeholder="Chọn nhân viên..."
              disabled={viewOnly}
            />
          </DrawerField>
        ) : (
          <div className="grid grid-cols-1 gap-y-1">
            <DrawerField label={t("voucher.drawer.partner")} required>
              <div className="flex gap-1">
                <div className="flex-1 min-w-0">
                  <Combobox
                    options={partnerOpts}
                    value={form.counterparty_id}
                    onChange={onPartnerChange}
                    placeholder={t("voucher.drawer.partnerPlaceholder")}
                    disabled={viewOnly}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreatePartner}
                  className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-surface-hover transition-colors flex items-center justify-center"
                  title="Thêm đối tác"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleEditPartner}
                  disabled={!form.counterparty_id}
                  className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-surface-hover transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Sửa đối tác"
                >
                  ✎
                </button>
              </div>
            </DrawerField>
          </div>
        )}

        {(form.counterparty_name_snapshot ||
          form.counterparty_phone_snapshot ||
          form.counterparty_identity_no_snapshot) && (
          <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-fg space-y-1">
            <p className="font-medium text-foreground">
              Thông tin sẽ được chốt khi lưu:
            </p>
            {form.counterparty_name_snapshot && (
              <p>
                Tên:{" "}
                <span className="text-foreground">
                  {form.counterparty_name_snapshot}
                </span>
              </p>
            )}
            {form.counterparty_phone_snapshot && (
              <p>
                SĐT:{" "}
                <span className="text-foreground">
                  {form.counterparty_phone_snapshot}
                </span>
              </p>
            )}
            {form.counterparty_identity_no_snapshot && (
              <p>
                CMND/CCCD:{" "}
                <span className="text-foreground">
                  {form.counterparty_identity_no_snapshot}
                </span>
              </p>
            )}
          </div>
        )}
      </DrawerSection>

      {/* Section 3: Hạch toán */}
      <DrawerSection title={t("voucher.drawer.sectionAccounting")}>
        <div className="grid grid-cols-1 gap-y-1">
          <div className="grid grid-cols-2 gap-x-3">
            <DrawerField label={t("voucher.drawer.amount")} required>
              <input
                type="text"
                inputMode="numeric"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder={t("voucher.drawer.amountPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.amountWords")}>
              <input
                type="text"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount_in_words}
                onChange={(e) =>
                  onFieldChange("amount_in_words", e.target.value)
                }
                placeholder={t("voucher.drawer.amountWordsPlaceholder")}
              />
            </DrawerField>
          </div>
          <DrawerField label={t("voucher.drawer.desc")}>
            <textarea
              className={inputCls}
              disabled={viewOnly || editing?.status === "APPROVED"}
              rows={2}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder={t("voucher.drawer.descPlaceholder")}
            />
          </DrawerField>
          {editing && (
            <DrawerField label="Lý do hủy" required>
              <input
                type="text"
                className={inputCls}
                value={form.cancel_reason || ""}
                onChange={(e) => onFieldChange("cancel_reason", e.target.value)}
                placeholder="Nhập lý do hủy phiếu..."
                disabled={editing.status === "CANCELLED"}
              />
            </DrawerField>
          )}
        </div>
      </DrawerSection>

      <div className="mt-2 pt-4 border-t border-border space-y-6">
        <DrawerSection title="Chứng từ liên quan">
          <RelatedDocumentsEditor
            value={form.related_documents}
            disabled={relatedDocumentsReadOnly}
            counterpartyId={form.counterparty_id}
            maxSettlementAmount={Number(form.amount) || undefined}
            onChange={(value) => onFieldChange("related_documents", value)}
          />
        </DrawerSection>

        {/* Section 4: Đính kèm */}
        <DrawerSection title={t("voucher.drawer.sectionAttachment")}>
          {existingAttachments.length > 0 && (
            <div className="mb-3 rounded-lg border border-border overflow-hidden">
              {existingAttachments.map((a) => (
                <AttachmentRow
                  key={a.id}
                  item={a}
                  onDelete={viewOnly ? undefined : onDeleteAttachment}
                />
              ))}
            </div>
          )}
          {!viewOnly && (
            <>
              <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
                <DrawerField label={t("voucher.drawer.attachmentType")}>
                  <Combobox
                    options={ATTACHMENT_TYPE_OPTS}
                    value={attachmentType}
                    onChange={(v) =>
                      onAttachmentTypeChange((v as AttachmentType) || "OTHER")
                    }
                    placeholder={t("voucher.drawer.attachmentTypePlaceholder")}
                  />
                </DrawerField>
                <DrawerField label={t("voucher.drawer.attachmentNote")}>
                  <input
                    type="text"
                    className={inputCls}
                    value={attachmentNote}
                    onChange={(e) => onAttachmentNoteChange(e.target.value)}
                    placeholder={t("voucher.drawer.attachmentNotePlaceholder")}
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("voucher.drawer.newFile")}>
                <FileUploadBox
                  multiple
                  files={attachmentFiles}
                  onFilesChange={onAttachmentFilesChange}
                  maxSizeMb={10}
                />
              </DrawerField>
            </>
          )}
        </DrawerSection>

        {/* Section 5: Lịch sử duyệt — chỉ hiện khi xem, không phải tạo mới */}
        {editing && (
          <DrawerSection title="Lịch sử duyệt">
            <ApprovalHistory voucherId={editing.id} />
          </DrawerSection>
        )}
      </div>

      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {saveError}
        </div>
      )}

      <PartnerDrawer
        drawerOpen={isPartnerOpen}
        closeDrawer={() => setIsPartnerOpen(false)}
        isDirty={false}
        editing={isPartnerEditing ? partnerForm : null}
        saving={false}
        handleSave={handlePartnerSave}
        form={partnerForm}
        setField={setPartnerField}
        contactRows={contactRows}
        setContactField={(idx: number, k: string, v: any) =>
          setContactRows((rows) =>
            rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)),
          )
        }
        removeContactRow={(idx: number) =>
          setContactRows((rows) => rows.filter((_, i) => i !== idx))
        }
        addContactRow={() =>
          setContactRows((r) => [...r, { tempId: Date.now() }])
        }
        bankRows={bankRows}
        setBankField={(idx: number, k: string, v: any) =>
          setBankRows((rows) =>
            rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)),
          )
        }
        removeBankRow={(idx: number) =>
          setBankRows((rows) => rows.filter((_, i) => i !== idx))
        }
        addBankRow={() => setBankRows((r) => [...r, { tempId: Date.now() }])}
        saveError={null}
        stackOffset={DEFAULT_STACK_OFFSET}
        zIndex={600}
      />
    </DrawerModal>
  );
}

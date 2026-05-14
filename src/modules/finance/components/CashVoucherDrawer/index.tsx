import { cn } from "@/shared/utils";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import {
  type CounterpartySource,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
  type AttachmentType,
  type CashBankTagPreset,
} from "@/modules/finance/api/financeApi";
import type { ChartOfAccount } from "@/modules/accounting/api/catalogApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { CashFund } from "@/modules/finance/api/financeApi";
import type { CashVoucherForm } from "@/modules/finance/types/voucherForm";
import { ATTACHMENT_TYPE_OPTS, COUNTERPARTY_ROLE_OPTS, COUNTERPARTY_SOURCE_OPTS } from "@/modules/finance/types/voucherForm";
import { useT } from "@/core/i18n";
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";
import { RelatedDocumentsEditor } from "@/modules/finance/components/RelatedDocumentsEditor";

interface SelectOption {
  value: string;
  label: string;
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
  debitAccountOpts: SelectOption[];
  creditAccountOpts: SelectOption[];
  tagPresets: CashBankTagPreset[];
  canUpdateVoucher: boolean;

  onClose: () => void;
  onSave: (status?: VoucherStatus) => void;
  onSaveRelatedDocuments: () => void;
  onStatusTransition: (action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL") => void;
  onToggleEditMode: () => void;
  onFieldChange: <K extends keyof CashVoucherForm>(k: K, v: CashVoucherForm[K]) => void;
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
  open, editing, drawerEditMode, form, saving, saveError,
  existingAttachments, attachmentFiles, attachmentType, attachmentNote,
  fundOpts, partnerOpts, employeeOpts, coaOpts, debitAccountOpts, creditAccountOpts, tagPresets,
  canUpdateVoucher,
  onClose, onSave, onSaveRelatedDocuments, onStatusTransition, onToggleEditMode,
  onFieldChange, onDocumentDateChange, onPostingDateChange, onAmountChange,
  onCashFundChange, onPartnerChange, onEmployeeChange, onTagPresetSelect, onSourceChange,
  onDeleteAttachment, onAttachmentFilesChange, onAttachmentTypeChange, onAttachmentNoteChange,
}: CashVoucherDrawerProps) {
  const t = useT();
  const viewOnly = !!editing && !drawerEditMode;
  const canEdit = !editing || editing.status === "DRAFT";
  const relatedDocumentsEditable = !!editing && ["APPROVED", "POSTED"].includes(editing.status) && canUpdateVoucher;
  const relatedDocumentsReadOnly = viewOnly && !relatedDocumentsEditable;
  const isDirty = !!form.voucher_no.trim() || !!form.amount;

  // ── Actions по статусу ────────────────────────────────────────────────────
  const actions: DrawerAction[] = (() => {
    if (!editing || drawerEditMode) {
      return [
        { label: "Hủy bỏ", onClick: onClose },
        { label: "Lưu nháp", disabled: saving, onClick: () => onSave("DRAFT") },
        { label: "Gửi duyệt", primary: true, loading: saving, disabled: saving, onClick: () => onSave("PENDING_APPROVAL") },
      ];
    }
    switch (editing.status) {
      case "DRAFT":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                { label: "Hủy phiếu", disabled: saving, onClick: () => onStatusTransition("CANCEL") },
                { label: "Gửi duyệt", primary: true, loading: saving, disabled: saving, onClick: () => onStatusTransition("SUBMIT") },
              ]
            : []),
        ];
      case "PENDING_APPROVAL":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                { label: "Hủy phiếu", disabled: saving, onClick: () => onStatusTransition("CANCEL") },
                { label: "Từ chối", disabled: saving, onClick: () => onStatusTransition("REJECT") },
                { label: "Duyệt", primary: true, loading: saving, disabled: saving, onClick: () => onStatusTransition("APPROVE") },
              ]
            : []),
        ];
      case "APPROVED":
      case "POSTED":
        return [
          { label: "Đóng", onClick: onClose },
          ...(canUpdateVoucher
            ? [
                { label: "Lưu chứng từ liên quan", primary: true, loading: saving, disabled: saving, onClick: onSaveRelatedDocuments },
                { label: "Hủy phiếu", disabled: saving, onClick: () => onStatusTransition("CANCEL") },
              ]
            : []),
        ];
      default:
        return [{ label: "Đóng", onClick: onClose }];
    }
  })();

  const editToggle = editing && canEdit && canUpdateVoucher ? (
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
    ? form.voucher_type === "CASH_RECEIPT" ? t("voucher.drawer.titleEditReceipt").replace("{0}", form.voucher_no) : t("voucher.drawer.titleEditPayment").replace("{0}", form.voucher_no)
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
            <DrawerField label={t("voucher.drawer.docDate")} required>
              <DatePicker
                value={form.document_date}
                disabled={viewOnly}
                onChange={onDocumentDateChange}
                className="w-full min-w-0"
              />
            </DrawerField>
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <DrawerField label={t("voucher.drawer.postDate")} required>
              <DatePicker
                value={form.posting_date}
                disabled={viewOnly}
                onChange={onPostingDateChange}
                className="w-full min-w-0"
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
        </div>
      </DrawerSection>

      {/* Section 2: Đối tượng */}
      <DrawerSection title={t("voucher.drawer.sectionPartner")}>
        <DrawerField label="Loại đối tượng" required>
          <Combobox
            options={COUNTERPARTY_SOURCE_OPTS}
            value={form.counterparty_source}
            onChange={(v) => onSourceChange((v as CounterpartySource) || "EXTERNAL")}
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
              <Combobox
                options={partnerOpts}
                value={form.counterparty_id}
                onChange={onPartnerChange}
                placeholder={t("voucher.drawer.partnerPlaceholder")}
                disabled={viewOnly}
              />
            </DrawerField>
            <div className="grid grid-cols-2 gap-x-3">
              <DrawerField label={t("voucher.drawer.role")}>
                <Combobox
                  options={COUNTERPARTY_ROLE_OPTS}
                  value={form.counterparty_role}
                  onChange={(v) => onFieldChange("counterparty_role", v)}
                  placeholder={t("voucher.drawer.rolePlaceholder")}
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("voucher.drawer.taxCode")}>
                <input
                  type="text"
                  disabled
                  className={inputCls}
                  value={form.counterparty_tax_code_snapshot}
                  readOnly
                />
              </DrawerField>
            </div>
            <div className="col-span-2 max-[560px]:col-span-1">
              <DrawerField label={t("voucher.drawer.address")}>
                <input
                  type="text"
                  disabled
                  className={inputCls}
                  value={form.counterparty_address_snapshot}
                  readOnly
                />
              </DrawerField>
            </div>
          </div>
        )}

        {(form.counterparty_name_snapshot ||
          form.counterparty_phone_snapshot ||
          form.counterparty_identity_no_snapshot) && (
          <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-fg space-y-1">
            <p className="font-medium text-foreground">Thông tin sẽ được chốt khi lưu:</p>
            {form.counterparty_name_snapshot && (
              <p>Tên: <span className="text-foreground">{form.counterparty_name_snapshot}</span></p>
            )}
            {form.counterparty_phone_snapshot && (
              <p>SĐT: <span className="text-foreground">{form.counterparty_phone_snapshot}</span></p>
            )}
            {form.counterparty_identity_no_snapshot && (
              <p>CMND/CCCD: <span className="text-foreground">{form.counterparty_identity_no_snapshot}</span></p>
            )}
          </div>
        )}
      </DrawerSection>

      {/* Section 3: Hạch toán */}
      <DrawerSection title={t("voucher.drawer.sectionAccounting")}>
        <CashBankTagPresetCards
          presets={tagPresets}
          selectedId={form.cash_bank_tag_preset_id}
          debitAccountOpts={debitAccountOpts}
          creditAccountOpts={creditAccountOpts}
          disabled={viewOnly}
          onSelect={onTagPresetSelect}
        />
        <div className="grid grid-cols-1 gap-y-1">
          <div className="grid grid-cols-2 gap-x-3">
            <DrawerField label={t("voucher.drawer.debitAcc")} required>
              <Combobox
                options={debitAccountOpts}
                value={form.debit_account_id}
                onChange={(v) => onFieldChange("debit_account_id", v)}
                placeholder={t("voucher.drawer.accPlaceholder")}
                disabled={viewOnly}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.creditAcc")} required>
              <Combobox
                options={creditAccountOpts}
                value={form.credit_account_id}
                onChange={(v) => onFieldChange("credit_account_id", v)}
                placeholder={t("voucher.drawer.accPlaceholder")}
                disabled={viewOnly}
              />
            </DrawerField>
          </div>
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
                onChange={(e) => onFieldChange("amount_in_words", e.target.value)}
                placeholder={t("voucher.drawer.amountWordsPlaceholder")}
              />
            </DrawerField>
          </div>
          <DrawerField label={t("voucher.drawer.desc")}>
            <textarea
              className={inputCls}
              disabled={viewOnly}
              rows={2}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder={t("voucher.drawer.descPlaceholder")}
            />
          </DrawerField>
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
                    onChange={(v) => onAttachmentTypeChange((v as AttachmentType) || "OTHER")}
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
    </DrawerModal>
  );
}

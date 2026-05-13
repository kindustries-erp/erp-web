import { DatePicker } from "@/shared/components/DatePicker";
import { DrawerModal, DrawerSection, DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { cn } from "@/shared/utils";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import { ATTACHMENT_TYPE_OPTS, COUNTERPARTY_ROLE_OPTS, COUNTERPARTY_SOURCE_OPTS } from "@/modules/finance/types/voucherForm";
import type { AttachmentType, CounterpartySource } from "@/modules/finance/api/financeApi";
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";
import { RelatedDocumentsEditor } from "@/modules/finance/components/RelatedDocumentsEditor";

export function BankVoucherDrawer(props: any) {
  const { t, drawerOpen, closeDrawer, drawerEditMode, isDirty, viewOnly, editing, form, editToggle, drawerActions, setField, handleDocumentDateChange, handlePostingDateChange, companyBankOpts, handleCompanyBankChange, employeeOpts, handleEmployeeChange, partnerOpts, handlePartnerChange, partnerBankOpts, partnerBankLoading, debitAccountOpts, creditAccountOpts, tagPresets, handleTagPresetSelect, handleAmountChange, existingAttachments, handleDeleteAttachment, attachmentType, setAttachmentType, attachmentNote, setAttachmentNote, attachmentFiles, setAttachmentFiles, saveError } = props;
  return (
    <DrawerModal
      open={drawerOpen}
      onClose={closeDrawer}
      confirmOnClose={drawerEditMode && isDirty && !viewOnly}
      title={editing ? (form.voucher_type === "BANK_RECEIPT" ? t("voucher.drawer.titleEditUNT") : t("voucher.drawer.titleEditUNC")).replace("{0}", form.voucher_no) : form.voucher_type === "BANK_RECEIPT" ? t("voucher.drawer.titleCreateUNT") : t("voucher.drawer.titleCreateUNC")}
      subtitle={editing ? editing.voucher_no : t("voucher.drawer.subtitleEdit")}
      headerExtra={editToggle}
      panelClassName="w-[860px] max-[980px]:w-[calc(100vw-24px)] max-[500px]:w-screen"
      bodyClassName="p-4"
      actions={drawerActions}
    >
      <DrawerSection title={t("voucher.drawer.sectionOrder")}>
        <div className="grid grid-cols-3 max-[760px]:grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
          <DrawerField label={t("voucher.drawer.voucherNo")} required><input type="text" disabled={viewOnly} className={inputCls} value={form.voucher_no} onChange={(e) => setField("voucher_no", e.target.value)} placeholder={t("voucher.drawer.voucherNoPlaceholder")} /></DrawerField>
          <DrawerField label={t("voucher.drawer.docDate")} required><DatePicker disabled={viewOnly} value={form.document_date} onChange={handleDocumentDateChange} className="w-full min-w-0" /></DrawerField>
          <DrawerField label={t("voucher.drawer.postDate")} required><DatePicker disabled={viewOnly} value={form.posting_date} onChange={handlePostingDateChange} className="w-full min-w-0" /></DrawerField>
        </div>
        <DrawerField label={t("voucher.drawer.bankAccount")} required><Combobox disabled={viewOnly} options={companyBankOpts} value={form.company_bank_account_id} onChange={handleCompanyBankChange} placeholder={t("voucher.drawer.bankAccountPlaceholder")} /></DrawerField>
      </DrawerSection>
      <CounterpartySection {...props} />
      <DrawerSection title={t("voucher.drawer.sectionAccounting")}>
        <CashBankTagPresetCards presets={tagPresets ?? []} selectedId={form.cash_bank_tag_preset_id} debitAccountOpts={debitAccountOpts} creditAccountOpts={creditAccountOpts} disabled={viewOnly} onSelect={handleTagPresetSelect} />
        <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
          <DrawerField label={t("voucher.drawer.debitAcc")} required><Combobox disabled={viewOnly} options={debitAccountOpts} value={form.debit_account_id} onChange={(v) => setField("debit_account_id", v)} placeholder={t("voucher.drawer.accPlaceholder")} /></DrawerField>
          <DrawerField label={t("voucher.drawer.creditAcc")} required><Combobox disabled={viewOnly} options={creditAccountOpts} value={form.credit_account_id} onChange={(v) => setField("credit_account_id", v)} placeholder={t("voucher.drawer.accPlaceholder")} /></DrawerField>
          <DrawerField label={t("voucher.drawer.amount")} required><input type="text" inputMode="numeric" disabled={viewOnly} className={inputCls} value={form.amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder={t("voucher.drawer.amountPlaceholder")} /></DrawerField>
          <DrawerField label={t("voucher.drawer.amountWords")}><input type="text" disabled={viewOnly} className={inputCls} value={form.amount_in_words} onChange={(e) => setField("amount_in_words", e.target.value)} placeholder={t("voucher.drawer.amountWordsPlaceholder")} /></DrawerField>
        </div>
        <DrawerField label={t("voucher.drawer.desc")}><textarea disabled={viewOnly} className={inputCls} rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder={t("voucher.drawer.descPlaceholder")} /></DrawerField>
      </DrawerSection>
      <DrawerSection title="Chứng từ liên quan"><RelatedDocumentsEditor value={form.related_documents ?? []} disabled={viewOnly} counterpartyId={form.counterparty_id} onChange={(value) => setField("related_documents", value)} /></DrawerSection>
      <DrawerSection title={t("voucher.drawer.sectionAttachment")}>
        {existingAttachments.length > 0 && <div className="mb-3 rounded-lg border border-border overflow-hidden">{existingAttachments.map((a: any) => <AttachmentRow key={a.id} item={a} onDelete={viewOnly ? undefined : handleDeleteAttachment} />)}</div>}
        {!viewOnly && <><div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3"><DrawerField label={t("voucher.drawer.attachmentType")}><Combobox options={ATTACHMENT_TYPE_OPTS} value={attachmentType} onChange={(v) => setAttachmentType((v as AttachmentType) || "OTHER")} placeholder={t("voucher.drawer.attachmentTypePlaceholder")} /></DrawerField><DrawerField label={t("voucher.drawer.attachmentNote")}><input type="text" className={inputCls} value={attachmentNote} onChange={(e) => setAttachmentNote(e.target.value)} placeholder={t("voucher.drawer.attachmentNotePlaceholder")} /></DrawerField></div><DrawerField label={t("voucher.drawer.newFile")}><FileUploadBox multiple files={attachmentFiles} onFilesChange={setAttachmentFiles} maxSizeMb={10} /></DrawerField></>}
      </DrawerSection>
      {editing && <DrawerSection title="Lịch sử duyệt"><ApprovalHistory voucherId={editing.id} /></DrawerSection>}
      {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
    </DrawerModal>
  );
}

function CounterpartySection(props: any) {
  const { t, form, setField, viewOnly, employeeOpts, handleEmployeeChange, partnerOpts, handlePartnerChange, partnerBankOpts, partnerBankLoading } = props;
  return (
    <DrawerSection title={t("voucher.drawer.sectionPartner")}>
      <DrawerField label="Loại đối tượng" required><Combobox options={COUNTERPARTY_SOURCE_OPTS} value={form.counterparty_source} onChange={(v) => setField("counterparty_source", (v as CounterpartySource) || "EXTERNAL")} disabled={viewOnly} /></DrawerField>
      {form.counterparty_source === "INTERNAL" ? <DrawerField label="Nhân viên" required><Combobox options={employeeOpts} value={form.employee_id} onChange={handleEmployeeChange} placeholder="Chọn nhân viên..." disabled={viewOnly} /></DrawerField> : <ExternalCounterpartyFields {...props} />}
      {(form.counterparty_name_snapshot || form.counterparty_phone_snapshot || form.counterparty_identity_no_snapshot) && <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-fg space-y-1"><p className="font-medium text-foreground">Thông tin sẽ được chốt khi lưu:</p>{form.counterparty_name_snapshot && <p>Tên: <span className="text-foreground">{form.counterparty_name_snapshot}</span></p>}{form.counterparty_phone_snapshot && <p>SĐT: <span className="text-foreground">{form.counterparty_phone_snapshot}</span></p>}{form.counterparty_identity_no_snapshot && <p>CMND/CCCD: <span className="text-foreground">{form.counterparty_identity_no_snapshot}</span></p>}</div>}
    </DrawerSection>
  );
}

function ExternalCounterpartyFields(props: any) {
  const { t, form, setField, viewOnly, partnerOpts, handlePartnerChange, partnerBankOpts, partnerBankLoading } = props;
  return <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3"><div className="col-span-2 max-[560px]:col-span-1"><DrawerField label={t("voucher.drawer.partner")} required><Combobox disabled={viewOnly} options={partnerOpts} value={form.counterparty_id} onChange={handlePartnerChange} placeholder={t("voucher.drawer.partnerPlaceholder")} /></DrawerField></div><DrawerField label={t("voucher.drawer.partnerBank")}><Combobox options={partnerBankOpts} value={form.beneficiary_bank_account_id} onChange={(v) => setField("beneficiary_bank_account_id", v)} placeholder={partnerBankLoading ? t("voucher.drawer.partnerBankLoading") : form.counterparty_id ? t("voucher.drawer.partnerBankPlaceholder") : t("voucher.drawer.partnerBankNoPartner")} disabled={viewOnly || !form.counterparty_id || partnerBankLoading} /></DrawerField><DrawerField label={t("voucher.drawer.taxCode")}><input type="text" disabled className={inputCls} value={form.counterparty_tax_code_snapshot} readOnly /></DrawerField><DrawerField label={t("voucher.drawer.role")}><Combobox disabled options={COUNTERPARTY_ROLE_OPTS} value={form.counterparty_role} onChange={(v) => setField("counterparty_role", v)} placeholder={t("voucher.drawer.rolePlaceholder")} /></DrawerField><div className="col-span-2 max-[560px]:col-span-1"><DrawerField label={t("voucher.drawer.address")}><input type="text" disabled className={inputCls} value={form.counterparty_address_snapshot} readOnly /></DrawerField></div></div>;
}

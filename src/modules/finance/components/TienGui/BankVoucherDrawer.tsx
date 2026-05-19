import { useState, useEffect } from "react";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  DEFAULT_STACK_OFFSET,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { PartnerDrawer } from "@/modules/partners/components/PartnerDrawer";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import {
  ATTACHMENT_TYPE_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
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
import type {
  AttachmentType,
  CounterpartySource,
} from "@/modules/finance/api/financeApi";
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";
import { CashBankTagPresetCards } from "@/modules/finance/components/CashBankTagPresetCards";
import { RelatedDocumentsEditor } from "@/modules/finance/components/RelatedDocumentsEditor";

export function BankVoucherDrawer(props: any) {
  const {
    t,
    drawerOpen,
    closeDrawer,
    drawerEditMode,
    isDirty,
    viewOnly,
    editing,
    form,
    editToggle,
    drawerActions,
    setField,
    handleDocumentDateChange,
    handlePostingDateChange,
    companyBankOpts,
    handleCompanyBankChange,
    employeeOpts,
    handleEmployeeChange,
    partnerOpts,
    handlePartnerChange,
    partnerBankOpts,
    partnerBankLoading,
    tagPresets,
    handleTagPresetSelect,
    handleAmountChange,
    existingAttachments,
    handleDeleteAttachment,
    attachmentType,
    setAttachmentType,
    attachmentNote,
    setAttachmentNote,
    attachmentFiles,
    setAttachmentFiles,
    saveError,
  } = props;
  const reloadPartners = props.reloadPartners as
    | (() => Promise<any[]>)
    | undefined;
  const showToast = props.showToast || (() => {});
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [isPartnerEditing, setIsPartnerEditing] = useState(false);

  const [partnerForm, setPartnerForm] = useState<any>({ ...emptyPartnerForm });
  const [contactRows, setContactRows] = useState<any[]>([]);
  const [bankRows, setBankRows] = useState<any[]>([]);

  // Sync partner banking rows to main form beneficiary when partner bank changes
  useEffect(() => {
    if (isPartnerOpen && isPartnerEditing && bankRows.length > 0) {
      // If we are editing partner and have banks, don't auto-override unless user saves.
      // The handlePartnerSave already calls handlePartnerChange which updates the main form.
    }
  }, [bankRows, isPartnerOpen, isPartnerEditing]);

  const handleEditPartner = async () => {
    if (!form.counterparty_id) return;
    const partnerItem = partnerOpts.find(
      (p: any) => p.value === form.counterparty_id,
    );
    if (!partnerItem) return;

    // Use the original business partner object if available in option
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
      // Reload partners list first so the new/updated partner is in the options,
      // then select it in the main form.
      if (reloadPartners) await reloadPartners();
      handlePartnerChange(partnerId);
      showToast({ title: "Đã lưu đối tác", variant: "success" });
    } catch (error) {
      console.error(error);
    }
  }

  const relatedDocumentsEditable =
    !!editing && ["APPROVED", "POSTED"].includes(editing.status);
  const relatedDocumentsReadOnly = viewOnly && !relatedDocumentsEditable;
  return (
    <>
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={drawerEditMode && isDirty && !viewOnly}
        title={
          editing
            ? (form.voucher_type === "BANK_RECEIPT"
                ? t("voucher.drawer.titleEditUNT")
                : t("voucher.drawer.titleEditUNC")
              ).replace("{0}", form.voucher_no)
            : form.voucher_type === "BANK_RECEIPT"
              ? t("voucher.drawer.titleCreateUNT")
              : t("voucher.drawer.titleCreateUNC")
        }
        subtitle={
          editing ? editing.voucher_no : t("voucher.drawer.subtitleEdit")
        }
        headerExtra={editToggle}
        panelClassName="w-[calc(100vw/3)] max-[1200px]:w-1/2 max-[980px]:w-[calc(100vw-24px)] max-[500px]:w-screen"
        bodyClassName="p-4"
        actions={drawerActions}
      >
        <DrawerSection title={t("voucher.drawer.sectionOrder")}>
          <div className="grid grid-cols-1 gap-y-1">
            <div className="grid grid-cols-2 gap-x-3">
              <DrawerField label={t("voucher.drawer.voucherNo")} required>
                <input
                  type="text"
                  disabled={viewOnly}
                  className={inputCls}
                  value={form.voucher_no}
                  onChange={(e) => setField("voucher_no", e.target.value)}
                  placeholder={t("voucher.drawer.voucherNoPlaceholder")}
                />
              </DrawerField>
              <DrawerField label={t("voucher.drawer.bankAccount")} required>
                <Combobox
                  disabled={viewOnly}
                  options={companyBankOpts}
                  value={form.company_bank_account_id}
                  onChange={handleCompanyBankChange}
                  placeholder={t("voucher.drawer.bankAccountPlaceholder")}
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-1 gap-x-3">
              <DrawerField label={t("voucher.drawer.docDate")} required>
                <DatePicker
                  disabled={viewOnly}
                  value={form.document_date}
                  onChange={handleDocumentDateChange}
                  className="w-full min-w-0"
                />
              </DrawerField>
            </div>
          </div>
        </DrawerSection>
        <CounterpartySection
          {...props}
          handleCreatePartner={handleCreatePartner}
          handleEditPartner={handleEditPartner}
        />
        <DrawerSection title={t("voucher.drawer.sectionAccounting")}>
          <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
            <DrawerField label={t("voucher.drawer.amount")} required>
              <input
                type="text"
                inputMode="numeric"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={t("voucher.drawer.amountPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.amountWords")}>
              <input
                type="text"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount_in_words}
                onChange={(e) => setField("amount_in_words", e.target.value)}
                placeholder={t("voucher.drawer.amountWordsPlaceholder")}
              />
            </DrawerField>
          </div>
          <DrawerField label={t("voucher.drawer.desc")}>
            <textarea
              disabled={viewOnly}
              className={inputCls}
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("voucher.drawer.descPlaceholder")}
            />
          </DrawerField>
          {editing && (
            <DrawerField label="Lý do hủy" required>
              <input
                type="text"
                className={inputCls}
                value={form.cancel_reason || ""}
                onChange={(e) => setField("cancel_reason", e.target.value)}
                placeholder="Nhập lý do hủy phiếu..."
                disabled={editing.status === "CANCELLED"}
              />
            </DrawerField>
          )}
        </DrawerSection>
        <DrawerSection title={t("voucher.drawer.sectionAttachment")}>
          {existingAttachments.length > 0 && (
            <div className="mb-3 rounded-lg border border-border overflow-hidden">
              {existingAttachments.map((a: any) => (
                <AttachmentRow
                  key={a.id}
                  item={a}
                  onDelete={viewOnly ? undefined : handleDeleteAttachment}
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
                      setAttachmentType((v as AttachmentType) || "OTHER")
                    }
                    placeholder={t("voucher.drawer.attachmentTypePlaceholder")}
                  />
                </DrawerField>
                <DrawerField label={t("voucher.drawer.attachmentNote")}>
                  <input
                    type="text"
                    className={inputCls}
                    value={attachmentNote}
                    onChange={(e) => setAttachmentNote(e.target.value)}
                    placeholder={t("voucher.drawer.attachmentNotePlaceholder")}
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("voucher.drawer.newFile")}>
                <FileUploadBox
                  multiple
                  files={attachmentFiles}
                  onFilesChange={setAttachmentFiles}
                  maxSizeMb={10}
                />
              </DrawerField>
            </>
          )}
        </DrawerSection>
        <DrawerSection title="Chứng từ công nợ">
          <RelatedDocumentsEditor
            value={form.related_documents ?? []}
            disabled={relatedDocumentsReadOnly}
            counterpartyId={form.counterparty_id}
            maxSettlementAmount={Number(form.amount) || undefined}
            onChange={(value) => setField("related_documents", value)}
          />
        </DrawerSection>
        {editing && (
          <DrawerSection title="Lịch sử duyệt">
            <ApprovalHistory voucherId={editing.id} />
          </DrawerSection>
        )}
        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>

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
    </>
  );
}

function CounterpartySection(props: any) {
  const { handleCreatePartner, handleEditPartner } = props;
  const { t, form, setField, viewOnly, employeeOpts, handleEmployeeChange } =
    props;
  return (
    <DrawerSection title={t("voucher.drawer.sectionPartner")}>
      <DrawerField label="Loại đối tượng" required>
        <Combobox
          options={COUNTERPARTY_SOURCE_OPTS}
          value={form.counterparty_source}
          onChange={(v) =>
            setField(
              "counterparty_source",
              (v as CounterpartySource) || "EXTERNAL",
            )
          }
          disabled={viewOnly}
        />
      </DrawerField>
      {form.counterparty_source === "INTERNAL" ? (
        <DrawerField label="Nhân viên" required>
          <Combobox
            options={employeeOpts}
            value={form.employee_id}
            onChange={handleEmployeeChange}
            placeholder="Chọn nhân viên..."
            disabled={viewOnly}
          />
        </DrawerField>
      ) : (
        <ExternalCounterpartyFields
          {...props}
          handleCreatePartner={handleCreatePartner}
          handleEditPartner={handleEditPartner}
        />
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
  );
}

function ExternalCounterpartyFields(props: any) {
  const { handleCreatePartner, handleEditPartner } = props;
  const {
    t,
    form,
    setField,
    viewOnly,
    partnerOpts,
    handlePartnerChange,
    partnerBankOpts,
    partnerBankLoading,
  } = props;
  return (
    <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3 gap-y-1">
      <DrawerField
        label={t("voucher.drawer.partner")}
        required
        labelExtra={
          <div className="flex gap-1 ml-1">
            <button
              type="button"
              onClick={handleCreatePartner}
              className="w-[22px] h-[22px] border border-border rounded-md text-xs font-bold hover:bg-surface-hover transition-colors flex items-center justify-center leading-none"
              title="Thêm đối tác"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleEditPartner}
              disabled={!form.counterparty_id}
              className="w-[22px] h-[22px] border border-border rounded-md text-xs font-medium hover:bg-surface-hover transition-colors flex items-center justify-center disabled:opacity-40"
              title="Sửa đối tác"
            >
              ✎
            </button>
          </div>
        }
      >
        <Combobox
          disabled={viewOnly}
          options={partnerOpts}
          value={form.counterparty_id}
          onChange={handlePartnerChange}
          placeholder={t("voucher.drawer.partnerPlaceholder")}
        />
      </DrawerField>
    </div>
  );
}

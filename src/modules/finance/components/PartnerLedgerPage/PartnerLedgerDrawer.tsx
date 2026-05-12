import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { DrawerModal, DrawerSection, DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";
import type {
  CreatePartnerLedgerItemDto,
  PartnerLedgerItem,
  PartnerLedgerSourceType,
} from "@/modules/finance/api/financeApi";
import { CURRENCY_OPTS, SOURCE_TYPE_OPTS } from "./constants";
import type { SelectOption, TFunc } from "./types";

interface PartnerLedgerDrawerProps {
  open: boolean;
  onClose: () => void;
  editingItem: PartnerLedgerItem | null;
  form: CreatePartnerLedgerItemDto;
  setField: <K extends keyof CreatePartnerLedgerItemDto>(key: K, value: CreatePartnerLedgerItemDto[K]) => void;
  partnerOpts: SelectOption[];
  accountOpts: SelectOption[];
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  t: TFunc;
}

export function PartnerLedgerDrawer({
  open,
  onClose,
  editingItem,
  form,
  setField,
  partnerOpts,
  accountOpts,
  saving,
  saveError,
  onSave,
  t,
}: PartnerLedgerDrawerProps) {
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={editingItem ? t("ledger.drawer.editTitle") : t("ledger.drawer.createTitle")}
      subtitle={t("ledger.drawer.subtitle")}
      actions={[{ label: saving ? t("ledger.drawer.saving") : t("ledger.drawer.save"), primary: true, loading: saving, onClick: onSave }]}
    >
      <DrawerSection title={t("ledger.drawer.sectionInfo")}>
        <DrawerField label={t("ledger.drawer.itemNo")}>
          <input className={inputCls} placeholder={t("ledger.drawer.itemNoPlaceholder")} value={form.item_no} onChange={(e) => setField("item_no", e.target.value)} />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.sourceType")}>
          <Combobox
            options={SOURCE_TYPE_OPTS}
            value={form.source_type ?? "MANUAL"}
            onChange={(v) => setField("source_type", v as PartnerLedgerSourceType)}
            className="w-full"
            allowClear={false}
          />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.partner")}>
          <Combobox options={partnerOpts} value={form.business_partner_id} onChange={(v) => setField("business_partner_id", v)} placeholder="— Chọn đối tác —" />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.account")}>
          <Combobox options={accountOpts} value={form.accounting_account_id} onChange={(v) => setField("accounting_account_id", v)} placeholder="— Chọn tài khoản —" />
        </DrawerField>
        <DateField label={t("ledger.drawer.docDate")} value={form.document_date} onChange={(v) => setField("document_date", v)} />
        <DateField label={t("ledger.drawer.postingDate")} value={form.posting_date} onChange={(v) => setField("posting_date", v)} />
        <DateField label={t("ledger.drawer.dueDate")} value={form.due_date ?? ""} onChange={(v) => setField("due_date", v)} />
        <DrawerField label={t("ledger.drawer.referenceNo")}>
          <input className={inputCls} placeholder={t("ledger.drawer.referenceNoPlaceholder")} value={form.reference_no ?? ""} onChange={(e) => setField("reference_no", e.target.value)} />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.description")}>
          <textarea className={cn(inputCls, "resize-none")} rows={2} placeholder={t("ledger.drawer.descriptionPlaceholder")} value={form.description} onChange={(e) => setField("description", e.target.value)} />
        </DrawerField>
      </DrawerSection>

      <DrawerSection title={t("ledger.drawer.sectionAmount")}>
        <DrawerField label={t("ledger.drawer.currency")}>
          <Combobox
            options={CURRENCY_OPTS}
            value={form.currency ?? "VND"}
            onChange={(v) => setField("currency", v)}
            className="w-full"
            allowClear={false}
          />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.amount")}>
          <input type="number" className={inputCls} min={0} step={1000} value={form.original_amount} onChange={(e) => setField("original_amount", parseFloat(e.target.value) || 0)} />
        </DrawerField>
        <DrawerField label={t("ledger.drawer.note")}>
          <textarea className={cn(inputCls, "resize-none")} rows={2} placeholder={t("ledger.drawer.notePlaceholder")} value={form.note ?? ""} onChange={(e) => setField("note", e.target.value)} />
        </DrawerField>
      </DrawerSection>

      {saveError && <div className="mx-4 mb-2 text-sm text-[#d92a2a] bg-[#fde8e8] rounded px-3 py-2">{saveError}</div>}
    </DrawerModal>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <DrawerField label={label}><DatePicker value={value} onChange={onChange} className="w-full" /></DrawerField>;
}

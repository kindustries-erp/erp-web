import { useState, useEffect, useRef } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import {
  getBusinessPartnersApi,
  getBusinessPartnersPagedApi,
  createBusinessPartnerApi,
  updateBusinessPartnerApi,
  deleteBusinessPartnerApi,
  getBusinessPartnerContactsPagedApi,
  createBusinessPartnerContactApi,
  updateBusinessPartnerContactApi,
  deleteBusinessPartnerContactApi,
  getBusinessPartnerBankAccountsPagedApi,
  createBusinessPartnerBankAccountApi,
  updateBusinessPartnerBankAccountApi,
  deleteBusinessPartnerBankAccountApi,
  getBusinessPartnerRolesPagedApi,
  createBusinessPartnerRoleApi,
  updateBusinessPartnerRoleApi,
  deleteBusinessPartnerRoleApi,
  type BusinessPartner,
  type CreateBusinessPartnerDto,
  type BusinessPartnerContact,
  type CreateBusinessPartnerContactDto,
  type BusinessPartnerBankAccount,
  type CreateBusinessPartnerBankAccountDto,
  type BusinessPartnerRole,
  type CreateBusinessPartnerRoleDto,
} from "@/modules/partners/api/partnerApi";

type ActiveTab = "partners" | "contacts" | "bankaccounts" | "roles";

const PARTNER_KIND_OPTS = [
  { value: "ORGANIZATION", label: "Tổ chức" },
  { value: "INDIVIDUAL", label: "Cá nhân" },
];

const CURRENCY_OPTS = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const PARTNER_ROLE_OPTS = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "VENDOR", label: "Nhà cung cấp" },
  { value: "SERVICE_PROVIDER", label: "Nhà cung cấp dịch vụ" },
];

// ── Tab header ────────────────────────────────────────────────────────────────

function TabHeader({
  active,
  onChange,
}: {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
}) {
  const t = useT();
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "partners", label: t("doitac.tabs.partners") },
    { key: "contacts", label: t("doitac.tabs.contacts") },
    { key: "bankaccounts", label: t("doitac.tabs.bankAccounts") },
    { key: "roles", label: t("doitac.tabs.roles") },
  ];
  return (
    <div className="flex gap-1 mb-5 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-[9px] text-xs font-medium cursor-pointer border-b-2 -mb-px transition-colors",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-[color:var(--muted-fg)] hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────

function PageHeader({ onAdd, title, desc }: { onAdd: () => void; title: string; desc: string }) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-[color:var(--muted-fg)] mt-[2px]">{desc}</div>
      </div>
      <button
        onClick={onAdd}
        className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
      >
        <IconPlus /> {t("common.addNew")}
      </button>
    </div>
  );
}

// ── Partners tab ──────────────────────────────────────────────────────────────

interface PartnerForm {
  code: string;
  name: string;
  display_name: string;
  partner_kind: string;
  tax_code: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  note: string;
  contact_id: string;
  contact_full_name: string;
  contact_position: string;
  contact_phone: string;
  contact_email: string;
  contact_is_default_receiver: boolean;
  contact_is_default_payer: boolean;
  contact_is_active: boolean;
  bank_id: string;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_currency: string;
  bank_is_default: boolean;
  bank_is_active: boolean;
  role_id: string;
  role_enabled: boolean;
  role: string;
  role_is_active: boolean;
}

const emptyPartnerForm: PartnerForm = {
  code: "",
  name: "",
  display_name: "",
  partner_kind: "ORGANIZATION",
  tax_code: "",
  phone: "",
  email: "",
  address: "",
  is_active: true,
  note: "",
  contact_id: "",
  contact_full_name: "",
  contact_position: "",
  contact_phone: "",
  contact_email: "",
  contact_is_default_receiver: true,
  contact_is_default_payer: false,
  contact_is_active: true,
  bank_id: "",
  bank_name: "",
  bank_branch: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_currency: "VND",
  bank_is_default: true,
  bank_is_active: true,
  role_id: "",
  role_enabled: true,
  role: "CUSTOMER",
  role_is_active: true,
};

function buildPartnerForm(p: BusinessPartner): PartnerForm {
  return {
    code: p.code,
    name: p.name,
    display_name: p.display_name ?? "",
    partner_kind: p.partner_kind,
    tax_code: p.tax_code ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    is_active: p.is_active,
    note: p.note ?? "",
    contact_id: "",
    contact_full_name: "",
    contact_position: "",
    contact_phone: "",
    contact_email: "",
    contact_is_default_receiver: true,
    contact_is_default_payer: false,
    contact_is_active: true,
    bank_id: "",
    bank_name: "",
    bank_branch: "",
    bank_account_number: "",
    bank_account_holder: "",
    bank_currency: "VND",
    bank_is_default: true,
    bank_is_active: true,
    role_id: "",
    role_enabled: true,
    role: "CUSTOMER",
    role_is_active: true,
  };
}

interface PartnerContactDraft {
  id: string;
  tempId: string;
  full_name: string;
  position: string;
  phone: string;
  email: string;
  is_default_receiver: boolean;
  is_default_payer: boolean;
  is_active: boolean;
}

interface PartnerBankDraft {
  id: string;
  tempId: string;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  account_holder: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
}

const newTempId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function emptyPartnerContactDraft(): PartnerContactDraft {
  return {
    id: "",
    tempId: newTempId(),
    full_name: "",
    position: "",
    phone: "",
    email: "",
    is_default_receiver: true,
    is_default_payer: false,
    is_active: true,
  };
}

function emptyPartnerBankDraft(): PartnerBankDraft {
  return {
    id: "",
    tempId: newTempId(),
    bank_name: "",
    bank_branch: "",
    account_number: "",
    account_holder: "",
    currency: "VND",
    is_default: true,
    is_active: true,
  };
}

function contactDraftFromApi(c: BusinessPartnerContact): PartnerContactDraft {
  return {
    id: c.id,
    tempId: c.id,
    full_name: c.full_name,
    position: c.position ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    is_default_receiver: c.is_default_receiver,
    is_default_payer: c.is_default_payer,
    is_active: c.is_active,
  };
}

function bankDraftFromApi(b: BusinessPartnerBankAccount): PartnerBankDraft {
  return {
    id: b.id,
    tempId: b.id,
    bank_name: b.bank_name,
    bank_branch: b.bank_branch ?? "",
    account_number: b.account_number,
    account_holder: b.account_holder,
    currency: b.currency ?? "VND",
    is_default: b.is_default,
    is_active: b.is_active,
  };
}

function contactHasData(row: PartnerContactDraft): boolean {
  return !!row.full_name.trim() || !!row.position.trim() || !!row.phone.trim() || !!row.email.trim();
}

function bankHasData(row: PartnerBankDraft): boolean {
  return !!row.bank_name.trim() || !!row.bank_branch.trim() || !!row.account_number.trim() || !!row.account_holder.trim();
}

function PartnersTab() {
  const [items, setItems] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartner | null>(null);
  const [form, setForm] = useState<PartnerForm>(emptyPartnerForm);
  const [contactRows, setContactRows] = useState<PartnerContactDraft[]>([emptyPartnerContactDraft()]);
  const [bankRows, setBankRows] = useState<PartnerBankDraft[]>([emptyPartnerBankDraft()]);
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);
  const [deletedBankIds, setDeletedBankIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    load(page, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  async function load(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnersPagedApi({ page: pg, pageSize: ps, search: q || undefined });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError("Không thể tải danh sách đối tác.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(v: string) {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    if (!v) { setSearch(""); setPage(1); return; }
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  }

  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyPartnerForm });
    setContactRows([emptyPartnerContactDraft()]);
    setBankRows([emptyPartnerBankDraft()]);
    setDeletedContactIds([]);
    setDeletedBankIds([]);
    setSaveError(null);
    setDrawerOpen(true);
  }
  async function openEdit(item: BusinessPartner) {
    setEditing(item);
    const baseForm = buildPartnerForm(item);
    setForm(baseForm);
    setContactRows([]);
    setBankRows([]);
    setDeletedContactIds([]);
    setDeletedBankIds([]);
    setSaveError(null);
    setDrawerOpen(true);
    try {
      const [contactRes, bankRes, roleRes] = await Promise.all([
        getBusinessPartnerContactsPagedApi({ page: 1, pageSize: 500 }),
        getBusinessPartnerBankAccountsPagedApi({ page: 1, pageSize: 500 }),
        getBusinessPartnerRolesPagedApi({ page: 1, pageSize: 500 }),
      ]);
      const partnerContacts = contactRes.items.filter((c) => c.business_partner_id === item.id);
      const partnerBanks = bankRes.items.filter((b) => b.business_partner_id === item.id);
      const partnerRoles = roleRes.items.filter((r) => r.business_partner_id === item.id);
      const contact =
        partnerContacts.find((c) => c.is_default_receiver || c.is_default_payer) ??
        partnerContacts[0];
      const bank = partnerBanks.find((b) => b.is_default) ?? partnerBanks[0];
      const role = partnerRoles.find((r) => r.is_active) ?? partnerRoles[0];
      setContactRows(partnerContacts.length ? partnerContacts.map(contactDraftFromApi) : [emptyPartnerContactDraft()]);
      setBankRows(partnerBanks.length ? partnerBanks.map(bankDraftFromApi) : [emptyPartnerBankDraft()]);
      setForm({
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
              bank_branch: bank.bank_branch ?? "",
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
      // Keep the partner drawer usable even if related records cannot be preloaded.
    }
  }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof PartnerForm>(k: K, v: PartnerForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setContactField = <K extends keyof PartnerContactDraft>(idx: number, k: K, v: PartnerContactDraft[K]) =>
    setContactRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)));
  const setBankField = <K extends keyof PartnerBankDraft>(idx: number, k: K, v: PartnerBankDraft[K]) =>
    setBankRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)));
  function addContactRow() { setContactRows((rows) => [...rows, emptyPartnerContactDraft()]); }
  function addBankRow() { setBankRows((rows) => [...rows, emptyPartnerBankDraft()]); }
  function removeContactRow(idx: number) {
    setContactRows((rows) => {
      const row = rows[idx];
      if (row?.id) setDeletedContactIds((ids) => [...ids, row.id]);
      const next = rows.filter((_, i) => i !== idx);
      return next.length ? next : [emptyPartnerContactDraft()];
    });
  }
  function removeBankRow(idx: number) {
    setBankRows((rows) => {
      const row = rows[idx];
      if (row?.id) setDeletedBankIds((ids) => [...ids, row.id]);
      const next = rows.filter((_, i) => i !== idx);
      return next.length ? next : [emptyPartnerBankDraft()];
    });
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setSaveError("Mã đối tác và tên đối tác là bắt buộc.");
      return;
    }
    const contactsToSave = contactRows.filter(contactHasData);
    const banksToSave = bankRows.filter(bankHasData);
    if (contactsToSave.some((row) => !row.full_name.trim())) {
      setSaveError("Tên liên hệ là bắt buộc khi nhập thông tin liên hệ.");
      return;
    }
    if (banksToSave.some((row) => !row.bank_name.trim() || !row.account_number.trim() || !row.account_holder.trim())) {
      setSaveError("Tên ngân hàng, số tài khoản và chủ tài khoản là bắt buộc khi nhập tài khoản ngân hàng.");
      return;
    }
    if (form.role_enabled && !form.role) {
      setSaveError("Vai trò đối tác là bắt buộc.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateBusinessPartnerDto = {
        code: form.code.trim(),
        name: form.name.trim(),
        partner_kind: form.partner_kind as "ORGANIZATION" | "INDIVIDUAL",
        display_name: form.display_name.trim() || undefined,
        tax_code: form.tax_code.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        is_active: form.is_active,
        note: form.note.trim() || undefined,
      };
      const savedPartner = editing
        ? await updateBusinessPartnerApi(editing.id, dto)
        : await createBusinessPartnerApi(dto);
      const partnerId = savedPartner.id;
      for (const id of deletedContactIds) {
        await deleteBusinessPartnerContactApi(id);
      }
      for (const id of deletedBankIds) {
        await deleteBusinessPartnerBankAccountApi(id);
      }
      for (const row of contactsToSave) {
        const contactDto: CreateBusinessPartnerContactDto = {
          business_partner_id: partnerId,
          full_name: row.full_name.trim(),
          position: row.position.trim() || undefined,
          phone: row.phone.trim() || undefined,
          email: row.email.trim() || undefined,
          is_default_receiver: row.is_default_receiver,
          is_default_payer: row.is_default_payer,
          is_active: row.is_active,
        };
        if (row.id) await updateBusinessPartnerContactApi(row.id, contactDto);
        else await createBusinessPartnerContactApi(contactDto);
      }
      for (const row of banksToSave) {
        const bankDto: CreateBusinessPartnerBankAccountDto = {
          business_partner_id: partnerId,
          bank_name: row.bank_name.trim(),
          bank_branch: row.bank_branch.trim() || undefined,
          account_number: row.account_number.trim(),
          account_holder: row.account_holder.trim(),
          currency: row.currency || "VND",
          is_default: row.is_default,
          is_active: row.is_active,
        };
        if (row.id) await updateBusinessPartnerBankAccountApi(row.id, bankDto);
        else await createBusinessPartnerBankAccountApi(bankDto);
      }
      if (form.role_enabled) {
        const roleDto: CreateBusinessPartnerRoleDto = {
          business_partner_id: partnerId,
          role: form.role,
          is_active: form.role_is_active,
        };
        if (form.role_id) await updateBusinessPartnerRoleApi(form.role_id, roleDto);
        else await createBusinessPartnerRoleApi(roleDto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else load(page, pageSize, search);
    } catch (e) {
      setSaveError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBusinessPartnerApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page, pageSize, search);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.code.trim() || !!form.name.trim();
  const kindLabel = (v: string) => PARTNER_KIND_OPTS.find((o) => o.value === v)?.label ?? v;

  return (
    <div>
      <PageHeader title={t("doitac.title")} desc={t("doitac.desc")} onAdd={openNew} />
      <div className="mb-3">
        <SearchInput placeholder="Tìm mã, tên hoặc MST..." value={searchInput} onChange={handleSearchInput} className="max-w-[280px]" />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              {[t("doitac.headers.code"), t("doitac.headers.name"), t("doitac.headers.kind"), t("doitac.headers.taxCode"), t("doitac.headers.phone"), t("doitac.headers.status"), ""].map((h, i) => (
                <th key={i} className={cn("text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]", i === 6 && "w-[80px]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {[14, 36, 20, 20, 24, 16, 0].map((w, j) => (
                  <td key={j} className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                    {w > 0 && <Skeleton className={`h-3 w-${w}`} />}
                  </td>
                ))}
              </tr>
            ))}
            {!loading && fetchError && (
              <tr><td colSpan={7} className="text-center text-xs text-[color:var(--warn-fg)] py-8">{fetchError}</td></tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr><td colSpan={7} className="text-center text-xs text-[color:var(--faint)] py-8">{t("common.noData")}</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-mono font-semibold text-[color:var(--muted-fg)]">{p.code}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">{p.name}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{kindLabel(p.partner_kind)}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-mono text-[color:var(--muted-fg)]">{p.tax_code || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{p.phone || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  <StatusBadge active={p.is_active} />
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  <RowActions onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget(p)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={handlePageSize} />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
        subtitle={editing ? editing.name : "Điền thông tin bên dưới"}
        panelClassName="partner-drawer-panel"
        bodyClassName="partner-drawer-body"
        actions={[
          { label: "Hủy", onClick: closeDrawer },
          { label: editing ? "Lưu thay đổi" : "Thêm mới", primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <div className="partner-drawer-grid">
        <div className="partner-card partner-card-main">
        <DrawerSection title="Thông tin đối tác">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3">
          <DrawerField label="Mã đối tác" required>
            <input type="text" className={inputCls} value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="VD: KH001" />
          </DrawerField>
          <DrawerField label="Tên đối tác" required>
            <input type="text" className={inputCls} value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Tên đầy đủ" />
          </DrawerField>
          <DrawerField label="Tên hiển thị">
            <input type="text" className={inputCls} value={form.display_name} onChange={(e) => setField("display_name", e.target.value)} placeholder="Tên ngắn gọn (tùy chọn)" />
          </DrawerField>
          <DrawerField label="Loại đối tác">
            <Combobox options={PARTNER_KIND_OPTS} value={form.partner_kind} onChange={(v) => setField("partner_kind", v || "ORGANIZATION")} allowClear={false} />
          </DrawerField>
          <DrawerField label="Mã số thuế">
            <input type="text" className={inputCls} value={form.tax_code} onChange={(e) => setField("tax_code", e.target.value)} placeholder="0123456789" />
          </DrawerField>
          <DrawerField label="Điện thoại">
            <input type="text" className={inputCls} value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="0912 345 678" />
          </DrawerField>
          <DrawerField label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="contact@example.com" />
          </DrawerField>
          <div className="md:col-span-2 xl:col-span-3">
          <DrawerField label="Địa chỉ">
            <input type="text" className={inputCls} value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Địa chỉ đầy đủ" />
          </DrawerField>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
          <DrawerField label="Ghi chú">
            <textarea className={inputCls} rows={2} value={form.note} onChange={(e) => setField("note", e.target.value)} />
          </DrawerField>
          </div>
          <DrawerField label="Trạng thái">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.is_active} onCheckedChange={(v) => setField("is_active", v === true)} />
              <span className="text-xs text-foreground">Đang hoạt động</span>
            </label>
          </DrawerField>
          </div>
        </DrawerSection>
        </div>

        <div className="partner-card partner-card-contact">
        <DrawerSection title={`Liên hệ (${contactRows.length})`}>
          <div className="partner-sublist">
            {contactRows.map((row, idx) => (
              <div key={row.tempId} className="partner-subitem">
                <div className="partner-subitem-head">
                  <span>Liên hệ {idx + 1}</span>
                  <button type="button" onClick={() => removeContactRow(idx)}>Xóa</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                  <DrawerField label="Họ và tên">
                    <input type="text" className={inputCls} value={row.full_name} onChange={(e) => setContactField(idx, "full_name", e.target.value)} placeholder="Tên người liên hệ" />
                  </DrawerField>
                  <DrawerField label="Chức vụ">
                    <input type="text" className={inputCls} value={row.position} onChange={(e) => setContactField(idx, "position", e.target.value)} placeholder="VD: Kế toán trưởng" />
                  </DrawerField>
                  <DrawerField label="Điện thoại">
                    <input type="text" className={inputCls} value={row.phone} onChange={(e) => setContactField(idx, "phone", e.target.value)} placeholder="0912 345 678" />
                  </DrawerField>
                  <DrawerField label="Email">
                    <input type="email" className={inputCls} value={row.email} onChange={(e) => setContactField(idx, "email", e.target.value)} placeholder="contact@example.com" />
                  </DrawerField>
                </div>
                <div className="partner-check-row">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={row.is_default_receiver} onCheckedChange={(v) => setContactField(idx, "is_default_receiver", v === true)} />
                    <span className="text-xs text-foreground">Người nhận mặc định</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={row.is_default_payer} onCheckedChange={(v) => setContactField(idx, "is_default_payer", v === true)} />
                    <span className="text-xs text-foreground">Người trả mặc định</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={row.is_active} onCheckedChange={(v) => setContactField(idx, "is_active", v === true)} />
                    <span className="text-xs text-foreground">Đang hoạt động</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="partner-add-line" onClick={addContactRow}>+ Thêm liên hệ</button>
        </DrawerSection>
        </div>

        <div className="partner-card partner-card-bank">
        <DrawerSection title={`Tài khoản ngân hàng (${bankRows.length})`}>
          <div className="partner-sublist">
            {bankRows.map((row, idx) => (
              <div key={row.tempId} className="partner-subitem">
                <div className="partner-subitem-head">
                  <span>Tài khoản {idx + 1}</span>
                  <button type="button" onClick={() => removeBankRow(idx)}>Xóa</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                  <DrawerField label="Tên ngân hàng">
                    <input type="text" className={inputCls} value={row.bank_name} onChange={(e) => setBankField(idx, "bank_name", e.target.value)} placeholder="VD: Vietcombank" />
                  </DrawerField>
                  <DrawerField label="Chi nhánh">
                    <input type="text" className={inputCls} value={row.bank_branch} onChange={(e) => setBankField(idx, "bank_branch", e.target.value)} placeholder="VD: Hà Nội" />
                  </DrawerField>
                  <DrawerField label="Số tài khoản">
                    <input type="text" className={inputCls} value={row.account_number} onChange={(e) => setBankField(idx, "account_number", e.target.value)} placeholder="0071001xxx" />
                  </DrawerField>
                  <DrawerField label="Chủ tài khoản">
                    <input type="text" className={inputCls} value={row.account_holder} onChange={(e) => setBankField(idx, "account_holder", e.target.value)} placeholder="Tên chủ tài khoản" />
                  </DrawerField>
                  <DrawerField label="Tiền tệ">
                    <Combobox options={CURRENCY_OPTS} value={row.currency} onChange={(v) => setBankField(idx, "currency", v || "VND")} allowClear={false} />
                  </DrawerField>
                </div>
                <div className="partner-check-row">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={row.is_default} onCheckedChange={(v) => setBankField(idx, "is_default", v === true)} />
                    <span className="text-xs text-foreground">Tài khoản mặc định</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={row.is_active} onCheckedChange={(v) => setBankField(idx, "is_active", v === true)} />
                    <span className="text-xs text-foreground">Đang hoạt động</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="partner-add-line" onClick={addBankRow}>+ Thêm tài khoản ngân hàng</button>
        </DrawerSection>
        </div>

        <div className="partner-card partner-card-role">
        <DrawerSection title="Vai trò đối tác">
          <div className="grid grid-cols-1 gap-x-3">
          <DrawerField label="Tạo / cập nhật vai trò">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.role_enabled} onCheckedChange={(v) => setField("role_enabled", v === true)} />
              <span className="text-xs text-foreground">Lưu vai trò cho đối tác này</span>
            </label>
          </DrawerField>
          <DrawerField label="Vai trò">
            <Combobox options={PARTNER_ROLE_OPTS} value={form.role} onChange={(v) => setField("role", v || "CUSTOMER")} allowClear={false} />
          </DrawerField>
          <DrawerField label="Trạng thái vai trò">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.role_is_active} onCheckedChange={(v) => setField("role_is_active", v === true)} />
              <span className="text-xs text-foreground">Đang hoạt động</span>
            </label>
          </DrawerField>
          </div>
        </DrawerSection>
        </div>
        </div>
        {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa đối tác?"
        message={`Bạn có chắc muốn xóa đối tác "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Contacts tab ──────────────────────────────────────────────────────────────

interface ContactForm {
  business_partner_id: string;
  full_name: string;
  position: string;
  phone: string;
  email: string;
  identity_no: string;
  address: string;
  is_default_receiver: boolean;
  is_default_payer: boolean;
  is_active: boolean;
  note: string;
}

const emptyContactForm: ContactForm = {
  business_partner_id: "",
  full_name: "",
  position: "",
  phone: "",
  email: "",
  identity_no: "",
  address: "",
  is_default_receiver: false,
  is_default_payer: false,
  is_active: true,
  note: "",
};

function buildContactForm(c: BusinessPartnerContact): ContactForm {
  return {
    business_partner_id: c.business_partner_id,
    full_name: c.full_name,
    position: c.position ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    identity_no: c.identity_no ?? "",
    address: c.address ?? "",
    is_default_receiver: c.is_default_receiver,
    is_default_payer: c.is_default_payer,
    is_active: c.is_active,
    note: c.note ?? "",
  };
}

function ContactsTab() {
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [items, setItems] = useState<BusinessPartnerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartnerContact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyContactForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartnerContact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getBusinessPartnersApi().then(setPartners).catch(() => {});
  }, []);

  useEffect(() => {
    load(page, pageSize, search, partnerFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, partnerFilter]);

  async function load(pg: number, ps: number, q: string, pid: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnerContactsPagedApi({ page: pid ? 1 : pg, pageSize: pid ? 500 : ps, search: q || undefined });
      const filtered = pid ? res.items.filter((item) => item.business_partner_id === pid) : res.items;
      setItems(filtered);
      setTotal(pid ? filtered.length : res.total);
      setTotalPages(pid ? Math.max(1, Math.ceil(filtered.length / ps)) : res.totalPages);
    } catch {
      setFetchError("Không thể tải danh sách liên hệ.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(v: string) {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    if (!v) { setSearch(""); setPage(1); return; }
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  }

  function handlePartnerFilter(v: string) { setPartnerFilter(v); setPage(1); }
  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyContactForm, business_partner_id: partnerFilter });
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: BusinessPartnerContact) {
    setEditing(item);
    setForm(buildContactForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.business_partner_id || !form.full_name.trim()) {
      setSaveError("Đối tác và tên liên hệ là bắt buộc.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateBusinessPartnerContactDto = {
        business_partner_id: form.business_partner_id,
        full_name: form.full_name.trim(),
        position: form.position.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        identity_no: form.identity_no.trim() || undefined,
        address: form.address.trim() || undefined,
        is_default_receiver: form.is_default_receiver,
        is_default_payer: form.is_default_payer,
        is_active: form.is_active,
        note: form.note.trim() || undefined,
      };
      if (editing) {
        await updateBusinessPartnerContactApi(editing.id, dto);
      } else {
        await createBusinessPartnerContactApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else load(page, pageSize, search, partnerFilter);
    } catch (e) {
      setSaveError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBusinessPartnerContactApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page, pageSize, search, partnerFilter);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.full_name.trim();
  const partnerName = (id: string) => partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }));

  return (
    <div>
      <PageHeader title={t("doitac.tabs.contacts")} desc="Danh sách liên hệ của đối tác." onAdd={openNew} />
      <div className="flex gap-2 mb-3 flex-wrap">
        <Combobox options={partnerOpts} value={partnerFilter} onChange={(v) => handlePartnerFilter(v)} placeholder="— Lọc theo đối tác —" className="w-[240px]" />
        <SearchInput placeholder="Tìm tên liên hệ..." value={searchInput} onChange={handleSearchInput} className="max-w-[220px]" />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              {[t("doitac.headers.code"), t("doitac.headers.contactName"), t("doitac.headers.position"), t("doitac.headers.phone"), t("doitac.headers.email"), t("doitac.headers.status"), ""].map((h, i) => (
                <th key={i} className={cn("text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]", i === 6 && "w-[80px]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (<td key={j} className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><Skeleton className="h-3 w-20" /></td>))}</tr>
            ))}
            {!loading && fetchError && <tr><td colSpan={7} className="text-center text-xs text-[color:var(--warn-fg)] py-8">{fetchError}</td></tr>}
            {!loading && !fetchError && items.length === 0 && <tr><td colSpan={7} className="text-center text-xs text-[color:var(--faint)] py-8">{t("common.noData")}</td></tr>}
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{partnerName(c.business_partner_id)}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">{c.full_name}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{c.position || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{c.phone || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{c.email || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><StatusBadge active={c.is_active} /></td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><RowActions onEdit={() => openEdit(c)} onDelete={() => setDeleteTarget(c)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={handlePageSize} />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? "Chỉnh sửa liên hệ" : "Thêm liên hệ mới"}
        subtitle={editing ? editing.full_name : "Điền thông tin bên dưới"}
        actions={[
          { label: "Hủy", onClick: closeDrawer },
          { label: editing ? "Lưu thay đổi" : "Thêm mới", primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <DrawerSection title="Thông tin liên hệ">
          <DrawerField label="Đối tác" required>
            <Combobox options={partnerOpts} value={form.business_partner_id} onChange={(v) => setField("business_partner_id", v)} placeholder="— Chọn đối tác —" />
          </DrawerField>
          <DrawerField label="Họ và tên" required>
            <input type="text" className={inputCls} value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
          </DrawerField>
          <DrawerField label="Chức vụ">
            <input type="text" className={inputCls} value={form.position} onChange={(e) => setField("position", e.target.value)} />
          </DrawerField>
          <DrawerField label="Điện thoại">
            <input type="text" className={inputCls} value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </DrawerField>
          <DrawerField label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </DrawerField>
          <DrawerField label="CMND/CCCD">
            <input type="text" className={inputCls} value={form.identity_no} onChange={(e) => setField("identity_no", e.target.value)} />
          </DrawerField>
          <DrawerField label="Địa chỉ">
            <input type="text" className={inputCls} value={form.address} onChange={(e) => setField("address", e.target.value)} />
          </DrawerField>
          <DrawerField label="Ghi chú">
            <textarea className={inputCls} rows={2} value={form.note} onChange={(e) => setField("note", e.target.value)} />
          </DrawerField>
          <DrawerField label="Cài đặt mặc định">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_default_receiver} onCheckedChange={(v) => setField("is_default_receiver", v === true)} />
                <span className="text-xs text-foreground">Người nhận mặc định</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_default_payer} onCheckedChange={(v) => setField("is_default_payer", v === true)} />
                <span className="text-xs text-foreground">Người trả mặc định</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_active} onCheckedChange={(v) => setField("is_active", v === true)} />
                <span className="text-xs text-foreground">Đang hoạt động</span>
              </label>
            </div>
          </DrawerField>
        </DrawerSection>
        {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa liên hệ?"
        message={`Bạn có chắc muốn xóa liên hệ "${deleteTarget?.full_name}"?`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Partner Bank Accounts tab ─────────────────────────────────────────────────

interface PartnerBankForm {
  business_partner_id: string;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  account_holder: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  note: string;
}

const emptyBankForm: PartnerBankForm = {
  business_partner_id: "",
  bank_name: "",
  bank_branch: "",
  account_number: "",
  account_holder: "",
  currency: "VND",
  is_default: false,
  is_active: true,
  note: "",
};

function buildBankForm(b: BusinessPartnerBankAccount): PartnerBankForm {
  return {
    business_partner_id: b.business_partner_id,
    bank_name: b.bank_name,
    bank_branch: b.bank_branch ?? "",
    account_number: b.account_number,
    account_holder: b.account_holder,
    currency: b.currency ?? "VND",
    is_default: b.is_default,
    is_active: b.is_active,
    note: b.note ?? "",
  };
}

function PartnerBankTab() {
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [items, setItems] = useState<BusinessPartnerBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartnerBankAccount | null>(null);
  const [form, setForm] = useState<PartnerBankForm>(emptyBankForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartnerBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getBusinessPartnersApi().then(setPartners).catch(() => {});
  }, []);

  useEffect(() => {
    load(page, pageSize, partnerFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, partnerFilter]);

  async function load(pg: number, ps: number, pid: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnerBankAccountsPagedApi({ page: pid ? 1 : pg, pageSize: pid ? 500 : ps });
      const filtered = pid ? res.items.filter((item) => item.business_partner_id === pid) : res.items;
      setItems(filtered);
      setTotal(pid ? filtered.length : res.total);
      setTotalPages(pid ? Math.max(1, Math.ceil(filtered.length / ps)) : res.totalPages);
    } catch {
      setFetchError("Không thể tải danh sách tài khoản ngân hàng.");
    } finally {
      setLoading(false);
    }
  }

  function handlePartnerFilter(v: string) { setPartnerFilter(v); setPage(1); }
  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyBankForm, business_partner_id: partnerFilter });
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: BusinessPartnerBankAccount) {
    setEditing(item);
    setForm(buildBankForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof PartnerBankForm>(k: K, v: PartnerBankForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.business_partner_id || !form.bank_name.trim() || !form.account_number.trim() || !form.account_holder.trim()) {
      setSaveError("Đối tác, tên ngân hàng, số tài khoản và chủ tài khoản là bắt buộc.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateBusinessPartnerBankAccountDto = {
        business_partner_id: form.business_partner_id,
        bank_name: form.bank_name.trim(),
        bank_branch: form.bank_branch.trim() || undefined,
        account_number: form.account_number.trim(),
        account_holder: form.account_holder.trim(),
        currency: form.currency || "VND",
        is_default: form.is_default,
        is_active: form.is_active,
        note: form.note.trim() || undefined,
      };
      if (editing) {
        await updateBusinessPartnerBankAccountApi(editing.id, dto);
      } else {
        await createBusinessPartnerBankAccountApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else load(page, pageSize, partnerFilter);
    } catch (e) {
      setSaveError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBusinessPartnerBankAccountApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page, pageSize, partnerFilter);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.bank_name.trim() || !!form.account_number.trim();
  const partnerName = (id: string) => partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }));

  return (
    <div>
      <PageHeader title={t("doitac.tabs.bankAccounts")} desc="Tài khoản ngân hàng của đối tác." onAdd={openNew} />
      <div className="mb-3">
        <Combobox options={partnerOpts} value={partnerFilter} onChange={(v) => handlePartnerFilter(v)} placeholder="— Lọc theo đối tác —" className="w-[240px]" />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              {["Đối tác", t("doitac.headers.bankName"), t("doitac.headers.accountNumber"), t("doitac.headers.accountHolder"), t("doitac.headers.bankBranch"), t("doitac.headers.currency"), t("doitac.headers.isDefault"), ""].map((h, i) => (
                <th key={i} className={cn("text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]", i === 7 && "w-[80px]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (<td key={j} className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><Skeleton className="h-3 w-20" /></td>))}</tr>
            ))}
            {!loading && fetchError && <tr><td colSpan={8} className="text-center text-xs text-[color:var(--warn-fg)] py-8">{fetchError}</td></tr>}
            {!loading && !fetchError && items.length === 0 && <tr><td colSpan={8} className="text-center text-xs text-[color:var(--faint)] py-8">{t("common.noData")}</td></tr>}
            {items.map((b) => (
              <tr key={b.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{partnerName(b.business_partner_id)}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">{b.bank_name}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-mono">{b.account_number}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">{b.account_holder}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{b.bank_branch || "—"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{b.currency ?? "VND"}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-center">
                  {b.is_default ? <span className="text-[color:var(--approve-fg)] font-bold">✓</span> : <span className="text-[color:var(--faint)]">—</span>}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><RowActions onEdit={() => openEdit(b)} onDelete={() => setDeleteTarget(b)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={handlePageSize} />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản ngân hàng"}
        subtitle={editing ? `${editing.bank_name} — ${editing.account_number}` : "Điền thông tin bên dưới"}
        actions={[
          { label: "Hủy", onClick: closeDrawer },
          { label: editing ? "Lưu thay đổi" : "Thêm mới", primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <DrawerSection title="Thông tin tài khoản">
          <DrawerField label="Đối tác" required>
            <Combobox options={partnerOpts} value={form.business_partner_id} onChange={(v) => setField("business_partner_id", v)} placeholder="— Chọn đối tác —" />
          </DrawerField>
          <DrawerField label="Tên ngân hàng" required>
            <input type="text" className={inputCls} value={form.bank_name} onChange={(e) => setField("bank_name", e.target.value)} placeholder="VD: Vietcombank" />
          </DrawerField>
          <DrawerField label="Chi nhánh">
            <input type="text" className={inputCls} value={form.bank_branch} onChange={(e) => setField("bank_branch", e.target.value)} placeholder="VD: Hà Nội" />
          </DrawerField>
          <DrawerField label="Số tài khoản" required>
            <input type="text" className={inputCls} value={form.account_number} onChange={(e) => setField("account_number", e.target.value)} placeholder="0071001xxx" />
          </DrawerField>
          <DrawerField label="Chủ tài khoản" required>
            <input type="text" className={inputCls} value={form.account_holder} onChange={(e) => setField("account_holder", e.target.value)} />
          </DrawerField>
          <DrawerField label="Tiền tệ">
            <Combobox options={CURRENCY_OPTS} value={form.currency} onChange={(v) => setField("currency", v || "VND")} allowClear={false} />
          </DrawerField>
          <DrawerField label="Ghi chú">
            <textarea className={inputCls} rows={2} value={form.note} onChange={(e) => setField("note", e.target.value)} />
          </DrawerField>
          <DrawerField label="Cài đặt">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_default} onCheckedChange={(v) => setField("is_default", v === true)} />
                <span className="text-xs text-foreground">Tài khoản mặc định</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.is_active} onCheckedChange={(v) => setField("is_active", v === true)} />
                <span className="text-xs text-foreground">Đang hoạt động</span>
              </label>
            </div>
          </DrawerField>
        </DrawerSection>
        {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa tài khoản ngân hàng?"
        message={`Bạn có chắc muốn xóa tài khoản "${deleteTarget?.bank_name} — ${deleteTarget?.account_number}"?`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Partner Roles tab ─────────────────────────────────────────────────────────

interface PartnerRoleForm {
  business_partner_id: string;
  role: string;
  is_active: boolean;
}

const emptyRoleForm: PartnerRoleForm = {
  business_partner_id: "",
  role: "CUSTOMER",
  is_active: true,
};

function buildRoleForm(r: BusinessPartnerRole): PartnerRoleForm {
  return {
    business_partner_id: r.business_partner_id,
    role: r.role,
    is_active: r.is_active,
  };
}

function PartnerRolesTab() {
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [items, setItems] = useState<BusinessPartnerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartnerRole | null>(null);
  const [form, setForm] = useState<PartnerRoleForm>(emptyRoleForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartnerRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getBusinessPartnersApi().then(setPartners).catch(() => {});
  }, []);

  useEffect(() => {
    load(page, pageSize, partnerFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, partnerFilter]);

  async function load(pg: number, ps: number, pid: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnerRolesPagedApi({ page: pid ? 1 : pg, pageSize: pid ? 500 : ps });
      const filtered = pid ? res.items.filter((item) => item.business_partner_id === pid) : res.items;
      setItems(filtered);
      setTotal(pid ? filtered.length : res.total);
      setTotalPages(pid ? Math.max(1, Math.ceil(filtered.length / ps)) : res.totalPages);
    } catch {
      setFetchError(t("doitac.roles.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePartnerFilter(v: string) { setPartnerFilter(v); setPage(1); }
  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyRoleForm, business_partner_id: partnerFilter });
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: BusinessPartnerRole) {
    setEditing(item);
    setForm(buildRoleForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof PartnerRoleForm>(k: K, v: PartnerRoleForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.business_partner_id || !form.role) {
      setSaveError(t("doitac.roles.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateBusinessPartnerRoleDto = {
        business_partner_id: form.business_partner_id,
        role: form.role,
        is_active: form.is_active,
      };
      if (editing) {
        await updateBusinessPartnerRoleApi(editing.id, dto);
      } else {
        await createBusinessPartnerRoleApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else load(page, pageSize, partnerFilter);
    } catch (e) {
      setSaveError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBusinessPartnerRoleApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page, pageSize, partnerFilter);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.business_partner_id || form.role !== "CUSTOMER" || !form.is_active;
  const partnerName = (id: string) => partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }));
  const roleLabel = (role: string) => PARTNER_ROLE_OPTS.find((o) => o.value === role)?.label ?? role;

  return (
    <div>
      <PageHeader title={t("doitac.roles.title")} desc={t("doitac.roles.desc")} onAdd={openNew} />
      <div className="mb-3">
        <Combobox options={partnerOpts} value={partnerFilter} onChange={(v) => handlePartnerFilter(v)} placeholder={t("doitac.roles.partnerFilterPlaceholder")} className="w-[240px]" />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 620 }}>
          <thead>
            <tr>
              {[t("doitac.headers.partner"), t("doitac.headers.role"), t("doitac.headers.status"), ""].map((h, i) => (
                <th key={i} className={cn("text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]", i === 3 && "w-[80px]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (<td key={j} className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><Skeleton className="h-3 w-24" /></td>))}</tr>
            ))}
            {!loading && fetchError && <tr><td colSpan={4} className="text-center text-xs text-[color:var(--warn-fg)] py-8">{fetchError}</td></tr>}
            {!loading && !fetchError && items.length === 0 && <tr><td colSpan={4} className="text-center text-xs text-[color:var(--faint)] py-8">{t("common.noData")}</td></tr>}
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">{partnerName(r.business_partner_id)}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">{roleLabel(r.role)}</td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><StatusBadge active={r.is_active} /></td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]"><RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={handlePageSize} />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? t("doitac.roles.editTitle") : t("doitac.roles.createTitle")}
        subtitle={editing ? roleLabel(editing.role) : t("doitac.roles.subtitle")}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          { label: editing ? t("common.saveChanges") : t("common.addNew"), primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <DrawerSection title={t("doitac.roles.sectionInfo")}>
          <DrawerField label={t("doitac.headers.partner")} required>
            <Combobox options={partnerOpts} value={form.business_partner_id} onChange={(v) => setField("business_partner_id", v)} placeholder={t("doitac.roles.partnerPlaceholder")} />
          </DrawerField>
          <DrawerField label={t("doitac.headers.role")} required>
            <Combobox options={PARTNER_ROLE_OPTS} value={form.role} onChange={(v) => setField("role", v || "CUSTOMER")} allowClear={false} />
          </DrawerField>
          <DrawerField label={t("doitac.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.is_active} onCheckedChange={(v) => setField("is_active", v === true)} />
              <span className="text-xs text-foreground">{t("status.active")}</span>
            </label>
          </DrawerField>
        </DrawerSection>
        {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("doitac.roles.deleteTitle")}
        message={t("doitac.roles.deleteMessage").replace("{0}", roleLabel(deleteTarget?.role ?? "")).replace("{1}", deleteTarget ? partnerName(deleteTarget.business_partner_id) : "")}
        confirmLabel={t("common.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function DoiTac() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("partners");
  return (
    <div>
      <TabHeader active={activeTab} onChange={setActiveTab} />
      {activeTab === "partners" && <PartnersTab />}
      {activeTab === "contacts" && <ContactsTab />}
      {activeTab === "bankaccounts" && <PartnerBankTab />}
      {activeTab === "roles" && <PartnerRolesTab />}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  const t = useT();
  return (
    <span className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${active ? "bg-approve-bg text-approve-fg" : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"}`}>
      {active ? t("status.active") : t("status.inactive")}
    </span>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-[5px] justify-end">
      <button title="Chỉnh sửa" onClick={onEdit} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"><IconEdit /></button>
      <button title="Xóa" onClick={onDelete} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"><IconTrash /></button>
    </div>
  );
}

function IconPlus() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}

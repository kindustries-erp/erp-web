import { useState, useEffect, useRef } from "react";
import { useT } from "@/core/i18n";
import { extractApiError } from "@/shared/utils/apiError";
import {
  getBusinessPartnersPagedApi,
  getBusinessPartnerContactsPagedApi,
  getBusinessPartnerBankAccountsPagedApi,
  getBusinessPartnerRolesPagedApi,
  createBusinessPartnerApi,
  updateBusinessPartnerApi,
  deleteBusinessPartnerApi,
  createBusinessPartnerContactApi,
  updateBusinessPartnerContactApi,
  deleteBusinessPartnerContactApi,
  createBusinessPartnerBankAccountApi,
  updateBusinessPartnerBankAccountApi,
  deleteBusinessPartnerBankAccountApi,
  createBusinessPartnerRoleApi,
  updateBusinessPartnerRoleApi,
  type BusinessPartner,
  type CreateBusinessPartnerDto,
  type BusinessPartnerContact,
  type CreateBusinessPartnerContactDto,
  type BusinessPartnerBankAccount,
  type CreateBusinessPartnerBankAccountDto,
  type CreateBusinessPartnerRoleDto,
} from "@/modules/partners/api/partnerApi";
import {
  type PartnerForm,
  emptyPartnerForm,
  buildPartnerForm,
} from "@/modules/partners/types";
import { PARTNER_KIND_OPTS } from "@/modules/partners/constants";
import { PartnersTabView } from "./PartnersTabView";

// ── Inline draft types ────────────────────────────────────────────────────────

interface ContactDraft {
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

interface BankDraft {
  id: string;
  tempId: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
}

const newTempId = () =>
  `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function emptyContactDraft(): ContactDraft {
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

function emptyBankDraft(): BankDraft {
  return {
    id: "",
    tempId: newTempId(),
    bank_name: "",
    account_number: "",
    account_holder: "",
    currency: "VND",
    is_default: true,
    is_active: true,
  };
}

function contactDraftFromApi(c: BusinessPartnerContact): ContactDraft {
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

function bankDraftFromApi(b: BusinessPartnerBankAccount): BankDraft {
  return {
    id: b.id,
    tempId: b.id,
    bank_name: b.bank_name,
    account_number: b.account_number,
    account_holder: b.account_holder,
    currency: b.currency ?? "VND",
    is_default: b.is_default,
    is_active: b.is_active,
  };
}

const contactHasData = (r: ContactDraft) =>
  !!r.full_name.trim() || !!r.phone.trim() || !!r.email.trim();
const bankHasData = (r: BankDraft) =>
  !!r.bank_name.trim() ||
  !!r.account_number.trim() ||
  !!r.account_holder.trim();

// ── Component ─────────────────────────────────────────────────────────────────

export function PartnersTab() {
  const [items, setItems] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartner | null>(null);
  const [form, setForm] = useState<PartnerForm>(emptyPartnerForm);
  const [contactRows, setContactRows] = useState<ContactDraft[]>([
    emptyContactDraft(),
  ]);
  const [bankRows, setBankRows] = useState<BankDraft[]>([emptyBankDraft()]);
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);
  const [deletedBankIds, setDeletedBankIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartner | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    load(page, pageSize, search);
  }, [page, pageSize, search]);

  async function load(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnersPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
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
    if (!v) {
      setSearch("");
      setPage(1);
      return;
    }
    searchTimer.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  }

  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyPartnerForm });
    setContactRows([emptyContactDraft()]);
    setBankRows([emptyBankDraft()]);
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
      const partnerContacts = contactRes.items.filter(
        (c) => c.business_partner_id === item.id,
      );
      const partnerBanks = bankRes.items.filter(
        (b) => b.business_partner_id === item.id,
      );
      const partnerRoles = roleRes.items.filter(
        (r) => r.business_partner_id === item.id,
      );
      const contact =
        partnerContacts.find(
          (c) => c.is_default_receiver || c.is_default_payer,
        ) ?? partnerContacts[0];
      const bank = partnerBanks.find((b) => b.is_default) ?? partnerBanks[0];
      const role = partnerRoles.find((r) => r.is_active) ?? partnerRoles[0];
      setContactRows(
        partnerContacts.length
          ? partnerContacts.map(contactDraftFromApi)
          : [emptyContactDraft()],
      );
      setBankRows(
        partnerBanks.length
          ? partnerBanks.map(bankDraftFromApi)
          : [emptyBankDraft()],
      );
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
      // Keep drawer usable even if related records fail to preload
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof PartnerForm>(k: K, v: PartnerForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setContactField = <K extends keyof ContactDraft>(
    idx: number,
    k: K,
    v: ContactDraft[K],
  ) =>
    setContactRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)),
    );
  const setBankField = <K extends keyof BankDraft>(
    idx: number,
    k: K,
    v: BankDraft[K],
  ) =>
    setBankRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [k]: v } : row)),
    );

  function removeContactRow(idx: number) {
    setContactRows((rows) => {
      const row = rows[idx];
      if (row?.id) setDeletedContactIds((ids) => [...ids, row.id]);
      const next = rows.filter((_, i) => i !== idx);
      return next.length ? next : [emptyContactDraft()];
    });
  }

  function removeBankRow(idx: number) {
    setBankRows((rows) => {
      const row = rows[idx];
      if (row?.id) setDeletedBankIds((ids) => [...ids, row.id]);
      const next = rows.filter((_, i) => i !== idx);
      return next.length ? next : [emptyBankDraft()];
    });
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setSaveError("Mã đối tác và tên đối tác là bắt buộc.");
      return;
    }
    const contactsToSave = contactRows.filter(contactHasData);
    const banksToSave = bankRows.filter(bankHasData);
    if (contactsToSave.some((r) => !r.full_name.trim())) {
      setSaveError("Tên liên hệ là bắt buộc khi nhập thông tin liên hệ.");
      return;
    }
    if (
      banksToSave.some(
        (r) =>
          !r.bank_name.trim() ||
          !r.account_number.trim() ||
          !r.account_holder.trim(),
      )
    ) {
      setSaveError("Tên ngân hàng, số tài khoản và chủ tài khoản là bắt buộc.");
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

      for (const id of deletedContactIds)
        await deleteBusinessPartnerContactApi(id);
      for (const id of deletedBankIds)
        await deleteBusinessPartnerBankAccountApi(id);

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
        if (form.role_id)
          await updateBusinessPartnerRoleApi(form.role_id, roleDto);
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

  function addContactRow() {
    setContactRows((r) => [...r, emptyContactDraft()]);
  }
  function addBankRow() {
    setBankRows((r) => [...r, emptyBankDraft()]);
  }

  const isDirty = !!form.code.trim() || !!form.name.trim();
  const kindLabel = (v: string) =>
    PARTNER_KIND_OPTS.find((o) => o.value === v)?.label ?? v;

  return (
    <PartnersTabView
      {...{
        t,
        openNew,
        searchInput,
        handleSearchInput,
        items,
        loading,
        fetchError,
        kindLabel,
        openEdit,
        setDeleteTarget,
        page,
        pageSize,
        total,
        totalPages,
        setPage,
        handlePageSize,
        drawerOpen,
        closeDrawer,
        isDirty,
        editing,
        saving,
        handleSave,
        form,
        setField,
        contactRows,
        setContactField,
        removeContactRow,
        addContactRow,
        bankRows,
        setBankField,
        removeBankRow,
        addBankRow,
        saveError,
        deleteTarget,
        deleting,
        handleDelete,
      }}
    />
  );
}

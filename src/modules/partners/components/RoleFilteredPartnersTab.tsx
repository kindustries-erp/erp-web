/**
 * RoleFilteredPartnersTab
 *
 * Reuses the full PartnersTab logic but pre-filters by a specific role
 * (CUSTOMER or VENDOR) via the API's `role` query param.
 *
 * Role assignment is NOT done here — it stays in the main Đối tác page
 * (PartnersTab + PartnerRolesTab). This view is read-list + basic create/update
 * for convenience, with the role auto-set on create.
 */

import { useState, useEffect, useRef } from "react";
import { useT } from "@/core/i18n";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  PARTNER_KIND_OPTS,
  CURRENCY_OPTS,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PARTNER_ROLE_OPTS,
} from "@/modules/partners/constants";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { PageHeader, StatusBadge } from "@/modules/partners/components/shared";
import { useUIStore } from "@/core/config/uiStore";

// ── Draft types (mirrors PartnersTab) ────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

export interface RoleFilteredPartnersTabProps {
  /** Role enum value to filter: "CUSTOMER" | "VENDOR" */
  role: string;
  /** Page title displayed */
  title: string;
  /** Page description */
  desc: string;
  /** Role label for UX (e.g. "Khách hàng" | "Nhà cung cấp") */
  roleLabel: string;
}

export function RoleFilteredPartnersTab({
  role,
  title,
  desc,
  roleLabel,
}: RoleFilteredPartnersTabProps) {
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
  const [form, setFormState] = useState<PartnerForm>(emptyPartnerForm);
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
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();

  useEffect(() => {
    load(page, pageSize, search);
  }, [page, pageSize, search, role]);

  async function load(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnersPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
        role,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError(`Không thể tải danh sách ${roleLabel}.`);
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
    setFormState({
      ...emptyPartnerForm,
      role,
      role_enabled: true,
    });
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
    setFormState(baseForm);
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
      const activeRole =
        partnerRoles.find((r) => r.role === role && r.is_active) ??
        partnerRoles.find((r) => r.is_active) ??
        partnerRoles[0];

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
      setFormState({
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
        ...(activeRole
          ? {
              role_id: activeRole.id,
              role_enabled: true,
              role: activeRole.role,
              role_is_active: activeRole.is_active,
            }
          : { role, role_enabled: true }),
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
    setFormState((f) => ({ ...f, [k]: v }));

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

      // Ensure this partner has the correct role set
      const roleDto: CreateBusinessPartnerRoleDto = {
        business_partner_id: partnerId,
        role: form.role || role,
        is_active: form.role_is_active ?? true,
      };
      if (form.role_id)
        await updateBusinessPartnerRoleApi(form.role_id, roleDto);
      else await createBusinessPartnerRoleApi(roleDto);

      showToast({
        title: editing ? "Đã cập nhật thành công" : `Đã tạo ${roleLabel} mới`,
        variant: "success",
      });
      closeDrawer();
      await load(page, pageSize, search);
    } catch (e) {
      setSaveError(extractApiError(e, `Không thể lưu ${roleLabel}.`));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBusinessPartnerApi(deleteTarget.id);
      showToast({ title: "Đã xóa thành công", variant: "success" });
      setDeleteTarget(null);
      await load(page, pageSize, search);
    } catch (e) {
      setSaveError(extractApiError(e, "Không thể xóa."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const kindLabel = (k: string) =>
    PARTNER_KIND_OPTS.find((o) => o.value === k)?.label ?? k;

  const columns: DataTableColumn<BusinessPartner>[] = [
    {
      key: "code",
      header: "Mã",
      cell: (bp) => bp.code,
      className: "font-mono font-semibold text-[color:var(--muted-fg)]",
    },
    {
      key: "name",
      header: "Tên",
      cell: (bp) => bp.name,
      className: "font-medium",
    },
    {
      key: "kind",
      header: "Loại",
      cell: (bp) => kindLabel(bp.partner_kind),
      className: "text-[color:var(--muted-fg)]",
    },
    {
      key: "tax_code",
      header: "MST",
      cell: (bp) => bp.tax_code || "—",
      className: "font-mono text-[color:var(--muted-fg)]",
    },
    {
      key: "phone",
      header: "Điện thoại",
      cell: (bp) => bp.phone || "—",
      className: "text-[color:var(--muted-fg)]",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (bp) => <StatusBadge active={bp.is_active} />,
    },
  ];

  return (
    <div>
      <PageHeader title={title} desc={desc} onAdd={openNew} />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(bp) => bp.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={680}
        filters={
          <SearchInput
            placeholder="Tìm mã, tên hoặc MST..."
            value={searchInput}
            onChange={handleSearchInput}
            className="max-w-[280px]"
          />
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
        actionsColumn={{
          cell: (bp) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  icon: <Pencil className="h-3.5 w-3.5" />,
                  onClick: () => openEdit(bp),
                },
                {
                  label: t("common.delete"),
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  onClick: () => setDeleteTarget(bp),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />

      {/* Drawer create/update */}
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? `Chỉnh sửa ${roleLabel}` : `Thêm ${roleLabel} mới`}
        subtitle={editing ? editing.name : "Điền thông tin bên dưới"}
        panelClassName="partner-drawer-panel"
        bodyClassName="partner-drawer-body"
        actions={[
          { label: "Hủy", onClick: closeDrawer },
          {
            label: editing ? "Lưu thay đổi" : "Thêm mới",
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <div className="partner-drawer-grid">
          {/* Main info */}
          <div className="partner-card partner-card-main">
            <DrawerSection title="Thông tin đối tác">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3">
                <DrawerField label="Mã đối tác" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={form.code}
                    onChange={(e) => setField("code", e.target.value)}
                    placeholder="VD: KH001"
                  />
                </DrawerField>
                <DrawerField label="Tên đối tác" required>
                  <input
                    type="text"
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Tên đầy đủ"
                  />
                </DrawerField>
                <DrawerField label="Tên hiển thị">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.display_name}
                    onChange={(e) => setField("display_name", e.target.value)}
                    placeholder="Tên ngắn gọn"
                  />
                </DrawerField>
                <DrawerField label="Loại đối tác">
                  <Combobox
                    options={PARTNER_KIND_OPTS}
                    value={form.partner_kind}
                    onChange={(v) =>
                      setField("partner_kind", v || "ORGANIZATION")
                    }
                    allowClear={false}
                  />
                </DrawerField>
                <DrawerField label="Mã số thuế">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.tax_code}
                    onChange={(e) => setField("tax_code", e.target.value)}
                    placeholder="0123456789"
                  />
                </DrawerField>
                <DrawerField label="Điện thoại">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="0912 345 678"
                  />
                </DrawerField>
                <DrawerField label="Email">
                  <input
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </DrawerField>
                <DrawerField label="Địa chỉ">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Địa chỉ"
                  />
                </DrawerField>
                <DrawerField label="Ghi chú">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.note}
                    onChange={(e) => setField("note", e.target.value)}
                    placeholder="Ghi chú"
                  />
                </DrawerField>
                <DrawerField label="Hoạt động">
                  <Checkbox
                    checked={form.is_active}
                    onCheckedChange={(v) => setField("is_active", !!v)}
                  />
                </DrawerField>
              </div>
            </DrawerSection>
          </div>

          {/* Contacts */}
          <div className="partner-card">
            <DrawerSection title="Người liên hệ">
              {contactRows.map((row, idx) => (
                <div
                  key={row.tempId}
                  className="border rounded-lg p-3 mb-2 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-x-2">
                    <DrawerField label="Họ tên" required>
                      <input
                        type="text"
                        className={inputCls}
                        value={row.full_name}
                        onChange={(e) =>
                          setContactField(idx, "full_name", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Chức vụ">
                      <input
                        type="text"
                        className={inputCls}
                        value={row.position}
                        onChange={(e) =>
                          setContactField(idx, "position", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Điện thoại">
                      <input
                        type="text"
                        className={inputCls}
                        value={row.phone}
                        onChange={(e) =>
                          setContactField(idx, "phone", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Email">
                      <input
                        type="email"
                        className={inputCls}
                        value={row.email}
                        onChange={(e) =>
                          setContactField(idx, "email", e.target.value)
                        }
                      />
                    </DrawerField>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <label className="flex items-center gap-1">
                      <Checkbox
                        checked={row.is_default_receiver}
                        onCheckedChange={(v) =>
                          setContactField(idx, "is_default_receiver", !!v)
                        }
                      />
                      Người nhận mặc định
                    </label>
                    <label className="flex items-center gap-1">
                      <Checkbox
                        checked={row.is_default_payer}
                        onCheckedChange={(v) =>
                          setContactField(idx, "is_default_payer", !!v)
                        }
                      />
                      Người thanh toán mặc định
                    </label>
                  </div>
                  {contactRows.length > 1 && (
                    <button
                      onClick={() => removeContactRow(idx)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa liên hệ này
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setContactRows((r) => [...r, emptyContactDraft()])
                }
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                + Thêm liên hệ
              </button>
            </DrawerSection>
          </div>

          {/* Banks */}
          <div className="partner-card">
            <DrawerSection title="Tài khoản ngân hàng">
              {bankRows.map((row, idx) => (
                <div
                  key={row.tempId}
                  className="border rounded-lg p-3 mb-2 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-x-2">
                    <DrawerField label="Ngân hàng" required>
                      <input
                        type="text"
                        className={inputCls}
                        value={row.bank_name}
                        onChange={(e) =>
                          setBankField(idx, "bank_name", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Số tài khoản" required>
                      <input
                        type="text"
                        className={inputCls}
                        value={row.account_number}
                        onChange={(e) =>
                          setBankField(idx, "account_number", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Chủ tài khoản" required>
                      <input
                        type="text"
                        className={inputCls}
                        value={row.account_holder}
                        onChange={(e) =>
                          setBankField(idx, "account_holder", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Loại tiền">
                      <Combobox
                        options={CURRENCY_OPTS}
                        value={row.currency}
                        onChange={(v) =>
                          setBankField(idx, "currency", v || "VND")
                        }
                        allowClear={false}
                      />
                    </DrawerField>
                  </div>
                  <label className="flex items-center gap-1 text-xs">
                    <Checkbox
                      checked={row.is_default}
                      onCheckedChange={(v) =>
                        setBankField(idx, "is_default", !!v)
                      }
                    />
                    Tài khoản mặc định
                  </label>
                  {bankRows.length > 1 && (
                    <button
                      onClick={() => removeBankRow(idx)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa tài khoản này
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setBankRows((r) => [...r, emptyBankDraft()])}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                + Thêm tài khoản
              </button>
            </DrawerSection>
          </div>
        </div>
        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={`Xóa ${roleLabel}?`}
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

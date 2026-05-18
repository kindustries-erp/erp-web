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
  getBusinessPartnerContactsPagedApi,
  createBusinessPartnerContactApi,
  updateBusinessPartnerContactApi,
  deleteBusinessPartnerContactApi,
  type BusinessPartner,
  type BusinessPartnerContact,
  type CreateBusinessPartnerContactDto,
} from "@/modules/partners/api/partnerApi";
import { PageHeader, RowActions, StatusBadge } from "./shared";

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

export function ContactsTab() {
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
  const [deleteTarget, setDeleteTarget] =
    useState<BusinessPartnerContact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getBusinessPartnersApi()
      .then(setPartners)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load(page, pageSize, search, partnerFilter);
  }, [page, pageSize, search, partnerFilter]);

  async function load(pg: number, ps: number, q: string, pid: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnerContactsPagedApi({
        page: pid ? 1 : pg,
        pageSize: pid ? 500 : ps,
        search: q || undefined,
      });
      const filtered = pid
        ? res.items.filter((item) => item.business_partner_id === pid)
        : res.items;
      setItems(filtered);
      setTotal(pid ? filtered.length : res.total);
      setTotalPages(
        pid ? Math.max(1, Math.ceil(filtered.length / ps)) : res.totalPages,
      );
    } catch {
      setFetchError("Không thể tải danh sách liên hệ.");
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

  function handlePartnerFilter(v: string) {
    setPartnerFilter(v);
    setPage(1);
  }
  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
  }

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
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
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
  const partnerName = (id: string) =>
    partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  return (
    <div>
      <PageHeader
        title={t("doitac.tabs.contacts")}
        desc="Danh sách liên hệ của đối tác."
        onAdd={openNew}
      />
      <div className="flex gap-2 mb-3 flex-wrap">
        <Combobox
          options={partnerOpts}
          value={partnerFilter}
          onChange={(v) => handlePartnerFilter(v)}
          placeholder="— Lọc theo đối tác —"
          className="w-[240px]"
        />
        <SearchInput
          placeholder="Tìm tên liên hệ..."
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[220px]"
        />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              {[
                t("doitac.headers.code"),
                t("doitac.headers.contactName"),
                t("doitac.headers.position"),
                t("doitac.headers.phone"),
                t("doitac.headers.email"),
                t("doitac.headers.status"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]",
                    i === 6 && "w-[80px]",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td
                      key={j}
                      className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"
                    >
                      <Skeleton className="h-3 w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && fetchError && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-xs text-[color:var(--warn-fg)] py-8"
                >
                  {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-xs text-[color:var(--faint)] py-8"
                >
                  {t("common.noData")}
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {partnerName(c.business_partner_id)}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">
                  {c.full_name}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {c.position || "—"}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {c.phone || "—"}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {c.email || "—"}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  <StatusBadge active={c.is_active} />
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  <RowActions
                    onEdit={() => openEdit(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? "Chỉnh sửa liên hệ" : "Thêm liên hệ mới"}
        subtitle={editing ? editing.full_name : "Điền thông tin bên dưới"}
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
        <DrawerSection title="Thông tin liên hệ">
          <DrawerField label="Đối tác" required>
            <Combobox
              options={partnerOpts}
              value={form.business_partner_id}
              onChange={(v) => setField("business_partner_id", v)}
              placeholder="— Chọn đối tác —"
            />
          </DrawerField>
          <DrawerField label="Họ và tên" required>
            <input
              type="text"
              className={inputCls}
              value={form.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Chức vụ">
            <input
              type="text"
              className={inputCls}
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Điện thoại">
            <input
              type="text"
              className={inputCls}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Email">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="CMND/CCCD">
            <input
              type="text"
              className={inputCls}
              value={form.identity_no}
              onChange={(e) => setField("identity_no", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Địa chỉ">
            <input
              type="text"
              className={inputCls}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Ghi chú">
            <textarea
              className={inputCls}
              rows={2}
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Cài đặt mặc định">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.is_default_receiver}
                  onCheckedChange={(v) =>
                    setField("is_default_receiver", v === true)
                  }
                />
                <span className="text-xs text-foreground">
                  Người nhận mặc định
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.is_default_payer}
                  onCheckedChange={(v) =>
                    setField("is_default_payer", v === true)
                  }
                />
                <span className="text-xs text-foreground">
                  Người trả mặc định
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(v) => setField("is_active", v === true)}
                />
                <span className="text-xs text-foreground">Đang hoạt động</span>
              </label>
            </div>
          </DrawerField>
        </DrawerSection>
        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
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

import { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import {
  getBusinessPartnersApi,
  getBusinessPartnerBankAccountsPagedApi,
  createBusinessPartnerBankAccountApi,
  updateBusinessPartnerBankAccountApi,
  deleteBusinessPartnerBankAccountApi,
  type BusinessPartner,
  type BusinessPartnerBankAccount,
  type CreateBusinessPartnerBankAccountDto,
} from "@/modules/partners/api/partnerApi";
import { CURRENCY_OPTS } from "@/modules/partners/constants";
import {
  type PartnerBankForm,
  emptyBankForm,
  buildBankForm,
} from "@/modules/partners/types";
import { PageHeader, RowActions } from "./shared";

export function PartnerBankTab() {
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
  const [editing, setEditing] = useState<BusinessPartnerBankAccount | null>(
    null,
  );
  const [form, setForm] = useState<PartnerBankForm>(emptyBankForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<BusinessPartnerBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getBusinessPartnersApi()
      .then(setPartners)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load(page, pageSize, partnerFilter);
  }, [page, pageSize, partnerFilter]);

  async function load(pg: number, ps: number, pid: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBusinessPartnerBankAccountsPagedApi({
        page: pid ? 1 : pg,
        pageSize: pid ? 500 : ps,
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
      setFetchError("Không thể tải danh sách tài khoản ngân hàng.");
    } finally {
      setLoading(false);
    }
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
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof PartnerBankForm>(
    k: K,
    v: PartnerBankForm[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (
      !form.business_partner_id ||
      !form.bank_name.trim() ||
      !form.account_number.trim() ||
      !form.account_holder.trim()
    ) {
      setSaveError(
        "Đối tác, tên ngân hàng, số tài khoản và chủ tài khoản là bắt buộc.",
      );
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateBusinessPartnerBankAccountDto = {
        business_partner_id: form.business_partner_id,
        bank_name: form.bank_name.trim(),
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
  const partnerName = (id: string) =>
    partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));

  return (
    <div>
      <PageHeader
        title={t("doitac.tabs.bankAccounts")}
        desc="Tài khoản ngân hàng của đối tác."
        onAdd={openNew}
      />
      <div className="mb-3">
        <Combobox
          options={partnerOpts}
          value={partnerFilter}
          onChange={(v) => handlePartnerFilter(v)}
          placeholder="— Lọc theo đối tác —"
          className="w-[240px]"
        />
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              {[
                "Đối tác",
                t("doitac.headers.bankName"),
                t("doitac.headers.accountNumber"),
                t("doitac.headers.accountHolder"),
                t("doitac.headers.bankBranch"),
                t("doitac.headers.currency"),
                t("doitac.headers.isDefault"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]",
                    i === 7 && "w-[80px]",
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
                  {Array.from({ length: 8 }).map((_, j) => (
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
                  colSpan={8}
                  className="text-center text-xs text-[color:var(--warn-fg)] py-8"
                >
                  {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-xs text-[color:var(--faint)] py-8"
                >
                  {t("common.noData")}
                </td>
              </tr>
            )}
            {items.map((b) => (
              <tr key={b.id} className="hover:bg-surface-hover">
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {partnerName(b.business_partner_id)}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-medium">
                  {b.bank_name}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] font-mono">
                  {b.account_number}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  {b.account_holder}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  —
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                  {b.currency ?? "VND"}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)] text-center">
                  {b.is_default ? (
                    <span className="text-[color:var(--approve-fg)] font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[color:var(--faint)]">—</span>
                  )}
                </td>
                <td className="text-xs px-[10px] py-[10px] border-b border-[color:var(--border-light)]">
                  <RowActions
                    onEdit={() => openEdit(b)}
                    onDelete={() => setDeleteTarget(b)}
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
        title={editing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản ngân hàng"}
        subtitle={
          editing
            ? `${editing.bank_name} — ${editing.account_number}`
            : "Điền thông tin bên dưới"
        }
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
        <DrawerSection title="Thông tin tài khoản">
          <DrawerField label="Đối tác" required>
            <Combobox
              options={partnerOpts}
              value={form.business_partner_id}
              onChange={(v) => setField("business_partner_id", v)}
              placeholder="— Chọn đối tác —"
            />
          </DrawerField>
          <DrawerField label="Tên ngân hàng" required>
            <input
              type="text"
              className={inputCls}
              value={form.bank_name}
              onChange={(e) => setField("bank_name", e.target.value)}
              placeholder="VD: Vietcombank"
            />
          </DrawerField>
          <DrawerField label="Số tài khoản" required>
            <input
              type="text"
              className={inputCls}
              value={form.account_number}
              onChange={(e) => setField("account_number", e.target.value)}
              placeholder="0071001xxx"
            />
          </DrawerField>
          <DrawerField label="Chủ tài khoản" required>
            <input
              type="text"
              className={inputCls}
              value={form.account_holder}
              onChange={(e) => setField("account_holder", e.target.value)}
            />
          </DrawerField>
          <DrawerField label="Tiền tệ">
            <Combobox
              options={CURRENCY_OPTS}
              value={form.currency}
              onChange={(v) => setField("currency", v || "VND")}
              allowClear={false}
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
          <DrawerField label="Cài đặt">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.is_default}
                  onCheckedChange={(v) => setField("is_default", v === true)}
                />
                <span className="text-xs text-foreground">
                  Tài khoản mặc định
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

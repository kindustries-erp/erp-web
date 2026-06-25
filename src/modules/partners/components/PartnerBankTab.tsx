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
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  ActionDropdown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ActionItem,
} from "@/shared/components/ActionDropdown";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
import { PageHeader } from "./shared";

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

  const columns: DataTableColumn<BusinessPartnerBankAccount>[] = [
    {
      key: "partner",
      header: "Đối tác",
      cell: (b) => partnerName(b.business_partner_id),
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "bank_name",
      header: t("doitac.headers.bankName"),
      cell: (b) => b.bank_name,
      className: "font-medium text-left",
      headerClassName: "text-center",
    },
    {
      key: "account_number",
      header: t("doitac.headers.accountNumber"),
      cell: (b) => b.account_number,
      className: "font-mono text-left",
      headerClassName: "text-center",
    },
    {
      key: "account_holder",
      header: t("doitac.headers.accountHolder"),
      cell: (b) => b.account_holder,
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "bank_branch",
      header: t("doitac.headers.bankBranch"),
      cell: () => "—",
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "currency",
      header: t("doitac.headers.currency"),
      cell: (b) => b.currency ?? "VND",
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "is_default",
      header: t("doitac.headers.isDefault"),
      cell: (b) =>
        b.is_default ? (
          <div className="flex justify-center w-full">
            <span className="text-[color:var(--approve-fg)] font-bold">✓</span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <span className="text-[color:var(--faint)]">—</span>
          </div>
        ),
      className: "text-center",
      headerClassName: "text-center",
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("doitac.tabs.bankAccounts")}
        desc="Tài khoản ngân hàng của đối tác."
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        filters={
          <Combobox
            options={partnerOpts}
            value={partnerFilter}
            onChange={(v) => handlePartnerFilter(v)}
            placeholder="— Lọc theo đối tác —"
            className="w-[240px]"
          />
        }
        actionsColumn={{
          cell: (b) => (
            <ActionDropdown
              items={[
                { label: t("common.edit"), onClick: () => openEdit(b) },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(b),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
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

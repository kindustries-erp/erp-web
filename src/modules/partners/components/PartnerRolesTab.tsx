import { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { extractApiError } from "@/shared/utils/apiError";
import {
  getBusinessPartnersApi,
  getBusinessPartnerRolesPagedApi,
  createBusinessPartnerRoleApi,
  updateBusinessPartnerRoleApi,
  deleteBusinessPartnerRoleApi,
  type BusinessPartner,
  type BusinessPartnerRole,
  type CreateBusinessPartnerRoleDto,
} from "@/modules/partners/api/partnerApi";
import { PARTNER_ROLE_OPTS } from "@/modules/partners/constants";
import { type PartnerRoleForm, emptyRoleForm } from "@/modules/partners/types";
import { PageHeader, StatusBadge } from "./shared";

function buildRoleForm(r: BusinessPartnerRole): PartnerRoleForm {
  return {
    business_partner_id: r.business_partner_id,
    role: r.role,
    is_active: r.is_active,
  };
}

export function PartnerRolesTab() {
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [items, setItems] = useState<BusinessPartnerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessPartnerRole | null>(null);
  const [form, setForm] = useState<PartnerRoleForm>(emptyRoleForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessPartnerRole | null>(
    null,
  );
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
      const res = await getBusinessPartnerRolesPagedApi({
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
      setFetchError(t("doitac.roles.fetchError"));
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
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof PartnerRoleForm>(
    k: K,
    v: PartnerRoleForm[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

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

  const isDirty =
    !!form.business_partner_id || form.role !== "CUSTOMER" || !form.is_active;
  const partnerName = (id: string) =>
    partners.find((p) => p.id === id)?.name ?? id;
  const partnerOpts = partners.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name}`,
  }));
  const roleLabel = (role: string) =>
    PARTNER_ROLE_OPTS.find((o) => o.value === role)?.label ?? role;

  const columns: DataTableColumn<BusinessPartnerRole>[] = [
    {
      key: "partner",
      header: t("doitac.headers.partner"),
      cell: (r) => partnerName(r.business_partner_id),
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "role",
      header: t("doitac.headers.role"),
      cell: (r) => roleLabel(r.role),
      className: "font-medium text-left",
      headerClassName: "text-center",
    },
    {
      key: "status",
      header: t("doitac.headers.status"),
      className: "text-center",
      headerClassName: "text-center",
      cell: (r) => (
        <div className="flex justify-center w-full">
          <StatusBadge active={r.is_active} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("doitac.roles.title")}
        desc={t("doitac.roles.desc")}
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(r) => r.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={620}
        filters={
          <Combobox
            options={partnerOpts}
            value={partnerFilter}
            onChange={(v) => handlePartnerFilter(v)}
            placeholder={t("doitac.roles.partnerFilterPlaceholder")}
            className="w-[240px]"
          />
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
        actionsColumn={{
          cell: (r) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  onClick: () => openEdit(r),
                },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(r),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={
          editing ? t("doitac.roles.editTitle") : t("doitac.roles.createTitle")
        }
        subtitle={
          editing ? roleLabel(editing.role) : t("doitac.roles.subtitle")
        }
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          {
            label: editing ? t("common.saveChanges") : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("doitac.roles.sectionInfo")}>
          <DrawerField label={t("doitac.headers.partner")} required>
            <Combobox
              options={partnerOpts}
              value={form.business_partner_id}
              onChange={(v) => setField("business_partner_id", v)}
              placeholder={t("doitac.roles.partnerPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("doitac.headers.role")} required>
            <Combobox
              options={PARTNER_ROLE_OPTS}
              value={form.role}
              onChange={(v) => setField("role", v || "CUSTOMER")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("doitac.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">
                {t("status.active")}
              </span>
            </label>
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
        title={t("doitac.roles.deleteTitle")}
        message={t("doitac.roles.deleteMessage")
          .replace("{0}", roleLabel(deleteTarget?.role ?? ""))
          .replace(
            "{1}",
            deleteTarget ? partnerName(deleteTarget.business_partner_id) : "",
          )}
        confirmLabel={t("common.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

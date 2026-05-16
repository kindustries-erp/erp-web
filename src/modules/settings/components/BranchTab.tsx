import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  branchApi,
  type Branch,
  type BranchQueryParams,
} from "@/modules/branches/api/branchApi";
import {
  SectionHeader,
  TagCell,
  ErrorBanner,
  IconEdit,
  IconTrash,
  extractApiError,
} from "./shared";

interface BranchForm {
  code: string;
  name: string;
  address: string;
  note: string;
  is_active: boolean;
}

const emptyBranchForm: BranchForm = {
  code: "",
  name: "",
  address: "",
  note: "",
  is_active: true,
};

function buildBranchForm(branch: Branch): BranchForm {
  return {
    code: branch.code ?? "",
    name: branch.name ?? "",
    address: branch.address ?? "",
    note: branch.note ?? "",
    is_active: branch.is_active ?? true,
  };
}

export function BranchTab() {
  const t = useT();
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyBranchForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadItems(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  async function loadItems(pg: number, ps: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const params: BranchQueryParams = { page: pg, pageSize: ps };
      const res = await branchApi.getBranches(params);
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 0);
    } catch (e: unknown) {
      setFetchError(extractApiError(e, t("settings.branch.fetchError")));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyBranchForm);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: Branch) {
    setEditing(item);
    setForm(buildBranchForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  const setField = <K extends keyof BranchForm>(key: K, value: BranchForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setSaveError(t("settings.branch.requiredError"));
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const dto = {
        code: form.code.trim(),
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        note: form.note.trim() || undefined,
        is_active: form.is_active,
      };
      if (editing) {
        await branchApi.updateBranch(editing.id, dto);
      } else {
        await branchApi.createBranch(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadItems(page, pageSize);
    } catch (e: unknown) {
      setSaveError(extractApiError(e, t("settings.tk.unknownError")));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await branchApi.deleteBranch(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadItems(page, pageSize);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty =
    !!form.code.trim() ||
    !!form.name.trim() ||
    !!form.address.trim() ||
    !!form.note.trim() ||
    form.is_active !== true;

  const columns: DataTableColumn<Branch>[] = [
    {
      key: "code",
      header: t("settings.branch.headers.code"),
      cell: (b) => b.code,
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "w-20",
    },
    {
      key: "name",
      header: t("settings.branch.headers.name"),
      cell: (b) => b.name,
      className: "font-medium",
      skeletonClassName: "w-32",
    },
    {
      key: "address",
      header: t("settings.branch.headers.address"),
      cell: (b) => b.address || "—",
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-40",
    },
    {
      key: "note",
      header: t("settings.branch.headers.note"),
      cell: (b) => b.note || "—",
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-36",
    },
    {
      key: "status",
      header: t("settings.branch.headers.status"),
      cell: (b) => <TagCell active={b.is_active} />,
      skeletonClassName: "w-16",
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[80px]",
      skeletonClassName: "",
      cell: (b) => (
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("common.edit")}
            onClick={() => openEdit(b)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("common.delete")}
            onClick={() => setDeleteTarget(b)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("settings.branch.title")}
        desc={t("settings.branch.desc")}
        icon={<GitBranch className="h-4 w-4" />}
        onAdd={openNew}
      />

      <DataTable
        items={items}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={760}
        loadingRows={4}
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
        title={editing ? t("settings.branch.editTitle") : t("settings.branch.createTitle")}
        subtitle={editing ? editing.name : t("settings.branch.subtitle")}
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
        <DrawerSection title={t("settings.branch.sectionInfo")}>
          <DrawerField label={t("settings.branch.headers.code")} required>
            <input
              type="text"
              className={inputCls}
              value={form.code}
              onChange={(e) => setField("code", e.target.value)}
              placeholder={t("settings.branch.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.branch.headers.name")} required>
            <input
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={t("settings.branch.namePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.branch.headers.address")}>
            <input
              type="text"
              className={inputCls}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder={t("settings.branch.addressPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.branch.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">{t("common.active")}</span>
            </label>
          </DrawerField>
          <DrawerField label={t("settings.branch.headers.note")}>
            <textarea
              className={inputCls}
              rows={3}
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              placeholder={t("settings.branch.notePlaceholder")}
            />
          </DrawerField>
        </DrawerSection>
        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("settings.branch.deleteMessage").replace("{0}", deleteTarget?.name ?? "")}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

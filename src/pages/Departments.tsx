import { useState, useEffect, useRef } from "react";
import { Building2 } from "lucide-react";
import { useT } from "@/core/i18n";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { SearchInput } from "@/shared/components/SearchInput";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";
import {
  getDepartmentsPagedApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  type Department,
  type CreateDepartmentDto,
} from "@/modules/hr/api/hrApi";

// ── Icons ──────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconBuilding = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8l-2 4h12z" />
  </svg>
);

// ── Form state ─────────────────────────────────────────────────────────────

interface DeptForm {
  department_code: string;
  department_name: string;
  description: string;
  is_active: boolean;
}

const emptyForm: DeptForm = {
  department_code: "",
  department_name: "",
  description: "",
  is_active: true,
};

function buildForm(d: Department): DeptForm {
  return {
    department_code: d.department_code,
    department_name: d.department_name,
    description: d.description ?? "",
    is_active: d.is_active,
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export function PhongBan() {
  const t = useT();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData(page, pageSize, search);
  }, [page, pageSize, search]);

  async function loadData(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getDepartmentsPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("phongban.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    if (value === "") {
      setSearch("");
      setPage(1);
    } else {
      searchTimer.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    }
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: Department) {
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  const setField = <K extends keyof DeptForm>(k: K, v: DeptForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.department_name.trim()) {
      setSaveError(t("phongban.requiredName"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateDepartmentDto = {
        department_code:
          form.department_code.trim() || (undefined as unknown as string),
        department_name: form.department_name.trim(),
        description: form.description.trim() || null,
        is_active: form.is_active,
      };
      if (editing) {
        await updateDepartmentApi(editing.id, dto);
      } else {
        await createDepartmentApi(dto);
      }
      closeDrawer();
      // After create, go to page 1 so new item is visible; after update, reload current page
      const targetPage = editing ? page : 1;
      if (targetPage !== page) setPage(1);
      else loadData(page, pageSize, search);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("phongban.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDepartmentApi(deleteTarget.id);
      setDeleteTarget(null);
      // If last item on page and not first page, go back one page
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadData(page, pageSize, search);
      }
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: DataTableColumn<Department>[] = [
    {
      key: "department_code",
      header: t("phongban.headers.code"),
      cell: (dept) => dept.department_code,
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "h-3 w-16",
    },
    {
      key: "department_name",
      header: t("phongban.headers.name"),
      cell: (dept) => dept.department_name,
      className: "font-medium",
      skeletonClassName: "h-3 w-32",
    },
    {
      key: "description",
      header: t("phongban.headers.description"),
      cell: (dept) => dept.description ?? "—",
      className: "text-[color:var(--muted-fg)] max-w-[220px] truncate",
      skeletonClassName: "h-3 w-40",
    },
    {
      key: "status",
      header: t("phongban.headers.status"),
      cell: (dept) => (
        <span
          className={cn(
            "inline-flex items-center px-[8px] py-[3px] rounded-[20px] text-[10px] font-medium",
            dept.is_active
              ? "bg-approve-bg text-approve-fg"
              : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
          )}
        >
          {dept.is_active ? t("status.active") : t("status.inactive")}
        </span>
      ),
      skeletonClassName: "h-4 w-16 rounded-full",
    },
  ];

  const isDirty =
    !!form.department_name.trim() ||
    !!form.department_code.trim() ||
    !!form.description.trim();

  return (
    <PageLayout
      title={t("nav.items.hrDepts")}
      desc="Quản lý danh sách phòng ban"
      icon={<Building2 className="h-4 w-4" />}
      actions={
        <button
          onClick={openNew}
          className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
        >
          <IconPlus /> {t("phongban.add")}
        </button>
      }
    >
      {/* ── DataTable ── */}
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(dept) => dept.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={520}
        filters={
          <SearchInput
            placeholder={t("phongban.searchPlaceholder")}
            value={searchInput}
            onChange={handleSearchInput}
            className="max-w-[320px]"
          />
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
        actionsColumn={{
          cell: (dept) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  onClick: () => openEdit(dept),
                },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(dept),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />

      {/* ── Drawer: Add / Edit ── */}
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        icon={<IconBuilding />}
        title={
          editing
            ? t("phongban.drawer.editTitle")
            : t("phongban.drawer.createTitle")
        }
        subtitle={
          editing ? editing.department_name : t("phongban.drawer.subtitle")
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
        <DrawerSection title={t("phongban.drawer.section")}>
          <DrawerField label={t("phongban.headers.code")}>
            <input
              type="text"
              className={inputCls}
              value={form.department_code}
              onChange={(e) => setField("department_code", e.target.value)}
              placeholder={t("phongban.drawer.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("phongban.headers.name")} required>
            <input
              type="text"
              className={inputCls}
              value={form.department_name}
              onChange={(e) => setField("department_name", e.target.value)}
              placeholder={t("phongban.drawer.namePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("phongban.headers.description")}>
            <textarea
              className={cn(inputCls, "min-h-[70px] resize-none")}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("phongban.drawer.descPlaceholder")}
              rows={3}
            />
          </DrawerField>
          <DrawerField label={t("phongban.headers.status")}>
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

      {/* ── Delete confirm ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t("phongban.delete.title")}
        message={t("phongban.delete.message").replace(
          "{0}",
          deleteTarget?.department_name ?? "",
        )}
        confirmLabel={t("common.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}

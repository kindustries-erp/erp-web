import { useState, useEffect, useRef } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TablePagination } from "@/shared/components/TablePagination";
import { SearchInput } from "@/shared/components/SearchInput";
import { Skeleton } from "@/shared/components/Skeleton";
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
const IconEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

  const isDirty =
    !!form.department_name.trim() ||
    !!form.department_code.trim() ||
    !!form.description.trim();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openNew}
          className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
        >
          <IconPlus /> {t("phongban.add")}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="mb-4">
        <SearchInput
          placeholder={t("phongban.searchPlaceholder")}
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[320px]"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              {[
                t("phongban.headers.code"),
                t("phongban.headers.name"),
                t("phongban.headers.description"),
                t("phongban.headers.status"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-3 py-[9px] border-b border-border uppercase tracking-[0.05em]",
                    i === 4 && "w-[80px]",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                    <Skeleton className="h-3 w-16" />
                  </td>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                    <Skeleton className="h-3 w-32" />
                  </td>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                    <Skeleton className="h-3 w-40" />
                  </td>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </td>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]" />
                </tr>
              ))}
            {!loading && fetchError && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-xs text-[color:var(--warn-fg)] py-10"
                >
                  {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-xs text-[color:var(--faint)] py-10"
                >
                  {t("common.noData")}
                </td>
              </tr>
            )}
            {items.map((dept) => (
              <tr key={dept.id} className="hover:bg-surface-hover">
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-mono text-[color:var(--muted-fg)]">
                  {dept.department_code}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-medium text-foreground">
                  {dept.department_name}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs text-[color:var(--muted-fg)] max-w-[220px] truncate">
                  {dept.description ?? "—"}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs">
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
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                  <div className="flex gap-[5px] justify-end">
                    <button
                      title={t("common.edit")}
                      onClick={() => openEdit(dept)}
                      className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
                    >
                      <IconEdit />
                    </button>
                    <button
                      title={t("common.delete")}
                      onClick={() => setDeleteTarget(dept)}
                      className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
                    >
                      <IconTrash />
                    </button>
                  </div>
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
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Briefcase } from "lucide-react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  selectCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TablePagination } from "@/shared/components/TablePagination";
import { SearchInput } from "@/shared/components/SearchInput";
import { PageHeader } from "@/shared/components/PageHeader";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";
import {
  getPositionsPagedApi,
  createPositionApi,
  updatePositionApi,
  deletePositionApi,
  getDepartmentsApi,
  type Position,
  type Department,
  type CreatePositionDto,
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
const IconBriefcase = () => (
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

interface PosForm {
  position_code: string;
  position_name: string;
  department_group: string;
  approval_level: string;
  department_id: string;
  is_active: boolean;
}

const emptyForm: PosForm = {
  position_code: "",
  position_name: "",
  department_group: "",
  approval_level: "",
  department_id: "",
  is_active: true,
};

function buildForm(p: Position): PosForm {
  return {
    position_code: p.position_code,
    position_name: p.position_name,
    department_group: p.department_group ?? "",
    approval_level: p.approval_level != null ? String(p.approval_level) : "",
    department_id: p.department_id ?? "",
    is_active: p.is_active,
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export function ChucVu() {
  const t = useT();
  const [items, setItems] = useState<Position[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
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
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<PosForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load departments once for dropdown
  useEffect(() => {
    getDepartmentsApi()
      .then(setDepts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData(page, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  async function loadData(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getPositionsPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("chucvu.fetchError"));
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

  function openEdit(item: Position) {
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

  const setField = <K extends keyof PosForm>(k: K, v: PosForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.position_name.trim()) {
      setSaveError(t("chucvu.requiredName"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreatePositionDto = {
        position_code:
          form.position_code.trim() || (undefined as unknown as string),
        position_name: form.position_name.trim(),
        department_group: form.department_group.trim() || null,
        approval_level: form.approval_level
          ? parseInt(form.approval_level, 10)
          : null,
        department_id: form.department_id || null,
        is_active: form.is_active,
      };
      if (editing) {
        await updatePositionApi(editing.id, dto);
      } else {
        await createPositionApi(dto);
      }
      closeDrawer();
      const targetPage = editing ? page : 1;
      if (targetPage !== page) setPage(1);
      else loadData(page, pageSize, search);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("chucvu.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePositionApi(deleteTarget.id);
      setDeleteTarget(null);
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

  const deptName = (id: string | null) =>
    id ? (depts.find((d) => d.id === id)?.department_name ?? id) : "—";

  const isDirty = !!form.position_name.trim() || !!form.position_code.trim();

  return (
    <div>
      <PageHeader
        title={t("chucvu.title")}
        desc={t("chucvu.desc")}
        icon={<Briefcase className="h-4 w-4" />}
        actions={
          <button
            onClick={openNew}
            className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
          >
            <IconPlus /> {t("chucvu.add")}
          </button>
        }
      />

      {/* ── Search ── */}
      <div className="mb-4">
        <SearchInput
          placeholder={t("chucvu.searchPlaceholder")}
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[320px]"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-surface border border-border rounded-[10px] overflow-x-auto card-shadow">
        <table className="w-full border-collapse" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              {[
                t("chucvu.headers.code"),
                t("chucvu.headers.name"),
                t("chucvu.headers.department"),
                t("chucvu.headers.approvalLevel"),
                t("chucvu.headers.status"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-3 py-[9px] border-b border-border uppercase tracking-[0.05em]",
                    i === 5 && "w-[80px]",
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
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-center">
                    <Skeleton className="h-3 w-6 mx-auto" />
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
                  colSpan={6}
                  className="text-center text-xs text-[color:var(--warn-fg)] py-10"
                >
                  {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-xs text-[color:var(--faint)] py-10"
                >
                  {t("common.noData")}
                </td>
              </tr>
            )}
            {items.map((pos) => (
              <tr key={pos.id} className="hover:bg-surface-hover">
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-mono text-[color:var(--muted-fg)]">
                  {pos.position_code}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs font-medium text-foreground">
                  {pos.position_name}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs text-[color:var(--muted-fg)]">
                  {deptName(pos.department_id)}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs text-center">
                  {pos.approval_level != null ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-[11px] font-semibold">
                      {pos.approval_level}
                    </span>
                  ) : (
                    <span className="text-[color:var(--faint)]">—</span>
                  )}
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)] text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center px-[8px] py-[3px] rounded-[20px] text-[10px] font-medium",
                      pos.is_active
                        ? "bg-approve-bg text-approve-fg"
                        : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
                    )}
                  >
                    {pos.is_active ? t("status.active") : t("status.inactive")}
                  </span>
                </td>
                <td className="px-3 py-[10px] border-b border-[color:var(--border-light)]">
                  <div className="flex gap-[5px] justify-end">
                    <button
                      title={t("common.edit")}
                      onClick={() => openEdit(pos)}
                      className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
                    >
                      <IconEdit />
                    </button>
                    <button
                      title={t("common.delete")}
                      onClick={() => setDeleteTarget(pos)}
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
        icon={<IconBriefcase />}
        title={editing ? t("chucvu.drawer.editTitle") : t("chucvu.drawer.createTitle")}
        subtitle={editing ? editing.position_name : t("chucvu.drawer.subtitle")}
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
        <DrawerSection title={t("chucvu.drawer.section")}>
          <DrawerField label={t("chucvu.headers.code")}>
            <input
              type="text"
              className={inputCls}
              value={form.position_code}
              onChange={(e) => setField("position_code", e.target.value)}
              placeholder={t("chucvu.drawer.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("chucvu.headers.name")} required>
            <input
              type="text"
              className={inputCls}
              value={form.position_name}
              onChange={(e) => setField("position_name", e.target.value)}
              placeholder={t("chucvu.drawer.namePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("chucvu.headers.department")}>
            <Combobox
              options={depts.map((d) => ({
                value: d.id,
                label: d.department_name,
              }))}
              value={form.department_id}
              onChange={(v) => setField("department_id", v)}
              placeholder={t("chucvu.drawer.noDepartment")}
            />
          </DrawerField>
          <DrawerField label={t("chucvu.drawer.group")}>
            <input
              type="text"
              className={inputCls}
              value={form.department_group}
              onChange={(e) => setField("department_group", e.target.value)}
              placeholder={t("chucvu.drawer.groupPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("chucvu.headers.approvalLevel")}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.approval_level}
              onChange={(e) => setField("approval_level", e.target.value)}
              placeholder={t("chucvu.drawer.approvalLevelPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("chucvu.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">{t("status.active")}</span>
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
        title={t("chucvu.delete.title")}
        message={t("chucvu.delete.message").replace("{0}", deleteTarget?.position_name ?? "")}
        confirmLabel={t("common.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

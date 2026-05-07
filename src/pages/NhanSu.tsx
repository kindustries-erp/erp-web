import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { PageHeader } from "@/shared/components/PageHeader";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  getEmployeesPagedApi,
  createEmployeeApi,
  deleteEmployeeApi,
  getDepartmentsApi,
  getPositionsApi,
  type Department,
  type Position,
  type CreateEmployeeDto,
} from "@/modules/hr/api/hrApi";
import {
  updateProfileApi,
  getEmployeeApi,
  type Employee,
  type UpdateProfileRequest,
} from "@/modules/auth/api/auth";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  getRolesApi,
  getEmployeePermissionsApi,
  saveEmployeePermissionsApi,
} from "@/modules/system/api/rbacApi";
import { usePermissionsEditor } from "@/modules/system/hooks/usePermissionsEditor";
import { PermissionMatrixDrawer } from "@/modules/system/components/PermissionMatrixDrawer";
import type { Role } from "@/modules/system/types/rbac";

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
const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconRefresh = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconLoginAs = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  active: "bg-approve-bg text-approve-fg",
  resigned: "bg-[color:var(--warn-bg)] text-[color:var(--warn-fg)]",
  inactive: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
};

const STATUS_FILTER_FETCH_LIMIT = 1000;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function deptLabel(emp: Employee) {
  if (!emp.department_id) return "—";
  if (typeof emp.department_id === "object")
    return emp.department_id.department_name;
  return String(emp.department_id);
}

function posLabel(emp: Employee) {
  if (!emp.position_id) return "—";
  if (typeof emp.position_id === "object") return emp.position_id.position_name;
  return String(emp.position_id);
}

function deptId(emp: Employee): string {
  if (!emp.department_id) return "";
  if (typeof emp.department_id === "object") return emp.department_id.id ?? "";
  return String(emp.department_id);
}

function posId(emp: Employee): string {
  if (!emp.position_id) return "";
  if (typeof emp.position_id === "object")
    return (emp.position_id as unknown as { id: string }).id ?? "";
  return String(emp.position_id);
}

function getDirectusId(emp: Employee): string {
  const val = emp.directus_user_id as unknown;
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "id" in val)
    return (val as { id?: string }).id ?? "";
  return "";
}

function getEmployeeRoleId(emp: Employee): string {
  const du = emp.directus_user_id as unknown;
  if (!du || typeof du !== "object") return "";
  const role = (du as Record<string, unknown>).role;
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object") return (role as { id?: string }).id ?? "";
  return "";
}

// ── Form state ─────────────────────────────────────────────────────────────

interface EmpForm {
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  position_id: string;
  employment_status: string;
  hire_date: string;
  is_active: boolean;
  notes: string;
  role_id: string;
}

const emptyForm: EmpForm = {
  employee_code: "",
  full_name: "",
  email: "",
  phone: "",
  department_id: "",
  position_id: "",
  employment_status: "active",
  hire_date: "",
  is_active: true,
  notes: "",
  role_id: "",
};

function buildForm(e: Employee): EmpForm {
  return {
    employee_code: e.employee_code ?? "",
    full_name: e.full_name ?? "",
    email: e.email ?? "",
    phone: e.phone ?? "",
    department_id: deptId(e),
    position_id: posId(e),
    employment_status: e.employment_status ?? "active",
    hire_date: e.hire_date ? e.hire_date.slice(0, 10) : "",
    is_active: e.is_active,
    notes: e.notes ?? "",
    role_id: getEmployeeRoleId(e),
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export function NhanSu() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const canImpersonate = useAuthStore((s) => s.canImpersonate);
  const impersonateAction = useAuthStore((s) => s.impersonateAction);
  const [items, setItems] = useState<Employee[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmpForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [impersonateTarget, setImpersonateTarget] = useState<Employee | null>(null);
  const [impersonating, setImpersonating] = useState(false);

  const [allRoles, setAllRoles] = useState<Role[]>([]);

  // Policy permission matrix editor (per-employee custom policy)
  const [policyTarget, setPolicyTarget] = useState<Employee | null>(null);
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const policyEditor = usePermissionsEditor({
    getApi: (id) => getEmployeePermissionsApi(id),
    saveApi: (id, dto) => saveEmployeePermissionsApi(id, dto),
  });

  // Load dropdowns once
  useEffect(() => {
    Promise.all([
      getDepartmentsApi(),
      getPositionsApi(),
      getRolesApi({ pageSize: 200 }),
    ])
      .then(([d, p, r]) => {
        setDepts(d);
        setPositions(p);
        setAllRoles(r.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData(page, pageSize, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, statusFilter]);

  async function loadData(pg: number, ps: number, q: string, status: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getEmployeesPagedApi({
        page: status ? 1 : pg,
        pageSize: status ? STATUS_FILTER_FETCH_LIMIT : ps,
        search: q || undefined,
      });
      if (status) {
        const filtered = result.items.filter(
          (emp) => emp.employment_status === status,
        );
        const start = (pg - 1) * ps;
        setItems(filtered.slice(start, start + ps));
        setTotal(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / ps)));
      } else {
        setItems(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch {
      setFetchError(t("nhansu.errors.fetch"));
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

  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
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

  function openEdit(item: Employee) {
    setEditing(item);
    // buildForm already extracts role_id from directus_user_id.role.id
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openPolicyMatrix(emp: Employee) {
    setPolicyTarget(emp);
    policyEditor.reset();
    setPolicyDrawerOpen(true);
    policyEditor.loadPermissions(emp.id);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  async function handleSavePolicyPermissions() {
    try {
      await policyEditor.save();
      showToast({
        title: t("nhansu.toast.permissionsSaved"),
        variant: "success",
      });
      setPolicyDrawerOpen(false);
      policyEditor.reset();
    } catch (e) {
      showToast({
        title: t("nhansu.toast.permissionsFailed"),
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      });
    }
  }

  const setField = <K extends keyof EmpForm>(k: K, v: EmpForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.full_name.trim()) {
      setSaveError(t("nhansu.errors.nameRequired"));
      return;
    }
    if (!form.email.trim()) {
      setSaveError(t("nhansu.errors.emailRequired"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) {
        const dto: UpdateProfileRequest = {
          employee_code: form.employee_code.trim() || undefined,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          department_id: form.department_id || undefined,
          position_id: form.position_id || undefined,
          employment_status: form.employment_status,
          hire_date: form.hire_date || null,
          is_active: form.is_active,
          notes: form.notes.trim() || null,
          role_id: form.role_id || null,
        };
        await updateProfileApi(editing.id, dto);
        closeDrawer();
        loadData(page, pageSize, search, statusFilter);
      } else {
        const dto: CreateEmployeeDto = {
          employee_code: form.employee_code.trim() || undefined,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          department_id: form.department_id || null,
          position_id: form.position_id || null,
          employment_status: form.employment_status,
          hire_date: form.hire_date || null,
          is_active: form.is_active,
          notes: form.notes.trim() || null,
        };
        await createEmployeeApi(dto);
        closeDrawer();
        if (page !== 1) setPage(1);
        else loadData(1, pageSize, search, statusFilter);
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("nhansu.errors.save"));
    } finally {
      setSaving(false);
    }
  }

  async function handleImpersonate() {
    if (!impersonateTarget) return;
    setImpersonating(true);
    try {
      // directus_user_id may not be included in the list response — fetch detail
      let targetId = getDirectusId(impersonateTarget);
      if (!targetId) {
        const detail = await getEmployeeApi(impersonateTarget.id);
        targetId = getDirectusId(detail);
      }
      if (!targetId) {
        showToast({ title: t("nhansu.toast.impersonateFailed"), description: "Nhân viên chưa liên kết tài khoản hệ thống.", variant: "destructive" });
        setImpersonating(false);
        return;
      }
      await impersonateAction(targetId);
      setImpersonateTarget(null);
      showToast({
        title: t("nhansu.toast.impersonateStarted"),
        description: impersonateTarget.full_name,
        variant: "success",
      });
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      showToast({
        title: t("nhansu.toast.impersonateFailed"),
        description: msg ?? "",
        variant: "destructive",
      });
    } finally {
      setImpersonating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployeeApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadData(page, pageSize, search, statusFilter);
      }
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.full_name.trim() || !!form.email.trim();
  const statusOptions = [
    { value: "active", label: t("nhansu.status.active") },
    { value: "inactive", label: t("nhansu.status.inactive") },
    { value: "resigned", label: t("nhansu.status.resigned") },
  ];
  const statusLabel: Record<string, string> = {
    active: t("nhansu.status.active"),
    inactive: t("nhansu.status.inactive"),
    resigned: t("nhansu.status.resigned"),
  };
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "employee",
      header: t("nhansu.headers.employee"),
      cell: (emp) => {
        const av = initials(emp.full_name ?? "?");
        return (
          <div className="flex items-center gap-[10px]">
            <div className="w-8 h-8 min-w-[32px] bg-primary rounded-full flex items-center justify-center text-primary-fg text-[10px] font-bold flex-shrink-0">
              {av}
            </div>
            <div>
              <div className="text-xs font-medium text-foreground leading-tight">
                {emp.full_name}
              </div>
              <div className="text-[10px] text-[color:var(--faint)] font-mono">
                {emp.employee_code ?? "—"}
              </div>
            </div>
          </div>
        );
      },
      skeletonClassName: "w-28",
    },
    {
      key: "contact",
      header: t("nhansu.headers.contact"),
      cell: (emp) => (
        <div>
          <div className="text-xs text-foreground">{emp.email}</div>
          {emp.phone && (
            <div className="text-[10px] text-[color:var(--muted-fg)]">
              {emp.phone}
            </div>
          )}
        </div>
      ),
      skeletonClassName: "w-36",
    },
    {
      key: "department",
      header: t("nhansu.headers.department"),
      cell: deptLabel,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-24",
    },
    {
      key: "position",
      header: t("nhansu.headers.position"),
      cell: posLabel,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-24",
    },
    {
      key: "status",
      header: t("nhansu.headers.status"),
      cell: (emp) => (
        <span
          className={cn(
            "inline-flex items-center px-[8px] py-[3px] rounded-[20px] text-[10px] font-medium",
            STATUS_STYLE[emp.employment_status] ??
              "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
          )}
        >
          {statusLabel[emp.employment_status] ?? emp.employment_status}
        </span>
      ),
      skeletonClassName: "w-20 rounded-full",
    },
    {
      key: "actions",
      header: "",
      cell: (emp) => (
        <div className="flex gap-[5px] justify-end">
          {canImpersonate && (
            <button
              title={t("nhansu.actions.loginAsUser")}
              onClick={() => setImpersonateTarget(emp)}
              className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-primary hover:bg-surface-hover cursor-pointer"
            >
              <IconLoginAs />
            </button>
          )}
          <button
            title={t("nhansu.actions.edit")}
            onClick={() => openEdit(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("nhansu.actions.delete")}
            onClick={() => setDeleteTarget(emp)}
            className="p-[5px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[100px]",
      skeletonClassName: "",
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("nhansu.title")}
        desc={t("nhansu.desc")}
        icon={<Users className="h-4 w-4" />}
        actions={
          <>
            <button
              onClick={() => loadData(page, pageSize, search, statusFilter)}
              title={t("nhansu.actions.refresh")}
              className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-[color:var(--muted-fg)] hover:bg-surface-hover cursor-pointer"
            >
              <IconRefresh />
            </button>
            <button
              onClick={openNew}
              className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
            >
              <IconPlus /> {t("nhansu.actions.add")}
            </button>
          </>
        }
      />

      {/* ── Filters ── */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <SearchInput
          placeholder={t("nhansu.searchPlaceholder")}
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[280px]"
        />
        <Combobox
          options={statusOptions}
          value={statusFilter}
          onChange={handleStatusFilter}
          placeholder={t("nhansu.status.all")}
          className="max-w-[180px]"
        />
      </div>

      {/* ── Table ── */}
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(emp) => emp.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={700}
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
        icon={<IconUser />}
        title={
          editing
            ? t("nhansu.drawer.editTitle")
            : t("nhansu.drawer.createTitle")
        }
        subtitle={editing ? editing.full_name : t("nhansu.drawer.subtitle")}
        stackOffset={policyDrawerOpen ? 22 : 0}
        zIndex={400}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          {
            label: editing
              ? t("nhansu.actions.saveChanges")
              : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("nhansu.drawer.personalInfo")}>
          <DrawerField label={t("nhansu.fields.employeeCode")}>
            <input
              type="text"
              className={inputCls}
              value={form.employee_code}
              onChange={(e) => setField("employee_code", e.target.value)}
              placeholder="VD: NV001"
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.fullName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
              placeholder={t("nhansu.placeholders.fullName")}
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.email")} required>
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="example@company.com"
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.phone")}>
            <input
              type="tel"
              className={inputCls}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="0912 345 678"
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title={t("nhansu.drawer.departmentPosition")}>
          <DrawerField label={t("nhansu.fields.department")}>
            <Combobox
              options={depts.map((d) => ({
                value: d.id,
                label: d.department_name,
              }))}
              value={form.department_id}
              onChange={(v) => setField("department_id", v)}
              placeholder={t("nhansu.placeholders.none")}
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.position")}>
            <Combobox
              options={positions.map((p) => ({
                value: p.id,
                label: p.position_name,
              }))}
              value={form.position_id}
              onChange={(v) => setField("position_id", v)}
              placeholder={t("nhansu.placeholders.none")}
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title={t("nhansu.drawer.employment")}>
          <DrawerField label={t("nhansu.fields.status")}>
            <Combobox
              options={statusOptions}
              value={form.employment_status}
              onChange={(v) => setField("employment_status", v || "active")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.hireDate")}>
            <input
              type="date"
              className={inputCls}
              value={form.hire_date}
              onChange={(e) => setField("hire_date", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("nhansu.fields.accountActive")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">
                {t("nhansu.fields.activeAccount")}
              </span>
            </label>
          </DrawerField>
        </DrawerSection>

        <DrawerSection title={t("nhansu.drawer.notes")}>
          <DrawerField label={t("nhansu.fields.internalNotes")}>
            <textarea
              className={cn(inputCls, "min-h-[70px] resize-none")}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder={t("nhansu.placeholders.notes")}
              rows={3}
            />
          </DrawerField>
        </DrawerSection>

        {editing && (
          <DrawerSection title={t("nhansu.drawer.permissions")}>
            <DrawerField label={t("nhansu.fields.baseRole")}>
              <Combobox
                options={allRoles.map((r) => ({ value: r.id, label: r.name }))}
                value={form.role_id}
                onChange={(v) => setField("role_id", v)}
                placeholder={t("nhansu.placeholders.noRole")}
              />
            </DrawerField>
            <DrawerField label={t("nhansu.fields.customPolicy")}>
              <button
                type="button"
                onClick={() => openPolicyMatrix(editing)}
                className="w-full flex items-center justify-between px-3 py-[7px] text-xs rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                <span>{t("nhansu.actions.editCustomPermissions")}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </DrawerField>
          </DrawerSection>
        )}

        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>

      {/* ── Policy permission matrix ── */}
      <PermissionMatrixDrawer
        open={policyDrawerOpen}
        role={
          policyTarget
            ? { id: policyTarget.id, name: policyTarget.full_name }
            : null
        }
        permMap={policyEditor.permMap}
        loading={policyEditor.loading}
        saving={policyEditor.saving}
        error={policyEditor.error}
        onClose={() => {
          setPolicyDrawerOpen(false);
          policyEditor.reset();
        }}
        onSave={handleSavePolicyPermissions}
        onToggle={policyEditor.toggle}
        onToggleRow={policyEditor.toggleRow}
        onToggleColumn={policyEditor.toggleColumn}
        isRowFull={policyEditor.isRowFull}
        isColumnFull={policyEditor.isColumnFull}
        onToggleAll={policyEditor.toggleAll}
        isAllFull={policyEditor.isAllFull}
        isAnyChecked={policyEditor.isAnyChecked}
        getPermissionConfig={policyEditor.getPermissionConfig}
        onPermissionConfigChange={policyEditor.updatePermissionConfig}
        onLoadCollectionFields={policyEditor.loadCollectionFields}
        zIndex={410}
        stackOffset={-56}
      />

      {/* ── Delete confirm ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t("nhansu.delete.title")}
        message={t("nhansu.delete.message").replace(
          "{0}",
          deleteTarget?.full_name ?? "",
        )}
        confirmLabel={t("nhansu.actions.delete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Impersonation confirm ── */}
      <ConfirmModal
        open={!!impersonateTarget}
        title={t("nhansu.confirm.impersonateTitle")}
        message={`${t("nhansu.confirm.impersonateBody")} ${impersonateTarget?.full_name ?? ""}`}
        confirmLabel={t("nhansu.actions.loginAsUser")}
        onConfirm={handleImpersonate}
        onCancel={() => setImpersonateTarget(null)}
        loading={impersonating}
        danger={false}
      />
    </div>
  );
}

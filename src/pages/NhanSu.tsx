import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { PageWithTabsLayout } from "@/shared/components/PageWithTabsLayout";
import { useAppStore } from "@/core/config/appStore";
import { PhongBan } from "@/pages/PhongBan";
import { ChucVu } from "@/pages/ChucVu";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable } from "@/shared/components/DataTable";
import { DEFAULT_STACK_OFFSET } from "@/shared/components/DrawerModal";
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
import { EmployeeDrawer } from "@/modules/hr/components/NhanSu/EmployeeDrawer";
import { buildEmployeeColumns } from "@/modules/hr/components/NhanSu/employeeColumns";
import {
  buildForm,
  emptyForm,
  getDirectusId,
  IconPlus,
  IconRefresh,
  STATUS_FILTER_FETCH_LIMIT,
  type EmpForm,
} from "@/modules/hr/components/NhanSu/shared";

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
  const [impersonateTarget, setImpersonateTarget] = useState<Employee | null>(
    null,
  );
  const [impersonating, setImpersonating] = useState(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [policyTarget, setPolicyTarget] = useState<Employee | null>(null);
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const policyEditor = usePermissionsEditor({
    getApi: (id) => getEmployeePermissionsApi(id),
    saveApi: (id, dto) => saveEmployeePermissionsApi(id, dto),
  });

  const statusOptions = useMemo(
    () => [
      { value: "active", label: t("nhansu.status.active") },
      { value: "inactive", label: t("nhansu.status.inactive") },
      { value: "resigned", label: t("nhansu.status.resigned") },
    ],
    [t],
  );
  const statusLabel = useMemo(
    () => ({
      active: t("nhansu.status.active"),
      inactive: t("nhansu.status.inactive"),
      resigned: t("nhansu.status.resigned"),
    }),
    [t],
  );
  const isDirty = !!form.full_name.trim() || !!form.email.trim();

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
      return;
    }
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  }
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSaveError(null);
    setDrawerOpen(true);
  };
  const openEdit = (item: Employee) => {
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  };
  const openPolicyMatrix = (emp: Employee) => {
    setPolicyTarget(emp);
    policyEditor.reset();
    setPolicyDrawerOpen(true);
    policyEditor.loadPermissions(emp.id);
  };

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

  async function handleSave() {
    if (!form.full_name.trim())
      return setSaveError(t("nhansu.errors.nameRequired"));
    if (!form.email.trim())
      return setSaveError(t("nhansu.errors.emailRequired"));
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await updateProfileApi(editing.id, buildUpdateDto(form));
      else await createEmployeeApi(buildCreateDto(form));
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadData(editing ? page : 1, pageSize, search, statusFilter);
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
      let targetId = getDirectusId(impersonateTarget);
      if (!targetId)
        targetId = getDirectusId(await getEmployeeApi(impersonateTarget.id));
      if (!targetId) {
        showToast({
          title: t("nhansu.toast.impersonateFailed"),
          description: "Nhân viên chưa liên kết tài khoản hệ thống.",
          variant: "destructive",
        });
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
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
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
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadData(page, pageSize, search, statusFilter);
    } finally {
      setDeleting(false);
    }
  }

  const columns = useMemo(
    () =>
      buildEmployeeColumns({
        t,
        canImpersonate,
        statusLabel,
        onImpersonate: setImpersonateTarget,
        onEdit: openEdit,
        onDelete: setDeleteTarget,
      }),
    [t, canImpersonate, statusLabel],
  );

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && ["nhan-vien", "phong-ban", "chuc-danh"].includes(tab)
      ? tab
      : "nhan-vien";
  });
  const { setCustomBreadcrumbs } = useAppStore();
  const tabs = [
    { value: "nhan-vien", label: t("nav.items.hrStaff") },
    { value: "phong-ban", label: t("nav.items.hrDepts") },
    { value: "chuc-danh", label: t("nav.items.hrPositions") },
  ];

  useEffect(() => {
    const tabKeyMap: Record<string, string> = {
      "nhan-vien": "nav.items.hrStaff",
      "phong-ban": "nav.items.hrDepts",
      "chuc-danh": "nav.items.hrPositions",
    };
    const key = tabKeyMap[activeTab] || "nav.items.hrStaff";
    setCustomBreadcrumbs([["breadcrumb.accounting"], ["nav.items.hr"], [key]]);
    return () => setCustomBreadcrumbs(null);
  }, [activeTab, setCustomBreadcrumbs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (!tab || !["nhan-vien", "phong-ban", "chuc-danh"].includes(tab)) {
      params.set("tab", "nhan-vien");
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", val);
    history.pushState(null, "", url.toString());
  };

  useEffect(() => {
    if (activeTab === "nhan-vien") {
      setCustomBreadcrumbs([["breadcrumb.hr"], ["breadcrumb.hrStaff"]]);
    } else if (activeTab === "phong-ban") {
      setCustomBreadcrumbs([["breadcrumb.hr"], ["breadcrumb.hrDepts"]]);
    } else if (activeTab === "chuc-danh") {
      setCustomBreadcrumbs([["breadcrumb.hr"], ["breadcrumb.hrPositions"]]);
    }
  }, [activeTab, setCustomBreadcrumbs]);

  return (
    <PageWithTabsLayout
      title={t("nav.items.hr")}
      desc={t("nhansu.desc")}
      icon={<Users className="h-4 w-4" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className={activeTab === "nhan-vien" ? "" : "hidden"}>
        <div className="flex justify-end mb-4">
          <HeaderActions
            onRefresh={() => loadData(page, pageSize, search, statusFilter)}
            onNew={openNew}
            t={t}
          />
        </div>
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
        <EmployeeDrawer
          open={drawerOpen}
          editing={editing}
          form={form}
          setForm={setForm}
          depts={depts}
          positions={positions}
          allRoles={allRoles}
          statusOptions={statusOptions}
          saving={saving}
          saveError={saveError}
          isDirty={isDirty}
          policyDrawerOpen={policyDrawerOpen}
          onClose={closeDrawer}
          onSave={handleSave}
          onOpenPolicyMatrix={openPolicyMatrix}
          t={t}
        />
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
          stackOffset={DEFAULT_STACK_OFFSET}
        />
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
      <div className={activeTab === "phong-ban" ? "" : "hidden"}>
        <PhongBan />
      </div>
      <div className={activeTab === "chuc-danh" ? "" : "hidden"}>
        <ChucVu />
      </div>
    </PageWithTabsLayout>
  );
}

function HeaderActions({
  onRefresh,
  onNew,
  t,
}: {
  onRefresh: () => void;
  onNew: () => void;
  t: ReturnType<typeof useT>;
}) {
  return (
    <>
      <button
        onClick={onRefresh}
        title={t("nhansu.actions.refresh")}
        className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-[color:var(--muted-fg)] hover:bg-surface-hover cursor-pointer"
      >
        <IconRefresh />
      </button>
      <button
        onClick={onNew}
        className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
      >
        <IconPlus /> {t("nhansu.actions.add")}
      </button>
    </>
  );
}

function buildUpdateDto(form: EmpForm): UpdateProfileRequest {
  return {
    employee_code: form.employee_code.trim() || undefined,
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    department_id: form.department_id || undefined,
    position_id: form.position_id || undefined,
    branch_id: form.branch_id || null,
    employment_status: form.employment_status,
    hire_date: form.hire_date || null,
    is_active: form.is_active,
    notes: form.notes.trim() || null,
    role_id: form.role_id || null,
  };
}
function buildCreateDto(form: EmpForm): CreateEmployeeDto {
  return {
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
}

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { PageLayout } from "@/shared/components/PageLayout";
import { SearchInput } from "@/shared/components/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Badge } from "@/shared/components/ui/badge";
import { useCoreRoles } from "@/modules/system/hooks/useCoreRoles";
import { useCorePermissionsEditor } from "@/modules/system/hooks/useCorePermissionsEditor";
import { useCoreRoleUsers } from "@/modules/system/hooks/useCoreRoleUsers";
import { CoreRoleDrawer } from "@/modules/system/components/CoreRoleDrawer";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";

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

const IconShield = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export function ErpPermissionsCorePage() {
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();

  const {
    roles,
    loading,
    error,
    total,
    totalPages,
    page,
    pageSize,
    load,
    handleSearch,
    handlePage,
    handlePageSize,
    createRole,
    updateRole,
    deleteRole,
  } = useCoreRoles();

  const {
    permMap,
    resources,
    loading: permLoading,
    error: permError,
    loadResources,
    loadPermissions,
    toggle,
    toggleRow,
    toggleColumn,
    toggleAll,
    isRowFull,
    isColumnFull,
    isAllFull,
    isAnyChecked,
    save: savePermissions,
    reset: resetPermissions,
  } = useCorePermissionsEditor();

  const {
    selectedIds: selectedUserIds,
    setSelectedIds: setSelectedUserIds,
    allUsers,
    loading: usersLoading,
    loadUsers,
    prepareNew,
    reset: resetUsers,
    save: saveUsers,
  } = useCoreRoleUsers();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    load();
    loadResources();
  }, []);

  function openNew() {
    setEditingRole(null);
    setSaveError(null);
    resetPermissions();
    setDrawerOpen(true);
    prepareNew();
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    setSaveError(null);
    resetPermissions();
    setDrawerOpen(true);
    loadPermissions(role.id);
    loadUsers(role.id);
  }

  function handleClose() {
    setDrawerOpen(false);
    resetPermissions();
    resetUsers();
  }

  async function handleSave(dto: CreateRoleDto | UpdateRoleDto) {
    setSaving(true);
    setSaveError(null);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, dto as UpdateRoleDto);
        await Promise.all([
          savePermissions(editingRole.id),
          saveUsers(editingRole.id),
        ]);
        await load();
        showToast({
          title: "Thành công",
          description: "Đã cập nhật vai trò",
          variant: "success",
        });
      } else {
        const newRole = await createRole(dto as CreateRoleDto);
        if (newRole) {
          await Promise.all([
            savePermissions(newRole.id),
            saveUsers(newRole.id),
          ]);
        }
        await load();
        showToast({
          title: "Thành công",
          description: "Đã tạo vai trò mới",
          variant: "success",
        });
      }
      setDrawerOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      showToast({
        title: "Đã xóa",
        description: deleteTarget.name,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title: "Xóa thất bại",
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function handleSearchChange(q: string) {
    setSearchInput(q);
    handleSearch(q);
  }

  const columns: DataTableColumn<Role>[] = [
    {
      key: "name",
      header: t("rbac.headers.name"),
      cell: (role) => role.name,
      className: "font-medium text-foreground whitespace-nowrap",
    },
    {
      key: "description",
      header: t("rbac.headers.description"),
      cell: (role) => role.description || "—",
      className: "text-[color:var(--muted-fg)] max-w-[300px] truncate",
    },
    {
      key: "users",
      header: t("rbac.headers.users"),
      cell: (role) => {
        const usersList = Array.isArray(role.users) ? role.users : [];
        return usersList.length > 0 ? (
          <div className="overflow-x-auto pb-1">
            <div className="flex w-max max-w-none gap-1 whitespace-nowrap">
              {usersList.map((user: any) => (
                <Badge
                  key={user.id}
                  variant="outline"
                  className="min-h-[24px] border-[#d8e0ee] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                >
                  {user.email || user.id}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[color:var(--faint)]">—</span>
        );
      },
      headerClassName: "text-center",
      className: "text-foreground max-w-[420px]",
    },
  ];

  return (
    <PageLayout
      title="Phân quyền (Core)"
      desc="Quản lý vai trò và phân quyền hệ thống sử dụng Core DB mới"
      icon={<Shield className="h-4 w-4" />}
      actions={
        <BtnPrimary onClick={openNew}>
          <IconPlus /> Tạo vai trò
        </BtnPrimary>
      }
    >
      <DataTable
        items={roles}
        columns={columns}
        getRowKey={(role) => role.id}
        loading={loading}
        error={error}
        emptyLabel={t("rbac.empty")}
        minWidth={760}
        loadingRows={5}
        actionsColumn={{
          cell: (role) => (
            <ActionDropdown
              items={[
                {
                  label: "Cấu hình",
                  icon: <IconShield />,
                  onClick: () => openEdit(role),
                },
                {
                  label: "Xóa",
                  icon: <IconTrash />,
                  onClick: () => setDeleteTarget(role),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
        filters={
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={t("rbac.searchPlaceholder")}
            className="w-[220px]"
          />
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={handlePage}
        onPageSize={handlePageSize}
      />

      <CoreRoleDrawer
        open={drawerOpen}
        editing={editingRole}
        saving={saving}
        saveError={saveError}
        onClose={handleClose}
        onSave={handleSave}
        resources={resources}
        permMap={permMap}
        permLoading={permLoading}
        permError={permError}
        onToggle={toggle}
        onToggleRow={toggleRow}
        onToggleColumn={toggleColumn}
        onToggleAll={toggleAll}
        isRowFull={isRowFull}
        isColumnFull={isColumnFull}
        isAllFull={isAllFull}
        isAnyChecked={isAnyChecked}
        selectedUserIds={selectedUserIds}
        onUsersChange={setSelectedUserIds}
        allUsers={allUsers}
        usersLoading={usersLoading}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa vai trò"
        message={
          deleteTarget
            ? `Bạn có chắc chắn muốn xóa vai trò "${deleteTarget.name}"?`
            : ""
        }
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}

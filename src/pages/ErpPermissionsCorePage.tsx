import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  PlusCircle,
  Settings,
  Trash,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { useCoreRoles } from "@/modules/system/hooks/useCoreRoles";
import { useCorePermissionsEditor } from "@/modules/system/hooks/useCorePermissionsEditor";
import { useCoreRoleUsers } from "@/modules/system/hooks/useCoreRoleUsers";
import { CoreRoleDrawer } from "@/modules/system/components/CoreRoleDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";

export function ErpPermissionsCorePage() {
  const canRead = useHasPermission("admin_users", "read");
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

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
    }),
    [],
  );

  const filterPanel = useFilterPanel(filterConfig, () => handlePage(1));

  useEffect(() => {
    handleSearch(filterPanel.state.search || "");
  }, [filterPanel.state.search]);

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

  const columns: DataTableColumn<Role>[] = useMemo(
    () => [
      {
        key: "name",
        header: t("rbac.headers.name"),
        cell: (role) => (
          <div className="flex items-center justify-between w-full gap-2 pr-1">
            <span className="truncate font-medium text-foreground">
              {role.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openEdit(role);
              }}
              className="h-6 w-6 p-0 opacity-60 hover:bg-transparent hover:text-primary hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
        className: "whitespace-nowrap text-left px-4",
        headerClassName: "text-center",
      },
      {
        key: "description",
        header: t("rbac.headers.description"),
        size: 250,
        cell: (role) => role.description || "—",
        className: "text-[color:var(--muted-fg)] truncate text-left",
        headerClassName: "text-center",
      },
      {
        key: "users",
        header: t("rbac.headers.users"),
        size: 300,
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
        className: "text-foreground text-left",
      },
    ],
    [t],
  );

  if (!canRead) return <Forbidden />;

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("nav.items.phanquyen")}
        desc="Quản lý vai trò và phân quyền hệ thống sử dụng Core DB mới"
        icon={<Shield className="h-5 w-5" />}
        tableId="erp-permissions-core-table"
        items={roles}
        columns={columns}
        getRowKey={(role) => role.id}
        loading={loading}
        error={error}
        emptyLabel={t("rbac.empty")}
        minWidth={760}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={handlePage}
        onPageSize={handlePageSize}
        onRefresh={load}
        filterConfig={filterConfig}
        filter={filterPanel}
        rowActions={(role) => [
          {
            groupLabel: "Tra cứu / Cấu hình",
            items: [
              {
                label: "Cấu hình",
                icon: <Settings className="w-3.5 h-3.5" />,
                onClick: () => openEdit(role),
              },
            ],
          },
          {
            groupLabel: "Thao tác",
            items: [
              {
                label: "Xóa",
                icon: <Trash className="w-3.5 h-3.5" />,
                variant: "danger",
                onClick: () => setDeleteTarget(role),
              },
            ],
          },
        ]}
        createActions={[
          {
            groupLabel: "Vai trò",
            items: [
              {
                label: "Tạo vai trò",
                icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
                onClick: openNew,
              },
            ],
          },
        ]}
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
    </>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Shield, PlusCircle, Trash, Eye, Pencil } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import {
  type DataTableColumn,
  TableText,
  TableDateCell,
  createColumnHeaderFilter,
} from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { useCoreRoles } from "@/modules/system/hooks/useCoreRoles";
import { useCorePermissionsEditor } from "@/modules/system/hooks/useCorePermissionsEditor";
import { useCoreRoleUsers } from "@/modules/system/hooks/useCoreRoleUsers";
import { CoreRoleDrawer } from "@/modules/system/components/CoreRoleDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";
import { getCoreRolesColumnOptionsApi } from "@/modules/system/api/rbacCoreApi";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";

export function ErpPermissionsCorePage() {
  const canRead = useHasPermission(ErpResource.ADMIN_USERS, ErpAction.READ);
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();

  const listHook = useCoreRoles();
  const {
    roles,
    loading,
    error,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    load,
    createRole,
    updateRole,
    deleteRole,
  } = listHook;

  const {
    initialPermMap,
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
    initialSelectedIds,
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
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view",
  );
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    load();
    loadResources();
  }, [load, loadResources]);

  function openNew() {
    setEditingRole(null);
    setDrawerMode("create");
    setSaveError(null);
    resetPermissions();
    setDrawerOpen(true);
    prepareNew();
  }

  function openDetail(role: Role, mode: "view" | "edit" = "view") {
    setEditingRole(role);
    setDrawerMode(mode);
    setSaveError(null);
    resetPermissions();
    setDrawerOpen(true);
    loadPermissions(role.id);
    loadUsers(role.id);
  }

  function handleToggleEdit() {
    setDrawerMode("edit");
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
          title: t("rbac.toast.successTitle", "Thành công"),
          description: t("rbac.toast.updateSuccess", "Đã cập nhật vai trò"),
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
          title: t("rbac.toast.successTitle", "Thành công"),
          description: t("rbac.toast.createSuccess", "Đã tạo vai trò mới"),
          variant: "success",
        });
      }
      setDrawerOpen(false);
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : t("rbac.toast.genericError", "Có lỗi xảy ra"),
      );
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
        title: t("rbac.toast.deleteSuccessTitle", "Đã xóa"),
        description: deleteTarget.name,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title: t("rbac.toast.deleteFailTitle", "Xóa thất bại"),
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "core-roles-column-options",
        fetchOptions: ({
          columnKey,
          search,
          pageParam,
          pageSize: ps,
          filtersStr,
        }) =>
          getCoreRolesColumnOptionsApi(
            columnKey,
            search,
            pageParam,
            ps || 20,
            filtersStr,
          ),
      }),
    [listHook],
  );

  const columns: DataTableColumn<Role>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "name",
        size: 220,
        enableResizing: true,
        header: headerFilter("name", t("rbac.headers.name", "Tên vai trò")),
        cell: (role) => (
          <TableText
            text={role.name}
            onDetailClick={() => openDetail(role, "view")}
          />
        ),
        className: "whitespace-nowrap text-left px-4",
      },
      {
        key: "description",
        size: 250,
        enableResizing: true,
        header: headerFilter(
          "description",
          t("rbac.headers.description", "Mô tả"),
          {
            showBlankOption: true,
          },
        ),
        cell: (role) => role.description || "—",
        className: "text-[color:var(--muted-fg)] truncate text-left",
      },
      {
        key: "users",
        size: 300,
        enableResizing: true,
        header: t("rbac.headers.users", "Người dùng"),
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
        className: "text-foreground text-left",
      },
      {
        key: "isActive",
        size: 130,
        enableResizing: true,
        className: "text-center",
        header: headerFilter(
          "isActive",
          t("rbac.headers.status", "Trạng thái"),
        ),
        cell: (role) => (
          <div className="flex justify-center w-full">
            <Badge
              variant={role.is_active ? "default" : "secondary"}
              className="w-[88px] inline-flex items-center justify-center text-center truncate"
            >
              {role.is_active
                ? t("rbac.status.active", "Hoạt động")
                : t("rbac.status.inactive", "Ngưng")}
            </Badge>
          </div>
        ),
      },
      {
        key: "createdAt",
        size: 150,
        enableResizing: true,
        className: "text-right",
        header: headerFilter.date(
          "createdAt",
          t("rbac.headers.createdAt", "Ngày tạo"),
        ),
        cell: (role) => (
          <TableDateCell
            date={(role as any).createdAt}
            className="justify-end w-full"
          />
        ),
      },
    ],
    [headerFilter, t],
  );

  if (!canRead) return <Forbidden />;

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("rbac.title", "Phân quyền & Vai trò")}
        desc={t(
          "rbac.desc",
          "Quản lý vai trò và phân quyền truy cập trong hệ thống",
        )}
        icon={<Shield className="h-5 w-5" />}
        tableId="erp-permissions-core-table"
        items={roles}
        columns={columns}
        getRowKey={(role) => role.id}
        loading={loading}
        error={error}
        emptyLabel={t("rbac.empty", "Chưa có vai trò nào")}
        minWidth={760}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(val) => {
          setPage(1);
          setPageSize(val);
        }}
        onRefresh={load}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={(role) => [
          {
            groupLabel: t("rbac.groupLookup", "TRA CỨU"),
            items: [
              {
                label: t("rbac.actions.viewDetail", "Chi tiết"),
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => openDetail(role, "view"),
              },
            ],
          },
          {
            groupLabel: t("rbac.groupActions", "THAO TÁC"),
            items: [
              {
                label: t("rbac.actions.edit", "Chỉnh sửa"),
                icon: <Pencil className="w-3.5 h-3.5" />,
                onClick: () => openDetail(role, "edit"),
              },
              {
                label: t("rbac.actions.delete", "Xóa"),
                icon: <Trash className="w-3.5 h-3.5" />,
                variant: "danger",
                onClick: () => setDeleteTarget(role),
              },
            ],
          },
        ]}
        createActions={[
          {
            groupLabel: t("rbac.groupRole", "Vai trò"),
            items: [
              {
                label: t("rbac.actions.createRole", "Tạo vai trò"),
                icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
                onClick: openNew,
              },
            ],
          },
        ]}
      />

      <CoreRoleDrawer
        open={drawerOpen}
        mode={drawerMode}
        onToggleEdit={handleToggleEdit}
        editing={editingRole}
        saving={saving}
        saveError={saveError}
        onClose={handleClose}
        onSave={handleSave}
        initialPermMap={initialPermMap}
        initialSelectedUserIds={initialSelectedIds}
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
        title={t("rbac.actions.deleteRole", "Xóa vai trò")}
        message={
          deleteTarget
            ? t(
                "rbac.deleteMessage",
                'Bạn chắc chắn muốn xóa vai trò "{0}"? Hành động này không thể hoàn tác.',
              ).replace("{0}", deleteTarget.name)
            : ""
        }
        confirmLabel={t("rbac.actions.delete", "Xóa")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

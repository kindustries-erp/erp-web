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
import { useRoles } from "@/modules/system/hooks/useRoles";
import { usePermissionsEditor } from "@/modules/system/hooks/usePermissionsEditor";
import { useRoleUsers } from "@/modules/system/hooks/useRoleUsers";
import { RoleDrawer } from "@/modules/system/components/RoleDrawer";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleUserSummary,
} from "@/modules/system/types/rbac";

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

// ── User email helpers ─────────────────────────────────────────────────────

function userLabelFromSummary(user: RoleUserSummary): string | null {
  return (
    user.email ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.id ||
    null
  );
}

function userEmails(role: Role, usersMap: Record<string, string>): string[] {
  if (!Array.isArray(role.users)) return [];
  const labels = role.users
    .map((user) =>
      typeof user === "string"
        ? (usersMap[user] ?? user)
        : userLabelFromSummary(user),
    )
    .filter((email): email is string => !!email);
  return Array.from(new Set(labels));
}

// ── Page ───────────────────────────────────────────────────────────────────

export function PhanQuyen() {
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();

  const {
    roles,
    loading,
    error,
    usersMap,
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
  } = useRoles();

  const {
    permMap,
    loading: permLoading,
    error: permError,
    loadPermissions,
    toggle,
    toggleRow,
    toggleColumn,
    toggleAll,
    isRowFull,
    isColumnFull,
    isAllFull,
    isAnyChecked,
    getPermissionConfig,
    updatePermissionConfig,
    loadCollectionFields,
    save: savePermissions,
    reset: resetPermissions,
  } = usePermissionsEditor();

  const {
    selectedIds: selectedUserIds,
    setSelectedIds: setSelectedUserIds,
    allUsers,
    loading: usersLoading,
    loadUsers,
    prepareNew,
    reset: resetUsers,
    save: saveUsers,
  } = useRoleUsers();

  // Role drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search input
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    load();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

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
        await Promise.all([savePermissions(), saveUsers(editingRole.id)]);
        await load();
        showToast({
          title: t("rbac.toast.updateSuccess"),
          description: (dto as UpdateRoleDto).name ?? editingRole.name,
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
          title: t("rbac.toast.createSuccess"),
          description: (dto as CreateRoleDto).name,
          variant: "success",
        });
      }
      setDrawerOpen(false);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : t("rbac.toast.unknownError"),
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
        title: t("rbac.toast.deleteSuccess"),
        description: deleteTarget.name,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title: t("rbac.toast.deleteFail"),
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
      className: "font-medium text-foreground whitespace-nowrap text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-36",
    },
    {
      key: "description",
      header: t("rbac.headers.description"),
      cell: (role) => role.description || "—",
      className:
        "text-[color:var(--muted-fg)] max-w-[300px] truncate text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-48",
    },
    {
      key: "users",
      header: t("rbac.headers.users"),
      cell: (role) => {
        const emails = userEmails(role, usersMap);
        return emails.length > 0 ? (
          <div className="overflow-x-auto pb-1">
            <div className="flex w-max max-w-none gap-1 whitespace-nowrap">
              {emails.map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="min-h-[24px] border-[#d8e0ee] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold leading-[14px] text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.04)] dark:border-[#334155] dark:bg-[#1e293b] dark:text-[#e2e8f0]"
                >
                  {email}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[color:var(--faint)]">—</span>
        );
      },
      headerClassName: "text-center",
      className: "text-foreground max-w-[420px] text-left",
      skeletonClassName: "w-56",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageLayout
      title={t("rbac.title")}
      desc={t("rbac.desc")}
      icon={<Shield className="h-4 w-4" />}
      actions={
        <BtnPrimary onClick={openNew}>
          <IconPlus /> {t("rbac.create")}
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
                  label: t("rbac.actions.authorize"),
                  icon: <IconShield />,
                  onClick: () => openEdit(role),
                },
                {
                  label: t("rbac.actions.delete"),
                  icon: <IconTrash />,
                  onClick: () => setDeleteTarget(role),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
        filters={
          <>
            <SearchInput
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("rbac.searchPlaceholder")}
              className="w-[220px] max-[480px]:w-full"
            />
            {total > 0 && (
              <span className="text-xs text-[color:var(--muted-fg)] ml-auto self-center">
                {t("rbac.total").replace("{0}", String(total))}
              </span>
            )}
          </>
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={handlePage}
        onPageSize={handlePageSize}
      />
      {/* Role create / edit drawer (includes permission matrix) */}
      <RoleDrawer
        open={drawerOpen}
        editing={editingRole}
        saving={saving}
        saveError={saveError}
        onClose={handleClose}
        onSave={handleSave}
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
        getPermissionConfig={getPermissionConfig}
        onPermissionConfigChange={updatePermissionConfig}
        onLoadCollectionFields={loadCollectionFields}
        selectedUserIds={selectedUserIds}
        onUsersChange={setSelectedUserIds}
        allUsers={allUsers}
        usersLoading={usersLoading}
      />
      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={
          deleteTarget
            ? t("rbac.deleteMessage").replace("{0}", deleteTarget.name)
            : ""
        }
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}

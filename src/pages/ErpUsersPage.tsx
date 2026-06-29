import { useCallback, useEffect, useMemo, useState } from "react";

import { Shield } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  DrawerAction,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Combobox } from "@/shared/components/Combobox";

import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useUIStore } from "@/core/config/uiStore";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import {
  auditCoreApi,
  employeeSelectApi,
  type AuditLogEntry,
  type CoreUserAdmin,
  type ErpEmployee,
  usersAdminApi,
} from "@/modules/system/api/usersCoreApi";
import { useT } from "@/core/i18n";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function ErpUsersPage() {
  const t = useT();
  const canRead = useHasPermission("admin_users", "read");
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<CoreUserAdmin[]>([]);
  const [employees, setEmployees] = useState<ErpEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<CoreUserAdmin | null>(null);
  const [selectedUser, setSelectedUser] = useState<CoreUserAdmin | null>(null);
  const [timeline, setTimeline] = useState<AuditLogEntry[]>([]);
  const [form, setForm] = useState({ email: "", password: "", employeeId: "" });
  const [impersonateTarget, setImpersonateTarget] =
    useState<CoreUserAdmin | null>(null);

  const canImpersonate = useAuthStore((s) => s.canImpersonate);
  const impersonateAction = useAuthStore((s) => s.impersonateAction);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: [
          { value: "ACTIVE", label: t("Hoạt động (ACTIVE)") },
          { value: "INACTIVE", label: t("Ngưng (INACTIVE)") },
        ],
        placeholder: t("Tất cả trạng thái"),
      },
    }),
    [t],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const search = filter.state.search;
  const status = filter.state.status;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAdminApi.list({
        page,
        pageSize,
        search,
        status: status || undefined,
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: t("Không tải được user"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("Lỗi không xác định"),
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, showToast, status]);

  const loadEmployees = useCallback(async () => {
    try {
      const rows = await employeeSelectApi.list();
      setEmployees(rows);
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  async function openDetail(user: CoreUserAdmin) {
    setSelectedUser(user);
    setDetailOpen(true);
    setTimelineLoading(true);
    try {
      const rows = await auditCoreApi.getEntityTimeline("core_user", user.id);
      setTimeline(rows);
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  }

  async function handleSave() {
    if (!editingUser) {
      if (!form.email.trim() || !form.password.trim()) {
        showToast({
          variant: "destructive",
          title: t("Thiếu thông tin"),
          description: t("Cần nhập email và mật khẩu"),
        });
        return;
      }
    }
    setCreating(true);
    try {
      if (editingUser) {
        await usersAdminApi.update(editingUser.id, {
          employeeId: form.employeeId || null,
        });
        showToast({
          title: t("Đã cập nhật user"),
          description: form.email.trim(),
        });
      } else {
        await usersAdminApi.create({
          email: form.email.trim(),
          password: form.password,
          employeeId: form.employeeId || undefined,
        });
        showToast({ title: t("Đã tạo user"), description: form.email.trim() });
      }
      setDrawerOpen(false);
      setForm({ email: "", password: "", employeeId: "" });
      setEditingUser(null);
      await loadUsers();
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: editingUser
          ? t("Cập nhật user thất bại")
          : t("Tạo user thất bại"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("Lỗi không xác định"),
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleActivate(user: CoreUserAdmin) {
    await usersAdminApi.activate(user.id);
    showToast({ title: t("Đã kích hoạt user"), description: user.email });
    await loadUsers();
  }

  async function handleDeactivate(user: CoreUserAdmin) {
    await usersAdminApi.deactivate(user.id);
    showToast({ title: t("Đã ngưng user"), description: user.email });
    await loadUsers();
  }

  async function handleResetPassword(user: CoreUserAdmin) {
    const nextPassword = window.prompt(
      `${t("Nhập mật khẩu mới cho")} ${user.email}`,
    );
    if (!nextPassword) return;
    await usersAdminApi.resetPassword(user.id, nextPassword);
    showToast({ title: t("Đã reset password"), description: user.email });
  }

  const columns: DataTableColumn<CoreUserAdmin>[] = useMemo(
    () => [
      {
        key: "email",
        header: "Email",
        className: "text-left",
        headerClassName: "text-center",
        cell: (item) => <span className="font-medium">{item.email}</span>,
      },
      {
        key: "employee",
        header: "Employee linked",
        className: "text-left",
        headerClassName: "text-center",
        cell: (item) =>
          item.employee
            ? `${item.employee.fullName} (${item.employee.employeeCode})`
            : "—",
      },
      {
        key: "lastLoginAt",
        header: t("Lần đăng nhập cuối"),
        className: "text-right",
        headerClassName: "text-center",
        cell: (item) => formatDate(item.lastLoginAt),
      },
      {
        key: "status",
        header: t("Trạng thái"),
        className: "text-center",
        headerClassName: "text-center",
        cell: (item) => (
          <div className="flex justify-center w-full">
            <span
              className={
                item.status === "ACTIVE"
                  ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                  : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
              }
            >
              {item.status}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  const drawerActions: DrawerAction[] = [
    {
      label: t("Đóng"),
      onClick: () => setDrawerOpen(false),
      variant: "outline",
      disabled: creating,
    },
    {
      label: creating
        ? t("Đang lưu...")
        : editingUser
          ? t("Cập nhật user")
          : t("Tạo user"),
      onClick: () => void handleSave(),
      primary: true,
      disabled: creating,
    },
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("Quản lý người dùng")}
      desc={t("Tạo user production-grade và xem timeline audit theo từng user")}
      icon={<Shield className="h-4 w-4" />}
      actions={
        <TableActionGroup
          onRefresh={() => void loadUsers()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={() => {
            void loadEmployees();
            setEditingUser(null);
            setForm({ email: "", password: "", employeeId: "" });
            setDrawerOpen(true);
          }}
          createLabel={t("Tạo user")}
        />
      }
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            emptyLabel={t("Chưa có user")}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={Math.ceil(total / pageSize)}
            onPage={setPage}
            onPageSize={(value) => {
              setPage(1);
              setPageSize(value);
            }}
            actionsColumn={{
              cell: (raw) => {
                const item = raw as CoreUserAdmin;
                return (
                  <ActionDropdown
                    items={[
                      {
                        label: t("Chỉnh sửa"),
                        onClick: () => {
                          void loadEmployees();
                          setEditingUser(item);
                          setForm({
                            email: item.email,
                            password: "",
                            employeeId: item.employeeId || "",
                          });
                          setDrawerOpen(true);
                        },
                      },
                      {
                        label: t("Xem chi tiết"),
                        onClick: () => void openDetail(item),
                      },
                      ...(canImpersonate &&
                      item.email !== "admin@liouni.com" &&
                      item.status === "ACTIVE"
                        ? [
                            {
                              label: t("Login as user"),
                              onClick: () => setImpersonateTarget(item),
                            },
                          ]
                        : []),
                      ...(item.status === "ACTIVE"
                        ? [
                            {
                              label: t("Ngưng hoạt động"),
                              onClick: () => void handleDeactivate(item),
                            },
                          ]
                        : [
                            {
                              label: t("Kích hoạt"),
                              onClick: () => void handleActivate(item),
                            },
                          ]),
                      {
                        label: t("Reset password"),
                        onClick: () => void handleResetPassword(item),
                      },
                    ]}
                  />
                );
              },
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <StandardFormDrawer
        open={drawerOpen}
        mode={editingUser ? "edit" : "create"}
        onClose={() => setDrawerOpen(false)}
        title={editingUser ? t("Cập nhật user") : t("Tạo user mới")}
        subtitle={t("Flow production-grade cho ERP CORE")}
        actions={drawerActions}
        layout="1-column"
        leftPanel={
          <DrawerSection title={t("Thông tin user")}>
            <DrawerField label="Email" required>
              <input
                className={inputCls}
                value={form.email}
                disabled={!!editingUser}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </DrawerField>
            {!editingUser && (
              <DrawerField label={t("Mật khẩu")} required>
                <input
                  type="password"
                  className={inputCls}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder={t("Tối thiểu 8 ký tự")}
                />
              </DrawerField>
            )}
            <DrawerField label={t("Liên kết employee")}>
              <Combobox
                options={employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.fullName} (${emp.employeeCode})`,
                }))}
                value={form.employeeId}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, employeeId: val }))
                }
                placeholder={t("Không liên kết")}
              />
            </DrawerField>
          </DrawerSection>
        }
      />

      <StandardFormDrawer
        open={detailOpen}
        mode="view"
        onClose={() => setDetailOpen(false)}
        title={selectedUser?.email || t("Chi tiết user")}
        subtitle={t("Timeline audit theo core_user")}
        actions={[
          {
            label: t("Đóng"),
            onClick: () => setDetailOpen(false),
            primary: true,
          },
        ]}
        layout="1-column"
        leftPanel={
          <>
            <DrawerSection title={t("Thông tin hiện tại")}>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedUser?.email}
                </div>
                <div>
                  <span className="font-medium">{t("Trạng thái:")}</span>{" "}
                  {selectedUser?.status}
                </div>
                <div>
                  <span className="font-medium">Employee:</span>{" "}
                  {selectedUser?.employee
                    ? `${selectedUser.employee.fullName} (${selectedUser.employee.employeeCode})`
                    : "—"}
                </div>
                <div>
                  <span className="font-medium">Last login:</span>{" "}
                  {formatDate(selectedUser?.lastLoginAt ?? null)}
                </div>
              </div>
            </DrawerSection>
            <DrawerSection title={t("Timeline audit")}>
              {timelineLoading ? (
                <div className="text-sm text-muted-foreground">
                  {t("Đang tải timeline...")}
                </div>
              ) : timeline.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {t("Chưa có log")}
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border bg-surface p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{entry.actionType}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.actorEmail || "system"} • {entry.status}
                      </div>
                      {entry.message ? (
                        <div className="mt-2 text-sm">{entry.message}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </>
        }
      />

      <ConfirmModal
        open={!!impersonateTarget}
        title={t("Xác nhận Login as")}
        message={`${t("Bạn có chắc chắn muốn đăng nhập dưới quyền user")} ${impersonateTarget?.email}? ${t("Hành động này sẽ được ghi log.")}`}
        confirmLabel="Login as"
        onConfirm={async () => {
          if (!impersonateTarget) return;
          try {
            await impersonateAction(impersonateTarget.id);
            setImpersonateTarget(null);
          } catch {
            // Error is handled in authStore
          }
        }}
        onCancel={() => setImpersonateTarget(null)}
      />
    </PageLayout>
  );
}

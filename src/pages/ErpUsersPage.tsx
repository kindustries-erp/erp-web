import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Shield,
  PlusCircle,
  Eye,
  EyeOff,
  LogIn,
  Ban,
  CheckCircle,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  DrawerAction,
  DrawerField,
  DrawerRow,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerRelatedTabItem,
} from "@/shared/components/StandardFormDrawer";
import { History } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
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
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CoreUserAdmin | null>(null);
  const [timeline, setTimeline] = useState<AuditLogEntry[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [impersonateTarget, setImpersonateTarget] =
    useState<CoreUserAdmin | null>(null);

  const isEditMode = drawerMode === "edit";
  const isCreateMode = drawerMode === "create";
  const isViewMode = drawerMode === "view";

  const isFormDirty = useMemo(() => {
    if (isEditMode && selectedUser) {
      return form.employeeId !== (selectedUser.employeeId || "");
    }
    if (isCreateMode) {
      return (
        form.email !== "" ||
        form.password !== "" ||
        form.confirmPassword !== "" ||
        form.employeeId !== ""
      );
    }
    return false;
  }, [form, isCreateMode, isEditMode, selectedUser]);

  function resetDrawerState() {
    setUserDrawerOpen(false);
    setDrawerMode("create");
    setSelectedUser(null);
    setTimeline([]);
    setTimelineLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setForm({ email: "", password: "", confirmPassword: "", employeeId: "" });
  }

  function handleCloseDrawer() {
    if (!isViewMode && isFormDirty) {
      setCloseConfirmOpen(true);
    } else {
      resetDrawerState();
    }
  }

  function handleConfirmClose() {
    setCloseConfirmOpen(false);
    resetDrawerState();
  }

  const impersonateAction = useAuthStore((s) => s.impersonateAction);
  const canImpersonate = useAuthStore((s) => s.canImpersonate);

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

  async function openViewDrawer(user: CoreUserAdmin) {
    setSelectedUser(user);
    setDrawerMode("view");
    setUserDrawerOpen(true);
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

  async function openCreateDrawer() {
    await loadEmployees();
    setSelectedUser(null);
    setDrawerMode("create");
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      employeeId: "",
    });
    setUserDrawerOpen(true);
  }

  function handleToggleToEdit() {
    if (!selectedUser) return;
    setDrawerMode("edit");
    setForm({
      email: selectedUser.email,
      password: "",
      confirmPassword: "",
      employeeId: selectedUser.employeeId || "",
    });
  }

  async function handleSave() {
    if (isCreateMode) {
      if (!form.email.trim() || !form.password.trim()) {
        showToast({
          variant: "destructive",
          title: t("Thiếu thông tin"),
          description: t("Vui lòng nhập email và mật khẩu"),
        });
        return;
      }
      if (form.password !== form.confirmPassword) {
        showToast({
          variant: "destructive",
          title: t("Lỗi nhập liệu"),
          description: t("Xác nhận mật khẩu không khớp"),
        });
        return;
      }
    }

    if (isEditMode && !selectedUser) return;

    setCreating(true);
    try {
      if (isEditMode && selectedUser) {
        await usersAdminApi.update(selectedUser.id, {
          employeeId: form.employeeId || null,
        });
        showToast({
          title: t("Đã cập nhật user"),
          description: selectedUser.email,
        });
      } else {
        await usersAdminApi.create({
          email: form.email.trim(),
          password: form.password,
          employeeId: form.employeeId || undefined,
        });
        showToast({ title: t("Đã tạo user"), description: form.email.trim() });
      }
      resetDrawerState();
      await loadUsers();
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: isEditMode
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

  const drawerActions: DrawerAction[] = isViewMode
    ? [
        {
          label: t("Đóng"),
          onClick: handleCloseDrawer,
          primary: true,
        },
      ]
    : [
        {
          label: t("Đóng"),
          onClick: handleCloseDrawer,
          variant: "outline",
          disabled: creating,
        },
        {
          label: creating
            ? t("Đang lưu...")
            : isEditMode
              ? t("Cập nhật user")
              : t("Tạo user"),
          onClick: () => void handleSave(),
          primary: true,
          disabled: creating,
        },
      ];

  if (!canRead) return <Forbidden />;

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("Quản lý người dùng")}
        desc={t(
          "Tạo user production-grade và xem timeline audit theo từng user",
        )}
        icon={<Shield className="h-4 w-4" />}
        tableId="erp-users-table-v2"
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        emptyLabel={t("Chưa có user")}
        minWidth={760}
        actionColumnSize={40}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
        onPage={setPage}
        onPageSize={(value) => {
          setPage(1);
          setPageSize(value);
        }}
        onRefresh={() => void loadUsers()}
        filterConfig={filterConfig}
        filter={filter}
        createActions={[
          {
            groupLabel: t("Người dùng"),
            items: [
              {
                label: t("Tạo user"),
                icon: <PlusCircle className="h-4 w-4 text-emerald-600" />,
                onClick: () => void openCreateDrawer(),
              },
            ],
          },
        ]}
        rowActions={(item) => [
          {
            groupLabel: t("Tra cứu"),
            items: [
              {
                label: t("Chi tiết user"),
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => void openViewDrawer(item),
              },
            ],
          },
          {
            groupLabel: t("Hành động"),
            items: [
              ...(canImpersonate &&
              item.email !== "admin@liouni.com" &&
              item.status === "ACTIVE"
                ? [
                    {
                      label: t("Đăng nhập dưới quyền"),
                      icon: <LogIn className="w-3.5 h-3.5" />,
                      onClick: () => setImpersonateTarget(item),
                    },
                  ]
                : []),
              ...(item.status === "ACTIVE"
                ? [
                    {
                      label: t("Ngưng hoạt động"),
                      icon: <Ban className="w-3.5 h-3.5 text-destructive" />,
                      onClick: () => void handleDeactivate(item),
                    },
                  ]
                : [
                    {
                      label: t("Kích hoạt"),
                      icon: (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ),
                      onClick: () => void handleActivate(item),
                    },
                  ]),
            ],
          },
        ]}
      />

      <StandardFormDrawer
        open={userDrawerOpen}
        mode={drawerMode}
        onClose={handleCloseDrawer}
        onToggleEdit={isViewMode ? handleToggleToEdit : undefined}
        confirmOnClose={!isViewMode && isFormDirty}
        title={
          isCreateMode
            ? t("Tạo user mới")
            : isEditMode
              ? t("Cập nhật user")
              : selectedUser?.email || t("Chi tiết user")
        }
        subtitle={
          isViewMode
            ? t("Timeline audit theo core_user")
            : t("Flow production-grade cho ERP CORE")
        }
        actions={drawerActions}
        layout="1-column"
        relatedTabs={
          isViewMode
            ? [
                {
                  key: "history",
                  label: t("Timeline audit"),
                  icon: <History className="w-3.5 h-3.5" />,
                  badgeCount: timeline.length,
                  content: (
                    <DrawerAuditTimeline
                      items={timeline.map((entry) => ({
                        id: entry.id,
                        actionType: entry.actionType,
                        actorEmail: entry.actorEmail || "system",
                        timestamp: entry.createdAt,
                        status: entry.status,
                        message: entry.message || undefined,
                      }))}
                      loading={timelineLoading}
                      emptyLabel={t("Chưa có log")}
                    />
                  ),
                },
              ]
            : undefined
        }
        leftPanel={
          isViewMode ? (
            <DrawerSection title={t("Thông tin hiện tại")}>
              <DrawerRow label="Email" value={selectedUser?.email || "—"} />
              <DrawerRow
                label={t("Trạng thái")}
                value={selectedUser?.status || "—"}
              />
              <DrawerRow
                label="Employee"
                value={
                  selectedUser?.employee
                    ? `${selectedUser.employee.fullName} (${selectedUser.employee.employeeCode})`
                    : "—"
                }
              />
              <DrawerRow
                label="Last login"
                value={formatDate(selectedUser?.lastLoginAt ?? null)}
              />
            </DrawerSection>
          ) : (
            <DrawerSection title={t("Thông tin user")}>
              <DrawerField label="Email" required>
                <input
                  className={inputCls}
                  value={form.email}
                  disabled={isEditMode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@example.com"
                />
              </DrawerField>
              {isCreateMode && (
                <>
                  <DrawerField label={t("Mật khẩu")} required>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={inputCls}
                        value={form.password}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder={t("Tối thiểu 8 ký tự")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </DrawerField>
                  <DrawerField label={t("Xác nhận mật khẩu")} required>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={inputCls}
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder={t("Nhập lại mật khẩu")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </DrawerField>
                </>
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
          )
        }
      />

      <ConfirmModal
        open={!!impersonateTarget}
        title={t("Đăng nhập với tư cách user này?")}
        message={
          t("Bạn sẽ truy cập hệ thống với các quyền của ") +
          (impersonateTarget?.email || "")
        }
        confirmLabel={t("Đăng nhập")}
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

      <ConfirmModal
        open={closeConfirmOpen}
        title={t("Chưa lưu thay đổi")}
        message={t(
          "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn đóng và hủy bỏ các thay đổi này không?",
        )}
        confirmLabel={t("Đóng")}
        onConfirm={handleConfirmClose}
        onCancel={() => setCloseConfirmOpen(false)}
      />
    </>
  );
}

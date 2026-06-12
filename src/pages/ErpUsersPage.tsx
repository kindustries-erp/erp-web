import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield, UserPlus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import { useUIStore } from "@/core/config/uiStore";
import {
  auditCoreApi,
  employeeSelectApi,
  type AuditLogEntry,
  type CoreUserAdmin,
  type ErpEmployee,
  usersAdminApi,
} from "@/modules/system/api/usersCoreApi";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function ErpUsersPage() {
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<CoreUserAdmin[]>([]);
  const [employees, setEmployees] = useState<ErpEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CoreUserAdmin | null>(null);
  const [timeline, setTimeline] = useState<AuditLogEntry[]>([]);
  const [form, setForm] = useState({ email: "", password: "", employeeId: "" });

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
        title: "Không tải được user",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi không xác định",
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

  async function handleCreate() {
    if (!form.email.trim() || !form.password.trim()) {
      showToast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Cần nhập email và mật khẩu",
      });
      return;
    }
    setCreating(true);
    try {
      await usersAdminApi.create({
        email: form.email.trim(),
        password: form.password,
        employeeId: form.employeeId || undefined,
      });
      showToast({ title: "Đã tạo user", description: form.email.trim() });
      setDrawerOpen(false);
      setForm({ email: "", password: "", employeeId: "" });
      await loadUsers();
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: "Tạo user thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi không xác định",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleActivate(user: CoreUserAdmin) {
    await usersAdminApi.activate(user.id);
    showToast({ title: "Đã kích hoạt user", description: user.email });
    await loadUsers();
  }

  async function handleDeactivate(user: CoreUserAdmin) {
    await usersAdminApi.deactivate(user.id);
    showToast({ title: "Đã ngưng user", description: user.email });
    await loadUsers();
  }

  async function handleResetPassword(user: CoreUserAdmin) {
    const nextPassword = window.prompt(`Nhập mật khẩu mới cho ${user.email}`);
    if (!nextPassword) return;
    await usersAdminApi.resetPassword(user.id, nextPassword);
    showToast({ title: "Đã reset password", description: user.email });
  }

  const columns: DataTableColumn<CoreUserAdmin>[] = useMemo(
    () => [
      {
        key: "email",
        header: "Email",
        cell: (item) => <span className="font-medium">{item.email}</span>,
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (item) => (
          <span
            className={
              item.status === "ACTIVE"
                ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
            }
          >
            {item.status}
          </span>
        ),
      },
      {
        key: "employee",
        header: "Employee linked",
        cell: (item) =>
          item.employee
            ? `${item.employee.fullName} (${item.employee.employeeCode})`
            : "—",
      },
      {
        key: "lastLoginAt",
        header: "Lần đăng nhập cuối",
        cell: (item) => formatDate(item.lastLoginAt),
      },
    ],
    [],
  );

  const drawerActions: DrawerAction[] = [
    {
      label: "Đóng",
      onClick: () => setDrawerOpen(false),
      variant: "outline",
      disabled: creating,
    },
    {
      label: creating ? "Đang tạo..." : "Tạo user",
      onClick: () => void handleCreate(),
      primary: true,
      disabled: creating,
    },
  ];

  return (
    <PageLayout
      title="Quản lý người dùng"
      desc="Tạo user production-grade và xem timeline audit theo từng user"
      icon={<Shield className="h-4 w-4" />}
      actions={
        <Button size="sm" onClick={() => setDrawerOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Tạo user
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo email..."
            className="w-full max-w-md"
          />
          <select
            className={inputCls + " w-[180px]"}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadUsers()}
          >
            Lọc
          </Button>
        </div>

        <DataTable
          items={items}
          columns={columns}
          getRowKey={(item) => item.id}
          loading={loading}
          emptyLabel="Chưa có user"
          actionsColumn={{
            cell: (raw) => {
              const item = raw as CoreUserAdmin;
              return (
                <ActionDropdown
                  items={[
                    {
                      label: "Xem chi tiết",
                      onClick: () => void openDetail(item),
                    },
                    ...(item.status === "ACTIVE"
                      ? [
                          {
                            label: "Ngưng hoạt động",
                            onClick: () => void handleDeactivate(item),
                          },
                        ]
                      : [
                          {
                            label: "Kích hoạt",
                            onClick: () => void handleActivate(item),
                          },
                        ]),
                    {
                      label: "Reset password",
                      onClick: () => void handleResetPassword(item),
                    },
                  ]}
                />
              );
            },
          }}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng: {total}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span>Trang {page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={items.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo user mới"
        subtitle="Flow production-grade cho ERP CORE"
        actions={drawerActions}
      >
        <DrawerSection title="Thông tin user">
          <DrawerField label="Email" required>
            <input
              className={inputCls}
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="user@example.com"
            />
          </DrawerField>
          <DrawerField label="Mật khẩu" required>
            <input
              type="password"
              className={inputCls}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Tối thiểu 8 ký tự"
            />
          </DrawerField>
          <DrawerField label="Liên kết employee">
            <select
              className={inputCls}
              value={form.employeeId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, employeeId: e.target.value }))
              }
            >
              <option value="">Không liên kết</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </DrawerField>
        </DrawerSection>
      </DrawerModal>

      <DrawerModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedUser?.email || "Chi tiết user"}
        subtitle="Timeline audit theo core_user"
        actions={[
          { label: "Đóng", onClick: () => setDetailOpen(false), primary: true },
        ]}
      >
        <DrawerSection title="Thông tin hiện tại">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Email:</span> {selectedUser?.email}
            </div>
            <div>
              <span className="font-medium">Trạng thái:</span>{" "}
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
        <DrawerSection title="Timeline audit">
          {timelineLoading ? (
            <div className="text-sm text-muted-foreground">
              Đang tải timeline...
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có log</div>
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
      </DrawerModal>
    </PageLayout>
  );
}

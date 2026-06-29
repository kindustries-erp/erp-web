import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Pencil, Ban, CheckCircle } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DrawerAction,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";

import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useUIStore } from "@/core/config/uiStore";
import {
  employeesCoreApi,
  type CreateEmployeeCoreDto,
  type UpdateEmployeeCoreDto,
} from "@/modules/system/api/employeesCoreApi";
import type { ErpEmployee } from "@/modules/system/api/usersCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function ErpEmployeesPage() {
  const canRead = useHasPermission("employees", "read");
  const showToast = useUIStore((s) => s.showToast);
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();

  const [items, setItems] = useState<ErpEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const drawerStore = useDrawerStore();
  const isThisDrawerOpen =
    drawerStore.isOpen && drawerStore.type === "employee";
  const viewOnly = drawerStore.mode === "view";
  const isEditing = drawerStore.mode !== "create";
  const editingData = drawerStore.entityData as ErpEmployee | null;

  const [form, setForm] = useState<CreateEmployeeCoreDto>({
    employeeCode: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    startDate: "",
    leaveDate: "",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    if (isThisDrawerOpen) {
      if (editingData) {
        setForm({
          employeeCode: editingData.employeeCode || "",
          fullName: editingData.fullName,
          email: editingData.email || "",
          phone: editingData.phone || "",
          address: editingData.address || "",
          startDate: editingData.startDate || "",
          leaveDate: editingData.leaveDate || "",
          status: editingData.status || "ACTIVE",

          notes: (editingData as any).notes || "",
        });
      } else {
        setForm({
          employeeCode: "",
          fullName: "",
          email: "",
          phone: "",
          address: "",
          startDate: "",
          leaveDate: "",
          status: "ACTIVE",
          notes: "",
        });
      }
    }
  }, [isThisDrawerOpen, editingData]);

  useEffect(() => {
    setCustomBreadcrumbs([
      [t("breadcrumb.system")],
      [t("breadcrumb.erpEmployees")],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs, t]);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: [
          { value: "ACTIVE", label: "Hoạt động (ACTIVE)" },
          { value: "INACTIVE", label: "Ngưng (INACTIVE)" },
        ],
        placeholder: "Tất cả trạng thái",
      },
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const search = filter.state.search;
  const status = filter.state.status;

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesCoreApi.list({
        page,
        pageSize,
        search,
      });
      // Handle client-side status filtering if backend doesn't support it yet
      let filtered = res.items;
      if (status) {
        filtered = filtered.filter((emp) => emp.status === status);
      }
      setItems(filtered);
      setTotal(status ? filtered.length : res.total);
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: "Không tải được dữ liệu",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status, showToast]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  async function handleSave() {
    if (!form.fullName.trim()) {
      showToast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Cần nhập họ tên nhân viên",
      });
      return;
    }
    const payload = { ...form };

    if (!payload.startDate) payload.startDate = null as any;

    if (!payload.leaveDate) payload.leaveDate = null as any;

    setSaving(true);
    try {
      if (isEditing && editingData) {
        await employeesCoreApi.update(
          editingData.id,
          payload as UpdateEmployeeCoreDto,
        );
        showToast({
          title: "Đã cập nhật nhân viên",
          description: payload.fullName.trim(),
        });
      } else {
        await employeesCoreApi.create(payload);
        showToast({
          title: "Đã tạo nhân viên",
          description: payload.fullName.trim(),
        });
      }
      drawerStore.closeDrawer();
      await loadEmployees();
    } catch (error: any) {
      showToast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu nhân viên",
      });
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<ErpEmployee>[] = [
    {
      key: "code",
      header: "Mã nhân viên",
      cell: (item) => (
        <span className="font-medium text-foreground">
          {item.employeeCode || "—"}
        </span>
      ),
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "name",
      header: "Họ tên",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.fullName}</span>
          {item.email && (
            <span className="text-xs text-muted-foreground">{item.email}</span>
          )}
        </div>
      ),
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "phone",
      header: "Điện thoại",
      cell: (item) => item.phone || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu",
      cell: (item) =>
        item.startDate
          ? new Date(item.startDate).toLocaleDateString("vi-VN")
          : "—",
      className: "text-right",
      headerClassName: "text-center",
    },
    {
      key: "status",
      header: "Trạng thái",
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
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("nav.items.erpEmployees")}
      desc="Danh sách nhân viên công ty"
      icon={<Users className="w-4 h-4" />}
      actions={
        <TableActionGroup
          onRefresh={loadEmployees}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={() => {
            drawerStore.openDrawer("employee", "create");
          }}
          createLabel="Thêm mới"
        />
      }
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            onRowClick={(item) =>
              drawerStore.openDrawer("employee", "view", item.id, item)
            }
            loading={loading}
            emptyLabel="Chưa có nhân viên"
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
              cell: (item) => (
                <ActionDropdown
                  items={[
                    {
                      label: "Chỉnh sửa",
                      icon: <Pencil size={14} />,
                      onClick: () => {
                        drawerStore.openDrawer(
                          "employee",
                          "edit",
                          item.id,
                          item,
                        );
                      },
                    },
                    ...(item.status === "ACTIVE"
                      ? [
                          {
                            label: "Ngưng hoạt động",
                            icon: (
                              <Ban size={14} className="text-destructive" />
                            ),
                            variant: "danger" as const,
                            onClick: async () => {
                              try {
                                await employeesCoreApi.update(item.id, {
                                  status: "INACTIVE",
                                });
                                showToast({
                                  title: "Đã ngưng hoạt động nhân viên",
                                });
                                void loadEmployees();
                              } catch (e: any) {
                                showToast({
                                  variant: "destructive",
                                  title: "Lỗi",
                                  description: e.message,
                                });
                              }
                            },
                          },
                        ]
                      : [
                          {
                            label: "Kích hoạt lại",
                            icon: (
                              <CheckCircle size={14} className="text-success" />
                            ),
                            onClick: async () => {
                              try {
                                await employeesCoreApi.update(item.id, {
                                  status: "ACTIVE",
                                });
                                showToast({ title: "Đã kích hoạt nhân viên" });
                                void loadEmployees();
                              } catch (e: any) {
                                showToast({
                                  variant: "destructive",
                                  title: "Lỗi",
                                  description: e.message,
                                });
                              }
                            },
                          },
                        ]),
                  ]}
                />
              ),
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <StandardFormDrawer
        open={isThisDrawerOpen}
        mode={drawerStore.mode}
        onClose={() => drawerStore.closeDrawer()}
        onToggleEdit={() => drawerStore.setMode("edit")}
        title={isEditing ? "Cập nhật nhân viên" : "Tạo nhân viên"}
        actions={
          viewOnly
            ? [
                {
                  label: "Đóng",
                  variant: "outline",
                  onClick: () => drawerStore.closeDrawer(),
                },
              ]
            : [
                {
                  label: "Hủy",
                  variant: "outline",
                  onClick: () => drawerStore.closeDrawer(),
                },
                {
                  label: isEditing ? "Lưu thay đổi" : "Tạo",
                  primary: true,
                  loading: saving,
                  onClick: handleSave,
                },
              ]
        }
        rightPanelTitle="Hệ thống"
        leftPanel={
          <DrawerSection title="Thông tin nhân viên">
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Mã nhân viên" required>
                <input
                  className={inputCls}
                  value={form.employeeCode}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm({ ...form, employeeCode: e.target.value })
                  }
                  placeholder="NV001"
                />
              </DrawerField>
              <DrawerField label="Họ tên" required>
                <input
                  className={inputCls}
                  value={form.fullName}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Email">
                <input
                  className={inputCls}
                  type="email"
                  value={form.email}
                  disabled={viewOnly}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </DrawerField>
              <DrawerField label="Số điện thoại">
                <input
                  className={inputCls}
                  value={form.phone}
                  disabled={viewOnly}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="09..."
                />
              </DrawerField>
            </div>
            <DrawerField label="Địa chỉ">
              <input
                className={inputCls}
                value={form.address || ""}
                disabled={viewOnly}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Đường A..."
              />
            </DrawerField>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Ngày bắt đầu">
                <DatePicker
                  value={form.startDate || ""}
                  disabled={viewOnly}
                  onChange={(val) => setForm({ ...form, startDate: val })}
                  placeholder="Chọn ngày"
                />
              </DrawerField>
              <DrawerField label="Ngày nghỉ">
                <DatePicker
                  value={form.leaveDate || ""}
                  disabled={viewOnly}
                  onChange={(val) => setForm({ ...form, leaveDate: val })}
                  placeholder="Chọn ngày"
                />
              </DrawerField>
            </div>
          </DrawerSection>
        }
        rightPanel={
          <>
            <DrawerField label="Trạng thái">
              <Combobox
                options={[
                  { value: "ACTIVE", label: "Hoạt động" },
                  { value: "INACTIVE", label: "Ngưng hoạt động" },
                ]}
                value={form.status || "ACTIVE"}
                disabled={viewOnly}
                onChange={(val) =>
                  setForm({ ...form, status: val || "ACTIVE" })
                }
                allowClear={false}
              />
            </DrawerField>
            <DrawerField label="Ghi chú">
              <textarea
                className={`${inputCls} min-h-[80px]`}
                rows={3}
                value={form.notes}
                disabled={viewOnly}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </DrawerField>
          </>
        }
      />
    </PageLayout>
  );
}

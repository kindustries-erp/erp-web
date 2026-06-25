import { useCallback, useEffect, useMemo, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Building2, Trash2, Users, Pencil, Eye } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  DataTable,
  type ActionsColumnConfig,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import {
  DrawerField,
  DrawerSection,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { extractApiError } from "@/shared/utils/apiError";
import { useUIStore } from "@/core/config/uiStore";
import { Combobox } from "@/shared/components/Combobox";
import {
  businessPartnersCoreApi,
  type CreateBusinessPartnerCoreDto,
  type ErpBusinessPartner,
} from "@/modules/business-partners-core/api/businessPartnersCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";

interface PartnerFormState {
  code: string;
  name: string;
  displayName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  status: string;
  notes: string;
}

const PARTNER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngưng" },
];

const emptyForm = (): PartnerFormState => ({
  code: "",
  name: "",
  displayName: "",
  taxCode: "",
  phone: "",
  email: "",
  address: "",
  contactName: "",
  status: "ACTIVE",
  notes: "",
});

export function ErpBusinessPartnersPage({
  partnerType,
  title,
  desc,
}: {
  partnerType: "CUSTOMER" | "VENDOR";
  title: string;
  desc: string;
}) {
  const canRead = useHasPermission("business_partners", "read");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canCreate = useHasPermission("business_partners", "create");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canUpdate = useHasPermission("business_partners", "update");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canDelete = useHasPermission("business_partners", "delete");

  const [items, setItems] = useState<ErpBusinessPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PartnerFormState>(emptyForm());

  const drawerStore = useDrawerStore();
  const isThisDrawerOpen =
    drawerStore.isOpen &&
    drawerStore.type === `BUSINESS_PARTNER_${partnerType}`;
  const viewOnly = drawerStore.mode === "view";
  const isEditing = drawerStore.mode !== "create";
  const [deleteTarget, setDeleteTarget] = useState<ErpBusinessPartner | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: PARTNER_STATUS_OPTIONS,
        placeholder: "Tất cả trạng thái",
      },
    }),
    [],
  );
  const filter = useFilterPanel(filterConfig);
  const search = filter.state.search.trim();
  const statusFilter = filter.state.status;

  const icon =
    partnerType === "VENDOR" ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await businessPartnersCoreApi.list({
        page: 1,
        pageSize: 200,
        search: search || undefined,
        partnerType,
      });
      setItems(res.items);
    } catch (err) {
      setFetchError(
        extractApiError(
          err,
          `Không tải được danh sách ${title.toLowerCase()}.`,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [partnerType, search, title]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(
    () =>
      statusFilter
        ? items.filter((item) => (item.status || "") === statusFilter)
        : items,
    [items, statusFilter],
  );

  const columns: DataTableColumn<ErpBusinessPartner>[] = [
    {
      key: "code",
      header: "Mã",
      cell: (item) => item.code || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "name",
      header: "Tên",
      cell: (item) => item.name || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "contactName",
      header: "Người liên hệ",
      cell: (item) => item.contactName || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "phone",
      header: "SĐT",
      cell: (item) => item.phone || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "email",
      header: "Email",
      cell: (item) => item.email || "—",
      className: "text-left",
      headerClassName: "text-center",
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-center",
      headerClassName: "text-center",
      cell: (item) => (
        <div className="flex justify-center w-full">
          {item.status === "ACTIVE" ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              Hoạt động
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              Ngưng
            </span>
          )}
        </div>
      ),
    },
  ];

  const actionsColumn: ActionsColumnConfig<ErpBusinessPartner> = {
    cell: (item) => (
      <ActionDropdown
        items={[
          {
            label: "Xóa",
            icon: <Trash2 className="h-3.5 w-3.5" />,
            variant: "danger",
            onClick: () => setDeleteTarget(item),
          },
        ]}
      />
    ),
  };

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await businessPartnersCoreApi.remove(deleteTarget.id);
      showToast({ title: "Đã xóa thành công", variant: "success" });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast({
        variant: "destructive",
        title: "Xóa thất bại",
        description: extractApiError(err, "Không xóa được đối tác."),
      });
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setForm(emptyForm());
    drawerStore.openDrawer(`BUSINESS_PARTNER_${partnerType}`, "create");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function openEdit(item: ErpBusinessPartner) {
    setForm({
      code: item.code ?? "",
      name: item.name ?? "",
      displayName: item.displayName ?? "",
      taxCode: item.taxCode ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      address: item.address ?? "",
      contactName: item.contactName ?? "",
      status: item.status ?? "ACTIVE",
      notes: item.notes ?? "",
    });
    drawerStore.openDrawer(
      `BUSINESS_PARTNER_${partnerType}`,
      "edit",
      item.id,
      item,
    );
  }

  function openView(item: ErpBusinessPartner) {
    setForm({
      code: item.code ?? "",
      name: item.name ?? "",
      displayName: item.displayName ?? "",
      taxCode: item.taxCode ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      address: item.address ?? "",
      contactName: item.contactName ?? "",
      status: item.status ?? "ACTIVE",
      notes: item.notes ?? "",
    });
    drawerStore.openDrawer(
      `BUSINESS_PARTNER_${partnerType}`,
      "view",
      item.id,
      item,
    );
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      showToast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Cần nhập mã và tên đối tác.",
      });
      return;
    }

    const payload: CreateBusinessPartnerCoreDto = {
      code: form.code.trim(),
      name: form.name.trim(),
      partnerType,
      ...(form.displayName.trim()
        ? { displayName: form.displayName.trim() }
        : {}),
      ...(form.taxCode.trim() ? { taxCode: form.taxCode.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.address.trim() ? { address: form.address.trim() } : {}),
      ...(form.contactName.trim()
        ? { contactName: form.contactName.trim() }
        : {}),
      status: form.status.trim() || "ACTIVE",
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };

    setSaving(true);
    try {
      if (isEditing && drawerStore.entityId) {
        await businessPartnersCoreApi.update(drawerStore.entityId, payload);
        showToast({
          title: "Đã cập nhật",
          description: `${title} đã được cập nhật.`,
        });
      } else {
        await businessPartnersCoreApi.create(payload);
        showToast({
          title: "Đã tạo",
          description: `${title} đã được tạo mới.`,
        });
      }
      drawerStore.closeDrawer();
      await load();
    } catch (err) {
      showToast({
        variant: "destructive",
        title: isEditing ? "Cập nhật thất bại" : "Tạo thất bại",
        description: extractApiError(err, "Không lưu được đối tác."),
      });
    } finally {
      setSaving(false);
    }
  }

  const drawerActions: DrawerAction[] = viewOnly
    ? [
        {
          label: "Đóng",
          onClick: drawerStore.closeDrawer,
          variant: "outline",
        },
      ]
    : [
        {
          label: "Hủy",
          onClick: drawerStore.closeDrawer,
          disabled: saving,
          variant: "outline",
        },
        {
          label: saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleSave(),
          disabled: saving,
          primary: true,
        },
      ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      actions={
        <TableActionGroup
          onRefresh={() => void load()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={openCreate}
        />
      }
    >
      <div className="flex items-start flex-1 min-h-0">
        <div className="min-w-0 flex-1 space-y-4 flex flex-col h-full">
          {fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 shrink-0">
              {fetchError}
            </div>
          ) : null}

          <DataTable<ErpBusinessPartner>
            items={filteredItems}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            emptyLabel={`Chưa có ${title.toLowerCase()} nào.`}
            minWidth={980}
            onRowClick={(item) => openView(item)}
            actionsColumn={actionsColumn}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={
          deleteTarget
            ? `Xóa ${title.toLowerCase()} "${deleteTarget.name || deleteTarget.code}"? Hành động này sẽ ẩn mục này khỏi danh sách.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <StandardFormDrawer
        open={isThisDrawerOpen}
        mode={drawerStore.mode}
        onClose={drawerStore.closeDrawer}
        onToggleEdit={() => drawerStore.setMode("edit")}
        title={
          viewOnly
            ? `Chi tiết ${title.toLowerCase()}`
            : isEditing
              ? `Chỉnh sửa ${title.toLowerCase()}`
              : `Tạo ${title.toLowerCase()}`
        }
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[1000px] xl:min-w-[1100px]"
        leftPanel={
          <DrawerSection title="Thông tin chính">
            <div className="grid gap-4 md:grid-cols-2">
              <DrawerField label="Mã *">
                <input
                  className={inputCls}
                  value={form.code}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                  placeholder="VD: NCC-001"
                />
              </DrawerField>
              <DrawerField label="Tên *">
                <input
                  className={inputCls}
                  value={form.name}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder={`Tên ${title.toLowerCase()}`}
                />
              </DrawerField>
              <DrawerField label="Tên hiển thị">
                <input
                  className={inputCls}
                  value={form.displayName}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayName: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Mã số thuế">
                <input
                  className={inputCls}
                  value={form.taxCode}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, taxCode: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Số điện thoại">
                <input
                  className={inputCls}
                  value={form.phone}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Email">
                <input
                  className={inputCls}
                  value={form.email}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Người liên hệ">
                <input
                  className={inputCls}
                  value={form.contactName}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactName: e.target.value }))
                  }
                />
              </DrawerField>
            </div>
            <div className="mt-4">
              <DrawerField label="Địa chỉ">
                <textarea
                  className={`${inputCls} min-h-[80px]`}
                  value={form.address}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
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
                  { value: "ACTIVE", label: "Hoạt động (ACTIVE)" },
                  { value: "INACTIVE", label: "Ngưng (INACTIVE)" },
                ]}
                value={form.status}
                disabled={viewOnly}
                onChange={(v) =>
                  setForm((p) => ({ ...p, status: v || "ACTIVE" }))
                }
                allowClear={false}
              />
            </DrawerField>
            <DrawerField label="Ghi chú">
              <textarea
                className={`${inputCls} min-h-[80px]`}
                value={form.notes}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </DrawerField>
          </>
        }
      />
    </PageLayout>
  );
}

export function ErpCustomersPage() {
  return (
    <ErpBusinessPartnersPage
      partnerType="CUSTOMER"
      title="Khách hàng"
      desc="Tạo và quản lý khách hàng bằng business partner API core trên Neon."
    />
  );
}

export function ErpSuppliersPage() {
  return (
    <ErpBusinessPartnersPage
      partnerType="VENDOR"
      title="Nhà cung cấp"
      desc="Tạo và quản lý nhà cung cấp bằng business partner API core trên Neon."
    />
  );
}

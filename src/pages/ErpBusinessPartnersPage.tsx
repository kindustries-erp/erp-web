import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Trash2, Users, Pencil, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  DataTable,
  type ActionsColumnConfig,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
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
  const canCreate = useHasPermission("business_partners", "create");
  const canUpdate = useHasPermission("business_partners", "update");
  const canDelete = useHasPermission("business_partners", "delete");

  const [items, setItems] = useState<ErpBusinessPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ErpBusinessPartner | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<PartnerFormState>(emptyForm());
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
    { key: "code", header: "Mã", cell: (item) => item.code || "—" },
    { key: "name", header: "Tên", cell: (item) => item.name || "—" },
    {
      key: "contactName",
      header: "Người liên hệ",
      cell: (item) => item.contactName || "—",
    },
    { key: "phone", header: "SĐT", cell: (item) => item.phone || "—" },
    { key: "email", header: "Email", cell: (item) => item.email || "—" },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) =>
        item.status === "ACTIVE" ? (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Hoạt động
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            Ngưng
          </span>
        ),
    },
  ];

  const actionsColumn: ActionsColumnConfig<ErpBusinessPartner> = {
    cell: (item) => (
      <ActionDropdown
        items={[
          {
            label: "Chi tiết",
            icon: <Eye className="h-3.5 w-3.5" />,
            onClick: () => openView(item),
          },
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
    setEditing(null);
    setForm(emptyForm());
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function openEdit(item: ErpBusinessPartner) {
    setEditing(item);
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
    setViewOnly(false);
    setDrawerOpen(true);
  }

  function openView(item: ErpBusinessPartner) {
    setEditing(item);
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
    setViewOnly(true);
    setDrawerOpen(true);
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
      if (editing) {
        await businessPartnersCoreApi.update(editing.id, payload);
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
      setDrawerOpen(false);
      await load();
    } catch (err) {
      showToast({
        variant: "destructive",
        title: editing ? "Cập nhật thất bại" : "Tạo thất bại",
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
          onClick: () => setDrawerOpen(false),
          variant: "outline",
        },
      ]
    : [
        {
          label: "Hủy",
          onClick: () => setDrawerOpen(false),
          disabled: saving,
          variant: "outline",
        },
        {
          label: saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới",
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
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          viewOnly
            ? `Chi tiết ${title.toLowerCase()}`
            : editing
              ? `Chỉnh sửa ${title.toLowerCase()}`
              : `Tạo ${title.toLowerCase()}`
        }
        headerExtra={
          viewOnly ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewOnly(false)}
            >
              Chỉnh sửa
            </Button>
          ) : undefined
        }
        actions={drawerActions}
      >
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
          </div>
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
        </DrawerSection>
      </DrawerModal>
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

import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import {
  DataTable,
  type DataTableColumn,
  type ActionsColumnConfig,
} from "@/shared/components/DataTable";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { extractApiError } from "@/shared/utils/apiError";
import { useUIStore } from "@/core/config/uiStore";
import {
  businessPartnersCoreApi,
  type CreateBusinessPartnerCoreDto,
  type ErpBusinessPartner,
} from "@/modules/business-partners-core/api/businessPartnersCoreApi";

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
  const [items, setItems] = useState<ErpBusinessPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ErpBusinessPartner | null>(null);
  const [form, setForm] = useState<PartnerFormState>(emptyForm());
  const showToast = useUIStore((s) => s.showToast);

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
        items={[{ label: "Chỉnh sửa", onClick: () => openEdit(item) }]}
      />
    ),
  };

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
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

  const drawerActions: DrawerAction[] = [
    {
      label: "Đóng",
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

  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      actions={
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mới
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="w-full max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={`Tìm ${title.toLowerCase()} theo mã, tên...`}
          />
        </div>

        {fetchError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {fetchError}
          </div>
        ) : null}

        <DataTable<ErpBusinessPartner>
          items={items}
          columns={columns}
          getRowKey={(item) => item.id}
          loading={loading}
          emptyLabel={`Chưa có ${title.toLowerCase()} nào.`}
          actionsColumn={actionsColumn}
        />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          editing
            ? `Chỉnh sửa ${title.toLowerCase()}`
            : `Tạo ${title.toLowerCase()}`
        }
        actions={drawerActions}
      >
        <DrawerSection title="Thông tin chính">
          <div className="grid gap-4 md:grid-cols-2">
            <DrawerField label="Mã *">
              <input
                className={inputCls}
                value={form.code}
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, displayName: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Mã số thuế">
              <input
                className={inputCls}
                value={form.taxCode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, taxCode: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Số điện thoại">
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Email">
              <input
                className={inputCls}
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Người liên hệ">
              <input
                className={inputCls}
                value={form.contactName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactName: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Ngưng (INACTIVE)</option>
              </select>
            </DrawerField>
          </div>
          <DrawerField label="Địa chỉ">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
          </DrawerField>
          <DrawerField label="Ghi chú">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={form.notes}
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

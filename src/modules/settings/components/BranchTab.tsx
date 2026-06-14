import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { useT } from "@/core/i18n";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  createBranchApi,
  deleteBranchApi,
  getBranchesApi,
  type Branch,
  updateBranchApi,
} from "@/modules/branches/api/branchApi";
import { SectionHeader, IconEdit, IconTrash } from "./shared";

export function BranchTab() {
  const t = useT();
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [del, setDel] = useState<Branch | null>(null);
  const [form, setForm] = useState({ code: "", name: "", is_active: true });
  const load = async () => {
    setLoading(true);
    try {
      setItems(await getBranchesApi());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const cols: DataTableColumn<Branch>[] = [
    { key: "code", header: "Mã", cell: (b) => b.code },
    { key: "name", header: "Tên chi nhánh", cell: (b) => b.name },
    {
      key: "is_active",
      header: "Trạng thái",
      cell: (b) => (b.is_active ? "Hoạt động" : "Ngưng"),
    },
  ];
  return (
    <div>
      <SectionHeader
        title={t("thietlap.tabs.chi-nhanh") || "Chi nhánh"}
        desc="Quản lý chi nhánh"
        icon={<Building2 className="h-4 w-4" />}
        onAdd={() => {
          setEditing(null);
          setForm({ code: "", name: "", is_active: true });
          setOpen(true);
        }}
      />
      <DataTable
        items={items}
        columns={cols}
        getRowKey={(i) => i.id}
        loading={loading}
        emptyLabel={t("common.noData")}
        minWidth={600}
        actionsColumn={{
          cell: (b) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  icon: <IconEdit />,
                  onClick: () => {
                    setEditing(b);
                    setForm({
                      code: b.code,
                      name: b.name,
                      is_active: b.is_active !== false,
                    });
                    setOpen(true);
                  },
                },
                {
                  label: t("common.delete"),
                  icon: <IconTrash />,
                  onClick: () => setDel(b),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />
      <DrawerModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Sửa chi nhánh" : "Thêm chi nhánh"}
        actions={[
          { label: t("common.cancel"), onClick: () => setOpen(false) },
          {
            label: editing ? t("common.saveChanges") : t("common.addNew"),
            primary: true,
            onClick: async () => {
              try {
                const dto = {
                  code: form.code.trim(),
                  name: form.name.trim(),
                  is_active: form.is_active,
                };
                if (editing) await updateBranchApi(editing.id, dto);
                else await createBranchApi(dto);
                setOpen(false);
                load();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (error: any) {
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  "Không thể lưu chi nhánh";
                alert(Array.isArray(message) ? message.join("\n") : message);
              }
            },
          },
        ]}
      >
        <DrawerSection title="Thông tin">
          <DrawerField label="Mã chi nhánh">
            <input
              className={inputCls}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </DrawerField>
          <DrawerField label="Tên chi nhánh">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </DrawerField>
          <DrawerField label="Hoạt động">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, is_active: v === true }))
              }
            />
          </DrawerField>
        </DrawerSection>
      </DrawerModal>
      <ConfirmModal
        open={!!del}
        title={t("confirmModal.defaultTitle")}
        message="Xóa chi nhánh?"
        confirmLabel={t("confirmModal.defaultConfirm")}
        onCancel={() => setDel(null)}
        onConfirm={async () => {
          if (del) await deleteBranchApi(del.id);
          setDel(null);
          load();
        }}
      />
    </div>
  );
}

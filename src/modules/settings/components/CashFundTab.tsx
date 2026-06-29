import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { SectionHeader, ErrorBanner } from "./shared";
import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import { money } from "@/shared/utils/format";

interface QuyForm {
  name: string;
  currency: string;
  isActive: boolean;
  openingBalance: number;
  periodDate: string;
}

const emptyQuyForm: QuyForm = {
  name: "",
  currency: "VND",
  isActive: true,
  openingBalance: 0,
  periodDate: "",
};

function buildQuyForm(f: ErpCashBook): QuyForm {
  return {
    name: f.name ?? "",
    currency: f.currency ?? "VND",
    isActive: f.isActive ?? true,
    openingBalance: f.openingBalance ?? 0,
    periodDate: f.periodDate ?? "",
  };
}

export function QuyTab() {
  const { currentBranchId } = useAppStore();
  const [items, setItems] = useState<ErpCashBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpCashBook | null>(null);
  const [form, setForm] = useState<QuyForm>(emptyQuyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErpCashBook | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    if (currentBranchId) {
      loadFunds();
    }
  }, [currentBranchId]);

  async function loadFunds() {
    if (!currentBranchId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await bankStatementApi.getCashBooks(currentBranchId);
      setItems(res);
    } catch {
      setFetchError(t("settings.quy.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm(emptyQuyForm);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: ErpCashBook) {
    setEditing(item);
    setForm(buildQuyForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  const setField = <K extends keyof QuyForm>(k: K, v: QuyForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError(t("settings.quy.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto = {
        branchId: currentBranchId!,
        name: form.name.trim(),
        currency: form.currency || "VND",
        isActive: form.isActive,
        openingBalance: form.openingBalance || 0,
        periodDate: form.periodDate || undefined,
      };

      if (editing) {
        await bankStatementApi.updateCashBook(editing.id, dto);
      } else {
        await bankStatementApi.createCashBook(dto);
      }
      closeDrawer();
      loadFunds();
    } catch (e: unknown) {
      const err = e as any;
      setSaveError(
        err?.response?.data?.message || err?.message || "Đã xảy ra lỗi",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bankStatementApi.deleteCashBook(deleteTarget.id);
      setDeleteTarget(null);
      loadFunds();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.name.trim();
  const columns: DataTableColumn<ErpCashBook>[] = [
    {
      key: "name",
      header: t("settings.quy.headers.fundName"),
      cell: (q) => q.name,
      className: "font-medium text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-32",
    },
    {
      key: "openingBalance",
      header: "Số dư đầu kỳ",
      cell: (b) => (b.openingBalance ? money(b.openingBalance) : "—"),
      className: "text-right",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
    },
    {
      key: "periodDate",
      header: "Ngày chốt dư",
      cell: (b) => b.periodDate || "—",
      className: "text-center text-[color:var(--muted-fg)]",
      headerClassName: "text-center",
      skeletonClassName: "w-20",
    },
    {
      key: "currency",
      header: t("settings.tk.headers.currency"),
      cell: (q) => q.currency,
      className: "text-[color:var(--muted-fg)] text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-12",
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("settings.quy.title")}
        desc={t("settings.quy.desc")}
        icon={<Wallet className="h-4 w-4" />}
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(q) => q.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={750}
        loadingRows={4}
        actionsColumn={{
          cell: (q) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  onClick: () => openEdit(q),
                },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(q),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={
          editing ? t("settings.quy.editTitle") : t("settings.quy.createTitle")
        }
        subtitle={editing ? editing.name : t("settings.quy.subtitle")}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          {
            label: editing ? t("common.saveChanges") : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("settings.quy.sectionInfo")}>
          <DrawerField label={t("settings.quy.headers.fundName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={t("settings.quy.fundNamePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.currency")}>
            <Combobox
              options={[
                { value: "VND", label: "VND" },
                { value: "USD", label: "USD" },
              ]}
              value={form.currency}
              onChange={(v) => setField("currency", v || "VND")}
              allowClear={false}
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Số dư đầu kỳ">
          <DrawerField label="Số tiền">
            <input
              type="number"
              className={inputCls}
              value={form.openingBalance}
              onChange={(e) =>
                setField("openingBalance", Number(e.target.value))
              }
              placeholder="0"
            />
          </DrawerField>
          <DrawerField label="Ngày chốt dư">
            <input
              type="date"
              className={inputCls}
              value={form.periodDate}
              onChange={(e) => setField("periodDate", e.target.value)}
            />
          </DrawerField>
        </DrawerSection>

        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("settings.quy.deleteMessage").replace(
          "{0}",
          deleteTarget?.name ?? "",
        )}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

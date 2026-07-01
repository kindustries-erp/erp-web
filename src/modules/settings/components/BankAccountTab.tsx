import { useState, useEffect } from "react";
import { Landmark } from "lucide-react";
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
  type ErpBankAccount,
} from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import { money } from "@/shared/utils/format";

interface BankForm {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  isActive: boolean;
  openingBalance: number;
  periodDate: string;
}

const emptyBankForm: BankForm = {
  bankCode: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  currency: "VND",
  isActive: true,
  openingBalance: 0,
  periodDate: "",
};

function buildBankForm(b: ErpBankAccount): BankForm {
  return {
    bankCode: b.bankCode ?? "",
    bankName: b.bankName ?? "",
    accountNumber: b.accountNumber ?? "",
    accountName: b.accountName ?? "",
    currency: b.currency ?? "VND",
    isActive: b.isActive ?? true,
    openingBalance: b.openingBalance ?? 0,
    periodDate: b.periodDate ?? "",
  };
}

export function NHTab() {
  const { currentBranchId } = useAppStore();
  const [items, setItems] = useState<ErpBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpBankAccount | null>(null);
  const [form, setForm] = useState<BankForm>(emptyBankForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ErpBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    if (currentBranchId) {
      loadItems();
    }
  }, [currentBranchId]);

  async function loadItems() {
    if (!currentBranchId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await bankStatementApi.getBankAccounts();
      setItems(res);
    } catch {
      setFetchError(t("settings.nh.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm(emptyBankForm);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: ErpBankAccount) {
    setEditing(item);
    setForm(buildBankForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  const setField = <K extends keyof BankForm>(k: K, v: BankForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (
      !form.bankName.trim() ||
      !form.accountNumber.trim() ||
      !form.accountName.trim()
    ) {
      setSaveError(t("settings.nh.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto = {
        branchId: currentBranchId!,
        bankCode: form.bankCode.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountName: form.accountName.trim(),
        currency: form.currency || "VND",
        isActive: form.isActive,
        openingBalance: form.openingBalance || 0,
        periodDate: form.periodDate || undefined,
      };

      if (editing) {
        await bankStatementApi.updateBankAccount(editing.id, dto);
      } else {
        await bankStatementApi.createBankAccount(dto);
      }
      closeDrawer();
      loadItems();
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
      await bankStatementApi.deleteBankAccount(deleteTarget.id);
      setDeleteTarget(null);
      loadItems();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.bankName.trim() || !!form.accountNumber.trim();
  const columns: DataTableColumn<ErpBankAccount>[] = [
    {
      key: "bankCode",
      header: t("settings.nh.headers.bankAccountCode"),
      cell: (b) => b.bankCode || "—",
      className: "font-mono text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-16",
    },
    {
      key: "bankName",
      header: t("settings.nh.headers.bankName"),
      cell: (b) => b.bankName,
      className: "font-medium text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-32",
    },
    {
      key: "accountNumber",
      header: t("settings.nh.headers.accountNumber"),
      cell: (b) => b.accountNumber,
      className: "text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-28",
    },
    {
      key: "accountName",
      header: t("settings.nh.headers.accountHolder"),
      cell: (b) => b.accountName,
      className: "text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-28",
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
      cell: (b) => b.currency,
      className: "text-[color:var(--muted-fg)] text-center",
      headerClassName: "text-center",
      skeletonClassName: "w-12",
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("settings.nh.title")}
        desc={t("settings.nh.desc")}
        icon={<Landmark className="h-4 w-4" />}
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={750}
        loadingRows={4}
        actionsColumn={{
          cell: (b) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  onClick: () => openEdit(b),
                },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(b),
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
          editing ? t("settings.nh.editTitle") : t("settings.nh.createTitle")
        }
        subtitle={editing ? editing.bankName : t("settings.nh.subtitle")}
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
        <DrawerSection title={t("settings.nh.sectionInfo")}>
          <DrawerField label={t("settings.nh.headers.bankAccountCode")}>
            <input
              type="text"
              className={inputCls}
              value={form.bankCode}
              onChange={(e) => setField("bankCode", e.target.value)}
              placeholder={t("settings.nh.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.bankName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.bankName}
              onChange={(e) => setField("bankName", e.target.value)}
              placeholder={t("settings.nh.bankNamePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.accountNumber")} required>
            <input
              type="text"
              className={inputCls}
              value={form.accountNumber}
              onChange={(e) => setField("accountNumber", e.target.value)}
              placeholder={t("settings.nh.accountNumberPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.accountHolder")} required>
            <input
              type="text"
              className={inputCls}
              value={form.accountName}
              onChange={(e) => setField("accountName", e.target.value)}
              placeholder={t("settings.nh.accountHolderPlaceholder")}
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
        message={t("settings.nh.deleteMessage").replace(
          "{0}",
          deleteTarget?.bankName ?? "",
        )}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

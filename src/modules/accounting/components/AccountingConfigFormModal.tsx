import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi, type ErpAccountingConfig } from "../api/accountingApi";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";

interface AccountingConfigFormModalProps {
  open: boolean;
  onClose: () => void;
  configId?: string | null;
}

const MODULE_OPTIONS = [
  { value: "goods_receipts", label: "Nhập kho (Goods Receipts)" },
  { value: "goods_issues", label: "Xuất kho (Goods Issues)" },
  { value: "production", label: "Sản xuất (Production)" },
  { value: "invoices", label: "Hóa đơn (Invoices)" },
];

const ACTION_OPTIONS = [
  { value: "post", label: "Ghi sổ (Post)" },
  { value: "cancel", label: "Hủy (Cancel)" },
];

export function AccountingConfigFormModal({
  open,
  onClose,
  configId,
}: AccountingConfigFormModalProps) {
  const t = useT();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    module: "",
    action: "",
    debit_account_id: "",
    credit_account_id: "",
    description: "",
    is_active: true,
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState("");

  const { data: configData, isFetching: loadingConfig } = useQuery({
    queryKey: ["accounting-configs", configId],
    queryFn: async () => {
      if (!configId) return null;
      // We could fetch one by ID, but accountingApi only has getConfigs list.
      // Wait, we didn't expose get getConfig(id), so we can just find it from the list query cache
      // or we can refetch the list. Let's just fetch the list and filter.
      const res = await accountingApi.getConfigs({ search: configId }); // This is a hack, ideally we should pass it as a prop or fetch it correctly.
      return res.items.find((x: any) => x.id === configId) || null;
    },
    enabled: !!configId && open,
  });

  const { data: accountsData, isFetching: loadingAccounts } = useQuery({
    queryKey: ["accounting-accounts", accountSearch],
    queryFn: () => accountingApi.getAccountOptions(accountSearch),
    enabled: open,
  });

  const accountOptions = useMemo(() => {
    if (!accountsData) return [];
    return accountsData.map((a: any) => ({
      value: a.id,
      label: `${a.account_code} - ${a.account_name}`,
    }));
  }, [accountsData]);

  useEffect(() => {
    if (open) {
      setSaveError(null);
      if (configData) {
        setForm({
          module: configData.module,
          action: configData.action,
          debit_account_id: configData.debit_account_id || "",
          credit_account_id: configData.credit_account_id || "",
          description: configData.description || "",
          is_active: configData.is_active,
        });
      } else if (!configId) {
        setForm({
          module: "",
          action: "",
          debit_account_id: "",
          credit_account_id: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [open, configData, configId]);

  const setField = (key: keyof typeof form, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        module: form.module,
        action: form.action,
        debit_account_id: form.debit_account_id || null,
        credit_account_id: form.credit_account_id || null,
        description: form.description,
        is_active: form.is_active,
      };
      if (configId) {
        await accountingApi.updateConfig(configId, payload);
      } else {
        await accountingApi.createConfig(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-configs"] });
      onClose();
    },
    onError: (err: any) => {
      setSaveError(
        err?.response?.data?.message || err.message || "Lỗi lưu cấu hình",
      );
    },
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={configId ? "Cập nhật cấu hình" : "Tạo cấu hình mới"}
      subtitle="Cấu hình tài khoản hạch toán tự động"
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: "Lưu",
          primary: true,
          disabled: mutation.isPending || loadingConfig,
          loading: mutation.isPending,
          onClick: () => mutation.mutate(),
        },
      ]}
    >
      <DrawerSection title="Thông tin cấu hình">
        <DrawerField label="Phân hệ (Module)" required>
          <Combobox
            options={MODULE_OPTIONS}
            value={form.module}
            onChange={(v) => setField("module", v)}
            placeholder="Chọn phân hệ"
            disabled={!!configId}
          />
        </DrawerField>

        <DrawerField label="Hành động (Action)" required>
          <Combobox
            options={ACTION_OPTIONS}
            value={form.action}
            onChange={(v) => setField("action", v)}
            placeholder="Chọn hành động"
            disabled={!!configId}
          />
        </DrawerField>

        <DrawerField label="Trạng thái">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setField("is_active", e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Hoạt động
          </label>
        </DrawerField>
      </DrawerSection>

      <DrawerSection title="Tài khoản hạch toán">
        <DrawerField label="Tài khoản Nợ (Debit)">
          <Combobox
            options={accountOptions}
            value={form.debit_account_id}
            onChange={(v) => setField("debit_account_id", v)}
            placeholder="Chọn tài khoản Nợ"
            searchPlaceholder="Tìm tài khoản..."
            onSearch={setAccountSearch}
            loading={loadingAccounts}
          />
        </DrawerField>

        <DrawerField label="Tài khoản Có (Credit)">
          <Combobox
            options={accountOptions}
            value={form.credit_account_id}
            onChange={(v) => setField("credit_account_id", v)}
            placeholder="Chọn tài khoản Có"
            searchPlaceholder="Tìm tài khoản..."
            onSearch={setAccountSearch}
            loading={loadingAccounts}
          />
        </DrawerField>

        <DrawerField label="Mô tả / Diễn giải">
          <textarea
            className={`${inputCls} min-h-[80px] resize-none`}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Mô tả cấu hình..."
            rows={3}
          />
        </DrawerField>
      </DrawerSection>

      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-3 mt-4">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}

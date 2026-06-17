import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "../api/accountingApi";
import type { AccountOption } from "../api/accountingApi";
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

export function AccountingConfigFormModal({
  open,
  onClose,
  configId,
}: AccountingConfigFormModalProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    module: "",
    debit_account_id: "",
    credit_account_id: "",
    description: "",
    is_active: true,
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountOptionsCache, setAccountOptionsCache] = useState<
    Record<string, AccountOption>
  >({});

  const { data: configData, isFetching: loadingConfig } = useQuery({
    queryKey: ["accounting-configs", configId],
    queryFn: async () => {
      if (!configId) return null;
      // Fetch list and filter by id (API doesn't expose single-item endpoint yet)
      const res = await accountingApi.getConfigs({ search: configId });
      return res.items.find((x) => x.id === configId) ?? null;
    },
    enabled: !!configId && open,
  });

  const { data: accountsData, isFetching: loadingAccounts } = useQuery({
    queryKey: ["accounting-accounts", accountSearch],
    queryFn: () => accountingApi.getAccountOptions(accountSearch),
    enabled: open,
  });

  useEffect(() => {
    if (accountsData) {
      setAccountOptionsCache((prev) => {
        const next = { ...prev };
        (accountsData as AccountOption[]).forEach((a) => {
          next[a.id] = a;
        });
        return next;
      });
    }
  }, [accountsData]);

  useEffect(() => {
    if (configData) {
      setAccountOptionsCache((prev) => {
        const next = { ...prev };
        if (configData.debit_account) {
          next[configData.debit_account.id] =
            configData.debit_account as AccountOption;
        }
        if (configData.credit_account) {
          next[configData.credit_account.id] =
            configData.credit_account as AccountOption;
        }
        return next;
      });
    }
  }, [configData]);

  const accountOptions = useMemo(() => {
    return Object.values(accountOptionsCache).map((a) => ({
      value: a.id,
      label: `${a.account_code} - ${a.account_name}`,
    }));
  }, [accountOptionsCache]);

  useEffect(() => {
    if (open) {
      setSaveError(null);
      if (configData) {
        setForm({
          module: configData.module,
          debit_account_id: configData.debit_account_id || "",
          credit_account_id: configData.credit_account_id || "",
          description: configData.description || "",
          is_active: configData.is_active,
        });
      } else if (!configId) {
        setForm({
          module: "",
          debit_account_id: "",
          credit_account_id: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [open, configData, configId]);

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        module: form.module,
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
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setSaveError(
        err?.response?.data?.message ?? err.message ?? "Lỗi lưu cấu hình",
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

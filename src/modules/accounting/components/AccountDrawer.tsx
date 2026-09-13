import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  type DrawerAction,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Badge } from "@/shared/components/ui/badge";
import { Layers } from "lucide-react";
import {
  accountingApi,
  type ChartOfAccountItem,
} from "@/modules/accounting/api/accountingApi";

export interface AccountDrawerProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  account: ChartOfAccountItem | null;
  onClose: () => void;
  onToggleEdit?: () => void;
  onSaved?: (account: ChartOfAccountItem) => void;
}

interface AccountFormData {
  accountCode: string;
  accountName: string;
  accountType: string;
  parentId: string;
  isActive: boolean;
}

const emptyFormData: AccountFormData = {
  accountCode: "",
  accountName: "",
  accountType: "ASSET",
  parentId: "",
  isActive: true,
};

export function AccountDrawer({
  open,
  mode,
  account,
  onClose,
  onToggleEdit,
  onSaved,
}: AccountDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AccountFormData>(emptyFormData);
  const [error, setError] = useState<string | null>(null);

  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  // Reset form when drawer opens or account changes
  useEffect(() => {
    if (open) {
      if (account && (isView || isEdit)) {
        setForm({
          accountCode: account.accountCode || account.account_code || "",
          accountName: account.accountName || account.account_name || "",
          accountType: (
            account.accountType ||
            account.account_type ||
            "ASSET"
          ).toUpperCase(),
          parentId: account.parentId || account.parent_account_id || "",
          isActive:
            account.isActive !== undefined
              ? account.isActive
              : account.is_active !== undefined
                ? account.is_active
                : true,
        });
      } else {
        setForm(emptyFormData);
      }
      setError(null);
    }
  }, [open, account, isView, isEdit]);

  // Fetch all accounts for Parent Account Combobox
  const { data: allAccountsData } = useQuery({
    queryKey: ["chart-of-accounts-all-dropdown"],
    queryFn: () => accountingApi.getChartOfAccounts({ page: 1, pageSize: 500 }),
    enabled: open,
    staleTime: 60 * 1000,
  });

  const parentOptions = useMemo(() => {
    const list: ChartOfAccountItem[] = Array.isArray(allAccountsData)
      ? allAccountsData
      : allAccountsData?.items || allAccountsData?.data || [];

    const filtered = account ? list.filter((a) => a.id !== account.id) : list;

    const opts = filtered.map((a) => {
      const code = a.accountCode || a.account_code || "";
      const name = a.accountName || a.account_name || "";
      return {
        value: a.id,
        label: `${code} — ${name}`,
        searchText: `${code} ${name}`,
      };
    });

    return [
      {
        value: "",
        label: t(
          "accounts.drawer.parentNone",
          "Không có (Tài khoản gốc cấp 1)",
        ),
      },
      ...opts,
    ];
  }, [allAccountsData, account, t]);

  const accountTypeOptions = useMemo(
    () => [
      { value: "ASSET", label: t("accounts.ASSET", "Tài sản") },
      { value: "LIABILITY", label: t("accounts.LIABILITY", "Nợ phải trả") },
      { value: "EQUITY", label: t("accounts.EQUITY", "Vốn chủ sở hữu") },
      { value: "REVENUE", label: t("accounts.REVENUE", "Doanh thu") },
      { value: "EXPENSE", label: t("accounts.EXPENSE", "Chi phí") },
      { value: "OTHER", label: t("accounts.OTHER", "Khác") },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        value: "true",
        label: t("accounts.drawer.statusActive", "Đang hoạt động"),
      },
      {
        value: "false",
        label: t("accounts.drawer.statusInactive", "Ngừng hoạt động"),
      },
    ],
    [t],
  );

  const saveMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const payload = {
        accountCode: data.accountCode.trim(),
        accountName: data.accountName.trim(),
        accountType: data.accountType,
        parentId: data.parentId || null,
        isActive: data.isActive,
      };

      if (isEdit && account?.id) {
        return accountingApi.updateChartOfAccount(account.id, payload);
      }
      return accountingApi.createChartOfAccount(payload);
    },
    onSuccess: (savedData) => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      queryClient.invalidateQueries({
        queryKey: ["chart-of-accounts-all-dropdown"],
      });
      showToast({
        title: isCreate
          ? t(
              "accounts.toast.createSuccess",
              "Đã tạo tài khoản kế toán thành công",
            )
          : t(
              "accounts.toast.updateSuccess",
              "Đã cập nhật tài khoản kế toán thành công",
            ),
        variant: "success",
      });
      if (onSaved) onSaved(savedData);
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("accounts.toast.saveError", "Không thể lưu tài khoản");
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    },
  });

  const handleSave = () => {
    if (!form.accountCode.trim()) {
      setError(t("accounts.drawer.codeRequired", "Vui lòng nhập mã tài khoản"));
      return;
    }
    if (!form.accountName.trim()) {
      setError(
        t("accounts.drawer.nameRequired", "Vui lòng nhập tên tài khoản"),
      );
      return;
    }
    setError(null);
    saveMutation.mutate(form);
  };

  const isDirty = useMemo(() => {
    if (!open) return false;
    if (isCreate) {
      return Boolean(form.accountCode.trim() || form.accountName.trim());
    }
    if (isEdit && account) {
      const origCode = account.accountCode || account.account_code || "";
      const origName = account.accountName || account.account_name || "";
      const origType = (
        account.accountType ||
        account.account_type ||
        "ASSET"
      ).toUpperCase();
      const origParent = account.parentId || account.parent_account_id || "";
      const origActive =
        account.isActive !== undefined
          ? account.isActive
          : account.is_active !== undefined
            ? account.is_active
            : true;

      return (
        form.accountCode !== origCode ||
        form.accountName !== origName ||
        form.accountType !== origType ||
        form.parentId !== origParent ||
        form.isActive !== origActive
      );
    }
    return false;
  }, [open, isCreate, isEdit, account, form]);

  const actions: DrawerAction[] = useMemo(() => {
    if (isView) {
      return [
        {
          label: t("common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ];
    }

    return [
      {
        label: t("common.cancel", "Hủy"),
        onClick: onClose,
        variant: "outline",
        disabled: saveMutation.isPending,
      },
      {
        label: isCreate
          ? t("accounts.actions.create", "Thêm mới")
          : t("common.saveChanges", "Lưu thay đổi"),
        primary: true,
        loading: saveMutation.isPending,
        disabled: saveMutation.isPending,
        onClick: handleSave,
      },
    ];
  }, [isView, isCreate, onClose, saveMutation.isPending, t]);

  const drawerTitle = useMemo(() => {
    if (isCreate) {
      return t("accounts.drawer.titleCreate", "Thêm mới tài khoản kế toán");
    }
    if (isEdit) {
      return t("accounts.drawer.titleEdit", "Chỉnh sửa tài khoản kế toán");
    }
    const code =
      form.accountCode || account?.accountCode || account?.account_code || "";
    return t("accounts.drawer.titleView", "Chi tiết tài khoản: {code}").replace(
      "{code}",
      code,
    );
  }, [isCreate, isEdit, form.accountCode, account, t]);

  const statusBadge = useMemo(() => {
    return (
      <Badge
        variant={form.isActive ? "default" : "secondary"}
        className="text-[11px] font-semibold"
      >
        {form.isActive
          ? t("accounts.active", "Đang hoạt động")
          : t("accounts.inactive", "Ngừng hoạt động")}
      </Badge>
    );
  }, [form.isActive, t]);

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={isView && onToggleEdit ? onToggleEdit : undefined}
      icon={<Layers className="w-5 h-5 text-primary" />}
      title={drawerTitle}
      titleExtra={statusBadge}
      subtitle={
        isCreate
          ? t(
              "accounts.drawer.subtitle",
              "Thông tin chi tiết tài khoản kế toán",
            )
          : form.accountName || undefined
      }
      layout="1-column"
      size="md"
      confirmOnClose={isDirty && (isEdit || isCreate)}
      actions={actions}
      leftPanel={
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <DrawerSection
            title={t("accounts.drawer.sectionGeneral", "Thông tin cơ bản")}
          >
            <div className="flex flex-col gap-3.5">
              <DrawerField
                label={t("accounts.drawer.codeLabel", "Mã tài khoản")}
                required={!isView}
              >
                <input
                  type="text"
                  className={`${inputCls} font-mono uppercase`}
                  value={form.accountCode}
                  disabled={isView}
                  placeholder={t(
                    "accounts.drawer.codePlaceholder",
                    "Ví dụ: 1111, 1121...",
                  )}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountCode: e.target.value.trim(),
                    }))
                  }
                />
              </DrawerField>

              <DrawerField
                label={t("accounts.drawer.nameLabel", "Tên tài khoản")}
                required={!isView}
              >
                <input
                  type="text"
                  className={inputCls}
                  value={form.accountName}
                  disabled={isView}
                  placeholder={t(
                    "accounts.drawer.namePlaceholder",
                    "Ví dụ: Tiền Việt Nam...",
                  )}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                />
              </DrawerField>

              <DrawerField
                label={t("accounts.drawer.typeLabel", "Loại tài khoản")}
                required={!isView}
              >
                <Combobox
                  options={accountTypeOptions}
                  value={form.accountType}
                  disabled={isView}
                  allowClear={false}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      accountType: val || "ASSET",
                    }))
                  }
                  placeholder={t(
                    "accounts.drawer.typePlaceholder",
                    "Chọn loại tài khoản...",
                  )}
                />
              </DrawerField>

              <DrawerField
                label={t("accounts.drawer.parentLabel", "Tài khoản mẹ")}
              >
                <Combobox
                  options={parentOptions}
                  value={form.parentId}
                  disabled={isView}
                  allowClear={true}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      parentId: val || "",
                    }))
                  }
                  placeholder={t(
                    "accounts.drawer.parentPlaceholder",
                    "Chọn tài khoản mẹ (nếu có)...",
                  )}
                />
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection
            title={t(
              "accounts.drawer.sectionSettings",
              "Trạng thái & Thiết lập",
            )}
          >
            <div className="flex flex-col gap-3.5">
              <DrawerField
                label={t("accounts.drawer.statusLabel", "Trạng thái hoạt động")}
              >
                <Combobox
                  options={statusOptions}
                  value={form.isActive ? "true" : "false"}
                  disabled={isView}
                  allowClear={false}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: val === "true",
                    }))
                  }
                />
              </DrawerField>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}

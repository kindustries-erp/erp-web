import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/DatePicker";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/Combobox";
import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { getChartOfAccountsApi } from "@/modules/accounting/api/catalogApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { Wallet } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  cashBook: ErpCashBook | null;
  onSuccess: () => void;
  mode?: "view" | "edit";
  onToggleEdit?: () => void;
}

const CURRENCY_OPTIONS = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
];

export function CashFundDrawer({
  open,
  onClose,
  cashBook,
  onSuccess,
  mode = "edit",
  onToggleEdit,
}: Props) {
  const t = useT();
  const queryClient = useQueryClient();
  const { currentBranchId } = useAppStore();

  const [selectedBranchId, setSelectedBranchId] = useState(
    currentBranchId || "",
  );
  const [accountingAccountId, setAccountingAccountId] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [isActive, setIsActive] = useState(true);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [periodDate, setPeriodDate] = useState("");

  const { data: branchOptions = [] } = useQuery({
    queryKey: ["branchOptions"],
    queryFn: getBranchOptionsApi,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["chartOfAccounts-flat"],
    queryFn: getChartOfAccountsApi,
  });

  const accountOptions = useMemo(() => {
    const list = Array.isArray(accounts)
      ? accounts
      : (accounts as any).items || [];
    const cashAccounts = list.filter(
      (a: any) =>
        a.accountCode?.startsWith("111") || a.account_code?.startsWith("111"),
    );
    const otherAccounts = list.filter(
      (a: any) =>
        !a.accountCode?.startsWith("111") && !a.account_code?.startsWith("111"),
    );
    return [...cashAccounts, ...otherAccounts].map((a: any) => ({
      value: a.id,
      label: `${a.accountCode || a.account_code} - ${a.accountName || a.account_name}`,
    }));
  }, [accounts]);

  useEffect(() => {
    if (cashBook) {
      setSelectedBranchId(cashBook.branchId ?? currentBranchId ?? "");
      setAccountingAccountId(cashBook.accountingAccountId ?? "");
      setName(cashBook.name ?? "");
      setCurrency(cashBook.currency ?? "VND");
      setIsActive(cashBook.isActive ?? true);
      setOpeningBalance(cashBook.openingBalance ?? 0);
      setPeriodDate(cashBook.periodDate ?? "");
    } else {
      setSelectedBranchId(currentBranchId || "");
      setAccountingAccountId("");
      setName("");
      setCurrency("VND");
      setIsActive(true);
      setOpeningBalance(0);
      setPeriodDate("");
    }
  }, [cashBook, open, currentBranchId]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!selectedBranchId)
        throw new Error(t("settings.branchRequired", "Chi nhánh là bắt buộc"));
      if (!accountingAccountId)
        throw new Error(
          t("settings.accountRequired", "Tài khoản kế toán là bắt buộc"),
        );
      const payload = {
        branchId: selectedBranchId,
        accountingAccountId,
        name: name.trim(),
        currency: currency || "VND",
        isActive,
        openingBalance: openingBalance || 0,
        periodDate: periodDate || undefined,
      };

      if (cashBook) {
        return bankStatementApi.updateCashBook(cashBook.id, payload);
      }
      return bankStatementApi.createCashBook(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-books"] });
      queryClient.invalidateQueries({ queryKey: ["cashBooks"] });
      toast.success(
        cashBook
          ? t("settings.updateSuccess", "Cập nhật sổ quỹ thành công")
          : t("settings.createSuccess", "Tạo sổ quỹ thành công"),
      );
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  const isReadOnly = mode === "view";

  const actions: DrawerAction[] = useMemo(() => {
    if (isReadOnly) {
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
      },
      {
        label: isPending
          ? t("common.saving", "Đang lưu...")
          : t("common.save", "Lưu"),
        onClick: () => mutate(),
        primary: true,
        loading: isPending,
        disabled: isPending || !name.trim() || !selectedBranchId,
      },
    ];
  }, [isReadOnly, isPending, name, selectedBranchId, onClose, mutate, t]);

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      mode={mode}
      onToggleEdit={onToggleEdit}
      layout="1-column"
      size="sm"
      confirmOnClose={mode === "edit"}
      icon={<Wallet className="w-5 h-5 text-emerald-600" />}
      title={
        cashBook
          ? t("common.edit", "Chỉnh sửa sổ quỹ")
          : t("panel.createNew", "Tạo sổ quỹ mới")
      }
      subtitle={
        cashBook
          ? cashBook.name
          : t("settings.cashFundDesc", "Thiết lập thông tin quỹ tiền mặt")
      }
      actions={actions}
      leftPanel={
        <div className="space-y-6">
          <DrawerSection title={t("common.generalInfo", "Thông tin chung")}>
            <DrawerField
              label={t("thietlap.columns.branch", "Chi nhánh")}
              required
            >
              <Combobox
                options={branchOptions}
                value={selectedBranchId}
                onChange={setSelectedBranchId}
                disabled={isReadOnly}
                placeholder={t("settings.selectBranch", "-- Chọn chi nhánh --")}
              />
            </DrawerField>

            <DrawerField
              label={t("settings.cashAccount111", "Tài khoản kế toán (111*)")}
              required
            >
              <Combobox
                options={accountOptions}
                value={accountingAccountId}
                onChange={setAccountingAccountId}
                disabled={isReadOnly}
                placeholder={t(
                  "settings.selectAccount",
                  "-- Chọn tài khoản kế toán --",
                )}
              />
            </DrawerField>

            <DrawerField
              label={t("thietlap.columns.cashFundName", "Tên sổ quỹ")}
              required
            >
              <Input
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                disabled={isReadOnly}
                placeholder={t(
                  "settings.cashFundNamePlaceholder",
                  "Nhập tên sổ quỹ...",
                )}
              />
            </DrawerField>

            <DrawerField label={t("thietlap.columns.currency", "Tiền tệ")}>
              <Combobox
                options={CURRENCY_OPTIONS}
                value={currency}
                onChange={setCurrency}
                disabled={isReadOnly}
              />
            </DrawerField>

            <DrawerField label={t("thietlap.columns.status", "Trạng thái")}>
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(!!checked)}
                  disabled={isReadOnly}
                />
                <span className="text-sm font-medium">
                  {isActive
                    ? t("common.active", "Hoạt động")
                    : t("common.inactive", "Ngưng hoạt động")}
                </span>
              </div>
            </DrawerField>
          </DrawerSection>

          <DrawerSection
            title={t("thietlap.columns.openingBalance", "Số dư ban đầu")}
          >
            <DrawerField label={t("settings.periodDate", "Ngày chốt số dư")}>
              <DatePicker
                value={periodDate}
                onChange={(val) => setPeriodDate(val)}
                disabled={isReadOnly}
                className="w-full"
              />
            </DrawerField>
            <DrawerField label={t("settings.openingBalanceAmount", "Số dư")}>
              <Input
                type="number"
                value={openingBalance}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOpeningBalance(Number(e.target.value))
                }
                disabled={isReadOnly}
              />
            </DrawerField>
          </DrawerSection>
        </div>
      }
    />
  );
}

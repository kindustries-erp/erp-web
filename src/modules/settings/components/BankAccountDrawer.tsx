import React from "react";
import { useT } from "@/core/i18n";
import type { ErpBankAccount } from "@/modules/bank-statements/api/bankStatementApi";
import {
  V2StandardDrawer,
  V2DrawerSize,
  V2DrawerLayout,
  type DrawerAction,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { V2Switch } from "@/v2/shared/components/atoms/v2-switch";
import { useBankAccountDrawer } from "./BankAccountDrawer.hook";

const CURRENCY_OPTIONS = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  bankAccount: ErpBankAccount | null;
  onSuccess: () => void;
}

export function BankAccountDrawer({
  open,
  onClose,
  bankAccount,
  onSuccess,
}: Props) {
  const t = useT();
  const d = useBankAccountDrawer({ open, bankAccount, onSuccess, onClose });

  const actions: DrawerAction[] = [
    {
      label: t("common.cancel") || "Hủy",
      variant: "secondary",
      onClick: onClose,
    },
    {
      label: t("common.save") || "Lưu",
      variant: "primary",
      onClick: d.handleSave,
      loading: d.isPending,
      disabled: !d.canSave,
    },
  ];

  return (
    <V2StandardDrawer
      open={open}
      onClose={onClose}
      size={V2DrawerSize.MD}
      layout={V2DrawerLayout.ONE_COLUMN}
      title={bankAccount ? t("common.edit") : t("panel.createNew")}
      actions={actions}
    >
      <div className="space-y-4">
        <DrawerSection title="Thông tin chung" collapsible={false}>
          <DrawerField label="Chi nhánh *" required>
            <V2Combobox
              options={d.branchOptions}
              value={d.form.selectedBranchId}
              onValueChange={(val) => d.setField("selectedBranchId", val || "")}
              placeholder="-- Chọn chi nhánh --"
            />
          </DrawerField>

          <DrawerField label="Tài khoản kế toán (112*) *" required>
            <V2Combobox
              options={d.accountOptions}
              value={d.form.accountingAccountId}
              onValueChange={(val) =>
                d.setField("accountingAccountId", val || "")
              }
              placeholder="-- Chọn tài khoản kế toán --"
            />
          </DrawerField>

          <DrawerField label="Ngân hàng (chọn từ danh mục)">
            <V2Combobox
              options={d.bankComboboxOptions}
              value={d.form.bankCode}
              onValueChange={d.handleBankSelect}
              placeholder="-- Chọn ngân hàng --"
              onScrollBottom={d.handleBankScrollBottom}
              onSearchChange={d.handleBankSearchChange}
              loading={d.isBanksLoading}
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Mã ngân hàng *" required>
              <V2Input
                value={d.form.bankCode}
                onChange={(e) => d.setField("bankCode", e.target.value)}
                placeholder="Ví dụ: VCB"
              />
            </DrawerField>

            <DrawerField label="Tên ngân hàng *" required>
              <V2Input
                value={d.form.bankName}
                onChange={(e) => d.setField("bankName", e.target.value)}
                placeholder="Ví dụ: Vietcombank"
              />
            </DrawerField>
          </div>

          <DrawerField label="Số tài khoản *" required>
            <V2Input
              value={d.form.accountNumber}
              onChange={(e) => d.setField("accountNumber", e.target.value)}
              placeholder="Nhập số tài khoản"
            />
          </DrawerField>

          <DrawerField label="Tên tài khoản *" required>
            <V2Input
              value={d.form.accountName}
              onChange={(e) => d.setField("accountName", e.target.value)}
              placeholder="Nhập tên chủ tài khoản"
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3 items-center">
            <DrawerField label="Tiền tệ">
              <V2Combobox
                options={CURRENCY_OPTIONS}
                value={d.form.currency}
                onValueChange={(val) => d.setField("currency", val || "VND")}
              />
            </DrawerField>

            <DrawerField label="Trạng thái">
              <div className="h-10 flex items-center">
                <V2Switch
                  checked={d.form.isActive}
                  onCheckedChange={(checked) => d.setField("isActive", checked)}
                  label="Đang hoạt động"
                />
              </div>
            </DrawerField>
          </div>
        </DrawerSection>

        <DrawerSection title="Số dư ban đầu" collapsible={false}>
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Ngày chốt số dư">
              <V2DatePicker
                value={d.form.periodDate}
                onValueChange={(val) => d.setField("periodDate", val || "")}
                placeholder="Chọn ngày"
              />
            </DrawerField>
            <DrawerField label="Số dư">
              <V2NumberInput
                value={d.form.openingBalance}
                onValueChange={(val) => d.setField("openingBalance", val ?? 0)}
              />
            </DrawerField>
          </div>
        </DrawerSection>
      </div>
    </V2StandardDrawer>
  );
}

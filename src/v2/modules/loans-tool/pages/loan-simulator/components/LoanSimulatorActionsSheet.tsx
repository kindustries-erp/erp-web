import React from "react";
import { LogIn, Plus, RotateCcw, Save, SlidersHorizontal } from "lucide-react";
import { V2BottomSheet, V2Button, V2Icon } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface LoanSimulatorActionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  isSaving: boolean;
  onReset: () => void;
  onAddLoan: () => void;
  onSaveToErp: () => Promise<void> | void;
}

export const LoanSimulatorActionsSheet: React.FC<
  LoanSimulatorActionsSheetProps
> = ({
  open,
  onOpenChange,
  isAuthenticated,
  isSaving,
  onReset,
  onAddLoan,
  onSaveToErp,
}) => {
  const { t } = useV2Translation();

  const handleSave = async () => {
    await onSaveToErp();
    onOpenChange(false);
  };

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("v2.loans.simulator.actionsTitle", "Thao tác mô phỏng")}
      subtitle={t(
        "v2.loans.simulator.actionsSubtitle",
        "Quản lý danh mục khoản vay và lưu vào ERP",
      )}
      icon={<V2Icon icon={SlidersHorizontal} size={16} />}
      maxHeightClass="max-h-[85dvh] h-auto"
      bodyClassName="p-4 flex flex-col gap-2.5 overflow-y-auto"
      footer={
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <V2Button
            type="button"
            variant="outline"
            fullWidth
            className="h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            {t("v2.common.close", "Đóng")}
          </V2Button>
        </div>
      }
    >
      <V2Button
        type="button"
        variant="primary"
        fullWidth
        isLoading={isSaving}
        leftIcon={<V2Icon icon={isAuthenticated ? Save : LogIn} size={16} />}
        className="h-12 rounded-xl justify-start px-4"
        onClick={handleSave}
      >
        {isAuthenticated
          ? t("v2.loans.simulator.saveToErp", "Lưu danh mục vào hệ thống ERP")
          : t("v2.loans.simulator.loginToSave", "Đăng nhập để lưu vào ERP")}
      </V2Button>

      <V2Button
        type="button"
        variant="outline"
        fullWidth
        leftIcon={<V2Icon icon={Plus} size={16} />}
        className="h-12 rounded-xl justify-start px-4"
        onClick={() => {
          onAddLoan();
          onOpenChange(false);
        }}
      >
        {t("v2.loans.action.addLoan", "Thêm khoản vay")}
      </V2Button>

      <V2Button
        type="button"
        variant="outline"
        fullWidth
        leftIcon={<V2Icon icon={RotateCcw} size={16} />}
        className="h-12 rounded-xl justify-start px-4"
        onClick={() => {
          onReset();
          onOpenChange(false);
        }}
      >
        {t("v2.loans.action.reset", "Mặc định")}
      </V2Button>
    </V2BottomSheet>
  );
};
LoanSimulatorActionsSheet.displayName = "LoanSimulatorActionsSheet";

import * as React from "react";
import { V2Progress } from "@/v2/shared/components/atoms/v2-progress";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";

const ACCOUNTS = [
  { value: "156", label: "156 - Hàng hóa" },
  { value: "211", label: "211 - Tài sản cố định" },
  { value: "642", label: "642 - Chi phí quản lý" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Drawer hạch toán: mở chồng lên drawer chi tiết (xếp tầng) và có tiến trình giả */
export const InvoiceShapePostingDrawer: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const [date, setDate] = React.useState<string | null>("2026-02-28");
  const [account, setAccount] = React.useState<string | null>("156");
  const [progress, setProgress] = React.useState<number | undefined>(undefined);

  const start = () => {
    setProgress(0);
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + 25);
      setProgress(value);
      if (value >= 100) clearInterval(timer);
    }, 250);
  };

  return (
    <V2StandardDrawer
      id="posting"
      open={open}
      onClose={onClose}
      mode="edit"
      title="Hạch toán hóa đơn"
      subtitle="Ghi sổ kép theo Thông tư 99"
      layout="1-column"
      size="md"
      actions={[
        { label: "Đóng", onClick: onClose },
        {
          label: "Hạch toán",
          primary: true,
          loading: progress !== undefined && progress < 100,
          onClick: start,
        },
      ]}
    >
      <DrawerSection title="Bút toán">
        <div className="grid gap-3">
          <DrawerField label="Ngày hạch toán" required>
            <V2DatePicker value={date} onValueChange={setDate} />
          </DrawerField>
          <DrawerField label="Tài khoản nợ">
            <V2Combobox
              options={ACCOUNTS}
              value={account}
              onValueChange={setAccount}
            />
          </DrawerField>
          {progress !== undefined && (
            <V2Progress
              value={progress}
              label={progress >= 100 ? "Đã hạch toán" : "Đang ghi sổ..."}
              showValue
              tone={progress >= 100 ? "emerald" : "primary"}
            />
          )}
        </div>
      </DrawerSection>
    </V2StandardDrawer>
  );
};

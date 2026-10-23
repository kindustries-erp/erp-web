import * as React from "react";
import {
  V2Progress,
  V2Switch,
  buildV2DatePresets,
  V2DateRangePicker,
  type V2DateRangeValue,
  DrawerField,
  DrawerSection,
  V2StandardDrawer,
} from "@/v2/shared/components";

interface Props {
  open: boolean;
  onClose: () => void;
}

const HISTORY = [
  { id: "1", label: "Hóa đơn mua vào 01/2026", value: 100 },
  { id: "2", label: "Hóa đơn bán ra Q1/2026", value: 64 },
];

/** Drawer xuất Excel: theo kỳ (có mốc nhanh) hoặc theo bộ lọc hiện tại, kèm lịch sử và tiến độ */
export const InvoiceShapeExportDrawer: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const [byFilter, setByFilter] = React.useState(false);
  const [range, setRange] = React.useState<V2DateRangeValue>({});
  const presets = React.useMemo(
    () => buildV2DatePresets((_, fallback) => fallback ?? ""),
    [],
  );

  return (
    <V2StandardDrawer
      id="export"
      open={open}
      onClose={onClose}
      mode="edit"
      title="Xuất Excel hóa đơn"
      layout="1-column"
      size="md"
      actions={[
        { label: "Đóng", onClick: onClose },
        {
          label: "Bắt đầu xuất",
          primary: true,
          disabled: !byFilter && !range.from,
        },
      ]}
    >
      <div className="flex flex-col gap-3">
        <DrawerSection title="Điều kiện xuất">
          <div className="grid gap-3">
            <V2Switch
              label="Theo bộ lọc đang xem trên bảng"
              checked={byFilter}
              onCheckedChange={setByFilter}
            />
            {!byFilter && (
              <DrawerField label="Kỳ hóa đơn" required>
                <V2DateRangePicker
                  value={range}
                  onValueChange={setRange}
                  presets={presets}
                  clearable
                />
              </DrawerField>
            )}
          </div>
        </DrawerSection>
        <DrawerSection title="Lịch sử xuất" count={HISTORY.length}>
          <div className="grid gap-3">
            {HISTORY.map((item) => (
              <V2Progress
                key={item.id}
                label={item.label}
                value={item.value}
                showValue
                tone={item.value >= 100 ? "emerald" : "amber"}
              />
            ))}
          </div>
        </DrawerSection>
      </div>
    </V2StandardDrawer>
  );
};

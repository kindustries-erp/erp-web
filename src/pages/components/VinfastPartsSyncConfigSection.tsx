import { CheckCircle2 } from "lucide-react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Checkbox } from "@/v2/shared/ui/checkbox";

export type VinfastSyncRange = "custom" | "all";

export interface VinfastPartsSyncConfigSectionProps {
  syncRange: VinfastSyncRange;
  onSyncRangeChange: (range: VinfastSyncRange) => void;
  dateFrom?: string;
  onDateFromChange: (value: string | undefined) => void;
  dateTo?: string;
  onDateToChange: (value: string | undefined) => void;
  clearDb: boolean;
  onClearDbChange: (value: boolean) => void;
  isSyncing: boolean;
  onStart: () => void;
}

export function VinfastPartsSyncConfigSection({
  syncRange,
  onSyncRangeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  clearDb,
  onClearDbChange,
  isSyncing,
  onStart,
}: VinfastPartsSyncConfigSectionProps) {
  return (
    <DrawerSection title="Cấu hình đồng bộ">
      <div className="space-y-4 pt-2">
        <DrawerField label="Chu kỳ đồng bộ" required>
          <V2Combobox
            value={syncRange}
            onValueChange={(v) => v && onSyncRangeChange(v as VinfastSyncRange)}
            options={[
              { value: "custom", label: "Tùy chọn ngày" },
              { value: "all", label: "Toàn thời gian" },
            ]}
            searchable={false}
            clearable={false}
          />
        </DrawerField>

        {syncRange === "custom" && (
          <>
            <DrawerField label="Từ ngày (Mặc định lấy tháng hiện tại)" required>
              <V2DatePicker
                value={dateFrom ?? null}
                onValueChange={(v) => onDateFromChange(v ?? undefined)}
              />
            </DrawerField>
            <DrawerField label="Đến ngày" required>
              <V2DatePicker
                value={dateTo ?? null}
                onValueChange={(v) => onDateToChange(v ?? undefined)}
              />
            </DrawerField>
          </>
        )}

        <label className="flex items-center gap-2 pt-2 text-sm font-medium text-foreground">
          <Checkbox
            checked={clearDb}
            onCheckedChange={(checked) => onClearDbChange(checked === true)}
          />
          Xóa sạch dữ liệu cũ trước khi đồng bộ
        </label>

        <div className="flex justify-end pt-4">
          <V2Button
            onClick={onStart}
            disabled={isSyncing}
            isLoading={isSyncing}
            loadingText="Đang xử lý..."
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Bắt đầu đồng bộ
          </V2Button>
        </div>
      </div>
    </DrawerSection>
  );
}

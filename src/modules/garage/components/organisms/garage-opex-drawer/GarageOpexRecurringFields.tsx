import React from "react";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import type { useGarageOpexDrawer } from "./garage-opex-drawer.hook";

interface GarageOpexRecurringFieldsProps {
  form: ReturnType<typeof useGarageOpexDrawer>;
  isView: boolean;
}

export function GarageOpexRecurringFields({
  form,
  isView,
}: GarageOpexRecurringFieldsProps) {
  const {
    loading,
    isRecurring,
    setIsRecurring,
    untilMonth,
    setUntilMonth,
    untilYear,
    setUntilYear,
    monthOptions,
    untilYearOptions,
    t,
  } = form;

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => !isView && !loading && setIsRecurring(!isRecurring)}
        className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer border border-border/60"
      >
        <Checkbox
          checked={isRecurring}
          onCheckedChange={(c) => setIsRecurring(Boolean(c))}
          disabled={isView || loading}
          id="recurring-checkbox"
        />
        <div className="flex flex-col select-none">
          <label
            htmlFor="recurring-checkbox"
            className="text-xs font-semibold text-foreground cursor-pointer"
          >
            {t("opex.drawer.enableRecurring", "Lặp lại định kỳ hàng tháng")}
          </label>
          <span className="text-[11px] text-muted-foreground">
            {t(
              "opex.drawer.enableRecurringDesc",
              "Tự động đồng bộ số tiền cho các tháng tiếp theo",
            )}
          </span>
        </div>
      </div>

      {isRecurring && (
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {t(
                "opex.drawer.recurringConfigHeader",
                "Cấu hình chu kỳ & thời hạn lặp lại",
              )}
            </span>
          </div>
          <DrawerField
            label={t("opex.drawer.recurrenceType", "Chu kỳ lặp lại")}
          >
            <input
              type="text"
              value={t("opex.drawer.monthlyLabel", "Hàng tháng")}
              disabled
              className={`${inputCls} bg-muted/60 text-muted-foreground font-medium text-xs`}
            />
          </DrawerField>
          <div className="grid grid-cols-2 gap-3">
            <DrawerField
              label={t("opex.drawer.untilMonth", "Áp dụng đến Tháng")}
            >
              <Combobox
                options={monthOptions}
                value={String(untilMonth)}
                onChange={(v) => v && setUntilMonth(Number(v))}
                disabled={isView || loading}
                allowClear={false}
              />
            </DrawerField>
            <DrawerField label={t("opex.drawer.untilYear", "Năm kết thúc")}>
              <Combobox
                options={untilYearOptions}
                value={String(untilYear)}
                onChange={(v) => v && setUntilYear(Number(v))}
                disabled={isView || loading}
                allowClear={false}
              />
            </DrawerField>
          </div>
        </div>
      )}
    </div>
  );
}

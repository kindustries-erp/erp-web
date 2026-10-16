import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { RefreshCw } from "lucide-react";
import type { useGarageOpexDrawer } from "./garage-opex-drawer.hook";
import { GarageOpexMainFields } from "./GarageOpexMainFields";
import { GarageOpexRecurringFields } from "./GarageOpexRecurringFields";

interface GarageOpexDrawerFormProps {
  form: ReturnType<typeof useGarageOpexDrawer>;
  isView: boolean;
}

export function GarageOpexDrawerForm({
  form,
  isView,
}: GarageOpexDrawerFormProps) {
  const { isReadOnlyRecord, isVoucherSourced, t } = form;

  return (
    <div className="flex flex-col gap-4">
      {isReadOnlyRecord && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
          <span className="text-base leading-none">⚡</span>
          <span className="font-medium">
            {isVoucherSourced
              ? t(
                  "opex.voucherSourcedNotice",
                  "Khoản chi này được ghi nhận từ phiếu chi garage (Chỉ đọc). Vui lòng chỉnh sửa tại Thu chi garage.",
                )
              : t(
                  "opex.autoCalculatedNotice",
                  "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L (Chỉ đọc).",
                )}
          </span>
        </div>
      )}

      {/* Section 1: Thông tin chi phí */}
      <DrawerSection
        title={t("opex.drawer.sectionInfo", "Thông tin chi phí")}
        collapsible
        defaultCollapsed={false}
      >
        <GarageOpexMainFields form={form} isView={isView} />
      </DrawerSection>

      {/* Section 2: Phát sinh định kỳ */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span>
              {t("opex.drawer.sectionRecurring", "Phát sinh chi phí định kỳ")}
            </span>
          </div>
        }
        collapsible
        defaultCollapsed={false}
      >
        <GarageOpexRecurringFields form={form} isView={isView} />
      </DrawerSection>
    </div>
  );
}

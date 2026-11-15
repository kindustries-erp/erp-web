import * as React from "react";
import { CalendarDays } from "lucide-react";
import { V2Button, V2Icon } from "@/v2/shared/components/atoms";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

interface V2DateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

/** Khung bottom sheet dùng chung cho V2DatePicker và V2DateRangePicker trên mobile */
export const V2DateSheet: React.FC<V2DateSheetProps> = ({
  open,
  onOpenChange,
  title,
  children,
}) => {
  const { t } = useV2Translation();

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      icon={<V2Icon icon={CalendarDays} size={16} />}
      maxHeightClass="max-h-[85dvh] h-auto"
      bodyClassName="px-4 py-3 overflow-y-auto"
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
      {children}
    </V2BottomSheet>
  );
};
V2DateSheet.displayName = "V2DateSheet";

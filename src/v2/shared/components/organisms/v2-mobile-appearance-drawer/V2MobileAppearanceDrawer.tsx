import * as React from "react";
import { Palette } from "lucide-react";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { V2MobileAppearanceSettings } from "@/v2/shared/components/molecules/v2-mobile-appearance-settings";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2MobileAppearanceDrawerProps } from "./V2MobileAppearanceDrawer.type";

export const V2MobileAppearanceDrawer: React.FC<
  V2MobileAppearanceDrawerProps
> = ({ open, onOpenChange, currentTheme, onThemeChange, className }) => {
  const { t } = useV2Translation();

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("v2.appearance.title", "Giao diện & Ngôn ngữ")}
      subtitle={t(
        "v2.appearance.subtitle",
        "Tùy chỉnh chủ đề màu sắc và ngôn ngữ hiển thị",
      )}
      icon={Palette}
      maxHeightClass="h-auto max-h-[70vh]"
      className={className}
    >
      <div className="pb-6 pt-1">
        <V2MobileAppearanceSettings
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
        />
      </div>
    </V2BottomSheet>
  );
};

V2MobileAppearanceDrawer.displayName = "V2MobileAppearanceDrawer";

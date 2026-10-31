import * as React from "react";
import {
  V2Button,
  V2Text,
  V2Icon,
  V2LanguageSwitcher,
  Palette,
  Globe,
  Sun,
  Moon,
  Sparkles,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2MobileAppearanceSettingsProps } from "./V2MobileAppearanceSettings.type";

export const V2MobileAppearanceSettings: React.FC<
  V2MobileAppearanceSettingsProps
> = ({ currentTheme, onThemeChange }) => {
  const { t } = useV2Translation();

  return (
    <div
      data-testid="mobile-appearance-settings"
      className="p-3 rounded-xl bg-card border border-border space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <V2Icon icon={Palette} size={14} className="text-primary" />
          <V2Text variant="caption" weight="semibold">
            {t("nav.bottom.themeStyle", "Giao diện")}
          </V2Text>
        </div>
        <div className="flex items-center gap-1">
          <V2Button
            size="xs"
            variant={currentTheme === "classic-light" ? "secondary" : "ghost"}
            className={cn(
              "h-7 px-2 text-xs border",
              currentTheme === "classic-light"
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-fg",
            )}
            leftIcon={
              <V2Icon icon={Sun} size={14} className="text-amber-500" />
            }
            onClick={() => onThemeChange?.("classic-light")}
            title={t("nav.bottom.themeClassicLight", "Giao diện sáng")}
          >
            <V2Text variant="caption">{t("v2.theme.light", "Sáng")}</V2Text>
          </V2Button>

          <V2Button
            size="xs"
            variant={currentTheme === "classic-dark" ? "secondary" : "ghost"}
            className={cn(
              "h-7 px-2 text-xs border",
              currentTheme === "classic-dark"
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-fg",
            )}
            leftIcon={
              <V2Icon icon={Moon} size={14} className="text-slate-400" />
            }
            onClick={() => onThemeChange?.("classic-dark")}
            title={t("nav.bottom.themeClassicDark", "Giao diện tối")}
          >
            <V2Text variant="caption">{t("v2.theme.dark", "Tối")}</V2Text>
          </V2Button>

          <V2Button
            size="xs"
            variant={currentTheme === "midnight" ? "secondary" : "ghost"}
            className={cn(
              "h-7 px-2 text-xs border",
              currentTheme === "midnight"
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-fg",
            )}
            leftIcon={
              <V2Icon icon={Sparkles} size={14} className="text-indigo-400" />
            }
            onClick={() => onThemeChange?.("midnight")}
            title={t("nav.bottom.themeMidnight", "Midnight")}
          >
            <V2Text variant="caption">Midnight</V2Text>
          </V2Button>
        </div>
      </div>

      <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <V2Icon icon={Globe} size={14} className="text-primary" />
          <V2Text variant="caption" weight="semibold">
            {t("nav.bottom.languageLabel", "Ngôn ngữ")}
          </V2Text>
        </div>
        <V2LanguageSwitcher size="default" />
      </div>
    </div>
  );
};

V2MobileAppearanceSettings.displayName = "V2MobileAppearanceSettings";

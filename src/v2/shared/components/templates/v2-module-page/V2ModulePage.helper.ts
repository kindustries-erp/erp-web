import { V2PageHeaderVariant } from "@/v2/shared/components/molecules/v2-page-header";
import type { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  V2_MODULE_PAGE_TAB_TO_BAR_VARIANT,
  V2ModulePageTabVariant,
  V2ModulePageVariant,
} from "./V2ModulePage.type";

export interface V2ModulePageAppearance {
  headerVariant: V2PageHeaderVariant;
  barTabVariant: V2TabBarVariant;
  containerClass: string;
}

const PRESET_CONFIG: Record<
  V2ModulePageVariant,
  {
    headerVariant: V2PageHeaderVariant;
    tabVariant: V2ModulePageTabVariant;
    containerClass: string;
  }
> = {
  [V2ModulePageVariant.DEFAULT]: {
    headerVariant: V2PageHeaderVariant.FLAT,
    tabVariant: V2ModulePageTabVariant.PAGE,
    containerClass: "px-2 sm:px-5 pt-1.5 sm:pt-[18px] pb-2 gap-2 sm:gap-4",
  },
  [V2ModulePageVariant.CARD]: {
    headerVariant: V2PageHeaderVariant.CARD,
    tabVariant: V2ModulePageTabVariant.PILL,
    containerClass: "px-2 sm:px-6 pt-2 sm:pt-5 pb-3 gap-3 sm:gap-5",
  },
};

/** Hợp nhất preset variant và prop ghi đè lẻ cho V2ModulePage. */
export function resolveV2ModulePageAppearance(params: {
  variant?: V2ModulePageVariant;
  headerVariant?: V2PageHeaderVariant;
  tabVariant?: V2ModulePageTabVariant;
}): V2ModulePageAppearance {
  const preset = PRESET_CONFIG[params.variant ?? V2ModulePageVariant.DEFAULT];
  const resolvedHeader = params.headerVariant ?? preset.headerVariant;
  const resolvedTab = params.tabVariant ?? preset.tabVariant;
  const containerClass =
    resolvedHeader === V2PageHeaderVariant.CARD
      ? PRESET_CONFIG[V2ModulePageVariant.CARD].containerClass
      : preset.containerClass;

  return {
    headerVariant: resolvedHeader,
    barTabVariant: V2_MODULE_PAGE_TAB_TO_BAR_VARIANT[resolvedTab],
    containerClass,
  };
}

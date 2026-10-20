import React, { useMemo } from "react";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  ERP_MODULE_REGISTRY,
  type ErpModuleDomain,
} from "@/shared/constants/customFields";

export interface ModuleConfigAttributeHeaderProps {
  domainKey?: ErpModuleDomain;
  activeModuleKey: string;
  onSelectModule: (key: string) => void;
  hidePillTabs?: boolean;
  t: (key: string, fallback: string) => string;
}

export function ModuleConfigAttributeHeader({
  domainKey,
  activeModuleKey,
  onSelectModule,
  hidePillTabs = false,
  t,
}: ModuleConfigAttributeHeaderProps) {
  const domainMods = useMemo(
    () => ERP_MODULE_REGISTRY.filter((m) => m.domain === domainKey),
    [domainKey],
  );

  const pillTabItems = useMemo(
    () =>
      domainMods.map((m) => ({
        value: m.key,
        label: t(m.nameKey, m.defaultName),
      })),
    [domainMods, t],
  );

  if (hidePillTabs || pillTabItems.length <= 1) return null;

  return (
    <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        size="sm"
        variant="pill"
        items={pillTabItems}
        value={activeModuleKey}
        onValueChange={onSelectModule}
      />
    </div>
  );
}

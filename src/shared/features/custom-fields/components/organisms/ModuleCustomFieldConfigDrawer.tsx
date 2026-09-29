import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, RotateCcw } from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";
import {
  ERP_DOMAIN_REGISTRY,
  ERP_MODULE_REGISTRY,
} from "../../domains/constants";
import type {
  ErpModuleDomain,
  ModuleCustomFieldConfigDrawerProps,
} from "../../domains/types";
import { ModuleLivePreviewPanel } from "../molecules/ModuleLivePreviewPanel";
import { ModuleCustomFieldConfigContent } from "./ModuleCustomFieldConfigContent";

const DOMAIN_KEYS = Object.keys(ERP_DOMAIN_REGISTRY) as ErpModuleDomain[];

export function ModuleCustomFieldConfigDrawer({
  open,
  onClose,
  mode = "unified",
  moduleKey,
  moduleLabel,
  initialTab,
  initialAttrCode,
}: ModuleCustomFieldConfigDrawerProps) {
  const t = useT();

  const [isContentDirty, setIsContentDirty] = useState(false);
  const [pendingDomainKey, setPendingDomainKey] = useState<string | null>(null);

  // Query ALL global attributes across the ERP ecosystem
  const { data: allGlobalDefs = [] } = useQuery({
    queryKey: ["module-config-all-global-defs"],
    queryFn: () => moduleConfigApi.getAttributeDefs(undefined, true),
    enabled: open,
  });

  // Calculate total attributes count per domain for top group tab badges
  const domainAttrCounts = useMemo(() => {
    const counts: Record<ErpModuleDomain, number> = {
      FINANCE: 0,
      PRODUCTION: 0,
      COMMERCE: 0,
      INVENTORY: 0,
      GARAGE: 0,
    };

    for (const gDef of allGlobalDefs) {
      if (gDef.isDeleted) continue;
      const mod = ERP_MODULE_REGISTRY.find(
        (m) => m.key === gDef.moduleKeyGlobal,
      );
      if (mod) {
        counts[mod.domain] += 1;
      }
    }

    return counts;
  }, [allGlobalDefs]);

  // Initial active module key
  const [activeModuleKey, setActiveModuleKey] = useState<string>(() => {
    const target = initialTab || moduleKey;
    if (target === "INVOICE" || !target) return "INVOICE_IN";
    return String(target);
  });

  useEffect(() => {
    if (open) {
      const target = initialTab || moduleKey;
      if (target === "INVOICE" || !target) {
        setActiveModuleKey("INVOICE_IN");
      } else {
        setActiveModuleKey(String(target));
      }
    }
  }, [open, initialTab, moduleKey]);

  // Find active module's domain
  const activeModuleDef = useMemo(
    () => ERP_MODULE_REGISTRY.find((m) => m.key === activeModuleKey),
    [activeModuleKey],
  );

  const activeDomain = activeModuleDef?.domain || "FINANCE";

  const executeDomainGroupChange = (domainKey: string) => {
    const domainMods = ERP_MODULE_REGISTRY.filter(
      (m) => m.domain === domainKey,
    );
    if (domainMods.length > 0) {
      const alreadyInDomain = domainMods.some((m) => m.key === activeModuleKey);
      if (!alreadyInDomain) {
        setActiveModuleKey(domainMods[0].key);
      }
    }
  };

  const handleDomainGroupChange = (domainKey: string) => {
    if (domainKey === activeDomain) return;
    if (isContentDirty) {
      setPendingDomainKey(domainKey);
      return;
    }
    executeDomainGroupChange(domainKey);
  };

  // Build Top Group Tabs for the 5 ERP Domains
  const tabs: DrawerTopTabItem[] = useMemo(() => {
    return DOMAIN_KEYS.map((dKey) => {
      const domainMeta = ERP_DOMAIN_REGISTRY[dKey];
      const domainBadge = domainAttrCounts[dKey] || 0;

      return {
        key: dKey,
        label: t(domainMeta.titleKey, domainMeta.defaultTitle),
        icon: domainMeta.icon,
        badgeCount: domainBadge,
        badgeVariant: domainBadge > 0 ? "default" : "secondary",
        content: (
          <ModuleCustomFieldConfigContent
            domainKey={dKey}
            activeModuleKey={activeModuleKey}
            onSelectModule={setActiveModuleKey}
            isOpen={open}
            onDirtyChange={setIsContentDirty}
            initialAttrCode={initialAttrCode}
          />
        ),
      };
    });
  }, [domainAttrCounts, activeModuleKey, open, t, initialAttrCode]);

  const [previewResetKey, setPreviewResetKey] = useState(0);

  const { data: currentModuleGlobalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", activeModuleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(activeModuleKey),
    enabled: open && !!activeModuleKey,
  });

  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  const handleRequestClose = useCallback(() => {
    if (isContentDirty) {
      setShowCloseConfirmModal(true);
    } else {
      onClose();
    }
  }, [isContentDirty, onClose]);

  const titleText =
    mode === "single" && moduleLabel
      ? `${t("moduleConfig.title", "Cấu hình trường tùy chỉnh")} — ${moduleLabel}`
      : t("moduleConfig.title", "Cấu hình trường tùy chỉnh");

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={handleRequestClose}
        confirmOnClose={false}
        icon={<Settings className="w-5 h-5 text-primary" />}
        title={titleText}
        subtitle={t(
          "moduleConfig.subtitle",
          "Quản lý các thuộc tính động cấu hình theo từng phân hệ",
        )}
        layout="2-columns"
        size="xl"
        zIndex={400}
        tabs={tabs}
        activeTabKey={activeDomain}
        onTabChange={handleDomainGroupChange}
        collapsibleRightPanel={true}
        rightPanelTitle={t(
          "moduleConfig.livePreviewTitle",
          "Xem trước Form thực tế",
        )}
        rightPanelTitleExtra={
          <Tooltip content={t("common.reset", "Làm mới")}>
            <button
              type="button"
              onClick={() => setPreviewResetKey((k) => k + 1)}
              className="p-1 -mr-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label={t("common.reset", "Làm mới")}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        }
        rightPanelDefaultCollapsed={false}
        stickyRightPanel={true}
        rightPanel={
          <ModuleLivePreviewPanel
            attributes={currentModuleGlobalDefs}
            moduleKey={activeModuleKey}
            resetKey={previewResetKey}
          />
        }
      />

      {/* Discard confirmation modal when closing drawer with unsaved changes */}
      <ConfirmModal
        open={showCloseConfirmModal}
        title={t("moduleConfig.confirmCloseTitle", "Xác nhận thoát cấu hình")}
        message={t(
          "moduleConfig.confirmCloseDesc",
          "Bạn đang có thông tin cấu hình thuộc tính chưa được lưu. Nếu thoát bây giờ, các thay đổi sẽ bị mất. Bạn có chắc chắn muốn thoát?",
        )}
        confirmLabel={t("common.discardChanges", "Thoát không lưu")}
        cancelLabel={t("common.continueEditing", "Tiếp tục chỉnh sửa")}
        danger
        onConfirm={() => {
          setShowCloseConfirmModal(false);
          setIsContentDirty(false);
          onClose();
        }}
        onCancel={() => setShowCloseConfirmModal(false)}
      />

      {/* Discard confirmation modal when switching domain with unsaved changes */}
      <ConfirmModal
        open={pendingDomainKey !== null}
        title={t("common.confirmCancelTitle", "Xác nhận hủy thay đổi")}
        message={t(
          "common.confirmCancelDesc",
          "Bạn có thay đổi chưa được lưu. Nếu chuyển nhóm phân hệ khác bây giờ, các thay đổi sẽ bị mất. Bạn có chắc chắn muốn chuyển?",
        )}
        confirmLabel={t("common.discardChanges", "Chuyển nhóm")}
        cancelLabel={t("common.continueEditing", "Tiếp tục sửa")}
        danger
        onConfirm={() => {
          if (pendingDomainKey) {
            setIsContentDirty(false);
            executeDomainGroupChange(pendingDomainKey);
          }
          setPendingDomainKey(null);
        }}
        onCancel={() => setPendingDomainKey(null)}
      />
    </>
  );
}

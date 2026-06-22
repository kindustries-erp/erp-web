import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { InventoryListPage } from "@/modules/operational/components/InventoryListPage";
import { ErpWarehouseTab } from "@/pages/ErpWarehouseTab";
import { useT } from "@/core/i18n";

type InventoryTabKind = "stock" | "vouchers";

export function Kho() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<InventoryTabKind>("stock");
  const [tabActions, setTabActions] = useState<React.ReactNode>(null);

  const TAB_OPTIONS = useMemo<{ key: InventoryTabKind; label: string }[]>(
    () => [
      { key: "stock", label: t("inventory.tabStock") },
      { key: "vouchers", label: t("inventory.tabVouchers") },
    ],
    [t],
  );

  const desc =
    activeTab === "stock"
      ? t("inventory.descStock")
      : t("inventory.descVouchers");

  return (
    <PageLayout
      title={t("inventory.pageTitle")}
      desc={desc}
      icon={<FileText className="h-5 w-5" />}
      tabs={TAB_OPTIONS.map((tab) => ({ value: tab.key, label: tab.label }))}
      activeTab={activeTab}
      onTabChange={(value) => {
        setActiveTab(value as InventoryTabKind);
        setTabActions(null);
      }}
      actions={tabActions}
    >
      {activeTab === "stock" ? (
        <InventoryListPage setActions={setTabActions} />
      ) : (
        <ErpWarehouseTab setActions={setTabActions} />
      )}
    </PageLayout>
  );
}

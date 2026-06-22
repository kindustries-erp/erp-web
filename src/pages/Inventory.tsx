import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { InventoryListPage } from "@/modules/operational/components/InventoryListPage";
import { ErpWarehouseTab } from "@/pages/ErpWarehouseTab";

type InventoryTabKind = "stock" | "vouchers";

export function Kho() {
  const [activeTab, setActiveTab] = useState<InventoryTabKind>("stock");
  const [tabActions, setTabActions] = useState<React.ReactNode>(null);

  const TAB_OPTIONS = useMemo<{ key: InventoryTabKind; label: string }[]>(
    () => [
      { key: "stock", label: "Tồn kho" },
      { key: "vouchers", label: "Chứng từ kho" },
    ],
    [],
  );

  const desc =
    activeTab === "stock"
      ? "Tổng hợp tồn kho toàn bộ hàng hóa: linh kiện (RAW), thành phẩm (FG), bán thành phẩm (WIP)."
      : "Quản lý phiếu nhập kho và xuất kho.";

  return (
    <PageLayout
      title="Kho"
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

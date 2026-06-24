import { useState } from "react";
import { Package } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { InventoryListPage } from "@/modules/operational/components/InventoryListPage";
import { useT } from "@/core/i18n";

export function InventoryStockPage() {
  const t = useT();
  const [pageActions, setPageActions] = useState<React.ReactNode>(null);

  return (
    <PageLayout
      title={t("inventory.tabStock")}
      desc={t("inventory.descStock")}
      icon={<Package className="h-5 w-5" />}
      actions={pageActions}
    >
      <InventoryListPage setActions={setPageActions} />
    </PageLayout>
  );
}

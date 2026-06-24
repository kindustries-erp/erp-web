import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { ErpWarehouseTab } from "@/pages/ErpWarehouseTab";
import { useT } from "@/core/i18n";

export function InventoryVouchersPage() {
  const t = useT();
  const [pageActions, setPageActions] = useState<React.ReactNode>(null);

  return (
    <PageLayout
      title={t("inventory.tabVouchers")}
      desc={t("inventory.descVouchers")}
      icon={<ReceiptText className="h-5 w-5" />}
      actions={pageActions}
    >
      <ErpWarehouseTab setActions={setPageActions} />
    </PageLayout>
  );
}

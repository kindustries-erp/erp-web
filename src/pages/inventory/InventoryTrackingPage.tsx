import { useState } from "react";
import { Barcode } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TrackedGoodsPage } from "@/modules/operational/components/list/TrackedGoodsPage";
import { useT } from "@/core/i18n";

export function InventoryTrackingPage() {
  const t = useT();
  const [pageActions, setPageActions] = useState<React.ReactNode>(null);

  return (
    <PageLayout
      title={t("Serial / Tracking")}
      desc={t("Danh sách sản phẩm / vật tư có tracking")}
      icon={<Barcode className="h-5 w-5" />}
      actions={pageActions}
    >
      <TrackedGoodsPage setActions={setPageActions} />
    </PageLayout>
  );
}

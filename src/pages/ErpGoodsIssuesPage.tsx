import { Boxes } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";

export function ErpGoodsIssuesPage() {
  return (
    <PageLayout
      title="ERP Goods Issues"
      desc="Xuất kho giao hàng cho đơn bán."
      icon={<Boxes className="h-5 w-5" />}
      className="p-4 md:p-6"
    >
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            ERP Goods Issues
          </h3>
          <p className="text-sm text-muted-foreground">
            Xuất kho giao hàng cho đơn bán.
          </p>
          <p className="text-sm text-muted-foreground">
            Wave 1 shell wire xong. CRUD/data sẽ implement ở bước tiếp theo.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

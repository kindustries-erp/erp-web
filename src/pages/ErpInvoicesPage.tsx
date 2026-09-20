import { ErpInvoicesTab } from "@/modules/erp-invoices-core/components/ErpInvoicesTab";

export function ErpInvoicesPage({
  instanceIndex = 1,
  initialTab,
}: {
  instanceIndex?: 1 | 2;
  initialTab?: "dashboard" | "in" | "in-lines" | "out" | "out-lines" | "draft";
}) {
  const initialDirection =
    initialTab === "out" || initialTab === "out-lines" ? "OUT" : undefined;
  return (
    <ErpInvoicesTab
      direction={initialDirection}
      instanceIndex={instanceIndex}
      initialTab={initialTab}
    />
  );
}

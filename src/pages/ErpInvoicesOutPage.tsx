import { ErpInvoicesTab } from "@/modules/erp-invoices-core/components/ErpInvoicesTab";

export function ErpInvoicesOutPage({
  instanceIndex = 1,
}: {
  instanceIndex?: 1 | 2;
}) {
  return <ErpInvoicesTab direction="OUT" instanceIndex={instanceIndex} />;
}

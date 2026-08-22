import { ErpInvoicesTab } from "@/modules/erp-invoices-core/components/ErpInvoicesTab";

export function ErpInvoicesInPage({
  instanceIndex = 1,
}: {
  instanceIndex?: 1 | 2;
}) {
  return <ErpInvoicesTab direction="IN" instanceIndex={instanceIndex} />;
}

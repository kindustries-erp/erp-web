import { ErpInvoicesPage } from "./ErpInvoicesPage";

export function ErpInvoicesOutPage({
  instanceIndex = 1,
}: {
  instanceIndex?: 1 | 2;
}) {
  return <ErpInvoicesPage initialTab="out" instanceIndex={instanceIndex} />;
}

import { ErpInvoicesPage } from "./ErpInvoicesPage";

export function ErpInvoicesInPage({
  instanceIndex = 1,
  initialTab,
}: {
  instanceIndex?: 1 | 2;
  initialTab?: "in" | "in-lines" | "out" | "out-lines";
}) {
  return (
    <ErpInvoicesPage
      instanceIndex={instanceIndex}
      initialTab={initialTab || "in"}
    />
  );
}

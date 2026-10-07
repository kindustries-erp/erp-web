export interface SyncAdvancedFormValues {
  companyTaxCode: string;
  syncType: "purchase" | "sold";
  queryType: "query" | "sco-query" | "all";
  fromDate: string;
  toDate: string;
  downloadOriginalPdf: boolean;
  concurrency: number;
}

export function getDefaultSyncAdvancedFormValues(
  defaultTaxCode = "",
): SyncAdvancedFormValues {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const fromDate = `${year}-${month}-01`;
  const toDate = `${year}-${month}-${day}`;

  return {
    companyTaxCode: defaultTaxCode,
    syncType: "purchase",
    queryType: "query",
    fromDate,
    toDate,
    downloadOriginalPdf: true,
    concurrency: 3,
  };
}

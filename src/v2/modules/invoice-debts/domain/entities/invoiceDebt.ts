export type InvoiceDebtStatus = "ACTIVE" | "INACTIVE";

export interface InvoiceDebt {
  id: string;
  search: string;
  partnerType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface InvoiceDebtFormValue {
  search: string;
  partnerType: string;
}

export const emptyInvoiceDebtForm = (): InvoiceDebtFormValue => ({
  search: "",
  partnerType: "ACTIVE",
});

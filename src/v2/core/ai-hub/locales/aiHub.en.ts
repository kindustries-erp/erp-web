import type { aiHubVi } from "./aiHub.vi";

export const aiHubEn: typeof aiHubVi = {
  invoice: {
    launcher: "AI invoice assistant",
    title: "Invoice assistant",
    subtitle: "Read an invoice and draft a purchase request",
    greeting:
      "Send a photo or PDF of an invoice. I will read the line items, match them to the item catalog and draft a purchase request for you to review.",
    attach: "Choose an invoice image or file",
    attachAnother: "Read another invoice",
    reading: "Reading the invoice",
    creating: "Creating the purchase request",
    summary:
      "Read {{count}} line items. Check codes and quantities, then confirm.",
    seller: "Supplier",
    invoiceNo: "Invoice no.",
    total: "Total",
    confirm: "Create purchase request",
    reset: "Start over",
    done: "Purchase request {{requestNo}} created.",
    createdItems: "New item codes: {{codes}}",
    noLines: "At least one line item is needed to create a purchase request.",
    readError: "Could not read the invoice. Please try again.",
    createError: "Could not create the purchase request. Please try again.",
    rejectType: "Only JPG, PNG, WEBP images or PDF files are accepted.",
    rejectSize: "The file is larger than 10MB.",
  },
  line: {
    matched: "In catalog",
    isNew: "New code",
    code: "Item code",
    codeAuto: "Auto-generated",
    qty: "Quantity",
    unitPrice: "Unit price",
    remove: "Remove line {{name}}",
    catalogName: "In catalog: {{name}}",
  },
  warning: {
    SKIPPED_LINES: "Some lines could not be read and were skipped.",
    MISSING_UNIT_PRICE: "Some lines have no unit price.",
    TOTAL_MISMATCH: "The line total differs a lot from the invoice total.",
  },
};

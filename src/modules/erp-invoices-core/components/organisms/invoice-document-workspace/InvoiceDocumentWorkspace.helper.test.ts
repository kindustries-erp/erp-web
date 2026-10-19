import { describe, it, expect } from "vitest";
import { normalizeInvoiceDocuments } from "./InvoiceDocumentWorkspace.helper";

const ZIP_KEY = "invoices/IN/2026/10/2026-10-19_0108818792_C26TTH_54.zip";

describe("normalizeInvoiceDocuments", () => {
  it("returns empty list for null invoice", () => {
    expect(normalizeInvoiceDocuments(null)).toEqual([]);
  });

  it("shows the provider zip from xml_file_key when there are no attachments", () => {
    const docs = normalizeInvoiceDocuments({
      attachments: [],
      pdfFileKey: null,
      pdfFiles: [],
      xmlFileKey: ZIP_KEY,
    } as any);

    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({
      id: ZIP_KEY,
      fileKey: ZIP_KEY,
      name: "2026-10-19_0108818792_C26TTH_54.zip",
      mimeType: "application/zip",
      isLegacy: true,
    });
  });

  it("does not duplicate the zip when an attachment already has the same fileKey", () => {
    const docs = normalizeInvoiceDocuments({
      attachments: [
        {
          attachment: {
            id: "att-1",
            fileKey: ZIP_KEY,
            fileName: "pkg.zip",
            mimeType: "application/xml",
          },
        },
      ],
      pdfFileKey: null,
      pdfFiles: [],
      xmlFileKey: ZIP_KEY,
    } as any);

    expect(docs).toHaveLength(1);
    expect(docs[0].attachmentId).toBe("att-1");
    expect(docs[0].isLegacy).toBe(false);
  });

  it("does not add a plain .xml key as a document", () => {
    const docs = normalizeInvoiceDocuments({
      attachments: [],
      pdfFileKey: null,
      pdfFiles: [],
      xmlFileKey: "invoices/IN/2026/10/a.xml",
    } as any);

    expect(docs).toEqual([]);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const cardSpy = vi.fn();
const lastCardProps = () =>
  cardSpy.mock.calls[cardSpy.mock.calls.length - 1]?.[0];
vi.mock("../../molecules/provider-lookup-info-card", () => ({
  ProviderLookupInfoCard: (props: any) => {
    cardSpy(props);
    return <div data-testid="lookup-card">{props.providerCode}</div>;
  },
}));
vi.mock("../erp-invoice-general-info", () => ({
  ErpInvoiceGeneralInfoSection: () => <div />,
}));
vi.mock("../erp-invoice-default-attributes-section", () => ({
  ErpInvoiceDefaultAttributesSection: () => <div />,
}));
vi.mock("@/shared/components/organisms", () => ({
  ModuleEntityCustomFieldsSection: () => <div />,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const lookupState = { data: undefined as any };
const downloadMutateAsync = vi.fn().mockResolvedValue({ success: true });
const uploadMutateAsync = vi.fn().mockResolvedValue({});
vi.mock("../../../hooks/useOriginalPdfLookupInfo", () => ({
  useOriginalPdfLookupInfo: vi.fn(() => lookupState),
}));
vi.mock("../../../hooks/useDownloadOriginalPdf", () => ({
  useDownloadOriginalPdf: () => ({
    mutateAsync: downloadMutateAsync,
    isPending: false,
  }),
}));
vi.mock("../../../hooks/useManualUploadPdf", () => ({
  useManualUploadPdf: () => ({
    mutateAsync: uploadMutateAsync,
    isPending: false,
  }),
}));

import { ErpInvoiceInternalSidebar } from "./ErpInvoiceInternalSidebar";

const baseInvoice = {
  id: "inv-1",
  invoiceNo: "2698",
  providerCode: "BKAV",
  lookupCode: null,
  lookupUrl: null,
  pdfFileKey: null,
  pdfSource: null,
  pdfError: "Lỗi cũ",
  xmlFileKey: "invoices/IN/x.zip",
} as any;

const renderSidebar = (direction: "IN" | "OUT", invoice = baseInvoice) =>
  render(
    <ErpInvoiceInternalSidebar
      form={{} as any}
      editMode={false}
      fieldSet={vi.fn()}
      direction={direction}
      detailInvoice={invoice}
      onRefreshDetail={vi.fn()}
    />,
  );

describe("ErpInvoiceInternalSidebar lookup card", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lookupState.data = {
      providerCode: "BKAV",
      providerName: "BKAV eHoadon",
      lookupCode: "M1-26-2JNWA-00000037338",
      lookupUrl: "https://van.ehoadon.vn/TCHD",
      hints: [{ label: "Mã CQT (MCCQT)", value: "M1-26-2JNWA-00000037338" }],
      hasXml: true,
    };
  });

  it("shows the lookup card for a purchase invoice with data from lookup-info", () => {
    renderSidebar("IN");

    expect(screen.getByTestId("lookup-card")).toBeInTheDocument();
    const props = lastCardProps();
    expect(props.lookupCode).toBe("M1-26-2JNWA-00000037338");
    expect(props.hints).toEqual([
      { label: "Mã CQT (MCCQT)", value: "M1-26-2JNWA-00000037338" },
    ]);
    expect(props.hasXml).toBe(true);
  });

  it("hides the lookup card for a sales invoice", () => {
    renderSidebar("OUT");
    expect(screen.queryByTestId("lookup-card")).not.toBeInTheDocument();
  });

  it("downloads the original PDF through the mutation hook", async () => {
    renderSidebar("IN");
    const props = lastCardProps();

    await props.onDownloadPdf("inv-1");

    expect(downloadMutateAsync).toHaveBeenCalledWith("inv-1");
  });

  it("uploads a manual PDF through the mutation hook", async () => {
    renderSidebar("IN");
    const props = lastCardProps();
    const file = new File(["%PDF-1.4"], "hd.pdf", { type: "application/pdf" });

    await props.onUploadPdf("inv-1", file);

    expect(uploadMutateAsync).toHaveBeenCalledWith({
      invoiceId: "inv-1",
      file,
    });
  });
});

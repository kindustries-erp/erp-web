import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowPrintTemplate } from "./GarageCashflowPrintTemplate";
import { GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO } from "./GarageCashflowPrintTemplate.data";
import type { GarageCashflowPrintData } from "./GarageCashflowPrintTemplate.type";

const receiptData: GarageCashflowPrintData = {
  variant: "RECEIPT",
  voucherCode: "PT-GARA-001",
  transDate: "2026-08-26",
  partyName: "LỤC NGỌC HẢI",
  partyAddress: "",
  reason: "Thanh toán tiền mua xe - Biển số: 67A-228.92",
  amount: 600000000,
  amountInWords: "Sáu trăm triệu đồng",
  note: "",
};

describe("GarageCashflowPrintTemplate", () => {
  it("renders nothing when data is null", () => {
    const { container } = render(<GarageCashflowPrintTemplate data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders PHIẾU THU content for a receipt voucher", () => {
    render(<GarageCashflowPrintTemplate data={receiptData} />);

    expect(screen.getByText("PHIẾU THU")).toBeInTheDocument();
    expect(screen.getByText(/Họ và tên người nộp tiền:/)).toBeInTheDocument();
    expect(screen.getByText(/LỤC NGỌC HẢI/)).toBeInTheDocument();
    expect(screen.getByText("600.000.000")).toBeInTheDocument();
    expect(screen.getByText(/Sáu trăm triệu đồng/)).toBeInTheDocument();
    expect(screen.getByText(/Số: PT-GARA-001/)).toBeInTheDocument();
  });

  it("renders PHIẾU CHI content for a payment voucher", () => {
    render(
      <GarageCashflowPrintTemplate
        data={{
          ...receiptData,
          variant: "PAYMENT",
          voucherCode: "PC-GARA-002",
        }}
      />,
    );

    expect(screen.getByText("PHIẾU CHI")).toBeInTheDocument();
    expect(screen.getByText(/Họ và tên người nhận tiền:/)).toBeInTheDocument();
    expect(screen.getByText("Người nhận tiền")).toBeInTheDocument();
  });

  it("renders company logo when companyProfile has a logo", () => {
    const { container } = render(
      <GarageCashflowPrintTemplate
        data={receiptData}
        companyProfile={
          {
            logo: "https://cdn.test/logo.png",
            company_name: "CÔNG TY ABC",
            address: "Hà Nội",
          } as any
        }
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/logo.png",
    );
  });

  it("falls back to the default logo when companyProfile has no logo", () => {
    const { container } = render(
      <GarageCashflowPrintTemplate data={receiptData} />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO,
    );
  });
});

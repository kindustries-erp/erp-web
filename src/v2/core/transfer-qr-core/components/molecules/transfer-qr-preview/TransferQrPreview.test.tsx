import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../../../transferQr.locale";
import { TransferQrMode } from "../../../transferQr.types";
import { TransferQrPreview } from "./TransferQrPreview";

describe("TransferQrPreview", () => {
  it("hiển thị hộp thông báo trống khi chưa có mã QR", () => {
    render(<TransferQrPreview qrDataUrl={null} />);
    expect(screen.getByText("Điền đủ thông tin để tạo mã QR")).toBeTruthy();
  });

  it("chế độ Nhận tiền: hiển thị Badge THẺ NHẬN TIỀN và thông tin doanh nghiệp (Tên cty, MST)", () => {
    render(
      <TransferQrPreview
        qrDataUrl="data:image/png;base64,mockqr"
        mode={TransferQrMode.RECEIVE_FROM_CUSTOMER}
        companyInfo={{
          companyName: "CÔNG TY TNHH GREENWAY MOTORS VIỆT NAM",
          taxCode: "0108999888",
        }}
        target={{
          bin: "970436",
          bankCode: "VCB",
          accountNumber: "0123456789",
          accountName: "NGUYEN VAN A",
        }}
        amount={1500000}
        content="THANH TOAN DH123"
      />,
    );

    expect(screen.getByText("THẺ NHẬN TIỀN")).toBeTruthy();
    expect(
      screen.getAllByText("CÔNG TY TNHH GREENWAY MOTORS VIỆT NAM"),
    ).toHaveLength(2);
    expect(screen.getByText(/0108999888/)).toBeTruthy();
    expect(screen.getByText("0123456789")).toBeTruthy();
    expect(screen.getByText("1.500.000 ₫")).toBeTruthy();
    expect(screen.getByText("THANH TOAN DH123")).toBeTruthy();
  });

  it("chế độ Thanh toán NCC: hiển thị Badge LỆNH THANH TOÁN và ẨN tên công ty cùng MST", () => {
    render(
      <TransferQrPreview
        qrDataUrl="data:image/png;base64,mockqr"
        mode={TransferQrMode.PAY_TO_SUPPLIER}
        companyInfo={{
          companyName: "CÔNG TY TNHH GREENWAY MOTORS",
          taxCode: "0108999888",
        }}
        target={{
          bin: "970407",
          bankCode: "TCB",
          accountNumber: "987654321",
          accountName: "CONG TY TNHH PHU TUNG TOAN CAU",
        }}
        amount={45000000}
      />,
    );

    expect(screen.getByText("LỆNH THANH TOÁN")).toBeTruthy();
    expect(screen.getByText("Người nhận (NCC):")).toBeTruthy();
    expect(screen.getByText("CONG TY TNHH PHU TUNG TOAN CAU")).toBeTruthy();
    // Tên công ty và MST công ty mình KHÔNG được hiển thị
    expect(screen.queryByText("CÔNG TY TNHH GREENWAY MOTORS")).toBeNull();
    expect(screen.queryByText(/0108999888/)).toBeNull();
  });

  it("không hiển thị thẻ ảnh logo khi companyInfo không có logo", () => {
    const { container } = render(
      <TransferQrPreview
        qrDataUrl="data:image/png;base64,mockqr"
        mode={TransferQrMode.RECEIVE_FROM_CUSTOMER}
        companyInfo={{
          companyName: "CÔNG TY ABC",
        }}
        target={{
          bin: "970407",
          bankCode: "TCB",
          accountNumber: "987654321",
          accountName: "CONG TY ABC",
        }}
      />,
    );

    const logoImg = container.querySelector('img[alt="Logo"]');
    expect(logoImg).toBeNull();
  });

  it("hiển thị logo khi có logo hợp lệ trong companyInfo ở chế độ nhận tiền", () => {
    const { container } = render(
      <TransferQrPreview
        qrDataUrl="data:image/png;base64,mockqr"
        mode={TransferQrMode.RECEIVE_FROM_CUSTOMER}
        companyInfo={{
          companyName: "CÔNG TY ABC",
          logo: "https://example.com/logo.png",
        }}
        target={{
          bin: "970407",
          bankCode: "TCB",
          accountNumber: "987654321",
          accountName: "CONG TY ABC",
        }}
      />,
    );

    const logoImg = container.querySelector('img[alt="Logo"]');
    expect(logoImg).not.toBeNull();
    expect(logoImg?.getAttribute("src")).toBe("https://example.com/logo.png");
  });

  it("sao chép số tài khoản vào clipboard khi nhấn nút copy", () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      <TransferQrPreview
        qrDataUrl="data:image/png;base64,mockqr"
        target={{
          bin: "970436",
          bankCode: "VCB",
          accountNumber: "0123456789",
          accountName: "NGUYEN VAN A",
        }}
      />,
    );

    const copyBtn = screen.getByTitle("Sao chép");
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith("0123456789");
  });
});

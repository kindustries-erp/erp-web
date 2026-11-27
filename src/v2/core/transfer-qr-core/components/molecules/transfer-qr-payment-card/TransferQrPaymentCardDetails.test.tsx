import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransferQrPaymentCardDetails } from "./TransferQrPaymentCardDetails";

const LONG_NAME = "CÔNG TY CỔ PHẦN GREENWAY AUTOMOTIVES CHI NHÁNH NAM SÀI GÒN";
const LONG_CONTENT = "Tự động sinh từ phiếu GN-PDV2611-0008 chứng từ gốc";

describe("TransferQrPaymentCardDetails", () => {
  it("stacked: chủ tài khoản và nội dung không bị cắt bằng truncate, giá trị nằm dưới nhãn", () => {
    render(
      <TransferQrPaymentCardDetails
        isReceive
        displayAccountName={LONG_NAME}
        accountNumber="886111"
        formattedAmount="864.000 ₫"
        content={LONG_CONTENT}
        stacked
      />,
    );

    const name = screen.getByText(LONG_NAME);
    const content = screen.getByText(LONG_CONTENT);
    expect(name.className).not.toContain("truncate");
    expect(content.className).not.toContain("truncate");
    expect(name.className).toContain("break-words");
    expect(content.className).toContain("break-all");

    // Nhãn và giá trị cùng khối dọc: giá trị nằm trong khối cha xếp cột.
    const nameBlock = name.parentElement as HTMLElement;
    expect(nameBlock.className).toContain("flex-col");
    const contentBlock = content.parentElement?.parentElement as HTMLElement;
    expect(contentBlock.className).toContain("flex-col");
  });

  it("không stacked: giữ hành vi cũ (một dòng, có truncate)", () => {
    render(
      <TransferQrPaymentCardDetails
        isReceive
        displayAccountName={LONG_NAME}
        accountNumber="886111"
        formattedAmount="864.000 ₫"
        content={LONG_CONTENT}
      />,
    );

    expect(screen.getByText(LONG_NAME).className).toContain("truncate");
    expect(screen.getByText(LONG_CONTENT).className).toContain("truncate");
    const nameBlock = screen.getByText(LONG_NAME).parentElement as HTMLElement;
    expect(nameBlock.className).toContain("justify-between");
  });
});

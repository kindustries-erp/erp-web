import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowFormDrawer } from "./GarageCashflowFormDrawer";

vi.mock("@/core/i18n", () => ({
  useT: () => (_k: string, d?: string) => d || _k,
}));

vi.mock("./GarageCashflowFormDrawer.hook", () => ({
  useGarageCashflowFormDrawer: (props: any) => ({
    formData: {
      settlementType: props.defaultType || "RECEIPT",
      amount: props.suggestedAmount || 1500000,
      paymentMethod: "BANK_TRANSFER",
      transDate: "2026-10-08",
      partnerName: "Anh Tuấn",
      receiptNumber: "PT-01",
      note: "Thu cọc sửa chữa",
      caseId: props.fixedCaseId,
    },
    handleChange: vi.fn(),
    caseOptions: [
      {
        id: "case-1",
        soChungTu: "GR-PDV-001",
        bienSoXe: "51K-12345",
        tenKhachHang: "Anh Tuấn",
        tienCoThue: 2000000,
        tienDaThanhToan: 500000,
        tienConPhaiThanhToan: 1500000,
      },
    ],
    bankTxnOptions: [],
    selectedCase: {
      id: "case-1",
      soChungTu: "GR-PDV-001",
      bienSoXe: "51K-12345",
      tenKhachHang: "Anh Tuấn",
      tienCoThue: 2000000,
      tienDaThanhToan: 500000,
      tienConPhaiThanhToan: 1500000,
    },
    selectedBankTxn: undefined,
    isSubmitting: false,
    handleSubmit: vi.fn(),
    isReadOnly: props.mode === "view",
  }),
}));

describe("GarageCashflowFormDrawer Organism", () => {
  it("renders drawer header and form elements when open is true", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowFormDrawer
          open={true}
          onClose={vi.fn()}
          defaultType="RECEIPT"
          suggestedAmount={1500000}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Ghi nhận Thu tiền Garage")).toBeDefined();
    expect(screen.getByText("Lưu giao dịch")).toBeDefined();
  });

  it("does not crash when closed", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowFormDrawer open={false} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    expect(container).toBeDefined();
  });
});

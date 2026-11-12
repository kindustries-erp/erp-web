import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AiInvoiceApi, AiInvoicePreview } from "../../../aiHub.type";
import { AiInvoiceAssistant } from "./AiInvoiceAssistant";

vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: () => ({ isMobile: false }),
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, arg?: string | Record<string, unknown>) =>
      typeof arg === "string"
        ? arg
        : String(arg?.defaultValue ?? "").replace(
            /{{(\w+)}}/g,
            (_m, name: string) => String(arg?.[name] ?? ""),
          ),
    locale: "vi",
  }),
}));

const preview: AiInvoicePreview = {
  invoice: {
    sellerName: "ABC",
    sellerTaxCode: null,
    invoiceNo: "0001234",
    invoiceDate: null,
    total: 300000,
  },
  lines: [
    {
      itemName: "Lọc dầu",
      itemCode: null,
      unit: "Cái",
      qtyRequested: 2,
      estUnitPrice: 150000,
      itemType: "PT",
      lineType: "GOODS",
      match: { status: "NEW" },
    },
  ],
  warnings: ["MISSING_UNIT_PRICE"],
  ai: { tier: "low", model: "m", latencyMs: 1 },
};

describe("AiInvoiceAssistant", () => {
  let api: {
    previewInvoice: ReturnType<typeof vi.fn>;
    createRequest: ReturnType<typeof vi.fn>;
  };
  const onCreated = vi.fn();

  const open = () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AiInvoiceAssistant
          api={api as unknown as AiInvoiceApi}
          context={{ requestDate: "2026-11-12" }}
          onCreated={onCreated}
        />
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Trợ lý AI đọc hóa đơn" }),
    );
  };
  const attach = (file: File) =>
    fireEvent.change(screen.getByTestId("v2-chat-file-input"), {
      target: { files: [file] },
    });
  const pdf = new File(["x"], "hd.pdf", { type: "application/pdf" });

  beforeEach(() => {
    onCreated.mockReset();
    api = {
      previewInvoice: vi.fn().mockResolvedValue(preview),
      createRequest: vi.fn().mockResolvedValue({
        requestId: "r1",
        requestNo: "GDNM-20261112-001",
        createdItems: [
          { id: "i1", itemCode: "PT-000001", itemName: "Lọc dầu" },
        ],
      }),
    };
  });

  it("đọc hóa đơn, cho sửa mã rồi tạo đề nghị mua", async () => {
    open();
    expect(screen.getByText(/Gửi ảnh hoặc file PDF hóa đơn/)).toBeDefined();

    attach(pdf);
    expect(await screen.findByText("hd.pdf")).toBeDefined();
    await screen.findByText(/Đã đọc 1 dòng hàng/);
    expect(api.previewInvoice).toHaveBeenCalledWith(pdf);
    // t() giả trả fallback, là chính mã cảnh báo
    expect(screen.getByText("MISSING_UNIT_PRICE")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Mã hàng"), {
      target: { value: "PT-LOC" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tạo đề nghị mua" }));

    await screen.findByText(/Đã tạo đề nghị mua GDNM-20261112-001/);
    expect(api.createRequest.mock.calls[0][0]).toMatchObject({
      requestDate: "2026-11-12",
      invoiceNo: "0001234",
      lines: [{ itemName: "Lọc dầu", itemCode: "PT-LOC", qtyRequested: 2 }],
    });
    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: "r1" }),
    );
    expect(screen.getByText(/Mã hàng mới: PT-000001/)).toBeDefined();
  });

  it("hiện lỗi của server khi đọc thất bại và vẫn cho chọn file khác", async () => {
    api.previewInvoice.mockRejectedValue({
      response: { data: { message: "AI không đọc được tài liệu" } },
    });
    open();
    attach(pdf);

    expect(await screen.findByText("AI không đọc được tài liệu")).toBeDefined();
    expect(screen.getByTestId("v2-chat-file-input")).toBeDefined();
  });

  it("không tạo phiếu khi đã bỏ hết dòng hàng", async () => {
    open();
    attach(pdf);
    await screen.findByText(/Đã đọc 1 dòng hàng/);

    fireEvent.click(screen.getByRole("button", { name: "Bỏ dòng Lọc dầu" }));
    fireEvent.click(screen.getByRole("button", { name: "Tạo đề nghị mua" }));

    await waitFor(() =>
      expect(
        screen.getByText("Cần ít nhất một dòng hàng để tạo đề nghị mua."),
      ).toBeDefined(),
    );
    expect(api.createRequest).not.toHaveBeenCalled();
  });

  it("báo lỗi khi file sai loại, không gọi API", () => {
    open();
    attach(new File(["x"], "a.txt", { type: "text/plain" }));
    expect(
      screen.getByText("Chỉ nhận ảnh JPG, PNG, WEBP hoặc file PDF."),
    ).toBeDefined();
    expect(api.previewInvoice).not.toHaveBeenCalled();
  });
});

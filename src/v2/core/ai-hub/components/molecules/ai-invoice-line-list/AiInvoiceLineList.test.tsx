import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AiInvoiceDraftLine } from "../../../aiHub.type";
import { AiInvoiceLineList } from "./AiInvoiceLineList";

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

const lines: AiInvoiceDraftLine[] = [
  {
    key: "line-0",
    itemName: "Lọc dầu",
    itemCode: "PT-90915",
    unit: "Cái",
    qtyRequested: 2,
    estUnitPrice: 150000,
    itemType: "PT",
    lineType: "GOODS",
    match: {
      status: "MATCHED",
      matchedBy: "CODE",
      catalogItemName: "Lọc dầu Toyota",
    },
  },
  {
    key: "line-1",
    itemName: "Công thay",
    itemCode: "",
    unit: null,
    qtyRequested: 1,
    estUnitPrice: null,
    itemType: "DV",
    lineType: "SERVICE",
    match: { status: "NEW" },
  },
];

describe("AiInvoiceLineList", () => {
  it("hiện nhãn đã có mã / mã mới, tên trong danh mục và gợi ý tự sinh mã", () => {
    render(
      <AiInvoiceLineList lines={lines} onChange={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(screen.getAllByTestId("ai-invoice-line")).toHaveLength(2);
    expect(screen.getByText("Đã có mã")).toBeDefined();
    expect(screen.getByText("Mã mới")).toBeDefined();
    expect(screen.getByText("Trong danh mục: Lọc dầu Toyota")).toBeDefined();
    const codes = screen.getAllByLabelText("Mã hàng") as HTMLInputElement[];
    expect(codes[0].value).toBe("PT-90915");
    expect(codes[1].placeholder).toBe("Tự sinh mã");
  });

  it("sửa mã và bỏ dòng gọi callback kèm key", () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <AiInvoiceLineList
        lines={lines}
        onChange={onChange}
        onRemove={onRemove}
      />,
    );
    fireEvent.change(screen.getAllByLabelText("Mã hàng")[1], {
      target: { value: "DV-CONG" },
    });
    expect(onChange).toHaveBeenCalledWith("line-1", { itemCode: "DV-CONG" });

    fireEvent.click(screen.getByRole("button", { name: "Bỏ dòng Lọc dầu" }));
    expect(onRemove).toHaveBeenCalledWith("line-0");
  });

  it("khóa ô nhập khi disabled", () => {
    render(
      <AiInvoiceLineList
        lines={lines}
        disabled
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(
      (screen.getAllByLabelText("Mã hàng")[0] as HTMLInputElement).disabled,
    ).toBe(true);
  });
});

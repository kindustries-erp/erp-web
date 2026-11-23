import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProcurementBranchLinkedField } from "./ProcurementBranchLinkedField";

vi.mock("../../../api/procurementLookups", () => ({
  listBranchLinkOptions: vi.fn().mockResolvedValue([
    {
      value: "b-1",
      label: "Q1 — Chi nhánh Quận 1",
      name: "Chi nhánh Quận 1",
    },
  ]),
  listSupplierOptions: vi.fn().mockResolvedValue([]),
}));

const renderField = (
  props: Partial<Parameters<typeof ProcurementBranchLinkedField>[0]> = {},
) => {
  const onBranchIdChange = vi.fn();
  const onBranchNameChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProcurementBranchLinkedField
        branchId="b-1"
        branchName="Quận 1 (sửa)"
        link={{ sourceValue: "Chi nhánh Quận 1", overridden: true }}
        onBranchIdChange={onBranchIdChange}
        onBranchNameChange={onBranchNameChange}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onBranchIdChange, onBranchNameChange };
};

describe("ProcurementBranchLinkedField", () => {
  it("hiện tên song song và nhãn đã chỉnh, kèm giá trị gốc", () => {
    renderField();
    expect(screen.getByDisplayValue("Quận 1 (sửa)")).toBeInTheDocument();
    expect(screen.getByText("Đã chỉnh")).toBeInTheDocument();
    expect(screen.getByText("Gốc: Chi nhánh Quận 1")).toBeInTheDocument();
  });

  it("sửa tên chỉ gọi đổi tên, không đổi id chi nhánh", async () => {
    const { onBranchIdChange, onBranchNameChange } = renderField();
    await userEvent.type(screen.getByDisplayValue("Quận 1 (sửa)"), "!");
    expect(onBranchNameChange).toHaveBeenCalled();
    expect(onBranchIdChange).not.toHaveBeenCalled();
  });

  it("khôi phục đặt tên về giá trị gốc", async () => {
    const { onBranchNameChange } = renderField();
    await userEvent.click(
      screen.getByRole("button", { name: /Khôi phục|Restore/i }),
    );
    expect(onBranchNameChange).toHaveBeenCalledWith("Chi nhánh Quận 1");
  });

  it("chọn chi nhánh điền tên thuần (không kèm mã) vào ô tên", async () => {
    const { onBranchIdChange, onBranchNameChange } = renderField({
      branchId: "",
      branchName: "",
      link: { sourceValue: undefined, overridden: false },
    });
    await userEvent.click(screen.getByRole("combobox", { name: "Chi nhánh" }));
    await userEvent.click(
      await screen.findByRole("option", { name: /Chi nhánh Quận 1/ }),
    );
    expect(onBranchIdChange).toHaveBeenCalledWith("b-1");
    expect(onBranchNameChange).toHaveBeenCalledWith("Chi nhánh Quận 1");
  });

  it("bỏ chọn chi nhánh thì xóa cả id lẫn tên trên phiếu", async () => {
    const { onBranchIdChange, onBranchNameChange } = renderField();
    await userEvent.click(
      await screen.findByRole("button", { name: "Bỏ lựa chọn" }),
    );
    expect(onBranchIdChange).toHaveBeenCalledWith("");
    expect(onBranchNameChange).toHaveBeenCalledWith("");
  });
});

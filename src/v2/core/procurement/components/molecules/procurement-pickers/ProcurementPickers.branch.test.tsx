import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProcurementBranchPicker } from "./ProcurementPickers";

vi.mock("../../../api/procurementLookups", () => ({
  listBranchOptions: vi
    .fn()
    .mockResolvedValue([{ value: "b-1", label: "Chi nhánh Quận 1" }]),
  listSupplierOptions: vi.fn().mockResolvedValue([]),
}));

const renderPicker = (
  props: Partial<Parameters<typeof ProcurementBranchPicker>[0]>,
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProcurementBranchPicker
        value="b-1"
        label="Chi nhánh Quận 1"
        viewing={false}
        onChange={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );

describe("ProcurementBranchPicker — khóa theo đề nghị", () => {
  it("khi locked: combobox bị vô hiệu hóa, hiện tên chi nhánh, không có nút bỏ chọn", () => {
    renderPicker({ locked: true, clearable: true });
    const trigger = screen.getByRole("combobox", { name: "Chi nhánh" });
    expect(trigger).toBeDisabled();
    expect(screen.getByText("Chi nhánh Quận 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bỏ lựa chọn" })).toBeNull();
  });

  it("khi không locked: combobox dùng được", () => {
    renderPicker({ locked: false });
    expect(
      screen.getByRole("combobox", { name: "Chi nhánh" }),
    ).not.toBeDisabled();
  });
});

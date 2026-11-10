import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ViewConfigDialog } from "./V2StandardTable.viewdialog";

const columns = [
  { key: "code", label: "Mã", canHide: true },
  { key: "name", label: "Tên", canHide: true },
];

const filterOptions = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
];

const renderDialog = (
  overrides: Partial<Parameters<typeof V2ViewConfigDialog>[0]> = {},
) => {
  const props = {
    mode: "create" as const,
    initialName: "",
    columns,
    initialVisibleKeys: ["code", "name"],
    isNameTaken: vi.fn(() => false),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<V2ViewConfigDialog {...props} />);
  return props;
};

const fillName = (value: string) =>
  fireEvent.change(screen.getByRole("textbox"), { target: { value } });

describe("V2ViewConfigDialog: bộ lọc có sẵn", () => {
  it("không có filterOptions thì không hiện nhãn bộ lọc", () => {
    renderDialog();
    expect(screen.queryByText("Bộ lọc có sẵn")).not.toBeInTheDocument();
  });

  it("có filterOptions thì hiện nhãn bộ lọc", () => {
    renderDialog({ filterOptions, initialFilterKey: "pending" });
    expect(screen.getByText("Bộ lọc có sẵn")).toBeInTheDocument();
  });

  it("gửi kèm filterKey ban đầu khi lưu", () => {
    const { onSubmit } = renderDialog({
      filterOptions,
      initialFilterKey: "pending",
    });
    fillName("Chờ tôi duyệt");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Chờ tôi duyệt",
      visibleKeys: ["code", "name"],
      filterKey: "pending",
    });
  });

  it("không có filterOptions thì không gửi filterKey", () => {
    const { onSubmit } = renderDialog();
    fillName("Của tôi");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(vi.mocked(onSubmit).mock.calls[0][0]).not.toHaveProperty(
      "filterKey",
    );
  });
});

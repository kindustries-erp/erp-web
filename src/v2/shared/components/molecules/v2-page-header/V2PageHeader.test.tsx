import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2PageHeader } from "./V2PageHeader";
import { V2PageHeaderVariant } from "./V2PageHeader.type";

describe("V2PageHeader", () => {
  it("renders title as h1, description, icon and actions", () => {
    render(
      <V2PageHeader
        title="Hóa đơn"
        description="Mô tả trang"
        icon={<svg data-testid="icon" />}
        actions={<button type="button">Tạo mới</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Hóa đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mô tả trang").tagName).toBe("P");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tạo mới" })).toBeInTheDocument();
  });

  it("omits description and icon when not provided", () => {
    render(<V2PageHeader title="Chỉ tiêu đề" />);

    expect(
      screen.getByRole("heading", { name: "Chỉ tiêu đề" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mô tả trang")).not.toBeInTheDocument();
  });

  it("creates one toolbar slot per tab and shows only the active one", () => {
    const register = vi.fn();
    const { container } = render(
      <V2PageHeader
        title="Hóa đơn"
        tabKeys={["overview", "in", "out"]}
        activeKey="in"
        register={register}
      />,
    );

    const slots = container.querySelectorAll("[data-toolbar-slot]");
    expect(slots).toHaveLength(3);
    expect(container.querySelector('[data-toolbar-slot="in"]')).toHaveClass(
      "flex",
    );
    expect(container.querySelector('[data-toolbar-slot="out"]')).toHaveClass(
      "hidden",
    );
    expect(register).toHaveBeenCalledWith("in", expect.any(HTMLElement));

    const toolbarContainer = slots[0]?.parentElement;
    expect(toolbarContainer).toHaveClass("sm:ml-auto");
  });

  it("renders V2TabCombobox on mobile when pageTabs has multiple items", () => {
    const handleSelect = vi.fn();
    render(
      <V2PageHeader
        title="Mua hàng Garage"
        pageTabs={[
          { value: "pr", label: "Đề nghị mua hàng" },
          { value: "po", label: "Đơn mua hàng" },
        ]}
        activePageTab="pr"
        onPageTabSelect={handleSelect}
      />,
    );

    expect(screen.getByTestId("v2-tab-combobox")).toBeInTheDocument();
    expect(screen.getByText("Đề nghị mua hàng")).toBeInTheDocument();
  });

  it("renders variant=V2PageHeaderVariant.CARD with card surface, icon and actions", () => {
    const { container } = render(
      <V2PageHeader
        variant={V2PageHeaderVariant.CARD}
        title="Quản Lý Khoản Vay"
        description="Theo dõi nghĩa vụ nợ"
        icon={<svg data-testid="card-icon" />}
        actions={<button type="button">Thêm mới</button>}
      />,
    );

    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-card", "rounded-2xl", "border");
    expect(
      screen.getByRole("heading", { level: 1, name: "Quản Lý Khoản Vay" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Theo dõi nghĩa vụ nợ")).toBeInTheDocument();
    expect(screen.getByTestId("card-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thêm mới" }),
    ).toBeInTheDocument();
  });
});

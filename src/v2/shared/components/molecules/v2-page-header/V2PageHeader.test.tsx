import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2PageHeader } from "./V2PageHeader";

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
  });
});

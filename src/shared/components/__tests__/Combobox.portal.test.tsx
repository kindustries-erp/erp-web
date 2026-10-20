import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Combobox } from "../Combobox";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback ?? key,
}));

const OPTIONS = [
  { value: "end-user", label: "Người dùng cuối" },
  { value: "dev", label: "Kỹ thuật (Dev)" },
];

describe("Combobox portalContainer", () => {
  it("gắn dropdown vào portalContainer khi được truyền (dùng cho phần tử đang full screen)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    render(
      <Combobox
        options={OPTIONS}
        value="end-user"
        onChange={vi.fn()}
        allowClear={false}
        portalContainer={container}
      />,
    );
    fireEvent.click(screen.getByText("Người dùng cuối"));

    expect(container.textContent).toContain("Kỹ thuật (Dev)");
    container.remove();
  });

  it("không truyền portalContainer thì dropdown vẫn gắn vào document.body như cũ", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    render(
      <Combobox
        options={OPTIONS}
        value="end-user"
        onChange={vi.fn()}
        allowClear={false}
      />,
    );
    fireEvent.click(screen.getByText("Người dùng cuối"));

    expect(screen.getByText("Kỹ thuật (Dev)")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Kỹ thuật (Dev)");
    container.remove();
  });
});

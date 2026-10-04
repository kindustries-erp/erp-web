import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerField } from "./DrawerField";
import { DrawerRow } from "./DrawerRow";

describe("V2 DrawerField & DrawerRow Molecules", () => {
  describe("DrawerField", () => {
    it("renders label, required indicator, and children", () => {
      render(
        <DrawerField label="Tên Khách Hàng" required>
          <input data-testid="input-name" />
        </DrawerField>,
      );

      expect(screen.getByText("Tên Khách Hàng")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByTestId("input-name")).toBeInTheDocument();
    });

    it("renders error message over helperText when both are present", () => {
      render(
        <DrawerField
          label="Mã Số Thuế"
          helperText="Nhập 10 hoặc 13 số"
          error="Mã số thuế không hợp lệ"
        >
          <input />
        </DrawerField>,
      );

      expect(screen.getByText("Mã số thuế không hợp lệ")).toBeInTheDocument();
      expect(screen.queryByText("Nhập 10 hoặc 13 số")).not.toBeInTheDocument();
    });

    it("renders helperText when error is not present", () => {
      render(
        <DrawerField label="Email" helperText="Nhập email nhận hóa đơn">
          <input />
        </DrawerField>,
      );

      expect(screen.getByText("Nhập email nhận hóa đơn")).toBeInTheDocument();
    });
  });

  describe("DrawerRow", () => {
    it("renders label and value properly", () => {
      render(<DrawerRow label="Mã Chứng Từ" value="INV-2026-001" />);

      expect(screen.getByText("Mã Chứng Từ")).toBeInTheDocument();
      expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
    });

    it("renders copy button and copies text when copyable is true", () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<DrawerRow label="Số Tài Khoản" value="19036789123" copyable />);

      const copyBtn = screen.getByRole("button", { name: "Copy to clipboard" });
      expect(copyBtn).toBeInTheDocument();

      fireEvent.click(copyBtn);
      expect(writeTextMock).toHaveBeenCalledWith("19036789123");
    });
  });
});

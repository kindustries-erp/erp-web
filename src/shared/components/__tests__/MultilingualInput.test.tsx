import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultilingualInput } from "../MultilingualInput";
import { getActiveSystemLanguages } from "@/core/config/languages";

vi.mock("@/core/i18n", () => ({
  useT: () => (_key: string, defaultText?: string) => defaultText || _key,
}));

describe("MultilingualInput Component", () => {
  describe("Popover Mode (Default)", () => {
    it("renders primary input with popover config trigger badge", () => {
      const activeCount = getActiveSystemLanguages().length;
      const values = { vi: "Màu sắc", en: "Color" };
      render(<MultilingualInput values={values} />);

      // Primary input contains Vietnamese value
      expect(screen.getByDisplayValue("Màu sắc")).toBeInTheDocument();

      // Suffix button shows filled/active count
      expect(screen.getByText(`2/${activeCount}`)).toBeInTheDocument();
    });

    it("triggers onChange when primary input value changes", () => {
      const onChange = vi.fn();
      const values = { vi: "Loại nhập", en: "Receipt Type" };
      render(<MultilingualInput values={values} onChange={onChange} />);

      const input = screen.getByDisplayValue("Loại nhập");
      fireEvent.change(input, { target: { value: "Loại nhập mới" } });

      expect(onChange).toHaveBeenCalledWith(
        { vi: "Loại nhập mới", en: "Receipt Type" },
        "vi",
        "Loại nhập mới",
      );
    });

    it("opens popover when trigger button is clicked and displays all languages", async () => {
      const values = { vi: "Ghi chú", en: "Special Note" };
      render(<MultilingualInput values={values} />);

      const triggerBtn = screen.getByTitle(
        "Cấu hình tên đa ngôn ngữ (VI, EN...)",
      );
      fireEvent.click(triggerBtn);

      // In popover, English and Vietnamese inputs should be accessible
      expect(screen.getByText("Cấu hình đa ngôn ngữ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Special Note")).toBeInTheDocument();
    });
  });

  describe("Tabs Mode (Legacy/Optional)", () => {
    it("renders default language tabs (VI, EN) and active input", () => {
      const values = { vi: "Màu sắc", en: "Color" };
      render(<MultilingualInput values={values} mode="tabs" />);

      // Check tabs
      expect(screen.getByText("VI")).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();

      // Default tab is VI
      const input = screen.getByDisplayValue("Màu sắc");
      expect(input).toBeInTheDocument();
    });

    it("switches tabs and updates displayed input value", () => {
      const values = { vi: "Phiếu nhập", en: "Goods Receipt" };
      render(<MultilingualInput values={values} mode="tabs" />);

      // Click EN tab
      fireEvent.click(screen.getByText("EN"));

      // Input should now show English text
      const input = screen.getByDisplayValue("Goods Receipt");
      expect(input).toBeInTheDocument();
    });

    it("renders expandable stacked inputs for all active languages when toggled", () => {
      const values = { vi: "Tên Việt", en: "English Name" };
      render(
        <MultilingualInput values={values} mode="tabs" allowExpandAll={true} />,
      );

      // Find expand toggle button
      const expandBtn = screen.getByTitle("Mở rộng tất cả ngôn ngữ");
      fireEvent.click(expandBtn);

      // Both inputs should be visible simultaneously
      expect(screen.getByDisplayValue("Tên Việt")).toBeInTheDocument();
      expect(screen.getByDisplayValue("English Name")).toBeInTheDocument();
    });
  });

  describe("Compact Variant", () => {
    it("renders compact variant properly for badge / inline editors", () => {
      const values = { vi: "Nhập mua", en: "Purchase" };
      const { container } = render(
        <MultilingualInput values={values} variant="compact" />,
      );

      expect(container.querySelector("input")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Nhập mua")).toBeInTheDocument();
    });
  });
});

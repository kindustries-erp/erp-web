import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
// Nạp locale họ garage.
import "@/v2/core/cases-garage";
import {
  GarageWorkshopFilters,
  type GarageWorkshopFiltersProps,
} from "./GarageWorkshopProgressPage.filters";

const setup = (over: Partial<GarageWorkshopFiltersProps> = {}) => {
  const props: GarageWorkshopFiltersProps = {
    isDesktop: true,
    search: "",
    onSearchChange: vi.fn(),
    classification: null,
    onClassificationChange: vi.fn(),
    showScope: true,
    scope: "current",
    onScopeChange: vi.fn(),
    ...over,
  };
  render(<GarageWorkshopFilters {...props} />);
  return props;
};

describe("GarageWorkshopFilters", () => {
  it("chọn phạm vi Tất cả chi nhánh gọi onScopeChange('all')", () => {
    const props = setup();
    fireEvent.click(
      screen.getByRole("combobox", { name: "Phạm vi chi nhánh" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Tất cả chi nhánh" }));
    expect(props.onScopeChange).toHaveBeenCalledWith("all");
  });

  it("showScope=false thì ẩn ô phạm vi, vẫn có ô phân loại", () => {
    setup({ showScope: false });
    expect(
      screen.queryByRole("combobox", { name: "Phạm vi chi nhánh" }),
    ).toBeNull();
    expect(screen.getByRole("combobox", { name: "Phân loại" })).toBeTruthy();
  });

  it("chọn Xe OJ gọi onClassificationChange('OJ')", () => {
    const props = setup();
    fireEvent.click(screen.getByRole("combobox", { name: "Phân loại" }));
    fireEvent.click(screen.getByRole("option", { name: "Xe OJ" }));
    expect(props.onClassificationChange).toHaveBeenCalledWith("OJ");
  });

  it("gõ tìm kiếm gọi onSearchChange (sau debounce)", async () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText(/Tìm biển số/), {
      target: { value: "51A" },
    });
    await waitFor(() =>
      expect(props.onSearchChange).toHaveBeenCalledWith("51A"),
    );
  });
});

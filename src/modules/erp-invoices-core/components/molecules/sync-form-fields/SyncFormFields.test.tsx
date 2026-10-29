import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SyncFormFields } from "./SyncFormFields";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const values = {
  companyTaxCode: "0101234567",
  syncType: "purchase" as const,
  fromDate: "2026-10-01",
  toDate: "2026-10-31",
};

describe("SyncFormFields", () => {
  it("hiển thị giá trị hiện tại của các ô", () => {
    render(<SyncFormFields values={values} onFieldChange={vi.fn()} />);
    expect(screen.getByDisplayValue("0101234567")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-10-01")).toBeInTheDocument();
  });

  it("báo thay đổi loại hóa đơn", () => {
    const onFieldChange = vi.fn();
    render(<SyncFormFields values={values} onFieldChange={onFieldChange} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "sold" },
    });
    expect(onFieldChange).toHaveBeenCalledWith("syncType", "sold");
  });
});

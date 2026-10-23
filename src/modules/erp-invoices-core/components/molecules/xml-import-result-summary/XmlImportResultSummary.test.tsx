import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { XmlImportResultSummary } from "./XmlImportResultSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) => {
      if (typeof fallback === "string") return fallback;
      const { defaultValue, count } = fallback as {
        defaultValue: string;
        count: number;
      };
      return defaultValue.replace("{{count}}", String(count));
    },
  }),
}));

describe("XmlImportResultSummary", () => {
  it("shows created, skipped and error counts with the total", () => {
    render(
      <XmlImportResultSummary
        result={{
          importId: "i",
          direction: "IN",
          total: 5,
          created: 3,
          skipped: [
            {
              filename: "a",
              invoiceNo: "1",
              sellerName: null,
              sellerTaxCode: null,
              reason: "DUPLICATE",
            },
          ],
          errors: [
            { filename: "b", reason: "x" },
            { filename: "c", reason: "y" },
          ],
        }}
      />,
    );

    expect(screen.getByText("3 tạo mới")).toBeInTheDocument();
    expect(screen.getByText("1 bỏ qua")).toBeInTheDocument();
    expect(screen.getByText("2 lỗi")).toBeInTheDocument();
    expect(screen.getByText("/ 5 file")).toBeInTheDocument();
  });
});

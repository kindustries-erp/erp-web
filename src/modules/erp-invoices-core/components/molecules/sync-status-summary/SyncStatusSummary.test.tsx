import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SyncStatusSummary } from "./SyncStatusSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

describe("SyncStatusSummary", () => {
  it("hiện số liệu tìm thấy và PDF thành công/thất bại", () => {
    render(
      <SyncStatusSummary
        status={{
          id: "abcdef123456",
          totalFound: 12,
          totalPdfSuccess: 10,
          totalPdfFailed: 2,
        }}
      />,
    );
    expect(screen.getByText(/Tìm thấy: 12/)).toBeInTheDocument();
    expect(screen.getByText(/PDF thành công: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Thất bại: 2/)).toBeInTheDocument();
  });
});

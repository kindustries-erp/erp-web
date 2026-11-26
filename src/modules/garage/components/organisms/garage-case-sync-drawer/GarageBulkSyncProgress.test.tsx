import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { GarageBulkSyncProgress } from "./GarageBulkSyncProgress";
import type { GarageBulkSyncStatus } from "../../../hooks/useGarageBulkSync";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def?: string) => def || _key,
  }),
}));
vi.mock("../../../hooks/useGarage", () => ({
  useGarageBranches: () => ({
    data: [{ externalId: "b-main", name: "Garage", code: "GR" }],
  }),
}));

const base: GarageBulkSyncStatus = {
  status: "running",
  scope: "all",
  startedAt: "2026-11-25T10:00:00Z",
  finishedAt: null,
  totalBranches: 2,
  completedBranches: 0,
  currentBranch: { branchExternalId: "b-main", accountKey: "MAIN" },
  accounts: [],
  results: [],
  message: null,
};

describe("GarageBulkSyncProgress", () => {
  it("hiện tiến độ theo tháng và tháng đang chạy", () => {
    render(
      <GarageBulkSyncProgress
        status={{
          ...base,
          totalChunks: 14,
          completedChunks: 3,
          currentChunk: { from: "2026-08-01", to: "2026-08-31" },
        }}
      />,
    );
    expect(screen.getByText(/3\/14 tháng/)).toBeDefined();
    expect(screen.getByText(/2026-08-01 → 2026-08-31/)).toBeDefined();
  });

  it("liệt kê tháng lỗi, không lặp lại lỗi chi nhánh đã có theo tháng", () => {
    render(
      <GarageBulkSyncProgress
        status={{
          ...base,
          status: "completed",
          currentBranch: null,
          totalChunks: 14,
          completedChunks: 14,
          currentChunk: null,
          results: [
            {
              branchExternalId: "b-main",
              accountKey: "MAIN",
              ok: false,
              error: "2026-09-01..2026-09-30: timeout",
            },
          ],
          failedChunks: [
            {
              branchExternalId: "b-main",
              accountKey: "MAIN",
              from: "2026-09-01",
              to: "2026-09-30",
              error: "timeout",
            },
          ],
        }}
      />,
    );
    expect(screen.getByText("Tháng lỗi")).toBeDefined();
    expect(
      screen.getByText(/Garage \(GR\) · MAIN · 2026-09-01 → 2026-09-30/),
    ).toBeDefined();
    expect(screen.queryByText(/2026-09-01\.\.2026-09-30/)).toBeNull();
  });

  it("job cũ không có tháng: không hiện đơn vị tháng", () => {
    render(<GarageBulkSyncProgress status={base} />);
    expect(screen.queryByText(/tháng/)).toBeNull();
  });
});

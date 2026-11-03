import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVinfastPartsStockExportAutoDownload } from "./VinfastPartsStockExportDrawer.autoDownload.hook";
import { useVinfastStockExportProgressStore } from "../stores/useVinfastStockExportProgressStore";

describe("useVinfastPartsStockExportAutoDownload", () => {
  beforeEach(() => {
    useVinfastStockExportProgressStore.getState().resetProgress();
  });

  it("triggers download when SSE progress is ready", () => {
    const download = vi.fn();
    const onTrackedDone = vi.fn();

    useVinfastStockExportProgressStore.setState({
      jobId: "job-vinfast-1",
      ready: true,
      fileName: "vinfast-stock.xlsx",
    });

    renderHook(() =>
      useVinfastPartsStockExportAutoDownload({
        open: true,
        trackedJobId: "job-vinfast-1",
        download,
        onTrackedDone,
      }),
    );

    expect(download).toHaveBeenCalledWith(
      "job-vinfast-1",
      "vinfast-stock.xlsx",
    );
    expect(onTrackedDone).toHaveBeenCalled();
  });

  it("triggers download when history item is COMPLETED", () => {
    const download = vi.fn();
    const onTrackedDone = vi.fn();

    renderHook(() =>
      useVinfastPartsStockExportAutoDownload({
        open: true,
        trackedJobId: "job-vinfast-2",
        historyItems: [
          {
            jobId: "job-vinfast-2",
            fileName: "history-stock.xlsx",
            status: "COMPLETED",
            current: 10,
            total: 10,
            message: "ok",
            createdAt: "2026-10-26T10:00:00.000Z",
            canDownload: true,
          },
        ],
        download,
        onTrackedDone,
      }),
    );

    expect(download).toHaveBeenCalledWith(
      "job-vinfast-2",
      "history-stock.xlsx",
    );
    expect(onTrackedDone).toHaveBeenCalled();
  });

  it("calls onTrackedDone when job fails", () => {
    const download = vi.fn();
    const onTrackedDone = vi.fn();

    renderHook(() =>
      useVinfastPartsStockExportAutoDownload({
        open: true,
        trackedJobId: "job-vinfast-3",
        historyItems: [
          {
            jobId: "job-vinfast-3",
            fileName: "history-stock.xlsx",
            status: "FAILED",
            current: 0,
            total: 10,
            message: "failed",
            createdAt: "2026-10-26T10:00:00.000Z",
            canDownload: false,
          },
        ],
        download,
        onTrackedDone,
      }),
    );

    expect(download).not.toHaveBeenCalled();
    expect(onTrackedDone).toHaveBeenCalled();
  });
});

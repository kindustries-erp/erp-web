import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileAttachmentsPage } from "../pages/FileAttachmentsPage";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  downloadUrl: vi.fn(),
  purge: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

vi.mock("../api/fileAttachmentsApi", () => ({ fileAttachmentsV2Api: api }));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

const row = {
  id: "r1",
  ownerType: "INVOICE",
  ownerId: "o1",
  category: "HOA_DON",
  isOriginal: false,
  fileName: "HD-001.pdf",
  fileSize: 2048,
  mimeType: "application/pdf",
  origin: "V2" as const,
  createdBy: null,
  createdAt: "2026-01-01T00:00:00Z",
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <div className="h-[800px]">
        <FileAttachmentsPage />
      </div>
    </QueryClientProvider>,
  );

describe("FileAttachmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({ items: [row], total: 1 });
    api.options.mockResolvedValue({ items: [], total: 0, next: null });
    api.getSettings.mockResolvedValue({
      autoPurgeEnabled: false,
      retentionDays: 30,
      updatedBy: null,
      updatedAt: "",
    });
  });

  it("tải danh sách qua API của module, mặc định không lọc đã xóa", async () => {
    renderPage();
    expect((await screen.findAllByText("HD-001.pdf")).length).toBeGreaterThan(
      0,
    );
    expect(api.list.mock.calls[0][1]).toEqual({});
  });

  it("mở cài đặt lưu giữ và hiện công tắc đang tắt", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("Cài đặt lưu giữ"));
    await waitFor(() => expect(api.getSettings).toHaveBeenCalled());
    expect(await screen.findByText(/Tự động xóa vĩnh viễn/)).toBeTruthy();
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false",
    );
  });
});

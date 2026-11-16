import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { V2OwnerFilesApi } from "@/v2/shared/files";
import { V2AttachmentsPanel } from "./V2AttachmentsPanel";
import {
  formatFileSize,
  policyToUploadProps,
} from "./V2AttachmentsPanel.helper";

const item = {
  id: "1",
  ownerType: "INVOICE",
  ownerId: "x",
  category: "HOA_DON",
  isOriginal: false,
  fileName: "a.pdf",
  fileSize: 2048,
  mimeType: "application/pdf",
  origin: "V2" as const,
  createdBy: null,
  createdAt: "",
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
};

const makeApi = (): V2OwnerFilesApi => ({
  basePath: "/t",
  list: vi.fn().mockResolvedValue({
    items: [item],
    policy: {
      maxFileBytes: 1024,
      maxFilesPerRequest: 2,
      allowedExtensions: ["pdf"],
      allowedMimeTypes: [],
    },
    categories: ["HOA_DON", "KHAC"],
  }),
  upload: vi.fn().mockResolvedValue([]),
  remove: vi.fn().mockResolvedValue(undefined),
  downloadUrl: vi.fn().mockResolvedValue({ url: "https://x", expiresIn: 300 }),
});

const renderPanel = (api: V2OwnerFilesApi, canEdit: boolean) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <V2AttachmentsPanel api={api} canEdit={canEdit} />
    </QueryClientProvider>,
  );

describe("helpers", () => {
  it("formatFileSize", () => {
    expect(formatFileSize(0)).toBe("—");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
  it("policyToUploadProps lấy giới hạn từ server", () => {
    expect(policyToUploadProps(null)).toEqual({});
    expect(
      policyToUploadProps({
        maxFileBytes: 5,
        maxFilesPerRequest: 2,
        allowedExtensions: ["pdf"],
        allowedMimeTypes: [],
      }),
    ).toEqual({ accept: [".pdf"], maxSizeBytes: 5, maxFiles: 2 });
  });
});

describe("V2AttachmentsPanel", () => {
  it("chỉ đọc: hiện file, không có nút xóa", async () => {
    renderPanel(makeApi(), false);
    expect(await screen.findByText("a.pdf")).toBeTruthy();
    expect(screen.queryByLabelText("Xóa")).toBeNull();
  });

  it("xóa phải qua modal xác nhận", async () => {
    const api = makeApi();
    renderPanel(api, true);
    fireEvent.click(await screen.findByLabelText("Xóa"));
    expect(api.remove).not.toHaveBeenCalled();
    const confirm = (await screen.findAllByText("Xóa")).pop() as HTMLElement;
    fireEvent.click(confirm);
    await waitFor(() => expect(api.remove).toHaveBeenCalledWith("1"));
  });
});

describe("V2AttachmentsPanel xem trước", () => {
  it("xóa file đang xem trước thì đóng khung xem trước", async () => {
    const api = makeApi();
    renderPanel(api, true);
    fireEvent.click(await screen.findByLabelText("Xem trước"));
    expect(await screen.findByText("Đóng xem trước")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Xóa"));
    const confirm = (await screen.findAllByText("Xóa")).pop() as HTMLElement;
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(screen.queryByText("Đóng xem trước")).toBeNull(),
    );
  });
});

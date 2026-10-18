import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AttachmentsTable } from "./AttachmentsTable";

vi.mock("@/modules/system/api/attachmentsApi", () => ({
  getAttachmentsPagedApi: vi.fn().mockResolvedValue({
    items: [
      {
        id: "att-1",
        fileName: "bang_ke.xlsx",
        fileSize: 2048,
        documentType: "BANG_KE",
        createdAt: "2026-10-06T10:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  }),
  getAttachmentOptionsApi: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    next: null,
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback ?? key,
}));

describe("AttachmentsTable", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("renders table with title and header correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AttachmentsTable onSelectAttachment={() => {}} />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Quản lý tài liệu")).toBeDefined();
    expect(
      screen.getByText("Quản lý tài liệu upload tập trung trong hệ thống"),
    ).toBeDefined();
  });
});

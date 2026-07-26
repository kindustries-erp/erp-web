// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostingSection } from "../PostingSection";
import { usePosting } from "../usePosting";
import { accountingApi } from "@/modules/accounting/api/accountingApi";

vi.mock("@/modules/accounting/api/accountingApi", () => ({
  accountingApi: {
    getChartOfAccounts: vi.fn(),
    getJournalEntryById: vi.fn(),
  },
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="mock-combobox"
      value={value || ""}
      placeholder={placeholder || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      data-testid="mock-datepicker"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function SummaryHost() {
  const postingState = usePosting();
  return (
    <PostingSection
      postingState={postingState}
      isPosted={true}
      journalEntryId="je-1"
      editMode={false}
    />
  );
}

function AutoBalanceHost({
  initialDescription,
  initialLines,
}: {
  initialDescription: string;
  initialLines: Array<{
    id: string;
    accountId: string;
    debit: number;
    credit: number;
    description: string;
  }>;
}) {
  const postingState = usePosting({
    postingDate: "2026-06-30",
    description: initialDescription,
    lines: initialLines,
  });

  return (
    <>
      <PostingSection
        isPosted={false}
        editMode={true}
        postingState={postingState as any}
        autoBalanceOnAddLine
      />
      <pre data-testid="posting-lines">
        {JSON.stringify(postingState.lines)}
      </pre>
    </>
  );
}

describe("PostingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a compact summary column for posted entries", async () => {
    (accountingApi.getChartOfAccounts as any).mockResolvedValue({
      items: [
        { id: "acc-1121", accountCode: "1121", accountName: "Tiền Việt Nam" },
        {
          id: "acc-131",
          accountCode: "131",
          accountName: "Phải thu của khách hàng",
        },
      ],
    });
    (accountingApi.getJournalEntryById as any).mockResolvedValue({
      id: "je-1",
      entryDate: "2026-06-30T00:00:00.000Z",
      description: "Thu tiền khách hàng",
      lines: [
        {
          id: "l1",
          accountId: "acc-1121",
          debit: 1000,
          credit: 0,
          description: "Thu tiền",
        },
        {
          id: "l2",
          accountId: "acc-131",
          debit: 0,
          credit: 1000,
          description: "Phải thu",
        },
      ],
    });

    render(
      <QueryClientProvider client={createClient()}>
        <SummaryHost />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Trạng thái")).toBeTruthy();
      expect(screen.getByText("Đã hạch toán")).toBeTruthy();
      expect(screen.getByText("Số dòng")).toBeTruthy();
      expect(screen.getByText(/Tổng Nợ:\s*1\.000/)).toBeTruthy();
      expect(screen.getByText(/Tổng Có:\s*1\.000/)).toBeTruthy();
      expect(screen.getByText("NỢ")).toBeTruthy();
      expect(screen.getByText("CÓ")).toBeTruthy();
    });
  });

  it("thêm dòng tự cân bằng vào cột Có khi Tổng Nợ lớn hơn Tổng Có", async () => {
    render(
      <QueryClientProvider client={createClient()}>
        <AutoBalanceHost
          initialDescription="Thu tien khach hang"
          initialLines={[
            {
              id: "l1",
              accountId: "acc-1121",
              debit: 100000,
              credit: 0,
              description: "Thu tien khach hang",
            },
          ]}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng" }));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);
      expect(lines[1].debit).toBe(0);
      expect(lines[1].credit).toBe(100000);
      expect(lines[1].description).toBe("Thu tien khach hang");
    });
  });

  it("thêm dòng tự cân bằng vào cột Nợ khi Tổng Có lớn hơn Tổng Nợ", async () => {
    render(
      <QueryClientProvider client={createClient()}>
        <AutoBalanceHost
          initialDescription="Dien giai dong 1"
          initialLines={[
            {
              id: "l1",
              accountId: "acc-131",
              debit: 0,
              credit: 55555,
              description: "Dien giai dong 1",
            },
          ]}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng" }));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);
      expect(lines[1].debit).toBe(55555);
      expect(lines[1].credit).toBe(0);
      expect(lines[1].description).toBe("Dien giai dong 1");
    });
  });
});

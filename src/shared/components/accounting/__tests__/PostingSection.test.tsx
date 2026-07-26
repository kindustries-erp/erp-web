// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostingSection } from "../PostingSection";
import { usePosting } from "../usePosting";

vi.mock("@/modules/accounting/api/accountingApi", () => ({
  accountingApi: {
    getChartOfAccounts: vi.fn().mockResolvedValue([]),
    getJournalEntryById: vi.fn().mockResolvedValue(null),
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

function PostingSectionHarness({
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

describe("PostingSection autoBalanceOnAddLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithClient = (ui: React.ReactNode) => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
    );
  };

  it("thêm dòng tự cân bằng vào cột Có khi Tổng Nợ lớn hơn Tổng Có", async () => {
    renderWithClient(
      <PostingSectionHarness
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
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng" }));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);
      expect(lines[1].accountId).toBe("");
      expect(lines[1].debit).toBe(0);
      expect(lines[1].credit).toBe(100000);
      expect(lines[1].description).toBe("Thu tien khach hang");
    });
  });

  it("thêm dòng tự cân bằng vào cột Nợ khi Tổng Có lớn hơn Tổng Nợ", async () => {
    renderWithClient(
      <PostingSectionHarness
        initialDescription=""
        initialLines={[
          {
            id: "l1",
            accountId: "acc-131",
            debit: 0,
            credit: 55555,
            description: "Dien giai dong 1",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng" }));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(2);
      expect(lines[1].accountId).toBe("");
      expect(lines[1].debit).toBe(55555);
      expect(lines[1].credit).toBe(0);
      expect(lines[1].description).toBe("Dien giai dong 1");
    });
  });

  it("khi Tổng Nợ bằng Tổng Có thì thêm dòng mới với số tiền 0 và giữ diễn giải", async () => {
    renderWithClient(
      <PostingSectionHarness
        initialDescription="Dien giai chung"
        initialLines={[
          {
            id: "l1",
            accountId: "acc-1121",
            debit: 10000,
            credit: 0,
            description: "Dien giai chung",
          },
          {
            id: "l2",
            accountId: "acc-131",
            debit: 0,
            credit: 10000,
            description: "Dien giai chung",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng" }));

    await waitFor(() => {
      const linesRaw = screen.getByTestId("posting-lines").textContent || "[]";
      const lines = JSON.parse(linesRaw);
      expect(lines).toHaveLength(3);
      expect(lines[2].accountId).toBe("");
      expect(lines[2].debit).toBe(0);
      expect(lines[2].credit).toBe(0);
      expect(lines[2].description).toBe("Dien giai chung");
    });
  });
});

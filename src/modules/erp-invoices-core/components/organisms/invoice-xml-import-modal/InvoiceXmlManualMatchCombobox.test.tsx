import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoiceXmlManualMatchCombobox } from "./InvoiceXmlManualMatchCombobox";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: { list: vi.fn() },
}));

// Trả về chuỗi mặc định tiếng Việt để giữ nguyên các assertion theo nhãn
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string"
        ? fallback
        : ((fallback as { defaultValue?: string })?.defaultValue ?? key),
  }),
}));

const initial = [{ value: "a", label: "HĐ cũ" }];

function renderCombobox(value = "") {
  const onChange = vi.fn();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <InvoiceXmlManualMatchCombobox
        direction="IN"
        value={value}
        onChange={onChange}
        initialOptions={initial}
      />
    </QueryClientProvider>,
  );
  return { onChange };
}

function typeSearch(text: string) {
  if (!screen.queryByPlaceholderText("Tìm số HĐ, ký hiệu...")) {
    fireEvent.click(screen.getByRole("combobox"));
  }
  fireEvent.change(screen.getByPlaceholderText("Tìm số HĐ, ký hiệu..."), {
    target: { value: text },
  });
}

describe("InvoiceXmlManualMatchCombobox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(erpInvoicesCoreApi.list).mockReset();
    vi.mocked(erpInvoicesCoreApi.list).mockResolvedValue({
      items: [],
      total: 0,
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces search and calls the server once with the last query", async () => {
    renderCombobox();
    typeSearch("1");
    typeSearch("18");
    typeSearch("1847");

    expect(erpInvoicesCoreApi.list).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(erpInvoicesCoreApi.list).toHaveBeenCalledTimes(1);
    expect(erpInvoicesCoreApi.list).toHaveBeenCalledWith({
      direction: "IN",
      search: "1847",
      pageSize: 20,
    });
  });

  it("shows the busy state while the request is pending", async () => {
    renderCombobox();
    typeSearch("abc");
    expect(screen.getByText("Đang tìm...")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    // Query bắt đầu sau khi debounce cập nhật; cho thêm lượt flush để kết quả về
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.queryByText("Đang tìm...")).toBeNull();
  });

  it("does not search for a blank query", async () => {
    renderCombobox();
    typeSearch("   ");
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(erpInvoicesCoreApi.list).not.toHaveBeenCalled();
  });

  it("keeps the label of the selected invoice when the options change", () => {
    renderCombobox("zzz");
    expect(screen.getByRole("combobox")).toHaveTextContent("Đã chọn hóa đơn");
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessPartnersPage } from "../../pages/BusinessPartnersPage";
import type { BusinessPartnerType } from "../../domain/entities/businessPartner";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  getColumnOptions: vi.fn(),
  getNextCode: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/modules/business-partners-core/api/businessPartnersCoreApi", () => ({
  businessPartnersCoreApi: api,
}));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

const renderPage = (partnerType: BusinessPartnerType = "CUSTOMER") => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <div className="h-[800px]">
        <BusinessPartnersPage partnerType={partnerType} />
      </div>
    </QueryClientProvider>,
  );
};

describe("BusinessPartnersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/v2/customers");
    api.list.mockResolvedValue({
      items: [
        {
          id: "partner-1",
          code: "KH-001",
          name: "Khách hàng A",
          partnerType: "CUSTOMER",
          status: "ACTIVE",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    api.getColumnOptions.mockResolvedValue({ items: [], total: 0, next: null });
    api.getNextCode.mockResolvedValue({ nextCode: "KH-002" });
    api.create.mockResolvedValue({ id: "partner-new" });
  });

  it("loads customers through the shared partner module", async () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Khách hàng" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Khách hàng A")).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(
      expect.objectContaining({ partnerType: "CUSTOMER" }),
    );
  });

  it("opens the V2 create drawer and generates a customer code", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Thêm khách hàng" }));
    expect(await screen.findByText("Thêm khách hàng mới")).toBeInTheDocument();
    await waitFor(() =>
      expect(api.getNextCode).toHaveBeenCalledWith("CUSTOMER"),
    );
  });

  it.each([
    ["CUSTOMER", "Thêm khách hàng", "Khách hàng mới"],
    ["VENDOR", "Thêm nhà cung cấp", "Nhà cung cấp mới"],
  ] as const)(
    "submits and refreshes the %s table",
    async (partnerType, createLabel, partnerName) => {
      renderPage(partnerType);
      fireEvent.click(screen.getByRole("button", { name: createLabel }));
      await waitFor(() => expect(api.getNextCode).toHaveBeenCalled());

      const textboxes = screen.getAllByRole("textbox");
      fireEvent.change(textboxes[1], { target: { value: partnerName } });
      fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

      await waitFor(() =>
        expect(api.create).toHaveBeenCalledWith(
          expect.objectContaining({ partnerType, name: partnerName }),
        ),
      );
      await waitFor(() =>
        expect(api.list.mock.calls.length).toBeGreaterThan(1),
      );
    },
  );
});

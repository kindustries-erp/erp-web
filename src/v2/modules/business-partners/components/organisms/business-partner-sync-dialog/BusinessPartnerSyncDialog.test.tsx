import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { businessPartnersV2Api } from "../../../api/businessPartnersApi";
import { BusinessPartnerSyncDialog } from "./BusinessPartnerSyncDialog";

const t = (key: string, fallback?: string) => fallback ?? key;

const renderDialog = (onOpenChange = vi.fn()) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <BusinessPartnerSyncDialog open onOpenChange={onOpenChange} t={t} />
    </QueryClientProvider>,
  );

describe("BusinessPartnerSyncDialog", () => {
  afterEach(() => vi.restoreAllMocks());

  it("previews the partners to create without writing", async () => {
    const preview = vi
      .spyOn(businessPartnersV2Api, "syncFromInvoices")
      .mockResolvedValue({
        message: "Xem trước đồng bộ",
        dryRun: true,
        count: 1,
        items: [
          {
            taxCode: "0100",
            name: "ABC",
            address: null,
            partnerType: "CUSTOMER",
          },
        ],
      });

    renderDialog();

    expect(await screen.findByText("ABC")).toBeTruthy();
    expect(preview).toHaveBeenCalledWith(true);
    expect(preview).not.toHaveBeenCalledWith(false);
  });

  it("disables confirm when nothing is new", async () => {
    vi.spyOn(businessPartnersV2Api, "syncFromInvoices").mockResolvedValue({
      message: "Xem trước đồng bộ",
      dryRun: true,
      count: 0,
      items: [],
    });

    renderDialog();

    await screen.findByText("Không có đối tác mới cần tạo");
    const confirm = screen.getByRole("button", {
      name: "Tạo đối tác",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });

  it("creates the partners only after confirm", async () => {
    vi.spyOn(businessPartnersV2Api, "syncFromInvoices").mockImplementation(
      async (dryRun) => ({
        message: "ok",
        dryRun,
        count: 1,
        items: [
          {
            taxCode: "0100",
            name: "ABC",
            address: null,
            partnerType: "CUSTOMER",
          },
        ],
      }),
    );
    const onOpenChange = vi.fn();

    renderDialog(onOpenChange);

    await screen.findByText("ABC");
    fireEvent.click(screen.getByRole("button", { name: "Tạo đối tác" }));

    await waitFor(() =>
      expect(businessPartnersV2Api.syncFromInvoices).toHaveBeenCalledWith(
        false,
      ),
    );
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

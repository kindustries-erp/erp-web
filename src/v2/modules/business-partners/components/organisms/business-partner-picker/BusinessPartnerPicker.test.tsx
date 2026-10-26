import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { businessPartnersV2Api } from "../../../api/businessPartnersApi";
import { BusinessPartnerPicker } from "./BusinessPartnerPicker";

const renderPicker = (
  props: Partial<React.ComponentProps<typeof BusinessPartnerPicker>> = {},
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <BusinessPartnerPicker
        direction="OUT"
        value={null}
        selectedLabel={null}
        onValueChange={() => undefined}
        {...props}
      />
    </QueryClientProvider>,
  );

describe("BusinessPartnerPicker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads select options for the statement direction", async () => {
    const spy = vi
      .spyOn(businessPartnersV2Api, "listSelectOptions")
      .mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

    renderPicker({ direction: "IN" });

    await waitFor(() => expect(spy).toHaveBeenCalledWith("IN", "", 1));
  });

  it("shows the selected partner label when the value is set", async () => {
    vi.spyOn(businessPartnersV2Api, "listSelectOptions").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    renderPicker({ value: "master:p-1", selectedLabel: "Công ty ABC" });

    expect(await screen.findByText("Công ty ABC")).toBeTruthy();
  });

  it("opens the create drawer from the picker", async () => {
    vi.spyOn(businessPartnersV2Api, "listSelectOptions").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    renderPicker({ direction: "OUT" });
    fireEvent.click(screen.getByRole("button", { name: "+ Tạo đối tác mới" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});

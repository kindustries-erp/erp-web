import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GarageItemCodeField } from "./GarageItemCodeField";
import { listGarageItemOptions } from "../api/garageItemOptions";

vi.mock("../api/garageItemOptions", () => ({
  listGarageItemOptions: vi.fn(),
}));

function setup(value: string, onPick = vi.fn()) {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <GarageItemCodeField value={value} ariaLabel="Mã" onPick={onPick} />
    </QueryClientProvider>,
  );
  return onPick;
}

describe("GarageItemCodeField", () => {
  beforeEach(() => {
    vi.mocked(listGarageItemOptions).mockResolvedValue([
      { itemCode: "PT-000001", itemName: "Lọc dầu", unit: "Cái" },
    ]);
  });

  it("gõ mã mới thì chỉ báo mã, không điền tên", () => {
    const onPick = setup("");
    fireEvent.change(screen.getByLabelText("Mã"), {
      target: { value: "ABC" },
    });
    expect(onPick).toHaveBeenCalledWith({ itemCode: "ABC" });
  });

  it("gõ đúng một mã gợi ý thì điền cả tên và đơn vị", async () => {
    const onPick = setup("PT-0");
    await waitFor(() => expect(listGarageItemOptions).toHaveBeenCalled());
    await screen.findByText("Lọc dầu", {}, { timeout: 2000 }).catch(() => {});
    fireEvent.change(screen.getByLabelText("Mã"), {
      target: { value: "pt-000001" },
    });
    expect(onPick).toHaveBeenCalledWith({
      itemCode: "PT-000001",
      itemName: "Lọc dầu",
      unit: "Cái",
    });
  });
});

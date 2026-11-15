import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AiInvoiceAssistantProps } from "@/v2/core/ai-hub";
import { GarageInvoiceAssistant } from "./GarageInvoiceAssistant";

const permissions = new Set<string>();
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: (req: { collection: string; action?: string }) =>
    permissions.has(`${req.collection}:${req.action}`),
}));
vi.mock("./garageProcurementRequests.config", () => ({
  garageProcurementRequestsConfig: {
    permissionCollection: "garage_procurement_requests",
    queryKey: "v2-garage-procurement-requests",
  },
}));
let captured: AiInvoiceAssistantProps | null = null;
vi.mock("@/v2/core/ai-hub", () => ({
  createAiInvoiceApi: (base: string) => ({ base }),
  AiInvoiceAssistant: (props: AiInvoiceAssistantProps) => {
    captured = props;
    return <div data-testid="assistant" />;
  },
}));

describe("GarageInvoiceAssistant", () => {
  const client = new QueryClient();
  const onCreated = vi.fn();
  const mount = () =>
    render(
      <QueryClientProvider client={client}>
        <GarageInvoiceAssistant onCreated={onCreated} />
      </QueryClientProvider>,
    );

  beforeEach(() => {
    permissions.clear();
    captured = null;
    onCreated.mockReset();
  });

  it("ẩn khi thiếu quyền dùng trợ lý hoặc quyền tạo đề nghị", () => {
    permissions.add("garage_procurement_requests:create");
    mount();
    expect(screen.queryByTestId("assistant")).toBeNull();
  });

  it("đủ quyền: hiện trợ lý với API ai-hub-garage", () => {
    permissions.add("garage_procurement_requests:create");
    permissions.add("ai_hub_garage:create");
    mount();
    expect(screen.getByTestId("assistant")).toBeDefined();
    expect(captured?.api).toEqual({ base: "/api/v2/ai-hub-garage" });
  });

  it("tạo xong: làm mới danh sách đề nghị và mở phiếu mới", () => {
    permissions.add("garage_procurement_requests:create");
    permissions.add("ai_hub_garage:create");
    const invalidate = vi.spyOn(client, "invalidateQueries");
    mount();

    captured?.onCreated?.({
      requestId: "r1",
      requestNo: "GDNM-1",
      createdItems: [],
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["v2-garage-procurement-requests"],
    });
    expect(onCreated).toHaveBeenCalledWith("r1");
  });
});

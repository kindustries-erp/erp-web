import { describe, expect, it } from "vitest";
import { resolveV2Route, type V2RouteDef } from "./v2RouteConfig";

describe("resolveV2Route", () => {
  it("matches a route by exact path", () => {
    expect(resolveV2Route("/v2/inventory")?.id).toBe("inventory");
  });

  it("matches nested paths under a route", () => {
    expect(resolveV2Route("/v2/sales-orders/123")?.id).toBe("sales-orders");
  });

  it("registers business partner routes with read permission", () => {
    expect(resolveV2Route("/v2/customers")?.permission).toEqual({
      collection: "business_partners",
      action: "read",
    });
    expect(resolveV2Route("/v2/suppliers")?.id).toBe("suppliers");
  });

  it("registers the invoice route with read permission on erp_invoices", () => {
    expect(resolveV2Route("/v2/invoices")).toMatchObject({
      id: "invoices",
      permission: { collection: "erp_invoices", action: "read" },
    });
  });

  it("does not match a path that only shares a prefix", () => {
    expect(resolveV2Route("/v2/sales-orders-archive")).toBeNull();
  });

  it("returns null for the home path", () => {
    expect(resolveV2Route("/v2")).toBeNull();
  });

  it("prefers the longest matching route", () => {
    const routes: V2RouteDef[] = [
      { id: "parent", path: "/v2/a", title: "A" },
      { id: "child", path: "/v2/a/b", title: "B" },
    ];
    expect(resolveV2Route("/v2/a/b/c", routes)?.id).toBe("child");
  });
});

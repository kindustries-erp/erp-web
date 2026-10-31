import { describe, expect, it } from "vitest";
import { resolveV2Route, isAdminPath, type V2RouteDef } from "./v2RouteConfig";

describe("resolveV2Route", () => {
  it("matches a route by exact path", () => {
    expect(resolveV2Route("/v2/inventory")?.id).toBe("inventory");
  });

  it("matches nested paths under a route", () => {
    expect(resolveV2Route("/v2/sales-orders/123")?.id).toBe("sales-orders");
  });

  it("matches admin routes under /v2/admin", () => {
    expect(resolveV2Route("/v2/admin/dashboard")?.id).toBe("admin-dashboard");
    expect(resolveV2Route("/v2/admin/dashboard")?.isAdmin).toBe(true);
    expect(resolveV2Route("/v2/admin/users")?.id).toBe("admin-users");
  });

  it("identifies admin paths correctly with isAdminPath", () => {
    expect(isAdminPath("/v2/admin")).toBe(true);
    expect(isAdminPath("/v2/admin/dashboard")).toBe(true);
    expect(isAdminPath("/v2/admin/users")).toBe(true);
    expect(isAdminPath("/v2/sales-orders")).toBe(false);
    expect(isAdminPath("/v2")).toBe(false);
  });

  it("registers business partner routes with read permission", () => {
    expect(resolveV2Route("/v2/customers")?.permission).toEqual({
      collection: "business_partners",
      action: "read",
    });
    expect(resolveV2Route("/v2/suppliers")?.id).toBe("suppliers");
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

import { describe, expect, it } from "vitest";
import type { V2RouteDef } from "@/v2/app/router/v2RouteConfig";
import { filterV2NavItems, filterV2NavSections } from "./v2Navigation";

const routes: V2RouteDef[] = [
  { id: "open", path: "/v2/open", title: "Open" },
  {
    id: "secure",
    path: "/v2/secure",
    title: "Secure",
    permission: { collection: "secure_collection" },
  },
];

const can = (requirement?: { collection: string }) =>
  !requirement || requirement.collection !== "secure_collection";

describe("filterV2NavItems", () => {
  it("keeps items without a route permission", () => {
    const items = [{ id: "open" }, { id: "unknown" }];
    expect(filterV2NavItems(items, can, routes)).toEqual(items);
  });

  it("hides items whose route requires a missing permission", () => {
    const result = filterV2NavItems(
      [{ id: "open" }, { id: "secure" }],
      can,
      routes,
    );
    expect(result).toEqual([{ id: "open" }]);
  });

  it("shows secured items when the permission is granted", () => {
    const result = filterV2NavItems([{ id: "secure" }], () => true, routes);
    expect(result).toEqual([{ id: "secure" }]);
  });
});

describe("filterV2NavSections", () => {
  const item = (id: string) => ({
    id,
    label: id,
    icon: (() => null) as never,
    href: `/v2/${id}`,
  });

  it("drops sections that end up empty", () => {
    const sections = [
      { id: "a", label: "A", items: [item("open")] },
      { id: "b", label: "B", items: [item("secure")] },
    ];
    const result = filterV2NavSections(sections, can, routes);
    expect(result.map((s) => s.id)).toEqual(["a"]);
  });
});

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  GARAGE_CASHFLOW_QUERY_KEYS,
  garageCashflowListKey,
  garageCashflowOptionsKey,
  invalidateGarageCashflowQueries,
} from "./garageCashflowQueries";

function seed(client: QueryClient, keys: unknown[][]) {
  keys.forEach((key) => client.setQueryData(key, { seeded: true }));
}

describe("garageCashflowQueries", () => {
  it("khóa danh sách theo tab: tab Dự thu chi dùng khóa riêng", () => {
    expect(garageCashflowListKey("forecast")).toBe(
      GARAGE_CASHFLOW_QUERY_KEYS.forecastList,
    );
    expect(garageCashflowListKey("vouchers")).toBe(
      GARAGE_CASHFLOW_QUERY_KEYS.list,
    );
    expect(garageCashflowListKey()).toBe(GARAGE_CASHFLOW_QUERY_KEYS.list);
    expect(garageCashflowOptionsKey("forecast")).toBe(
      "garage-cashflow-options-forecast",
    );
  });

  it("làm mới cả hai danh sách, dashboard, lịch sử và giá trị lọc cột", async () => {
    const client = new QueryClient();
    const affected = [
      ["garage-cashflow-list", 1, 20],
      ["garage-cashflow-forecast-list", 1, 20],
      ["garage-cashflow-dashboard", { branchId: undefined }],
      ["garage-cashflow-audit", "v-1"],
      ["garage-cashflow-options-forecast", "partnerName", "", ""],
      ["garage-cashflow-options-vouchers", "partnerName", "", ""],
    ];
    const untouched = [
      ["garage-cashflow-column-views"],
      ["garage-customers-debt"],
      [{ scope: "other" }],
    ];
    seed(client, [...affected, ...untouched]);

    await invalidateGarageCashflowQueries(client);

    affected.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    untouched.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(false),
    );
  });
});

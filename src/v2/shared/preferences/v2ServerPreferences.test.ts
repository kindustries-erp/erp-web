import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { loadV2ServerPreferences } from "./v2ServerPreferences";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

const TABLES_URL = "/api/v1/app/table-preferences";
const V2_TABLES_URL = "/api/v2/table-preferences?tableIdPrefix=procurement-";
const USER_URL = "/api/v1/app/preferences";

const mockResponses = (
  tables: () => Promise<unknown>,
  user: () => Promise<unknown>,
  v2Tables: () => Promise<unknown> = async () => ({ data: { items: [] } }),
) =>
  vi.mocked(v2HttpClient.get).mockImplementation((url: string) => {
    if (url === TABLES_URL) return tables();
    if (url === V2_TABLES_URL) return v2Tables();
    return user();
  });

describe("loadV2ServerPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useV2LocaleStore.setState({ locale: "vi" });
    useV2TablePreferencesStore.setState({ tables: {}, migrationVersion: 1 });
  });

  it("loads each table's config and the language from the server", async () => {
    mockResponses(
      async () => ({
        data: {
          data: {
            "erp-customers-table": {
              columns: { visibility: { code: true }, order: [], sizing: {} },
            },
          },
        },
      }),
      async () => ({ data: { data: { language: "en" } } }),
    );

    await loadV2ServerPreferences();

    expect(v2HttpClient.get).toHaveBeenCalledWith(TABLES_URL);
    expect(v2HttpClient.get).toHaveBeenCalledWith(USER_URL);
    expect(useV2LocaleStore.getState().locale).toBe("en");
    expect(
      useV2TablePreferencesStore.getState().tables["erp-customers-table"],
    ).toMatchObject({ columns: { visibility: { code: true } } });
  });

  it("giữ filterKey của custom view khi nạp cấu hình v2 từ server", async () => {
    mockResponses(
      async () => ({ data: { data: {} } }),
      async () => ({ data: { data: {} } }),
      async () => ({
        data: {
          items: [
            {
              tableId: "procurement-requests-garage-table",
              updatedAt: "2026-11-10T00:00:00Z",
              views: {
                customViews: [
                  {
                    key: "custom_1",
                    label: "Chờ duyệt",
                    baseKey: "all",
                    visibility: { code: true },
                    order: ["code"],
                    filterKey: "pending",
                  },
                ],
              },
            },
          ],
        },
      }),
    );

    await loadV2ServerPreferences();

    expect(
      useV2TablePreferencesStore.getState().tables[
        "procurement-requests-garage-table"
      ]?.views?.customViews[0],
    ).toMatchObject({ key: "custom_1", filterKey: "pending" });
  });

  it("lets the v2 procurement config override the v1 copy of the same table", async () => {
    mockResponses(
      async () => ({
        data: {
          data: {
            "procurement-requests-garage-table": {
              columns: { order: ["old"] },
            },
            "erp-customers-table": { columns: { order: ["customers"] } },
          },
        },
      }),
      async () => ({ data: { data: {} } }),
      async () => ({
        data: {
          items: [
            {
              tableId: "procurement-requests-garage-table",
              columns: { order: ["new"] },
              views: { activeKey: "all" },
              updatedAt: "2026-11-09T00:00:00.000Z",
            },
          ],
        },
      }),
    );

    await loadV2ServerPreferences();

    const tables = useV2TablePreferencesStore.getState().tables;
    expect(tables["procurement-requests-garage-table"]).toEqual({
      columns: { order: ["new"] },
      views: { activeKey: "all" },
    });
    expect(tables["erp-customers-table"]).toEqual({
      columns: { order: ["customers"] },
    });
  });

  it("keeps the v1 procurement copy when the v2 request fails", async () => {
    mockResponses(
      async () => ({
        data: {
          data: {
            "procurement-orders-garage-table": { columns: { order: ["v1"] } },
          },
        },
      }),
      async () => ({ data: { data: {} } }),
      async () => {
        throw new Error("offline");
      },
    );

    await loadV2ServerPreferences();

    expect(
      useV2TablePreferencesStore.getState().tables[
        "procurement-orders-garage-table"
      ],
    ).toEqual({ columns: { order: ["v1"] } });
  });

  it("still applies the language when the table request fails", async () => {
    mockResponses(
      async () => {
        throw new Error("offline");
      },
      async () => ({ data: { data: { language: "en" } } }),
    );

    await expect(loadV2ServerPreferences()).resolves.toBeUndefined();
    expect(useV2LocaleStore.getState().locale).toBe("en");
    expect(useV2TablePreferencesStore.getState().tables).toEqual({});
  });

  it("keeps local state when both requests fail", async () => {
    vi.mocked(v2HttpClient.get).mockRejectedValue(new Error("offline"));

    await expect(loadV2ServerPreferences()).resolves.toBeUndefined();
    expect(useV2LocaleStore.getState().locale).toBe("vi");
  });
});

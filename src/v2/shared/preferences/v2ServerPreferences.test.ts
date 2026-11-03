import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { loadV2ServerPreferences } from "./v2ServerPreferences";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

const TABLES_URL = "/api/v1/app/table-preferences";
const USER_URL = "/api/v1/app/preferences";

const mockResponses = (
  tables: () => Promise<unknown>,
  user: () => Promise<unknown>,
) =>
  vi
    .mocked(v2HttpClient.get)
    .mockImplementation((url: string) =>
      url === TABLES_URL ? tables() : user(),
    );

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

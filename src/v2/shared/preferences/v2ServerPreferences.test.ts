import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { loadV2ServerPreferences } from "./v2ServerPreferences";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

describe("loadV2ServerPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useV2LocaleStore.setState({ locale: "vi" });
    useV2TablePreferencesStore.setState({ tables: {}, migrationVersion: 1 });
  });

  it("makes one request and applies both table configs and language", async () => {
    vi.mocked(v2HttpClient.get).mockResolvedValue({
      data: {
        data: {
          language: "en",
          tableConfigs: {
            "v2:erp-customers-table": {
              columns: { visibility: { code: true }, order: [], sizing: {} },
            },
            "erp-vendors-table": { columnOrder: ["v1-only"] },
          },
        },
      },
    });

    await loadV2ServerPreferences();

    expect(v2HttpClient.get).toHaveBeenCalledTimes(1);
    expect(useV2LocaleStore.getState().locale).toBe("en");
    expect(
      useV2TablePreferencesStore.getState().tables["erp-customers-table"],
    ).toMatchObject({ columns: { visibility: { code: true } } });
    expect(
      useV2TablePreferencesStore.getState().tables["erp-vendors-table"],
    ).toBeUndefined();
  });

  it("keeps local state when the request fails", async () => {
    vi.mocked(v2HttpClient.get).mockRejectedValue(new Error("offline"));

    await expect(loadV2ServerPreferences()).resolves.toBeUndefined();
    expect(useV2LocaleStore.getState().locale).toBe("vi");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapV1TablePreference } from "./v2TablePreferences.migrate";
import {
  migrateV1TablePreferences,
  useV2TablePreferencesStore,
} from "./useV2TablePreferencesStore";
import {
  applyV2SystemView,
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "./v2TablePreferenceStorages";

vi.mock("./v2TablePreferences.sync", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./v2TablePreferences.sync")>()),
  scheduleTablePreferenceSync: vi.fn(),
}));

const V1_KEY = "erp_preferences";

describe("mapV1TablePreference", () => {
  it("maps V1 system view keys to the V2 names and keeps custom views", () => {
    const mapped = mapV1TablePreference({
      columnOrder: ["code", "name"],
      columnVisibility: { code: true, name: true, email: false },
      columnSizing: { code: 170 },
      activeView: "legal_tax",
      views: [
        {
          key: "mine",
          label: "Của tôi",
          columnVisibility: { email: true },
          isCustom: true,
        },
        { key: "overview", label: "Tổng quan", isCustom: false },
      ],
    });

    expect(mapped.columns).toEqual({
      visibility: { code: true, name: true, email: false },
      order: ["code", "name"],
      sizing: { code: 170 },
    });
    expect(mapped.views).toEqual({
      activeKey: "legal",
      customViews: [
        {
          key: "mine",
          label: "Của tôi",
          baseKey: "overview",
          visibility: { email: true },
          order: ["code", "name"],
        },
      ],
    });
  });
});

describe("migrateV1TablePreferences", () => {
  beforeEach(() => {
    localStorage.clear();
    useV2TablePreferencesStore.setState({ tables: {}, migrationVersion: 0 });
  });

  it("copies V1 tables once and skips alias keys and existing V2 tables", () => {
    localStorage.setItem(
      V1_KEY,
      JSON.stringify({
        state: {
          tables: {
            "erp-customers-table": {
              columnOrder: ["code"],
              columnVisibility: {},
            },
            "erp-customers-table_2": {
              columnOrder: ["code"],
              columnVisibility: {},
            },
            "erp-vendors-table": {
              columnOrder: ["name"],
              columnVisibility: {},
            },
          },
        },
      }),
    );
    useV2TablePreferencesStore.setState({
      tables: {
        "erp-vendors-table": {
          columns: { visibility: {}, order: ["keep"], sizing: {} },
        },
      },
    });

    migrateV1TablePreferences();

    const { tables, migrationVersion } = useV2TablePreferencesStore.getState();
    expect(Object.keys(tables).sort()).toEqual([
      "erp-customers-table",
      "erp-vendors-table",
    ]);
    expect(tables["erp-vendors-table"].columns?.order).toEqual(["keep"]);
    expect(migrationVersion).toBe(1);

    localStorage.setItem(
      V1_KEY,
      JSON.stringify({ state: { tables: { x: {} } } }),
    );
    migrateV1TablePreferences();
    expect(useV2TablePreferencesStore.getState().tables.x).toBeUndefined();
  });
});

describe("v2 table storages", () => {
  beforeEach(() => {
    useV2TablePreferencesStore.setState({ tables: {}, migrationVersion: 1 });
  });

  it("saves and loads column preferences under the table id", () => {
    v2ColumnPreferencesStorage.save("erp-customers-table", {
      visibility: { code: true },
      order: ["code"],
      sizing: {},
    });

    expect(v2ColumnPreferencesStorage.load("erp-customers-table")).toEqual({
      visibility: { code: true },
      order: ["code"],
      sizing: {},
    });
    expect(v2ColumnPreferencesStorage.load("unknown")).toBeNull();
  });

  it("applies a system view by updating visibility and the active key", () => {
    applyV2SystemView("erp-customers-table", "all", {
      code: true,
      email: true,
    });

    expect(
      v2ColumnPreferencesStorage.load("erp-customers-table")?.visibility,
    ).toEqual({
      code: true,
      email: true,
    });
    expect(v2ViewPresetStorage.load("erp-customers-table")?.activeKey).toBe(
      "all",
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { readV1Locale, useV2LocaleStore } from "./useV2LocaleStore";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { patch: vi.fn(() => Promise.resolve({})) },
}));

describe("readV1Locale", () => {
  beforeEach(() => localStorage.clear());

  it("reads the language chosen in V1 from its persisted state", () => {
    localStorage.setItem(
      "erp-app",
      JSON.stringify({ state: { locale: "en" } }),
    );
    expect(readV1Locale()).toBe("en");
  });

  it("ignores missing or unknown values", () => {
    expect(readV1Locale()).toBeUndefined();
    localStorage.setItem(
      "erp-app",
      JSON.stringify({ state: { locale: "fr" } }),
    );
    expect(readV1Locale()).toBeUndefined();
    localStorage.setItem("erp-app", "{not json");
    expect(readV1Locale()).toBeUndefined();
  });
});

describe("useV2LocaleStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null });
    useV2LocaleStore.setState({ locale: "vi" });
  });

  it("saves the language to the server only when a session exists", () => {
    useV2LocaleStore.getState().setLocale("en");
    expect(v2HttpClient.patch).not.toHaveBeenCalled();

    useAuthStore.setState({ accessToken: "token" });
    useV2LocaleStore.getState().setLocale("vi");
    expect(v2HttpClient.patch).toHaveBeenCalledWith("/api/v1/app/preferences", {
      language: "vi",
    });
  });

  it("applies a server language only when it is supported", () => {
    useV2LocaleStore.getState().applyServerLanguage("en");
    expect(useV2LocaleStore.getState().locale).toBe("en");

    useV2LocaleStore.getState().applyServerLanguage("de");
    expect(useV2LocaleStore.getState().locale).toBe("en");
  });
});

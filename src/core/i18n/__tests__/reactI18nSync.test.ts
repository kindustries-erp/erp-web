import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/core/config/appStore";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import i18n from "../react-i18n";

describe("react-i18n 2-way locale sync", () => {
  beforeEach(() => {
    useAppStore.setState({ locale: "vi" });
    useV2LocaleStore.setState({ locale: "vi" });
    void i18n.changeLanguage("vi");
  });

  it("syncs useV2LocaleStore when useAppStore changes locale", () => {
    useAppStore.getState().setLocale("en");
    expect(useV2LocaleStore.getState().locale).toBe("en");
    expect(i18n.language).toBe("en");
  });

  it("syncs useAppStore and i18n when useV2LocaleStore changes locale", () => {
    useV2LocaleStore.getState().setLocale("en");
    expect(useAppStore.getState().locale).toBe("en");
    expect(i18n.language).toBe("en");
  });
});

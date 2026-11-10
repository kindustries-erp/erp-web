import { describe, expect, it } from "vitest";
import { lookupV2ModuleKey } from "@/v2/shared/locales";
import "./deckViewer.locale";

const EXPECTED_KEYS = [
  "v2.deckViewer.toggleSidebar",
  "v2.deckViewer.prevPage",
  "v2.deckViewer.nextPage",
  "v2.deckViewer.downloadPdf",
  "v2.deckViewer.toggleFullscreen",
  "v2.deckViewer.pageList",
  "v2.deckViewer.pagesCount",
  "v2.deckViewer.searchPlaceholder",
  "v2.deckViewer.noMatchingPages",
  "v2.deckViewer.slideAriaLabel",
  "v2.deckViewer.notFoundTitle",
  "v2.deckViewer.notFoundDesc",
];

describe("deckViewer.locale", () => {
  it("registers all required vi and en translations", () => {
    for (const key of EXPECTED_KEYS) {
      expect(typeof lookupV2ModuleKey("vi", key)).toBe("string");
      expect(typeof lookupV2ModuleKey("en", key)).toBe("string");
    }
  });
});

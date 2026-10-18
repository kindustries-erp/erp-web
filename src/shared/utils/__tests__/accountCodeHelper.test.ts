import { describe, it, expect } from "vitest";
import {
  extractAccountCodeFromText,
  resolveOptionAccountCode,
  cleanOptionDisplayLabel,
} from "../accountCodeHelper";

describe("accountCodeHelper", () => {
  describe("extractAccountCodeFromText", () => {
    it("extracts account code from brackets [TK 632]", () => {
      expect(
        extractAccountCodeFromText(
          "[TK 632] Gia công ngoài & Thầu phụ kỹ thuật",
        ),
      ).toBe("632");
      expect(extractAccountCodeFromText("[TK1561] Phụ tùng chính hãng")).toBe(
        "1561",
      );
      expect(extractAccountCodeFromText("[152] Nguyên vật liệu")).toBe("152");
      expect(extractAccountCodeFromText("Chi phí khác [6427]")).toBe("6427");
    });

    it("extracts account code with prefix TK: 1561", () => {
      expect(extractAccountCodeFromText("TK: 1561 - Phụ tùng")).toBe("1561");
      expect(extractAccountCodeFromText("TK 153 - CCDC xưởng")).toBe("153");
    });

    it("returns null for non-matching or empty strings", () => {
      expect(extractAccountCodeFromText("")).toBeNull();
      expect(extractAccountCodeFromText(null)).toBeNull();
      expect(extractAccountCodeFromText("Hàng hóa thông thường")).toBeNull();
    });
  });

  describe("resolveOptionAccountCode", () => {
    it("prioritizes explicit opt.accountCode", () => {
      const opt = {
        value: "GARAGE_SUBCONTRACT",
        label: "[TK 1561] Sai label",
        accountCode: "632",
      };
      expect(resolveOptionAccountCode(opt)).toBe("632");
    });

    it("extracts code from opt.label when accountCode is absent", () => {
      const opt = {
        value: "GARAGE_SUBCONTRACT",
        label: "[TK 632] Gia công ngoài & Thầu phụ kỹ thuật",
      };
      expect(resolveOptionAccountCode(opt)).toBe("632");
    });

    it("extracts code from opt.labels.vi when label has no code", () => {
      const opt = {
        value: "CUSTOM_PART",
        label: "Phụ tùng tùy chỉnh",
        labels: {
          vi: "[TK 1563] Phụ tùng OEM",
        },
      };
      expect(resolveOptionAccountCode(opt)).toBe("1563");
    });

    it("fallbacks to TT99 mapping by opt.value when no label code exists", () => {
      const opt = {
        value: "VF_PARTS",
        label: "Phụ tùng xe",
      };
      expect(resolveOptionAccountCode(opt)).toBe("1561");

      const optVehicles = {
        value: "COMMERCIAL_VEHICLES",
        label: "Mua xe lướt",
      };
      expect(resolveOptionAccountCode(optVehicles)).toBe("1562");
    });

    it("returns null for completely unknown custom option without any code", () => {
      const opt = {
        value: "CUSTOM_UNKNOWN_OPTION",
        label: "Tùy chọn không xác định",
      };
      expect(resolveOptionAccountCode(opt)).toBeNull();
    });
  });

  describe("cleanOptionDisplayLabel", () => {
    it("removes [TK ...] bracket prefixes and suffixes", () => {
      expect(
        cleanOptionDisplayLabel("[TK 632] Gia công ngoài & Thầu phụ kỹ thuật"),
      ).toBe("Gia công ngoài & Thầu phụ kỹ thuật");
      expect(cleanOptionDisplayLabel("Phụ tùng chính hãng [1561]")).toBe(
        "Phụ tùng chính hãng",
      );
      expect(cleanOptionDisplayLabel("TK: 152 - Nguyên vật liệu")).toBe(
        "Nguyên vật liệu",
      );
    });

    it("preserves normal labels unchanged", () => {
      expect(cleanOptionDisplayLabel("Dịch vụ sửa chữa")).toBe(
        "Dịch vụ sửa chữa",
      );
      expect(cleanOptionDisplayLabel("")).toBe("");
      expect(cleanOptionDisplayLabel(null)).toBe("");
    });
  });
});

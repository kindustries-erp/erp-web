import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  KgaraCaseStatusBadge,
  getKgaraStatusLabel,
} from "../KgaraCaseStatusBadge";

describe("KgaraCaseStatusBadge & getKgaraStatusLabel", () => {
  describe("getKgaraStatusLabel", () => {
    it("returns empty string for null, undefined, and empty string", () => {
      expect(getKgaraStatusLabel(null)).toBe("");
      expect(getKgaraStatusLabel(undefined)).toBe("");
      expect(getKgaraStatusLabel("")).toBe("");
    });

    it("maps known integer status codes correctly", () => {
      expect(getKgaraStatusLabel(1)).toBe("Tiếp nhận");
      expect(getKgaraStatusLabel(2)).toBe("Báo giá");
      expect(getKgaraStatusLabel(3)).toBe("Kết thúc");
      expect(getKgaraStatusLabel(4)).toBe("Đã hủy");
      expect(getKgaraStatusLabel(99)).toBe("Trạng thái 99");
    });

    it("trims and returns string statuses", () => {
      expect(getKgaraStatusLabel("  Đang sửa chữa  ")).toBe("Đang sửa chữa");
      expect(getKgaraStatusLabel("Kết thúc")).toBe("Kết thúc");
    });
  });

  describe("KgaraCaseStatusBadge rendering", () => {
    it("renders nothing when status is null or undefined", () => {
      const { container: c1 } = render(<KgaraCaseStatusBadge status={null} />);
      expect(c1.firstChild).toBeNull();

      const { container: c2 } = render(
        <KgaraCaseStatusBadge status={undefined} />,
      );
      expect(c2.firstChild).toBeNull();
    });

    it("renders number status safely without TypeError", () => {
      render(<KgaraCaseStatusBadge status={3} />);
      expect(screen.getByText("Kết thúc")).toBeDefined();
    });

    it("renders number status 1 with warning variant label", () => {
      render(<KgaraCaseStatusBadge status={1} />);
      expect(screen.getByText("Tiếp nhận")).toBeDefined();
    });

    it("renders text statuses correctly", () => {
      render(<KgaraCaseStatusBadge status="Hoàn tất" />);
      expect(screen.getByText("Hoàn tất")).toBeDefined();
    });
  });
});

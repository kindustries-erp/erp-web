import { describe, expect, it } from "vitest";
import {
  findLoanPresetById,
  getLoanPresetOptions,
  LOAN_PRESETS,
} from "./loan-presets.rule";
import { AmortizationMethod } from "../types/loan.types";

describe("loan-presets.rule", () => {
  it("chứa danh sách LOAN_PRESETS đầy đủ các kịch bản thực tế ngân hàng", () => {
    expect(LOAN_PRESETS.length).toBeGreaterThanOrEqual(6);

    const ids = LOAN_PRESETS.map((p) => p.id);
    expect(ids).toContain("mortgage-amortized");
    expect(ids).toContain("mortgage-declining");
    expect(ids).toContain("car-loan");
    expect(ids).toContain("personal-unsecured");
    expect(ids).toContain("working-capital");
    expect(ids).toContain("project-grace");
    expect(ids).toContain("other-custom");
  });

  it("findLoanPresetById tìm đúng preset theo id", () => {
    const carLoan = findLoanPresetById("car-loan");
    expect(carLoan).toBeDefined();
    expect(carLoan?.amortizationMethod).toBe(AmortizationMethod.AMORTIZED);
    expect(carLoan?.principalAmount).toBe(500_000_000);
    expect(carLoan?.tenorMonths).toBe(60);

    const otherCustom = findLoanPresetById("other-custom");
    expect(otherCustom).toBeDefined();
    expect(otherCustom?.name).toContain("Khoản vay khác");
    expect(otherCustom?.lenderName).toBe("");

    const mortgageDeclining = findLoanPresetById("mortgage-declining");
    expect(mortgageDeclining?.amortizationMethod).toBe(
      AmortizationMethod.EQUAL_PRINCIPAL,
    );
    expect(mortgageDeclining?.principalAmount).toBe(2_000_000_000);
  });

  it("getLoanPresetOptions trả về danh sách options đúng thứ tự và label fallback", () => {
    const mockT = (_key: string, fallback: string) => fallback;
    const options = getLoanPresetOptions(mockT);

    expect(options.length).toBe(7);
    expect(options[0].value).toBe("mortgage-amortized");
    expect(options[1].value).toBe("mortgage-declining");
    expect(options[2].value).toBe("car-loan");
    expect(options[3].value).toBe("personal-unsecured");
    expect(options[4].value).toBe("working-capital");
    expect(options[5].value).toBe("project-grace");
    expect(options[6].value).toBe("other-custom");
  });
});

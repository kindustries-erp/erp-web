import { describe, expect, it } from "vitest";
import { getAmortizationMethodOptions } from "./loan-format.rule";
import { AmortizationMethod } from "../types/loan.types";

describe("loan-format.rule - getAmortizationMethodOptions", () => {
  it("trả về các phương thức trả nợ theo đúng thứ tự ưu tiên thực tế ngân hàng", () => {
    const mockT = (_key: string, fallback: string) => fallback;
    const options = getAmortizationMethodOptions(mockT);

    expect(options.length).toBe(6);

    // AMORTIZED (Trả góp đều cố định) đứng đầu tiên
    expect(options[0].value).toBe(AmortizationMethod.AMORTIZED);
    expect(options[0].label).toContain("Trả góp đều cố định");
    expect(options[0].label).toContain("Vay tín chấp, Mua nhà, Mua xe");

    // EQUAL_PRINCIPAL (Dư nợ giảm dần) đứng thứ hai
    expect(options[1].value).toBe(AmortizationMethod.EQUAL_PRINCIPAL);
    expect(options[1].label).toContain("Dư nợ giảm dần");
    expect(options[1].label).toContain("Vay thế chấp BĐS, Mua xe");

    // BULLET (Trả lãi hàng tháng, gốc trả cuối kỳ) đứng thứ ba
    expect(options[2].value).toBe(AmortizationMethod.BULLET);
    expect(options[2].label).toContain("Trả lãi hàng tháng, gốc trả cuối kỳ");

    // GRACE_PERIOD (Ân hạn gốc) đứng thứ tư
    expect(options[3].value).toBe(AmortizationMethod.GRACE_PERIOD);

    // FLAT (Lãi phẳng) đứng thứ năm
    expect(options[4].value).toBe(AmortizationMethod.FLAT);

    // MATURITY_LUMP_SUM đứng cuối cùng
    expect(options[5].value).toBe(AmortizationMethod.MATURITY_LUMP_SUM);
  });
});

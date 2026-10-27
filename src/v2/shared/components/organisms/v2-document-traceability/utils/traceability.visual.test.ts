import { describe, expect, it } from "vitest";
import {
  getTraceabilityVisualMeta,
  isManualSettlementNode,
} from "./traceability.visual";

describe("getTraceabilityVisualMeta", () => {
  it("shows an outbound invoice as a receipt (emerald)", () => {
    const meta = getTraceabilityVisualMeta({
      docType: "INVOICE",
      title: "Hóa đơn bán hàng",
    });
    expect(meta.label).toBe("HĐ BÁN");
    expect(meta.isInvoiceOut).toBe(true);
    expect(meta.badgeCls).toContain("emerald");
  });

  it("shows an inbound invoice as a payment (orange)", () => {
    const meta = getTraceabilityVisualMeta({
      docType: "INVOICE",
      title: "Hóa đơn mua",
    });
    expect(meta.label).toBe("HĐ MUA");
    expect(meta.isInvoiceIn).toBe(true);
    expect(meta.badgeCls).toContain("#ea580c");
  });

  it("maps a tax status code to its i18n key", () => {
    const meta = getTraceabilityVisualMeta({
      docType: "INVOICE",
      title: "x",
      metadata: { taxInvoiceStatus: 3 },
    });
    expect(meta.statusLabelKey).toBe("v2.traceability.taxStatus.adjusted");
  });

  it("treats a GBC bank credit as a receipt with a plus prefix", () => {
    const meta = getTraceabilityVisualMeta({
      docType: "BANK_TXN",
      docNo: "GBC-001",
      title: "Thu tiền",
    });
    expect(meta.isReceipt).toBe(true);
    expect(meta.amountPrefix).toBe("+");
    expect(meta.label).toBe("GBC");
  });

  it("treats a UNC bank debit as a payment with a minus prefix", () => {
    const meta = getTraceabilityVisualMeta({
      docType: "BANK_TXN",
      docNo: "UNC-001",
      title: "Chuyển khoản",
    });
    expect(meta.isPayment).toBe(true);
    expect(meta.amountPrefix).toBe("-");
    expect(meta.label).toBe("UNC");
  });

  it("uses the off-book label for a manual settlement", () => {
    const meta = getTraceabilityVisualMeta({
      id: "manual-1",
      docType: "BANK_TXN",
      title: "Chi khác",
    });
    expect(meta.label).toBe("CHI NGOÀI");
  });

  it("uses DOC_TYPE_META for other document types", () => {
    const meta = getTraceabilityVisualMeta({ docType: "INVENTORY_ITEM" });
    expect(meta.label).toBe("ITEM");
    expect(meta.badgeCls).toContain("cyan");
  });
});

describe("isManualSettlementNode", () => {
  it("is false for non-bank nodes", () => {
    expect(isManualSettlementNode({ docType: "INVOICE", id: "manual-1" })).toBe(
      false,
    );
  });

  it("detects the off-system channel", () => {
    expect(
      isManualSettlementNode({
        docType: "BANK_TXN",
        sourceChannel: "OFF_SYSTEM_MANUAL",
      }),
    ).toBe(true);
  });
});

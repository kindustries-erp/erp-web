import { describe, it, expect } from "vitest";
import {
  calculateStatusDonutItems,
  calculateClassificationDonutItems,
} from "../utils/funnelDataCalculators";
import { getStatusColor } from "../utils/funnelConfig";

describe("Funnel Data Calculators: Donut Item Aggregation", () => {
  describe("calculateStatusDonutItems", () => {
    it("aggregates items with duplicate statusName into a single slice with summed value", () => {
      const rawStatusData = [
        { statusName: "Đang làm", count: 5, revenue: 5000000 },
        { statusName: "Đang làm", count: 3, revenue: 3000000 },
        { statusName: "Báo giá", count: 2, revenue: 2000000 },
        { statusName: "Báo giá", count: 4, revenue: 4000000 },
        { statusName: "Hoàn tất", count: 10, revenue: 20000000 },
      ];

      // Test COUNT mode (isAmount = false)
      const countItems = calculateStatusDonutItems(
        rawStatusData,
        false,
        getStatusColor,
      );

      expect(countItems).toHaveLength(3);
      expect(countItems.find((i) => i.label === "Đang làm")?.value).toBe(8);
      expect(countItems.find((i) => i.label === "Báo giá")?.value).toBe(6);
      expect(countItems.find((i) => i.label === "Hoàn tất")?.value).toBe(10);

      // Test AMOUNT mode (isAmount = true)
      const amountItems = calculateStatusDonutItems(
        rawStatusData,
        true,
        getStatusColor,
      );

      expect(amountItems).toHaveLength(3);
      expect(amountItems.find((i) => i.label === "Đang làm")?.value).toBe(
        8000000,
      );
      expect(amountItems.find((i) => i.label === "Báo giá")?.value).toBe(
        6000000,
      );
      expect(amountItems.find((i) => i.label === "Hoàn tất")?.value).toBe(
        20000000,
      );
    });

    it("handles undefined or empty statusName gracefully", () => {
      const rawStatusData = [
        { count: 1, revenue: 1000 },
        { statusName: "", count: 2, revenue: 2000 },
      ];

      const countItems = calculateStatusDonutItems(
        rawStatusData,
        false,
        getStatusColor,
      );

      expect(countItems).toHaveLength(1);
      expect(countItems[0].label).toBe("Khác");
      expect(countItems[0].value).toBe(3);
    });
  });

  describe("calculateClassificationDonutItems", () => {
    it("aggregates items with duplicate classificationName into a single slice with summed value", () => {
      const rawClassificationData = [
        {
          classificationKey: "SUA_CHUA_CHUNG",
          classificationName: "Sửa chữa chung",
          count: 10,
          revenue: 15000000,
        },
        {
          classificationKey: "SUA_CHUA_CHUNG",
          classificationName: "Sửa chữa chung",
          count: 5,
          revenue: 5000000,
        },
        {
          classificationKey: "OJ_NGOAI",
          classificationName: "OJ Ngoài",
          count: 2,
          revenue: 3000000,
        },
      ];

      const countItems = calculateClassificationDonutItems(
        rawClassificationData,
        false,
      );

      expect(countItems).toHaveLength(2);
      expect(countItems.find((i) => i.label === "Sửa chữa chung")?.value).toBe(
        15,
      );
      expect(countItems.find((i) => i.label === "OJ Ngoài")?.value).toBe(2);

      const amountItems = calculateClassificationDonutItems(
        rawClassificationData,
        true,
      );

      expect(amountItems).toHaveLength(2);
      expect(amountItems.find((i) => i.label === "Sửa chữa chung")?.value).toBe(
        20000000,
      );
      expect(amountItems.find((i) => i.label === "OJ Ngoài")?.value).toBe(
        3000000,
      );
    });
  });
});

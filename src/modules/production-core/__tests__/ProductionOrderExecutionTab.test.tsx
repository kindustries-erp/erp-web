import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  ProductionOrderExecutionTab,
  isIdentifierValid,
  identifiersAllValid,
  parseVehicleBulkInput,
  findVehicleDuplicate,
  type ProductionIdentifier,
} from "../components/drawer/ProductionOrderExecutionTab";
import type { ErpProductionOrder } from "../api/productionCoreApi";

describe("ProductionOrderExecutionTab - Vehicle Identifiers & Validation", () => {
  describe("isIdentifierValid", () => {
    it("validates VEHICLE policy requiring only vinNo and engineNo", () => {
      const validId: ProductionIdentifier = {
        vinNo: "VIN1234567890",
        engineNo: "ENG987654321",
        serialNo: "",
        lotNo: "",
        notes: "",
        attributes: [],
      };
      expect(isIdentifierValid(validId, "VEHICLE")).toBe(true);

      const missingEngine: ProductionIdentifier = {
        ...validId,
        engineNo: "   ",
      };
      expect(isIdentifierValid(missingEngine, "VEHICLE")).toBe(false);

      const missingVin: ProductionIdentifier = {
        ...validId,
        vinNo: "",
      };
      expect(isIdentifierValid(missingVin, "VEHICLE")).toBe(false);
    });

    it("validates SERIAL and LOT policies", () => {
      const serialId: ProductionIdentifier = {
        vinNo: "",
        engineNo: "",
        serialNo: "SER-001",
        lotNo: "",
        notes: "",
        attributes: [],
      };
      expect(isIdentifierValid(serialId, "SERIAL")).toBe(true);
      expect(isIdentifierValid({ ...serialId, serialNo: "" }, "SERIAL")).toBe(
        false,
      );

      const lotId: ProductionIdentifier = {
        vinNo: "",
        engineNo: "",
        serialNo: "",
        lotNo: "LOT-2026-01",
        notes: "",
        attributes: [],
      };
      expect(isIdentifierValid(lotId, "LOT")).toBe(true);
      expect(isIdentifierValid({ ...lotId, lotNo: "" }, "LOT")).toBe(false);
    });
  });

  describe("identifiersAllValid", () => {
    it("returns true when all items are valid", () => {
      const ids: ProductionIdentifier[] = [
        {
          vinNo: "VIN1",
          engineNo: "ENG1",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN2",
          engineNo: "ENG2",
          serialNo: "SER2",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(identifiersAllValid(ids, "VEHICLE")).toBe(true);
    });

    it("returns false when any item is invalid", () => {
      const ids: ProductionIdentifier[] = [
        {
          vinNo: "VIN1",
          engineNo: "ENG1",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN2",
          engineNo: "",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(identifiersAllValid(ids, "VEHICLE")).toBe(false);
    });
  });

  describe("parseVehicleBulkInput", () => {
    it("parses 2-column comma separated input (VIN, EngineNo)", () => {
      const input = "VIN-001, ENG-001\nVIN-002, ENG-002";
      const result = parseVehicleBulkInput(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        vinNo: "VIN-001",
        engineNo: "ENG-001",
        serialNo: "",
        lotNo: "",
        notes: "",
        attributes: [],
      });
      expect(result[1].vinNo).toBe("VIN-002");
      expect(result[1].engineNo).toBe("ENG-002");
    });

    it("parses 4-column tab separated input (VIN, EngineNo, SerialNo, Notes)", () => {
      const input = "VIN-001\tENG-001\tSER-001\tXe màu đỏ bàn giao sớm";
      const result = parseVehicleBulkInput(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        vinNo: "VIN-001",
        engineNo: "ENG-001",
        serialNo: "SER-001",
        lotNo: "",
        notes: "Xe màu đỏ bàn giao sớm",
        attributes: [],
      });
    });

    it("throws error when VIN or EngineNo is missing", () => {
      const input = "VIN-001\n";
      expect(() => parseVehicleBulkInput(input)).toThrow(
        "Dòng 1: Số khung (VIN) và Số máy là bắt buộc.",
      );
    });
  });

  describe("findVehicleDuplicate", () => {
    it("detects duplicate VIN", () => {
      const ids: ProductionIdentifier[] = [
        {
          vinNo: "VIN-001",
          engineNo: "ENG-001",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "vin-001",
          engineNo: "ENG-002",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(findVehicleDuplicate(ids)).toBe(
        "Số khung (VIN) bị trùng trong danh sách",
      );
    });

    it("detects duplicate EngineNo", () => {
      const ids: ProductionIdentifier[] = [
        {
          vinNo: "VIN-001",
          engineNo: "ENG-001",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN-002",
          engineNo: "ENG-001",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(findVehicleDuplicate(ids)).toBe("Số máy bị trùng trong danh sách");
    });

    it("returns null when no duplicates exist", () => {
      const ids: ProductionIdentifier[] = [
        {
          vinNo: "VIN-001",
          engineNo: "ENG-001",
          serialNo: "SER-001",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN-002",
          engineNo: "ENG-002",
          serialNo: "SER-002",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(findVehicleDuplicate(ids)).toBeNull();
    });
  });

  describe("Component Rendering", () => {
    const mockOrder: ErpProductionOrder = {
      id: "po-1",
      orderNumber: "MO-2026090001",
      status: "IN_PROGRESS",
      qtyToProduce: 2,
      qtyProduced: 1,
      finishedGoodItem: {
        id: "fg-1",
        sku: "XE-MAY-01",
        name: "Xe máy điện Klotus",
        trackingPolicy: "VEHICLE",
      } as any,
      producedVehicles: [
        {
          id: "veh-1",
          vin: "VIN-001",
          engineNo: "ENG-001",
          serialNo: "SER-001",
          attributes: { color: "Đỏ", version: "1.0" },
          notes: "Nghiệm thu đạt chuẩn",
        },
      ] as any,
    } as any;

    it("renders execution table with VIN, EngineNo, SerialNo, and Notes columns", () => {
      const mockIdentifiers: ProductionIdentifier[] = [
        {
          vinNo: "VIN-002",
          engineNo: "ENG-002",
          serialNo: "",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];

      render(
        <ProductionOrderExecutionTab
          order={mockOrder}
          trackingPolicy="VEHICLE"
          needsIdentifiers={true}
          saving={false}
          batchCompleteQty="1"
          setBatchCompleteQty={() => {}}
          showBatchDialog={false}
          setShowBatchDialog={() => {}}
          vehicleBulkInput=""
          setVehicleBulkInput={() => {}}
          identifiers={mockIdentifiers}
          setIdentifiers={() => {}}
          handleIdentifierChange={() => {}}
          applyVehicleBulkInput={() => {}}
          onStartAll={async () => {}}
          onCompleteOne={async () => {}}
          onBatchComplete={async () => {}}
        />,
      );

      // Verify Column headers for VEHICLE
      expect(screen.getByText("Số khung (VIN)")).toBeInTheDocument();
      expect(screen.getAllByText("Số máy").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Số Serial (tùy chọn)")).toBeInTheDocument();
      expect(screen.getAllByText("Ghi chú").length).toBeGreaterThanOrEqual(1);

      // Verify Produced Vehicles List with extended attributes
      expect(
        screen.getByText("Danh sách thành phẩm đã xuất xưởng"),
      ).toBeInTheDocument();
      expect(screen.getByText("VIN-001")).toBeInTheDocument();
      expect(screen.getByText("ENG-001")).toBeInTheDocument();
      expect(screen.getByText("color:")).toBeInTheDocument();
      expect(screen.getByText("Đỏ")).toBeInTheDocument();
    });
  });
});

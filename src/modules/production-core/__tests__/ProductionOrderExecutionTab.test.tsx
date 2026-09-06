import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  ProductionOrderExecutionTab,
  isIdentifierValid,
  identifiersAllValid,
  parseVehicleBulkInput,
  findVehicleDuplicate,
  generateInternalSerial,
  type ProductionIdentifier,
} from "../components/drawer/ProductionOrderExecutionTab";
import type { ErpProductionOrder } from "../api/productionCoreApi";

describe("ProductionOrderExecutionTab - Vehicle Identifiers & Validation", () => {
  describe("generateInternalSerial", () => {
    it("generates formatted internal serial with SKU prefix, YYMMDD date and index padding", () => {
      const sn1 = generateInternalSerial("XE-MAY-01", 1);
      expect(sn1).toMatch(/^SN-XE-MAY-01-\d{6}-001$/);

      const snWithOrder = generateInternalSerial("KLOTUS", 1, "0012");
      expect(snWithOrder).toMatch(/^SN-KLOTUS-\d{6}-0012-001$/);

      const snOtherOrder = generateInternalSerial("KLOTUS", 1, "0013");
      expect(snOtherOrder).toMatch(/^SN-KLOTUS-\d{6}-0013-001$/);
      expect(snWithOrder).not.toBe(snOtherOrder);

      const snDefault = generateInternalSerial("", 5);
      expect(snDefault).toMatch(/^SN-ITEM-\d{6}-005$/);
    });
  });

  describe("isIdentifierValid", () => {
    it("validates VEHICLE policy requiring only vinNo and engineNo (vehicle serial is optional)", () => {
      const validId: ProductionIdentifier = {
        vinNo: "VIN1234567890",
        engineNo: "ENG987654321",
        serialNo: "",
        internalSerialNo: "SN-XE-001",
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
      const serialIdWithInternal: ProductionIdentifier = {
        vinNo: "",
        engineNo: "",
        serialNo: "",
        internalSerialNo: "SN-PART-001",
        lotNo: "",
        notes: "",
        attributes: [],
      };
      expect(isIdentifierValid(serialIdWithInternal, "SERIAL")).toBe(true);

      const serialIdWithExternal: ProductionIdentifier = {
        vinNo: "",
        engineNo: "",
        serialNo: "SER-001",
        internalSerialNo: "",
        lotNo: "",
        notes: "",
        attributes: [],
      };
      expect(isIdentifierValid(serialIdWithExternal, "SERIAL")).toBe(true);
      expect(
        isIdentifierValid(
          { ...serialIdWithExternal, serialNo: "", internalSerialNo: "" },
          "SERIAL",
        ),
      ).toBe(false);

      const lotId: ProductionIdentifier = {
        vinNo: "",
        engineNo: "",
        serialNo: "",
        internalSerialNo: "",
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
          internalSerialNo: "SN-1",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN2",
          engineNo: "ENG2",
          serialNo: "SER2",
          internalSerialNo: "SN-2",
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
          internalSerialNo: "SN-1",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN2",
          engineNo: "",
          serialNo: "",
          internalSerialNo: "SN-2",
          lotNo: "",
          notes: "",
          attributes: [],
        },
      ];
      expect(identifiersAllValid(ids, "VEHICLE")).toBe(false);
    });
  });

  describe("parseVehicleBulkInput", () => {
    it("parses 2-column comma separated input (VIN, EngineNo) with auto-generated internal serial", () => {
      const input = "VIN-001, ENG-001\nVIN-002, ENG-002";
      const result = parseVehicleBulkInput(input, "VEHICLE", "XE-01", "0012");
      expect(result).toHaveLength(2);
      expect(result[0].vinNo).toBe("VIN-001");
      expect(result[0].engineNo).toBe("ENG-001");
      expect(result[0].serialNo).toBe("");
      expect(result[0].internalSerialNo).toMatch(/^SN-XE-01-\d{6}-0012-001$/);
      expect(result[1].vinNo).toBe("VIN-002");
      expect(result[1].engineNo).toBe("ENG-002");
      expect(result[1].internalSerialNo).toMatch(/^SN-XE-01-\d{6}-0012-002$/);
    });

    it("parses 4-column tab separated input (VIN, EngineNo, SerialNo, Notes)", () => {
      const input = "VIN-001\tENG-001\tSER-001\t\tXe màu đỏ bàn giao sớm";
      const result = parseVehicleBulkInput(input, "VEHICLE", "XE-01", "0012");
      expect(result).toHaveLength(1);
      expect(result[0].vinNo).toBe("VIN-001");
      expect(result[0].engineNo).toBe("ENG-001");
      expect(result[0].serialNo).toBe("SER-001");
      expect(result[0].notes).toBe("Xe màu đỏ bàn giao sớm");
      expect(result[0].internalSerialNo).toMatch(/^SN-XE-01-\d{6}-0012-001$/);
    });

    it("throws error when VIN or EngineNo is missing", () => {
      const input = "VIN-001\n";
      expect(() => parseVehicleBulkInput(input, "VEHICLE", "XE-01")).toThrow(
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
          internalSerialNo: "SN-1",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "vin-001",
          engineNo: "ENG-002",
          serialNo: "",
          internalSerialNo: "SN-2",
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
          internalSerialNo: "SN-1",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN-002",
          engineNo: "ENG-001",
          serialNo: "",
          internalSerialNo: "SN-2",
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
          internalSerialNo: "SN-1",
          lotNo: "",
          notes: "",
          attributes: [],
        },
        {
          vinNo: "VIN-002",
          engineNo: "ENG-002",
          serialNo: "SER-002",
          internalSerialNo: "SN-2",
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
      referenceNo: "MO-2026090001",
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

    it("renders execution action buttons and produced vehicle table for VEHICLE", () => {
      const mockIdentifiers: ProductionIdentifier[] = [
        {
          vinNo: "VIN-002",
          engineNo: "ENG-002",
          serialNo: "",
          internalSerialNo: "SN-XE-MAY-01-260906-0001-002",
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
          identifiers={mockIdentifiers}
          setIdentifiers={() => {}}
          handleIdentifierChange={() => {}}
          onOpenIdentifierDrawer={() => {}}
          onStartAll={async () => {}}
          onCompleteOne={async () => {}}
          onBatchComplete={async () => {}}
        />,
      );

      // Verify Open Completion & Declaration Drawer button in section header
      expect(
        screen.getByText("Nghiệm thu & Khai báo Số khung / Số máy"),
      ).toBeInTheDocument();

      // Verify Unified Section Title
      expect(
        screen.getByText("Danh sách thành phẩm đã xuất xưởng"),
      ).toBeInTheDocument();

      // Verify Table Columns
      expect(screen.getByText("Số khung (VIN)")).toBeInTheDocument();
      expect(screen.getByText("Số máy")).toBeInTheDocument();
      expect(screen.getByText("Số Serial xe")).toBeInTheDocument();
      expect(screen.getByText("Số Serial nội bộ")).toBeInTheDocument();
      expect(screen.getByText("Ghi chú")).toBeInTheDocument();

      // Verify Produced Vehicle Values
      expect(screen.getByText("VIN-001")).toBeInTheDocument();
      expect(screen.getByText("ENG-001")).toBeInTheDocument();
      expect(screen.getByText("SER-001")).toBeInTheDocument();
      expect(screen.getByText("Nghiệm thu đạt chuẩn")).toBeInTheDocument();
    });
  });
});

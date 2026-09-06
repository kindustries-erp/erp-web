import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ProductionOrderExecutionTab,
  isIdentifierValid,
  identifiersAllValid,
  findVehicleDuplicate,
  generateInternalSerial,
  type ProductionIdentifier,
} from "../components/drawer/ProductionOrderExecutionTab";
import { ProductionIdentifierReviewTable } from "../components/drawer/ProductionIdentifierReviewTable";
import { ProductionIdentifierDeclareDrawer } from "../components/drawer/ProductionIdentifierDeclareDrawer";
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

  describe("Component Rendering", () => {
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

      // Verify Open Completion button with shortened label "Nghiệm thu"
      expect(screen.getByText("Nghiệm thu")).toBeInTheDocument();

      // Verify Unified Section Title with inline (1 / 2)
      expect(
        screen.getByText("Danh sách thành phẩm đã xuất xưởng"),
      ).toBeInTheDocument();
      expect(screen.getByText("(1 / 2)")).toBeInTheDocument();

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

  describe("ProductionIdentifierReviewTable & ProductionIdentifierDeclareDrawer", () => {
    it("renders ProductionIdentifierReviewTable with DataTable, title progress tooltip, and Split Button actions", () => {
      const mockIdentifiers: ProductionIdentifier[] = [
        {
          vinNo: "VIN-001",
          engineNo: "ENG-001",
          serialNo: "SER-001",
          internalSerialNo: "SN-XE-001",
          lotNo: "",
          notes: "Xe mẫu",
          attributes: [],
          isExisting: true,
        },
        {
          vinNo: "",
          engineNo: "",
          serialNo: "",
          internalSerialNo: "SN-XE-002",
          lotNo: "",
          notes: "",
          attributes: [],
          isExisting: false,
        },
      ];

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierReviewTable
            policy="VEHICLE"
            identifiers={mockIdentifiers}
            onChange={() => {}}
            onSetIdentifiers={() => {}}
            requiredQty={2}
            skuPrefix="XE-MAY"
            orderSuffix="0001"
          />
        </QueryClientProvider>,
      );

      // Verify Section Title and Progress Count
      expect(
        screen.getByText("Thông tin định danh xe xuất xưởng"),
      ).toBeInTheDocument();
      expect(screen.getByText("(1 / 2)")).toBeInTheDocument();

      // Verify Split Button Main Action
      expect(screen.getByText("Nhập từ file Excel")).toBeInTheDocument();

      // Verify Table Column Headers
      expect(screen.getByText("Số khung (VIN) *")).toBeInTheDocument();
      expect(screen.getByText("Số máy *")).toBeInTheDocument();
      expect(screen.getByText("Số Serial xe")).toBeInTheDocument();
      expect(screen.getByText("Số Serial nội bộ")).toBeInTheDocument();
      expect(screen.getByText("Ghi chú")).toBeInTheDocument();
    });

    it("renders ProductionIdentifierDeclareDrawer with standardized collapsible sections, qtyToProduce rows and categorized confirmation modal", async () => {
      const mockIdentifiers: ProductionIdentifier[] = [];

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {}}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={mockIdentifiers}
            setIdentifiers={() => {}}
            batchCompleteQty="1"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async () => {}}
          />
        </QueryClientProvider>,
      );

      // Verify Drawer Title
      expect(
        screen.getByText("Nghiệm thu & Khai báo Số khung, Số máy Xe"),
      ).toBeInTheDocument();

      // Verify Table Section in Left Panel
      expect(
        screen.getByText("Thông tin định danh xe xuất xưởng"),
      ).toBeInTheDocument();

      // Verify Right Panel Sections
      expect(screen.getByText("Thông tin Lệnh sản xuất")).toBeInTheDocument();
      expect(screen.getByText("Tiến độ sản xuất")).toBeInTheDocument();
      expect(screen.getByText("Quy tắc định danh")).toBeInTheDocument();
    });

    it("opens categorized ConfirmModal when clicking confirm button and submits correctly", async () => {
      let batchCompleteCalled = false;
      let submittedIdentifiers: ProductionIdentifier[] = [];
      let submittedQty = "";

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {}}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={[]}
            setIdentifiers={() => {}}
            batchCompleteQty="1"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async (qty, ids) => {
              batchCompleteCalled = true;
              submittedQty = String(qty || "");
              submittedIdentifiers = ids || [];
            }}
          />
        </QueryClientProvider>,
      );

      // In mockOrder, qtyToProduce is 2, row 0 is existing vehicle (VIN-001, ENG-001).
      // Let's enter VIN and Engine for row 1 (the new vehicle)
      // Find row 1 VIN input (placeholder "Nhập số VIN...")
      const vinInputs = screen.getAllByPlaceholderText("Nhập số VIN...");
      if (vinInputs.length > 1) {
        fireEvent.change(vinInputs[1], { target: { value: "VIN-002" } });
        fireEvent.blur(vinInputs[1]);
      }

      const engInputs = screen.getAllByPlaceholderText("Nhập số máy...");
      if (engInputs.length > 1) {
        fireEvent.change(engInputs[1], { target: { value: "ENG-002" } });
        fireEvent.blur(engInputs[1]);
      }

      const confirmBtn = screen.getByText("Xác nhận hoàn thành & Nhập kho");
      fireEvent.click(confirmBtn);

      // Verify Modal Title & Categorized Content
      expect(
        screen.getByText(
          /Bạn có chắc chắn muốn xác nhận kết quả sản xuất cho Lệnh sản xuất/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("MO-2026090001").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Sản xuất mới & Nhập kho:")).toBeInTheDocument();

      // Click "Đồng ý nhập kho"
      const modalConfirmBtn = screen.getByText("Đồng ý nhập kho");
      fireEvent.click(modalConfirmBtn);

      expect(batchCompleteCalled).toBe(true);
      expect(submittedQty).toBe("1");
      expect(submittedIdentifiers.length).toBe(1);
      expect(submittedIdentifiers[0].vinNo).toBe("VIN-002");
    });

    it("displays error when an existing vehicle VIN or Engine is cleared", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {}}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={[]}
            setIdentifiers={() => {}}
            batchCompleteQty="1"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async () => {}}
          />
        </QueryClientProvider>,
      );

      // Clear row 0 (existing vehicle) VIN
      const vinInputs = screen.getAllByPlaceholderText("Nhập số VIN...");
      fireEvent.change(vinInputs[0], { target: { value: "" } });
      fireEvent.blur(vinInputs[0]);

      // Verify warning message is shown in right panel
      expect(
        screen.getByText(
          "Xe đã ghi nhận xuất xưởng không được để trống Số khung hoặc Số máy!",
        ),
      ).toBeInTheDocument();
    });

    it("shows updated vehicle count in ConfirmModal when existing vehicle details are modified and a new vehicle is completed", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {}}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={[]}
            setIdentifiers={() => {}}
            batchCompleteQty="1"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async () => {}}
          />
        </QueryClientProvider>,
      );

      // Edit row 0 (existing vehicle) VIN to fix typo
      const vinInputs = screen.getAllByPlaceholderText("Nhập số VIN...");
      fireEvent.change(vinInputs[0], { target: { value: "VIN-001-FIXED" } });
      fireEvent.blur(vinInputs[0]);

      // Enter row 1 (new vehicle)
      const vinInputsUpdated = screen.getAllByPlaceholderText("Nhập số VIN...");
      fireEvent.change(vinInputsUpdated[1], { target: { value: "VIN-002" } });
      fireEvent.blur(vinInputsUpdated[1]);

      const engInputs = screen.getAllByPlaceholderText("Nhập số máy...");
      fireEvent.change(engInputs[1], { target: { value: "ENG-002" } });
      fireEvent.blur(engInputs[1]);

      // Check right panel indicates 1 updated unit
      expect(screen.getByText("Cập nhật thông tin")).toBeInTheDocument();

      const confirmBtn = screen.getByText("Xác nhận hoàn thành & Nhập kho");
      fireEvent.click(confirmBtn);

      // Verify modal shows updated vehicle line and newly produced vehicle line
      expect(
        screen.getByText("Cập nhật thông tin đã xuất xưởng:"),
      ).toBeInTheDocument();
      expect(screen.getByText("Sản xuất mới & Nhập kho:")).toBeInTheDocument();
    });

    it("shows close confirm modal when isDirty is true and user closes drawer", async () => {
      let closeCalled = false;
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {
              closeCalled = true;
            }}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={[]}
            setIdentifiers={() => {}}
            batchCompleteQty="1"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async () => {}}
          />
        </QueryClientProvider>,
      );

      // Enter a new VIN in row 1 -> isDirty becomes true
      const vinInputs = screen.getAllByPlaceholderText("Nhập số VIN...");
      fireEvent.change(vinInputs[1], { target: { value: "VIN-UNSAVED" } });
      fireEvent.blur(vinInputs[1]);

      // Click "Đóng" button
      const closeBtn = screen.getByText("Đóng");
      fireEvent.click(closeBtn);

      // Verify Close Confirm Modal is shown
      expect(screen.getByText("Hủy bỏ thay đổi?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Bạn có các thay đổi chưa được lưu trong danh sách khai báo định danh. Bạn có chắc chắn muốn đóng không?",
        ),
      ).toBeInTheDocument();

      // Click "Đồng ý đóng"
      const confirmCloseBtn = screen.getByText("Đồng ý đóng");
      fireEvent.click(confirmCloseBtn);

      expect(closeCalled).toBe(true);
    });

    it("allows saving updates with 'Lưu cập nhật thông tin' button when ONLY editing existing vehicles", async () => {
      let submitCalled = false;
      let submittedNewQty = -1;
      let submittedUpdates: any[] = [];

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProductionIdentifierDeclareDrawer
            open={true}
            onClose={() => {}}
            order={mockOrder}
            policy="VEHICLE"
            identifiers={[]}
            setIdentifiers={() => {}}
            batchCompleteQty="0"
            setBatchCompleteQty={() => {}}
            onBatchComplete={async (newQty, newIds, updated) => {
              submitCalled = true;
              submittedNewQty = newQty ?? 0;
              submittedUpdates = updated || [];
            }}
          />
        </QueryClientProvider>,
      );

      // Modify existing vehicle (row 0) - edit notes
      const notesInputs = screen.getAllByPlaceholderText("Ghi chú đơn vị...");
      fireEvent.change(notesInputs[0], {
        target: { value: "Đã sửa số tem serial và bảo dưỡng" },
      });
      fireEvent.blur(notesInputs[0]);

      // Button label should now be "Lưu cập nhật thông tin"
      const saveBtn = screen.getByText("Lưu cập nhật thông tin");
      expect(saveBtn).toBeInTheDocument();
      fireEvent.click(saveBtn);

      // Verify modal appears with "Xác nhận lưu cập nhật thông tin" and "Đồng ý lưu cập nhật"
      expect(
        screen.getByText("Xác nhận lưu cập nhật thông tin"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Cập nhật thông tin đã xuất xưởng:"),
      ).toBeInTheDocument();

      const modalConfirmBtn = screen.getByText("Đồng ý lưu cập nhật");
      fireEvent.click(modalConfirmBtn);

      expect(submitCalled).toBe(true);
      expect(submittedNewQty).toBe(0);
      expect(submittedUpdates).toHaveLength(1);
      expect(submittedUpdates[0].notes).toBe(
        "Đã sửa số tem serial và bảo dưỡng",
      );
    });
  });
});

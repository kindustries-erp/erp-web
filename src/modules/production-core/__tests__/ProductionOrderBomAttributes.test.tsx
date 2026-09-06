import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductionOrderRightPanel } from "../components/drawer/ProductionOrderRightPanel";

describe("ProductionOrderRightPanel BOM Attributes", () => {
  const defaultForm = {
    finishedGoodItemId: "fg-1",
    bomId: "bom-1",
    qtyToProduce: "2",
    referenceNo: "MO-2026090001",
    plannedStartDate: "2026-09-01",
    plannedEndDate: "2026-09-05",
  };

  it("renders BOM Attributes Section with category and attribute details", () => {
    const mockBomInfo = {
      id: "bom-1",
      bomCode: "BOM-KLOTUS-01",
      bomName: "Định mức xe KLOTUS V1",
      version: "1.0",
      categoryId: "cat-1",
      categoryCode: "XE_MAY_DIEN",
      categoryName: "Xe máy điện",
      attributes: { "attr-motor": "800W" },
      globalAttributes: { color: "DO", version: "1.0" },
      attributeDetails: [
        {
          id: "def-color",
          code: "color",
          name: "Màu sắc",
          nameEn: "Color",
          fieldType: "SELECT",
          value: "DO",
          label: "Đỏ [DO]",
          options: [{ value: "DO", label: "Đỏ", labelEn: "Red" }],
          isRequired: false,
          isGlobal: true,
          sortOrder: 0,
        },
        {
          id: "def-motor",
          code: "motor_power",
          name: "Công suất động cơ",
          nameEn: "Motor Power",
          fieldType: "TEXT",
          value: "800W",
          label: "800W",
          isRequired: true,
          isGlobal: false,
          sortOrder: 1,
        },
      ],
    };

    render(
      <ProductionOrderRightPanel
        mode="create"
        editing={null}
        form={defaultForm}
        setForm={() => {}}
        itemOptions={[{ value: "fg-1", label: "Xe máy điện KLOTUS" }]}
        availableBoms={[
          { id: "bom-1", bomName: "BOM-01", version: "1.0" } as any,
        ]}
        bomOptions={[{ value: "bom-1", label: "BOM-01 (v1.0)" }]}
        selectedBomInfo={mockBomInfo}
        bomLoading={false}
        saving={false}
      />,
    );

    // Verify BOM Attributes Section title
    expect(screen.getByText("Thuộc tính định mức (BOM)")).toBeInTheDocument();

    // Verify Category Name & Code Badge
    expect(screen.getByText("Xe máy điện (XE_MAY_DIEN)")).toBeInTheDocument();

    // Verify Dynamic Attributes Display
    expect(screen.getByText("Màu sắc")).toBeInTheDocument();
    expect(screen.getByText("Đỏ")).toBeInTheDocument();
    expect(screen.getByText("Công suất động cơ")).toBeInTheDocument();
    expect(screen.getByText("800W")).toBeInTheDocument();
  });

  it("renders loading state when bomLoading is true", () => {
    render(
      <ProductionOrderRightPanel
        mode="create"
        editing={null}
        form={defaultForm}
        setForm={() => {}}
        itemOptions={[{ value: "fg-1", label: "Xe máy điện KLOTUS" }]}
        availableBoms={[
          { id: "bom-1", bomName: "BOM-01", version: "1.0" } as any,
        ]}
        bomOptions={[{ value: "bom-1", label: "BOM-01 (v1.0)" }]}
        selectedBomInfo={null}
        bomLoading={true}
        saving={false}
      />,
    );

    expect(screen.getByText("Đang tải thuộc tính BOM...")).toBeInTheDocument();
  });

  it("renders empty attributes notice when BOM has no attributes or category", () => {
    const mockEmptyBomInfo = {
      id: "bom-2",
      bomCode: "BOM-RAW-02",
      bomName: "Định mức thô",
      version: "1.0",
      categoryId: null,
      categoryCode: null,
      categoryName: null,
      attributes: {},
      globalAttributes: {},
      attributeDetails: [],
    };

    render(
      <ProductionOrderRightPanel
        mode="create"
        editing={null}
        form={defaultForm}
        setForm={() => {}}
        itemOptions={[{ value: "fg-1", label: "Xe máy điện KLOTUS" }]}
        availableBoms={[
          { id: "bom-2", bomName: "BOM-02", version: "1.0" } as any,
        ]}
        bomOptions={[{ value: "bom-2", label: "BOM-02 (v1.0)" }]}
        selectedBomInfo={mockEmptyBomInfo}
        bomLoading={false}
        saving={false}
      />,
    );

    expect(
      screen.getByText("BOM này không có thuộc tính tùy chỉnh."),
    ).toBeInTheDocument();
  });
});

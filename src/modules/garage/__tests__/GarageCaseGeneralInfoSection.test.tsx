import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCaseGeneralInfoSection } from "../components/drawer/sections/GarageCaseGeneralInfoSection";

describe("GarageCaseGeneralInfoSection", () => {
  const mockCaseData = {
    id: "case-123",
    soChungTu: "GR-PDV-2026-0001",
    bienSoXe: "51K-639.44",
    khachHangName: "NGUYỄN THỊ MAI HOAN",
    tenTinhTrangDichVu: "Kết thúc",
    ngayPhatSinh: "2026-09-07T08:00:00Z",
    kgaraClassification: "Nội Bộ PQ",
    kgaraClassificationCode: "HDPQ",
    erpNotes: "Ghi chú vụ việc nội bộ",
  };

  it("renders null when caseData is null", () => {
    const { container } = render(
      <GarageCaseGeneralInfoSection caseData={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all fields including KGara vehicle source and ERP notes in view mode", () => {
    render(
      <GarageCaseGeneralInfoSection caseData={mockCaseData} editMode={false} />,
    );

    expect(screen.getByText("GR-PDV-2026-0001")).toBeDefined();
    expect(screen.getByText("51K-639.44")).toBeDefined();
    expect(screen.getByText("NGUYỄN THỊ MAI HOAN")).toBeDefined();
    expect(screen.getByText("Kết thúc")).toBeDefined();
    expect(screen.getByText("Nội Bộ PQ")).toBeDefined();
    expect(screen.getByText("HDPQ")).toBeDefined();
    expect(screen.getByText("Ghi chú vụ việc nội bộ")).toBeDefined();
  });

  it("renders textarea for ERP notes in edit mode and calls onErpNotesChange", () => {
    const onNotesChange = vi.fn();

    render(
      <GarageCaseGeneralInfoSection
        caseData={mockCaseData}
        editMode={true}
        erpNotes="Ghi chú đang sửa"
        onErpNotesChange={onNotesChange}
      />,
    );

    expect(screen.getByText("Nội Bộ PQ")).toBeDefined();

    const textarea = screen.getByPlaceholderText(
      "Nhập ghi chú nghiệp vụ nội bộ trên ERP...",
    );
    expect(textarea).toBeDefined();
    expect((textarea as HTMLTextAreaElement).value).toBe("Ghi chú đang sửa");

    fireEvent.change(textarea, { target: { value: "Ghi chú mới 2026" } });
    expect(onNotesChange).toHaveBeenCalledWith("Ghi chú mới 2026");
  });
});

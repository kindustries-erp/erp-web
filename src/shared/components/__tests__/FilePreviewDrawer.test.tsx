import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilePreviewDrawer } from "../FilePreviewDrawer";
import * as XLSX from "xlsx";

// Mock i18n
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

// Mock SheetJS because we don't want to actually parse complex buffers in tests
vi.mock("xlsx", () => {
  return {
    read: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(),
    },
  };
});

describe("FilePreviewDrawer", () => {
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = mockCreateObjectURL as any;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL as any;

    // Default mock implementation
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
  });

  it("does not render when open is false", () => {
    const { baseElement } = render(
      <FilePreviewDrawer open={false} onClose={() => {}} />,
    );
    expect(
      baseElement.querySelector(".slide-panel-overlay"),
    ).not.toBeInTheDocument();
  });

  it("renders a PDF in react-pdf", () => {
    const file = new File(["dummy pdf content"], "test.pdf", {
      type: "application/pdf",
    });
    render(<FilePreviewDrawer open={true} onClose={vi.fn()} file={file} />);

    const pdfDoc = screen.getByTestId("pdf-document");
    expect(pdfDoc).toBeInTheDocument();
  });

  it("renders an image in an img tag", async () => {
    const imgFile = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const { baseElement } = render(
      <FilePreviewDrawer open={true} onClose={() => {}} file={imgFile} />,
    );

    const img = baseElement.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "blob:mock-url");
    expect(img).toHaveAttribute("alt", "test.png");
  });

  it("shows an unsupported message for unsupported files", async () => {
    const docFile = new File(["dummy content"], "test.docx", {
      type: "application/msword",
    });
    render(<FilePreviewDrawer open={true} onClose={() => {}} file={docFile} />);

    expect(
      screen.getByText("Định dạng file không hỗ trợ xem trước trực tiếp"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Không thể xem trước file cục bộ. Vui lòng tải lên hoặc tải xuống để xem.",
      ),
    ).toBeInTheDocument();
  });

  it.skip("renders an excel file as an HTML table", async () => {
    // Setup excel mock
    vi.mocked(XLSX.read).mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    } as any);

    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      ["Header 1", "Header 2"],
      ["Row 1 Col 1", "Row 1 Col 2"],
    ]);

    const excelFile = new File(["dummy"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    // mock arrayBuffer
    excelFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

    // We don't need act around render, findByText will wait
    render(
      <FilePreviewDrawer open={true} onClose={() => {}} file={excelFile} />,
    );

    // Check table headers (it's async due to state updates)
    expect(await screen.findByText("Cột 1")).toBeInTheDocument();
    expect(screen.getByText("Cột 2")).toBeInTheDocument();

    // Check table cells
    expect(screen.getByText("Row 1 Col 1")).toBeInTheDocument();
    expect(screen.getByText("Row 1 Col 2")).toBeInTheDocument();
  });

  it.skip("creates and revokes object URL correctly when mounted and unmounted", () => {
    const pdfFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });
    const { rerender } = render(
      <FilePreviewDrawer open={true} onClose={() => {}} file={pdfFile} />,
    );

    expect(mockCreateObjectURL).toHaveBeenCalledWith(pdfFile);

    // Close the drawer
    rerender(
      <FilePreviewDrawer open={false} onClose={() => {}} file={pdfFile} />,
    );

    // Revoke should be called
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("download button triggers a download", async () => {
    const pdfFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });
    render(<FilePreviewDrawer open={true} onClose={() => {}} file={pdfFile} />);

    // Mock anchor element logic
    const mockAnchor = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: any) => {
        if (tag === "a") return mockAnchor as any;
        return originalCreateElement(tag);
      });

    // Spy on appendChild to only mock for our anchor
    const originalAppendChild = document.body.appendChild.bind(document.body);
    const appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation((node: any) => {
        if (node === mockAnchor) return node;
        return originalAppendChild(node);
      });

    const originalRemoveChild = document.body.removeChild.bind(document.body);
    const removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation((node: any) => {
        if (node === mockAnchor) return node;
        return originalRemoveChild(node);
      });

    const downloadBtn = await screen.findByRole("button", {
      name: /Tải xuống/i,
    });
    fireEvent.click(downloadBtn);

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockAnchor.href).toBe("blob:mock-url");
    expect(mockAnchor.download).toBe("test.pdf");
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});

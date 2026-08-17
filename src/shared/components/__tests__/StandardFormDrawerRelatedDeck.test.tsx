import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerAuditTimeline,
  DrawerRelatedDocs,
  DrawerAttachmentsDeck,
  DrawerInternalNotes,
} from "@/shared/components/drawer";

// Mock useT
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("StandardFormDrawer Related Deck & Horizon Divider", () => {
  it("does not render Horizon Divider when relatedTabs and bottomPanel are absent (backward compatible)", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test Drawer"
        leftPanel={<div>Main Content</div>}
      />,
    );

    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.queryByText("Thông tin liên quan")).not.toBeInTheDocument();
  });

  it("renders Horizon Divider Bar and tabs when relatedTabs are provided", () => {
    const mockTabs = [
      {
        key: "history",
        label: "Lịch sử thao tác",
        badgeCount: 5,
        content: <div>Audit Log List Content</div>,
      },
      {
        key: "docs",
        label: "Chứng từ liên quan",
        badgeCount: 2,
        content: <div>Related Docs Content</div>,
      },
    ];

    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Voucher Detail"
        leftPanel={<div>Main Left Content</div>}
        relatedTabs={mockTabs}
      />,
    );

    expect(screen.getByText("Main Left Content")).toBeInTheDocument();
    expect(screen.getByText("Lịch sử thao tác")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên quan")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Audit Log List Content")).toBeInTheDocument();
  });

  it("switches tab content when clicking another tab pill", () => {
    const onTabChange = vi.fn();
    const mockTabs = [
      {
        key: "tab1",
        label: "Tab Một",
        content: <div>Content Tab 1</div>,
      },
      {
        key: "tab2",
        label: "Tab Hai",
        content: <div>Content Tab 2</div>,
      },
    ];

    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Drawer With Tabs"
        leftPanel={<div>Main Content</div>}
        relatedTabs={mockTabs}
        onRelatedTabChange={onTabChange}
      />,
    );

    expect(screen.getByText("Content Tab 1")).toBeInTheDocument();
    expect(screen.queryByText("Content Tab 2")).not.toBeInTheDocument();

    // Click Tab 2
    fireEvent.click(screen.getByText("Tab Hai"));

    expect(screen.queryByText("Content Tab 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content Tab 2")).toBeInTheDocument();
    expect(onTabChange).toHaveBeenCalledWith("tab2");
  });

  it("toggles collapse state when clicking the expand/collapse button", () => {
    const mockTabs = [
      {
        key: "history",
        label: "Lịch sử",
        content: <div>Collapsible Content Area</div>,
      },
    ];

    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Collapsible Drawer"
        leftPanel={<div>Main Body</div>}
        relatedTabs={mockTabs}
      />,
    );

    expect(screen.getByText("Collapsible Content Area")).toBeInTheDocument();

    // Find collapse button by title "Thu gọn"
    const toggleBtn = screen.getByTitle("Thu gọn");
    fireEvent.click(toggleBtn);

    // Content should be hidden
    expect(
      screen.queryByText("Collapsible Content Area"),
    ).not.toBeInTheDocument();

    // Find expand button by title "Mở rộng"
    const expandBtn = screen.getByTitle("Mở rộng");
    fireEvent.click(expandBtn);

    // Content should be visible again
    expect(screen.getByText("Collapsible Content Area")).toBeInTheDocument();
  });

  it("renders custom bottomPanel when provided", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Custom Bottom Panel Drawer"
        leftPanel={<div>Main Body</div>}
        bottomPanel={<div>Custom Bottom Deck Details</div>}
        bottomPanelTitle="Thông tin phụ trợ"
      />,
    );

    expect(screen.getByText("Thông tin phụ trợ")).toBeInTheDocument();
    expect(screen.getByText("Custom Bottom Deck Details")).toBeInTheDocument();
  });
});

describe("Pre-built Related Deck Sub-Components", () => {
  it("renders DrawerAuditTimeline correctly with diffs and user info", () => {
    const items = [
      {
        id: "log-1",
        actionType: "CREATE",
        actionLabel: "Khởi tạo phiếu",
        actorName: "Nguyễn Văn A",
        actorEmail: "vana@liouni.vn",
        timestamp: new Date().toISOString(),
        message: "Khởi tạo đơn hàng mới từ báo giá",
        diffs: [
          {
            field: "status",
            fieldLabel: "Trạng thái",
            oldVal: "DRAFT",
            newVal: "APPROVED",
          },
        ],
      },
    ];

    render(<DrawerAuditTimeline items={items} />);

    expect(screen.getByText("Khởi tạo phiếu")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(
      screen.getByText("Khởi tạo đơn hàng mới từ báo giá"),
    ).toBeInTheDocument();
    expect(screen.getByText("Trạng thái:")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
  });

  it("renders DrawerRelatedDocs correctly with document cards", () => {
    const onOpen = vi.fn();
    const docs = [
      {
        id: "doc-1",
        docNo: "PO-202608-001",
        docType: "Đơn mua hàng",
        status: "ĐÃ DUYỆT",
        amount: 50000000,
      },
    ];

    render(<DrawerRelatedDocs docs={docs} onOpenDoc={onOpen} />);

    expect(screen.getByText("PO-202608-001")).toBeInTheDocument();
    expect(screen.getByText("Đơn mua hàng")).toBeInTheDocument();
    expect(screen.getByText("ĐÃ DUYỆT")).toBeInTheDocument();
    expect(screen.getByText("50.000.000 ₫")).toBeInTheDocument();

    fireEvent.click(screen.getByText("PO-202608-001"));
    expect(onOpen).toHaveBeenCalledWith(docs[0]);
  });

  it("renders DrawerAttachmentsDeck correctly with files and upload trigger", () => {
    const onPreview = vi.fn();
    const files = [
      {
        id: "file-1",
        name: "hop-dong-kinh-te.pdf",
        size: 1048576,
        uploadedBy: "Kế toán",
      },
    ];

    render(
      <DrawerAttachmentsDeck
        attachments={files}
        onPreview={onPreview}
        onUpload={() => {}}
      />,
    );

    expect(screen.getByText("hop-dong-kinh-te.pdf")).toBeInTheDocument();
    expect(screen.getByText("1.0 MB")).toBeInTheDocument();
    expect(screen.getByText("• Kế toán")).toBeInTheDocument();
    expect(
      screen.getByText("Nhấn để tải lên tệp mới hoặc kéo thả vào đây"),
    ).toBeInTheDocument();

    const previewBtn = screen.getByTitle("Xem trước");
    fireEvent.click(previewBtn);
    expect(onPreview).toHaveBeenCalledWith(files[0]);
  });

  it("renders DrawerInternalNotes and handles adding new note", async () => {
    const onAddNote = vi.fn().mockResolvedValue(undefined);
    const notes = [
      {
        id: "note-1",
        authorName: "Trần Thị B",
        createdAt: new Date().toISOString(),
        content: "Lưu ý kiểm tra lại số khung trước khi giao hàng",
      },
    ];

    render(<DrawerInternalNotes notes={notes} onAddNote={onAddNote} />);

    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    expect(
      screen.getByText("Lưu ý kiểm tra lại số khung trước khi giao hàng"),
    ).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(
      "Thêm ghi chú nội bộ (Ctrl + Enter để gửi)...",
    );
    fireEvent.change(textarea, { target: { value: "Ghi chú mới từ tester" } });

    const submitBtn = screen.getByText("Gửi ghi chú");
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onAddNote).toHaveBeenCalledWith("Ghi chú mới từ tester");
  });
});

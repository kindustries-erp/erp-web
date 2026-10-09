import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2FilePreviewPanel } from "./V2FilePreviewPanel";
import { resolvePreviewKind } from "./V2FilePreviewPanel.helper";

describe("resolvePreviewKind", () => {
  it("detects pdf by mime or extension, only with a url", () => {
    expect(
      resolvePreviewKind({
        name: "a.bin",
        mimeType: "application/pdf",
        url: "blob:x",
      }),
    ).toBe("pdf");
    expect(resolvePreviewKind({ name: "HD.PDF", url: "blob:x" })).toBe("pdf");
    expect(resolvePreviewKind({ name: "a.pdf" })).toBe("unsupported");
  });

  it("detects images", () => {
    expect(resolvePreviewKind({ name: "a.png", url: "blob:x" })).toBe("image");
    expect(
      resolvePreviewKind({ name: "x", mimeType: "image/jpeg", url: "blob:x" }),
    ).toBe("image");
  });

  it("detects text-like files, only with text content", () => {
    expect(resolvePreviewKind({ name: "hd.xml", text: "<a/>" })).toBe("text");
    expect(
      resolvePreviewKind({
        name: "x",
        mimeType: "application/json",
        text: "{}",
      }),
    ).toBe("text");
    expect(resolvePreviewKind({ name: "hd.xml" })).toBe("unsupported");
  });

  it("falls back to unsupported", () => {
    expect(resolvePreviewKind({ name: "a.zip", url: "blob:x" })).toBe(
      "unsupported",
    );
  });
});

describe("V2FilePreviewPanel", () => {
  it("asks to select a file when none is given", () => {
    render(<V2FilePreviewPanel file={null} />);
    expect(screen.getByText("Chọn tệp để xem trước")).toBeInTheDocument();
  });

  it("shows a skeleton while loading", () => {
    const { container } = render(<V2FilePreviewPanel file={null} loading />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("shows the error message", () => {
    render(<V2FilePreviewPanel file={null} error="Không tải được tệp" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Không tải được tệp");
  });

  it("renders a pdf in an iframe named after the file", () => {
    render(
      <V2FilePreviewPanel file={{ name: "HD-001.pdf", url: "blob:pdf" }} />,
    );
    expect(screen.getByTitle("HD-001.pdf")).toHaveAttribute("src", "blob:pdf");
  });

  it("renders an image", () => {
    render(<V2FilePreviewPanel file={{ name: "scan.png", url: "blob:img" }} />);
    expect(screen.getByRole("img", { name: "scan.png" })).toHaveAttribute(
      "src",
      "blob:img",
    );
  });

  it("renders text content", () => {
    render(
      <V2FilePreviewPanel file={{ name: "hd.xml", text: "<HDon>1</HDon>" }} />,
    );
    expect(screen.getByText("<HDon>1</HDon>")).toBeInTheDocument();
  });

  it("offers a download for unsupported files", () => {
    const onDownload = vi.fn();
    render(
      <V2FilePreviewPanel file={{ name: "a.zip" }} onDownload={onDownload} />,
    );
    expect(
      screen.getByText("Không hỗ trợ xem trước định dạng này"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Tải xuống" })[0]!);
    expect(onDownload).toHaveBeenCalled();
  });
});

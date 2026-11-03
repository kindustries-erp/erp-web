import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { XmlFilePreviewModal } from "./XmlFilePreviewModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe("XmlFilePreviewModal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when no file is selected", () => {
    render(<XmlFilePreviewModal file={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a dialog titled with the file name", () => {
    const file = new File(["<a/>"], "inv.xml", { type: "application/xml" });
    render(<XmlFilePreviewModal file={file} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toHaveTextContent("inv.xml");
  });

  it("does not crash when object URLs are unavailable for a pdf", () => {
    const pdf = new File(["%PDF"], "a.pdf", { type: "application/pdf" });
    vi.stubGlobal("URL", { ...URL, createObjectURL: undefined });
    render(<XmlFilePreviewModal file={pdf} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { XmlUploadFileList } from "./XmlUploadFileList";
import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) => {
      if (typeof fallback === "string") return fallback;
      const { defaultValue, count } = fallback as {
        defaultValue: string;
        count: number;
      };
      return defaultValue.replace("{{count}}", String(count));
    },
  }),
  Trans: ({ children }: { children?: unknown }) => children,
}));

const pdf = new File(["%PDF"], "b.pdf", { type: "application/pdf" });
const xml = new File(["<a/>"], "a.xml", { type: "application/xml" });
const files: FileEntry[] = [
  { id: "1", type: "xml", file: xml, pairedPdf: "a.pdf" } as FileEntry,
  { id: "2", type: "pdf", file: pdf } as FileEntry,
];

describe("XmlUploadFileList", () => {
  it("shows pairing state and an orphan marker for an unpaired pdf", () => {
    render(<XmlUploadFileList files={files} onRemove={vi.fn()} />);

    expect(screen.getByText("Đã ghép PDF")).toBeInTheDocument();
    expect(screen.getByText("Orphan")).toBeInTheDocument();
  });

  it("calls onRemove with the entry id", () => {
    const onRemove = vi.fn();
    render(<XmlUploadFileList files={files} onRemove={onRemove} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Xóa" })[0]);
    expect(onRemove).toHaveBeenCalledWith("1");
  });

  it("opens the preview modal for a pdf instead of a drawer", () => {
    render(<XmlUploadFileList files={files} onRemove={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Xem PDF" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when there are no files", () => {
    const { container } = render(
      <XmlUploadFileList files={[]} onRemove={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

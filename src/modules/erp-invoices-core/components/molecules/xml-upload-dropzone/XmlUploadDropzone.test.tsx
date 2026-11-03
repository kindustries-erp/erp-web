import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { XmlUploadDropzone } from "./XmlUploadDropzone";

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

describe("XmlUploadDropzone", () => {
  it("passes only supported files to the caller", () => {
    const onFilesSelected = vi.fn();
    const { container } = render(
      <XmlUploadDropzone onFilesSelected={onFilesSelected} />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const xml = new File(["<a/>"], "inv.xml", { type: "application/xml" });
    const pdf = new File(["%PDF"], "inv.pdf", { type: "application/pdf" });
    const exe = new File(["x"], "virus.exe", {
      type: "application/x-msdownload",
    });
    fireEvent.change(input, { target: { files: [xml, pdf, exe] } });

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    const accepted = onFilesSelected.mock.calls[0][0] as File[];
    expect(accepted.map((f) => f.name)).toEqual(["inv.xml", "inv.pdf"]);
  });

  it("does not call the caller when every file is rejected", () => {
    const onFilesSelected = vi.fn();
    const { container } = render(
      <XmlUploadDropzone onFilesSelected={onFilesSelected} />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [
          new File(["x"], "virus.exe", { type: "application/x-msdownload" }),
        ],
      },
    });

    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});

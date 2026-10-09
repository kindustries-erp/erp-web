import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2FileUpload } from "./V2FileUpload";

const file = (name: string, size = 10) =>
  new File([new Uint8Array(size)], name);
const input = () => screen.getByTestId("v2-file-input") as HTMLInputElement;

describe("V2FileUpload", () => {
  it("shows the default title and a hint", () => {
    render(<V2FileUpload onFilesSelected={vi.fn()} hint="XML, ZIP" />);
    expect(
      screen.getByText("Kéo thả tệp vào đây hoặc bấm để chọn"),
    ).toBeInTheDocument();
    expect(screen.getByText("XML, ZIP")).toBeInTheDocument();
  });

  it("reports files chosen through the input", () => {
    const onFilesSelected = vi.fn();
    render(
      <V2FileUpload onFilesSelected={onFilesSelected} accept={[".xml"]} />,
    );
    const xml = file("a.xml");
    fireEvent.change(input(), { target: { files: [xml] } });
    expect(onFilesSelected).toHaveBeenCalledWith([xml], []);
  });

  it("reports files dropped on the zone", () => {
    const onFilesSelected = vi.fn();
    render(<V2FileUpload onFilesSelected={onFilesSelected} />);
    const zone = screen.getByRole("button");
    const xml = file("a.xml");
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [xml] } });
    expect(onFilesSelected).toHaveBeenCalledWith([xml], []);
  });

  it("shows why a file was rejected", () => {
    const onFilesSelected = vi.fn();
    render(
      <V2FileUpload onFilesSelected={onFilesSelected} accept={[".xml"]} />,
    );
    fireEvent.change(input(), { target: { files: [file("a.txt")] } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "a.txt: Định dạng tệp không được hỗ trợ",
    );
    expect(onFilesSelected).toHaveBeenCalledWith(
      [],
      [expect.objectContaining({ reason: "type" })],
    );
  });

  it("accepts a single file when multiple is off", () => {
    const onFilesSelected = vi.fn();
    render(<V2FileUpload onFilesSelected={onFilesSelected} multiple={false} />);
    fireEvent.change(input(), {
      target: { files: [file("1.xml"), file("2.xml")] },
    });
    const [accepted, rejected] = onFilesSelected.mock.calls[0]!;
    expect(accepted).toHaveLength(1);
    expect(rejected[0].reason).toBe("count");
  });

  it("ignores input when disabled", () => {
    const onFilesSelected = vi.fn();
    render(<V2FileUpload onFilesSelected={onFilesSelected} disabled />);
    fireEvent.drop(screen.getByRole("button"), {
      dataTransfer: { files: [file("a.xml")] },
    });
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});

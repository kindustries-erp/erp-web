import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ChatComposer } from "./V2ChatComposer";

const file = (name: string, type: string, size = 10) => {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

describe("V2ChatComposer", () => {
  it("chỉ đính kèm: nút hiện nhãn, không có ô nhập chữ", () => {
    render(<V2ChatComposer onAttach={vi.fn()} attachLabel="Chọn hóa đơn" />);
    expect(screen.getByRole("button", { name: "Chọn hóa đơn" })).toBeDefined();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("chuyển file hợp lệ cho onAttach", () => {
    const onAttach = vi.fn();
    render(
      <V2ChatComposer
        onAttach={onAttach}
        attachLabel="Chọn"
        accept={["image/*", "application/pdf"]}
        maxSizeBytes={100}
      />,
    );
    const pdf = file("hd.pdf", "application/pdf");
    fireEvent.change(screen.getByTestId("v2-chat-file-input"), {
      target: { files: [pdf] },
    });
    expect(onAttach).toHaveBeenCalledWith([pdf]);
  });

  it("báo lý do khi file sai loại hoặc quá dung lượng", () => {
    const onAttach = vi.fn();
    const onReject = vi.fn();
    render(
      <V2ChatComposer
        onAttach={onAttach}
        onReject={onReject}
        attachLabel="Chọn"
        accept={["application/pdf"]}
        maxSizeBytes={100}
      />,
    );
    const input = screen.getByTestId("v2-chat-file-input");
    fireEvent.change(input, {
      target: { files: [file("a.txt", "text/plain")] },
    });
    fireEvent.change(input, {
      target: { files: [file("to.pdf", "application/pdf", 500)] },
    });
    expect(onReject.mock.calls).toEqual([["type"], ["size"]]);
    expect(onAttach).not.toHaveBeenCalled();
  });

  it("gửi chữ đã trim rồi xóa ô nhập; không gửi chuỗi rỗng", () => {
    const onSend = vi.fn();
    render(
      <V2ChatComposer
        onSend={onSend}
        attachLabel="Chọn"
        placeholder="Nhập tin nhắn"
        sendLabel="Gửi"
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.submit(input.closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "  xin chào " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSend).toHaveBeenCalledWith("xin chào");
    expect(input.value).toBe("");
  });
});

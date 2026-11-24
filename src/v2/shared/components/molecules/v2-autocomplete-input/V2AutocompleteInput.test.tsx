import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2AutocompleteInput } from "./V2AutocompleteInput";
import type { V2AutocompleteInputProps } from "./V2AutocompleteInput.type";

const options = [
  { value: "e1", label: "Nguyễn Văn An", description: "NV01" },
  { value: "e2", label: "Trần Bình", description: "NV02" },
];

function Harness(over: Partial<V2AutocompleteInputProps>) {
  const [text, setText] = React.useState("");
  return (
    <V2AutocompleteInput
      aria-label="Người làm"
      value={text}
      onChange={setText}
      options={options}
      onSelect={(o) => setText(o.label)}
      {...over}
    />
  );
}
const input = () => screen.getByRole("combobox", { name: "Người làm" });

describe("V2AutocompleteInput", () => {
  it("gõ thì hiện gợi ý lọc không dấu; bấm gợi ý thì điền và đóng", () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    fireEvent.change(input(), { target: { value: "van" } });
    expect(
      screen.getByRole("option", { name: /Nguyễn Văn An/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Trần Bình/ })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }));
    expect(onSelect).toHaveBeenCalledWith(options[0]);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("không khớp gợi ý nào thì không hiện danh sách, vẫn giữ chữ đã gõ", () => {
    const onChange = vi.fn();
    render(
      <V2AutocompleteInput
        aria-label="Người làm"
        value="Thợ thuê"
        onChange={onChange}
        options={options}
        onSelect={vi.fn()}
      />,
    );
    fireEvent.change(input(), { target: { value: "Thợ thuê ngoài" } });
    expect(onChange).toHaveBeenCalledWith("Thợ thuê ngoài");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("phím ↓ Enter chọn gợi ý; Esc đóng; gõ gọi tìm server", () => {
    const onSearchChange = vi.fn();
    render(<Harness onSearchChange={onSearchChange} />);
    fireEvent.change(input(), { target: { value: "n" } });
    expect(onSearchChange).toHaveBeenCalledWith("n");
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(input()).toHaveValue("Nguyễn Văn An");
    fireEvent.change(input(), { target: { value: "Tr" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

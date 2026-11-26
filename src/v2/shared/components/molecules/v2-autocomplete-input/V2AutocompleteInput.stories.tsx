import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2AutocompleteInput } from "./V2AutocompleteInput";

const options = [
  { value: "e1", label: "Nguyễn Văn An", description: "NV01 · KTV" },
  { value: "e2", label: "Trần Bình", description: "NV02 · Thợ sơn" },
  { value: "e3", label: "Lê Cường", description: "NV03 · Thợ gầm" },
];

const meta: Meta<typeof V2AutocompleteInput> = {
  title: "V2/Molecules/V2AutocompleteInput",
  component: V2AutocompleteInput,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof V2AutocompleteInput>;

const Controlled = () => {
  const [text, setText] = React.useState("");
  const [picked, setPicked] = React.useState<string | null>(null);
  return (
    <div className="w-80 p-4">
      <V2AutocompleteInput
        aria-label="Người làm"
        placeholder="Gõ tên người làm"
        value={text}
        onChange={(v) => {
          setText(v);
          setPicked(null);
        }}
        options={options}
        onSelect={(o) => {
          setText(o.label);
          setPicked(o.value);
        }}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Mã đã gắn: {picked ?? "—"}
      </p>
    </div>
  );
};

export const MacDinh: Story = { render: () => <Controlled /> };

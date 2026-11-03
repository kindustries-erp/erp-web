import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2PostingLinesEditor } from "./V2PostingLinesEditor";
import {
  createPostingLine,
  type PostingLineValue,
} from "./postingLines.helper";

const meta: Meta<typeof V2PostingLinesEditor> = {
  title: "Components/Organisms/V2PostingLinesEditor",
  component: V2PostingLinesEditor,
  tags: ["autodocs"],
};
export default meta;

const accounts = [
  { value: "1111", label: "1111 - Quỹ tiền mặt" },
  { value: "131", label: "131 - Phải thu khách hàng" },
];

const Interactive = () => {
  const [lines, setLines] = useState<PostingLineValue[]>([
    createPostingLine({ accountId: "1111", debit: 500 }),
  ]);
  return (
    <V2PostingLinesEditor
      lines={lines}
      accounts={accounts}
      onChange={setLines}
      autoBalance
    />
  );
};

export const Default: StoryObj<typeof V2PostingLinesEditor> = {
  render: () => <Interactive />,
};

export const Disabled: StoryObj<typeof V2PostingLinesEditor> = {
  args: {
    lines: [createPostingLine({ accountId: "131", credit: 200 })],
    accounts,
    onChange: () => undefined,
    disabled: true,
  },
};

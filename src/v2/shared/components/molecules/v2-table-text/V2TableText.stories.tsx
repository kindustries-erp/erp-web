import type { Meta } from "@storybook/react";
import React from "react";
import { V2TableText } from "./V2TableText";

const meta: Meta<typeof V2TableText> = {
  title: "Components/Molecules/Table/V2TableText",
  component: V2TableText,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="group/text w-64 rounded border border-border p-2 text-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const LONG =
  "CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM - Cước phí vận chuyển";

export const Default = () => <V2TableText text="HD-000123" />;
export const Copyable = () => <V2TableText text="HD-000123" enableCopy />;
export const LongTextWithTooltip = () => <V2TableText text={LONG} tooltip />;
export const DetailLink = () => (
  <V2TableText text="HD-000123" enableCopy onDetailClick={() => {}} />
);
export const LinkedRecord = () => (
  <V2TableText text="PO-4471" onDrawerClick={() => {}} />
);
export const AllActions = () => (
  <V2TableText
    text={LONG}
    enableCopy
    onDetailClick={() => {}}
    onDrawerClick={() => {}}
  />
);

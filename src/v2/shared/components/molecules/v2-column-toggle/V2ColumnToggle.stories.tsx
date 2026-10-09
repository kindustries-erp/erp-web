import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2ColumnToggle } from "./V2ColumnToggle";
import type { V2ColumnToggleItem } from "./V2ColumnToggle.type";

const meta: Meta<typeof V2ColumnToggle> = {
  title: "Components/Molecules/Table/V2ColumnToggle",
  component: V2ColumnToggle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

const make = (count: number): V2ColumnToggleItem[] =>
  Array.from({ length: count }, (_, i) => ({
    key: `col${i}`,
    label: `Cột ${i + 1}`,
    visible: true,
    canHide: i !== 0,
  }));

const Stateful = ({
  initial,
  customized,
}: {
  initial: V2ColumnToggleItem[];
  customized?: boolean;
}) => {
  const [columns, setColumns] = useState(initial);
  return (
    <V2ColumnToggle
      columns={columns}
      isCustomized={customized}
      onToggle={(key) =>
        setColumns((cs) =>
          cs.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
        )
      }
      onReorder={(keys) =>
        setColumns((cs) =>
          keys.map((k) => cs.find((c) => c.key === k) as V2ColumnToggleItem),
        )
      }
      onReset={() => setColumns(initial)}
    />
  );
};

export const Default = () => <Stateful initial={make(5)} />;
export const Customized = () => (
  <Stateful
    customized
    initial={make(5).map((c, i) => ({ ...c, visible: i % 2 === 0 }))}
  />
);
export const FirstColumnCannotHide = () => <Stateful initial={make(4)} />;
export const ManyColumns = () => <Stateful initial={make(24)} />;

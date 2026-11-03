import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2TraceTableSection } from "./V2TraceTableSection";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { buildTraceTableColumns } from "./V2TraceTable.columns";
import "../../traceability.locale";
import { TRACEABILITY_MOCK_GRAPH } from "../../mocks/traceability.mock";

const meta: Meta<typeof V2TraceTableSection> = {
  title: "Components/Organisms/V2TraceTableSection",
  component: V2TraceTableSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceTableSection>;

const items = TRACEABILITY_MOCK_GRAPH.nodes.filter((n) => !n.isCurrent);

/** Dựng cột bằng hàm dịch thật của V2 (vì cột cần `t` khi render) */
const Demo = () => {
  const { t } = useV2Translation();
  const columns = buildTraceTableColumns({
    t,
    allowEdit: false,
    onOpen: () => undefined,
  });
  return (
    <V2TraceTableSection
      tableId="v2-traceability-story"
      title={t("v2.traceability.table.directTitle")}
      items={items}
      columns={columns}
      rowActions={() => []}
      emptyLabel={t("v2.traceability.table.empty")}
    />
  );
};

export const Default: Story = { render: () => <Demo /> };

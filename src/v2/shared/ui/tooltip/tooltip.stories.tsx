import type { Meta } from "@storybook/react";
import React from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "V2/UI Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;

export const Default = () => {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex gap-4 p-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="px-3 py-1.5 bg-surface border border-border text-foreground text-xs rounded font-medium"
            >
              Rê chuột vào đây
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Gợi ý thao tác trên giao diện</span>
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export const Positions = () => {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-6 p-12 items-center">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="px-3 py-1.5 border border-border text-foreground text-xs rounded capitalize"
              >
                Side {side}
              </button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <span>Vị trí: {side}</span>
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

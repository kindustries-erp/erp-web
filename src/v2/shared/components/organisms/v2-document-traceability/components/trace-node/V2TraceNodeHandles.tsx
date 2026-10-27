import React from "react";
import { Handle, Position } from "@xyflow/react";

const HANDLE_CLASS =
  "z-30 h-3 w-3 cursor-crosshair border-2 border-surface !bg-muted-fg opacity-0 group-hover:opacity-100";

/** Bốn điểm nối của thẻ chứng từ; trái/trên là đích, phải/dưới là nguồn */
export function V2TraceNodeHandles() {
  return (
    <>
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className={HANDLE_CLASS}
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className={HANDLE_CLASS}
      />
    </>
  );
}

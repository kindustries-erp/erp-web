import React from "react";
import { Handle, Position } from "@xyflow/react";

/**
 * Cổng kết nối handles theo phong cách Node Editor cao cấp (Dribbble):
 * Bo tròn đồng tâm, bóng mờ nhẹ, hiển thị mượt mà khi hover và phóng to khi chạm điểm nối.
 */
const BASE_HANDLE_CLASS =
  "!h-3 !w-3 !rounded-full !border-2 !border-surface !bg-muted-fg shadow-2xs transition-all duration-200 ease-out opacity-0 group-hover:opacity-90 hover:!bg-primary hover:!scale-125 hover:opacity-100 z-30 cursor-crosshair";

/** Bốn điểm nối của thẻ chứng từ; trái/trên là đích, phải/dưới là nguồn */
export const V2TraceNodeHandles = React.memo(function V2TraceNodeHandles() {
  return (
    <>
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className={BASE_HANDLE_CLASS}
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className={BASE_HANDLE_CLASS}
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className={BASE_HANDLE_CLASS}
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className={BASE_HANDLE_CLASS}
      />
    </>
  );
});

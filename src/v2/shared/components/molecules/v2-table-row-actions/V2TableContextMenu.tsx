import * as React from "react";
import { createPortal } from "react-dom";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { V2RowActionList } from "./V2RowActionList";
import { clampMenuPosition } from "./V2TableRowActions.helper";

export interface V2TableContextMenuProps {
  position: { x: number; y: number } | null;
  groups: V2RowActionGroup[];
  onClose: () => void;
}

export const V2TableContextMenu: React.FC<V2TableContextMenuProps> = ({
  position,
  groups,
  onClose,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{
    left: number;
    top: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!position || !menuRef.current) {
      setCoords(null);
      return;
    }
    const { width, height } = menuRef.current.getBoundingClientRect();
    setCoords(
      clampMenuPosition({
        x: position.x,
        y: position.y,
        width,
        height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }),
    );
  }, [position]);

  React.useEffect(() => {
    if (!position) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [position, onClose]);

  if (!position) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      onContextMenu={(event) => event.preventDefault()}
      style={{
        position: "fixed",
        left: coords?.left ?? position.x,
        top: coords?.top ?? position.y,
      }}
      className="z-[60] min-w-[180px] max-w-[280px] rounded-xl border border-[color:var(--popup-border,rgba(226,232,240,0.8))] bg-[var(--popup-bg,rgba(246,248,252,0.72))] p-1 shadow-lg backdrop-blur-xl"
    >
      <V2RowActionList groups={groups} onAction={onClose} />
    </div>,
    document.body,
  );
};

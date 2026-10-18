import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

export interface RowContextMenuState {
  rowKey: string;
  x: number;
  y: number;
}

export const useRowContextMenu = () => {
  const [state, setState] = useState<RowContextMenuState | null>(null);

  const open = useCallback((event: MouseEvent, rowKey: string) => {
    event.preventDefault();
    setState({ rowKey, x: event.clientX, y: event.clientY });
  }, []);

  const close = useCallback(() => setState(null), []);

  return { state, open, close };
};

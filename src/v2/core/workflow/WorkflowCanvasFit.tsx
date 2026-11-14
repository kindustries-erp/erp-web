import { useEffect } from "react";
import { useReactFlow, useStore } from "@xyflow/react";

/** Fit lại toàn bộ sơ đồ khi khung đổi kích thước (vào/ra full screen, kéo drawer) hoặc đổi sơ đồ. */
export function FitOnResize({ canvasId }: { canvasId: string }) {
  const { fitView } = useReactFlow();
  const size = useStore((state) => `${state.width}x${state.height}`);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.05, duration: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [size, fitView, canvasId]);

  return null;
}

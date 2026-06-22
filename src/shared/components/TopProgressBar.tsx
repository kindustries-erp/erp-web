import { createPortal } from "react-dom";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";

export function TopProgressBar() {
  const globalLoading = useUIStore((s) => s.globalLoading);
  const appTheme = useAppStore((s) => s.appTheme);

  if (!globalLoading || typeof document === "undefined") return null;

  const isLightMode = appTheme === "shell" || appTheme === "orcaq";
  const bgContainer = isLightMode ? "bg-white/20" : "bg-primary/20";
  const bgBar = isLightMode ? "bg-white" : "bg-primary";

  return createPortal(
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] z-[99999] overflow-hidden pointer-events-none ${bgContainer}`}
    >
      <div
        className={`h-full ${bgBar}`}
        style={{
          width: "40%",
          animation: "indeterminate 1.5s infinite ease-in-out",
        }}
      >
        <style>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}

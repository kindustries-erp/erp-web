import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  useV2ToastStore,
  type V2Toast,
} from "@/v2/shared/stores/useV2ToastStore";

const VARIANT_CLASS: Record<V2Toast["variant"], string> = {
  default:
    "border-border/80 bg-card/95 text-card-foreground shadow-black/5 dark:border-white/10 dark:bg-card/90 dark:text-foreground dark:shadow-black/40",
  success:
    "border-emerald-500/30 bg-emerald-50/95 text-emerald-950 shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-[#07271a]/95 dark:text-emerald-100 dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)]",
  destructive:
    "border-rose-500/30 bg-rose-50/95 text-rose-950 shadow-rose-500/10 dark:border-rose-500/30 dark:bg-[#2b0d12]/95 dark:text-rose-100 dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)]",
};

export function V2Toaster() {
  const { t } = useV2Translation();
  const toasts = useV2ToastStore((state) => state.toasts);
  const dismissToast = useV2ToastStore((state) => state.dismissToast);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={3800}>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) dismissToast(toast.id);
          }}
          className={cn(
            "pointer-events-auto grid w-[380px] max-w-[calc(100vw-32px)] grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300",
            VARIANT_CLASS[toast.variant],
          )}
        >
          {toast.variant === "destructive" ? (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : toast.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-primary-foreground" />
          )}
          <div className="min-w-0">
            <ToastPrimitive.Title className="text-sm font-semibold leading-5">
              {toast.title}
            </ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className="mt-1 text-xs leading-5 opacity-90">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            aria-label={t("v2.common.close", "Đóng")}
            className="rounded-md p-1 text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] m-0 flex w-auto max-w-[calc(100vw-32px)] list-none flex-col items-center gap-2.5 p-0 outline-none pointer-events-none" />
    </ToastPrimitive.Provider>
  );
}

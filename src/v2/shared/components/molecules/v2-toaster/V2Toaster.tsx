import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  useV2ToastStore,
  type V2ToastVariant,
} from "@/v2/shared/stores/useV2ToastStore";

const VARIANT_CLASS: Record<V2ToastVariant, string> = {
  default:
    "border-[color:var(--popup-border,rgba(226,232,240,0.8))] bg-[var(--modal-bg,rgba(246,248,252,0.75))] text-foreground dark:border-white/[0.08]",
  success:
    "border-emerald-500/35 bg-emerald-50/75 text-foreground dark:border-emerald-400/30 dark:bg-emerald-950/40",
  destructive:
    "border-rose-500/35 bg-rose-50/75 text-foreground dark:border-rose-400/30 dark:bg-rose-950/40",
  warning:
    "border-amber-500/35 bg-amber-50/75 text-foreground dark:border-amber-400/30 dark:bg-amber-950/40",
};

function ToastIcon({ variant }: { variant: V2ToastVariant }) {
  switch (variant) {
    case "destructive":
      return (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
      );
    case "success":
      return (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      );
    case "warning":
      return (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      );
    default:
      return (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-primary-foreground" />
      );
  }
}

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
            "pointer-events-auto grid w-[380px] max-w-[calc(100vw-32px)] grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl border px-4 py-3",
            "backdrop-blur-[var(--glass-blur,16px)] backdrop-saturate-[180%] backdrop-contrast-[102%]",
            "shadow-[var(--popup-shadow,0_20px_40px_-12px_rgba(15,23,42,0.2))] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
            "transition-all duration-300",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out",
            VARIANT_CLASS[toast.variant],
          )}
        >
          <ToastIcon variant={toast.variant} />
          <div className="min-w-0">
            <ToastPrimitive.Title className="text-sm font-semibold leading-5 text-foreground">
              {toast.title}
            </ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className="mt-1 text-xs leading-relaxed text-muted-fg">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            aria-label={t("v2.common.close", "Đóng")}
            className="rounded-md p-1 text-muted-fg hover:text-foreground hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] m-0 flex w-auto max-w-[calc(100vw-32px)] list-none flex-col items-center gap-2.5 p-0 outline-none pointer-events-none" />
    </ToastPrimitive.Provider>
  );
}

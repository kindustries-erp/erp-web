import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  useV2ToastStore,
  type V2Toast,
} from "@/v2/shared/stores/useV2ToastStore";

const VARIANT_CLASS: Record<V2Toast["variant"], string> = {
  default: "border-border bg-card text-foreground",
  success: "border-primary/30 bg-accent text-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
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
            "grid w-[360px] max-w-[calc(100vw-32px)] grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
            VARIANT_CLASS[toast.variant],
          )}
        >
          {toast.variant === "destructive" ? (
            <XCircle className="mt-px h-4 w-4" />
          ) : (
            <CheckCircle2 className="mt-px h-4 w-4" />
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
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed right-5 top-5 z-[999] m-0 flex w-auto list-none flex-col gap-2 p-0 outline-none" />
    </ToastPrimitive.Provider>
  );
}

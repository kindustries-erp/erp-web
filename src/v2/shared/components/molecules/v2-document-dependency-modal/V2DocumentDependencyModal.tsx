import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/v2/shared/ui/dialog";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2DocumentDependencyStore } from "@/v2/shared/stores/useV2DocumentDependencyStore";

/** Hiện khi không thể hủy/xóa vì chứng từ đang được tham chiếu (409 DOCUMENT_IN_USE) */
export function V2DocumentDependencyModal() {
  const { t } = useV2Translation();
  const isOpen = useV2DocumentDependencyStore((state) => state.isOpen);
  const message = useV2DocumentDependencyStore((state) => state.message);
  const dependencies = useV2DocumentDependencyStore(
    (state) => state.dependencies,
  );
  const closeModal = useV2DocumentDependencyStore((state) => state.closeModal);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            {t("v2.documentDependency.title", "Không thể hủy chứng từ")}
          </DialogTitle>
          <DialogDescription>
            {message ||
              t(
                "v2.documentDependency.description",
                "Chứng từ đang được sử dụng ở các chứng từ dưới đây",
              )}
          </DialogDescription>
        </DialogHeader>
        {dependencies.length > 0 && (
          <ul className="max-h-48 list-inside list-disc space-y-1.5 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">
            {dependencies.map((dependency, index) => (
              <li key={`${dependency}-${index}`}>{dependency}</li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <V2Button size="sm" onClick={closeModal}>
            {t("v2.common.close", "Đóng")}
          </V2Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

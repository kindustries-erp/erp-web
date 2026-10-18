import * as React from "react";
import { Download, FileQuestion } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import { V2EmptyState } from "@/v2/shared/components/molecules/v2-empty-state";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { resolvePreviewKind } from "./V2FilePreviewPanel.helper";
import type { V2FilePreviewPanelProps } from "./V2FilePreviewPanel.type";

export const V2FilePreviewPanel: React.FC<V2FilePreviewPanelProps> = ({
  file,
  loading = false,
  error,
  onDownload,
  height,
  className,
}) => {
  const { t } = useV2Translation();
  const download = onDownload && (
    <V2Button
      type="button"
      variant="outline"
      size="sm"
      leftIcon={<Download className="h-3.5 w-3.5" />}
      onClick={onDownload}
    >
      {t("v2.preview.download", "Tải xuống")}
    </V2Button>
  );

  const body = (() => {
    if (loading) return <V2Skeleton className="h-full min-h-48 w-full" />;
    if (error) return <V2AlertBanner>{error}</V2AlertBanner>;
    if (!file) {
      return (
        <V2EmptyState title={t("v2.preview.empty", "Chọn tệp để xem trước")} />
      );
    }
    const kind = resolvePreviewKind(file);
    if (kind === "pdf") {
      return (
        <iframe
          title={file.name}
          src={file.url}
          className="h-full min-h-96 w-full rounded-md border border-border bg-background"
        />
      );
    }
    if (kind === "image") {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="h-full w-full rounded-md border border-border bg-background object-contain"
        />
      );
    }
    if (kind === "text") {
      return (
        <pre className="h-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted p-3 font-mono text-xs">
          {file.text}
        </pre>
      );
    }
    return (
      <V2EmptyState
        icon={<FileQuestion aria-hidden className="h-5 w-5" />}
        title={t(
          "v2.preview.unsupported",
          "Không hỗ trợ xem trước định dạng này",
        )}
        action={download}
      />
    );
  })();

  return (
    <div
      className={cn("flex min-h-0 flex-col gap-2", className)}
      style={{ height }}
    >
      {file && (
        <div className="flex shrink-0 items-center justify-between gap-2">
          <V2Text as="span" variant="body-sm" weight="bold" truncate>
            {file.name}
          </V2Text>
          {download}
        </div>
      )}
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );
};
V2FilePreviewPanel.displayName = "V2FilePreviewPanel";

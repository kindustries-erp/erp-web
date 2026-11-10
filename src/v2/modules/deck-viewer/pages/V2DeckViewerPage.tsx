import { V2DeckViewer, type DeckConfig } from "@/v2/core/deck-viewer";
import { V2EmptyState } from "@/v2/shared/components/molecules/v2-empty-state";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { DECK_REGISTRY } from "../configs";
import "../deckViewerModule.locale";

export interface V2DeckViewerPageProps {
  deckKey?: string;
  config?: DeckConfig;
}

export function V2DeckViewerPage({
  deckKey = "imotorbike",
  config,
}: V2DeckViewerPageProps) {
  const { t } = useV2Translation();
  const resolvedConfig = config ?? DECK_REGISTRY[deckKey];

  if (!resolvedConfig) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <V2EmptyState
          title={t(
            "v2.deckViewer.notFoundTitle",
            "Không tìm thấy tài liệu trình chiếu",
          )}
          description={t(
            "v2.deckViewer.notFoundDesc",
            "Vui lòng kiểm tra lại đường dẫn hoặc cấu hình tài liệu.",
          )}
        />
      </div>
    );
  }

  return <V2DeckViewer config={resolvedConfig} />;
}

export default V2DeckViewerPage;

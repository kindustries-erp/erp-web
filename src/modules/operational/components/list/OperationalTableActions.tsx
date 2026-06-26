import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { Button } from "@/shared/components/ui/Button";

interface OperationalTableActionsProps {
  loading: boolean;
  onRefresh: () => void;
  onFilterToggle: () => void;
  activeFilterCount: number;
  /** Nếu có, hiện nút "Tạo mới" */
  onCreate?: () => void;
  ctaLabel?: string;
  onCta?: () => void;
  bulkActionsNode?: React.ReactNode;
  portalId?: string;
}

/**
 * Nhóm action buttons ở header của trang danh sách operational.
 * Extracted từ OperationalListPage.tsx (dòng 1336–1363).
 */
export function OperationalTableActions({
  loading,
  onRefresh,
  onFilterToggle,
  activeFilterCount,
  onCreate,
  ctaLabel,
  onCta,
  bulkActionsNode,
  portalId,
}: OperationalTableActionsProps) {
  return (
    <TableActionGroup
      onRefresh={onRefresh}
      loading={loading}
      onFilterToggle={onFilterToggle}
      activeFilterCount={activeFilterCount}
      onCreate={onCreate}
      portalId={portalId}
    >
      {bulkActionsNode}
      {ctaLabel && onCta ? (
        <Button
          variant="secondary"
          size="sm"
          className="px-3 py-2"
          onClick={onCta}
          disabled={loading}
        >
          {ctaLabel}
        </Button>
      ) : undefined}
    </TableActionGroup>
  );
}

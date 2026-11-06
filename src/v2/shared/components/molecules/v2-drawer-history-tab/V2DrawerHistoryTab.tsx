import * as React from "react";
import { History } from "lucide-react";
import { DrawerSection } from "../v2-drawer-section";
import { DrawerAuditTimeline } from "../v2-drawer-audit-timeline";
import type { V2DrawerHistoryTabProps } from "./V2DrawerHistoryTab.type";

export function V2DrawerHistoryTab({
  items,
  title = "Lịch sử thay đổi",
  subtitle,
  emptyMessage = "Chưa có bản ghi lịch sử nào",
  loading,
  className,
}: V2DrawerHistoryTabProps) {
  return (
    <DrawerSection
      title={title}
      className={className}
      titleExtra={
        subtitle ? (
          <span className="text-xs text-muted-foreground font-normal">
            {subtitle}
          </span>
        ) : undefined
      }
    >
      {loading ? (
        <div className="space-y-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start animate-pulse">
              <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border/70 rounded-xl bg-muted/10">
          <History className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">
            {emptyMessage}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Mọi thao tác tạo mới, chỉnh sửa thông tin hoặc phân quyền sẽ được
            lưu vết tại đây.
          </p>
        </div>
      ) : (
        <div className="pt-2">
          <DrawerAuditTimeline items={items} emptyMessage={emptyMessage} />
        </div>
      )}
    </DrawerSection>
  );
}

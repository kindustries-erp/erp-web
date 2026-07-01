import React from "react";
import { SysTag } from "../api/tagsApi";
import { Badge } from "@/shared/components/ui/badge";

interface TagDisplayProps {
  tags: SysTag[];
  maxVisible?: number;
}

export function TagDisplay({ tags, maxVisible = 3 }: TagDisplayProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className="gap-1 px-2 py-0.5 rounded-full text-[11px]"
          style={{
            backgroundColor: tag.color
              ? `${tag.color}15`
              : "var(--color-surface)",
            color: tag.color || "var(--color-primary-text)",
            borderColor: tag.color ? `${tag.color}30` : "var(--color-border)",
          }}
          title={tag.description || tag.name}
        >
          {tag.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className="px-1.5 py-0.5 rounded-full text-[11px] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-secondary-text)]"
          title={tags
            .slice(maxVisible)
            .map((t) => t.name)
            .join(", ")}
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

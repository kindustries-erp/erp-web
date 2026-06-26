import React from "react";
import { SysTag } from "../api/tagsApi";

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
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
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
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-secondary-text)]"
          title={tags
            .slice(maxVisible)
            .map((t) => t.name)
            .join(", ")}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

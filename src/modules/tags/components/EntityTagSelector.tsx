import React, { useState } from "react";
import { Package, X, Plus } from "lucide-react";
import { useTags, useEntityTags, useTagsMutations } from "../hooks/useTags";
import { SysTag } from "../api/tagsApi";
import * as Popover from "@radix-ui/react-popover";

interface EntityTagSelectorProps {
  entityType: string;
  entityId: string;
  readOnly?: boolean;
}

export function EntityTagSelector({
  entityType,
  entityId,
  readOnly,
}: EntityTagSelectorProps) {
  const { data: allTags = [], isLoading: isLoadingTags } = useTags();
  const { data: entityTags = [], isLoading: isLoadingEntityTags } =
    useEntityTags(entityType, entityId);
  const { updateEntityTags } = useTagsMutations();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(false);

  const selectedTagIds = new Set(entityTags.map((t) => t.id));
  const availableTags = allTags.filter((t) => !selectedTagIds.has(t.id));

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleTag = async (tag: SysTag) => {
    if (readOnly) return;
    setUpdating(true);
    try {
      const newTagIds = selectedTagIds.has(tag.id)
        ? entityTags.filter((t) => t.id !== tag.id).map((t) => t.id)
        : [...entityTags.map((t) => t.id), tag.id];
      await updateEntityTags({ entityType, entityId, tagIds: newTagIds });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTag = async (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    if (readOnly) return;
    setUpdating(true);
    try {
      const newTagIds = entityTags
        .filter((t) => t.id !== tagId)
        .map((t) => t.id);
      await updateEntityTags({ entityType, entityId, tagIds: newTagIds });
    } finally {
      setUpdating(false);
    }
  };

  if (isLoadingTags || isLoadingEntityTags) {
    return (
      <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md"></div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entityTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-[color:var(--color-border)]"
          style={{
            backgroundColor: tag.color
              ? `${tag.color}15`
              : "var(--color-surface)",
            color: tag.color || "var(--color-primary-text)",
            borderColor: tag.color ? `${tag.color}30` : undefined,
          }}
          title={tag.description || tag.name}
        >
          {tag.name}
          {!readOnly && (
            <button
              type="button"
              onClick={(e) => handleRemoveTag(e, tag.id)}
              className="hover:opacity-75 focus:outline-none"
              disabled={updating}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}

      {!readOnly && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed border-[color:var(--color-border)] text-[color:var(--color-secondary-text)] hover:text-[color:var(--color-primary-text)] hover:border-[color:var(--color-primary-text)] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              className="z-[9999] w-[220px] rounded-lg p-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-md"
            >
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  placeholder="Tìm thẻ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm px-2 py-1.5 border border-[color:var(--color-border)] rounded bg-transparent text-[color:var(--color-primary-text)] focus:outline-none focus:border-blue-500"
                />
                <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
                  {filteredTags.length === 0 ? (
                    <div className="text-xs text-center text-[color:var(--color-secondary-text)] py-2">
                      Không tìm thấy thẻ nào
                    </div>
                  ) : (
                    filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        disabled={updating}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[color:var(--color-bg-hover)] text-left text-sm"
                      >
                        {tag.color ? (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                        ) : (
                          <Package className="w-3 h-3 text-[color:var(--color-secondary-text)] flex-shrink-0" />
                        )}
                        <span className="truncate text-[color:var(--color-primary-text)] font-medium">
                          {tag.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Package, X, Plus } from "lucide-react";
import { useTags, useEntityTags, useTagsMutations } from "../hooks/useTags";
import { SysTag } from "../api/tagsApi";
import * as Popover from "@radix-ui/react-popover";
import { TagConnectionsDrawer } from "./TagConnectionsDrawer";

interface EntityTagSelectorProps {
  entityType: string;
  entityId: string;
  readOnly?: boolean;
  /** When true, does not persist to API — instead manages state locally via pendingTagIds/onPendingChange */
  pendingMode?: boolean;
  /** Current pending tag IDs (controlled, when pendingMode=true) */
  pendingTagIds?: string[];
  /** Called when user adds/removes a tag in pendingMode */
  onPendingChange?: (ids: string[]) => void;
}

export function EntityTagSelector({
  entityType,
  entityId,
  readOnly,
  pendingMode = false,
  pendingTagIds = [],
  onPendingChange,
}: EntityTagSelectorProps) {
  const { data: allTags = [], isLoading: isLoadingTags } = useTags();
  const { data: entityTagsFromApi = [], isLoading: isLoadingEntityTags } =
    useEntityTags(entityType, pendingMode ? "" : entityId);
  const { updateEntityTags, createTag } = useTagsMutations();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(false);
  const [viewingTag, setViewingTag] = useState<SysTag | null>(null);

  // In pendingMode, resolve full tag objects from allTags using pendingTagIds
  const entityTags: SysTag[] = pendingMode
    ? allTags.filter((t) => pendingTagIds.includes(t.id))
    : entityTagsFromApi;

  const selectedTagIds = new Set(entityTags.map((t) => t.id));
  const availableTags = allTags.filter((t) => !selectedTagIds.has(t.id));

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleTag = async (tag: SysTag) => {
    if (readOnly) return;
    if (pendingMode) {
      const newIds = selectedTagIds.has(tag.id)
        ? pendingTagIds.filter((id) => id !== tag.id)
        : [...pendingTagIds, tag.id];
      onPendingChange?.(newIds);
      return;
    }
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

  const handleCreateNewTag = async (name: string) => {
    if (readOnly) return;
    setUpdating(true);
    try {
      const newTag = await createTag({ name: name.trim() });
      if (pendingMode) {
        onPendingChange?.([...pendingTagIds, newTag.id]);
      } else {
        const newTagIds = [...entityTags.map((t) => t.id), newTag.id];
        await updateEntityTags({ entityType, entityId, tagIds: newTagIds });
      }
      setSearchTerm("");
    } catch (e) {
      console.error("Failed to create tag", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTag = async (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    if (readOnly) return;
    if (pendingMode) {
      onPendingChange?.(pendingTagIds.filter((id) => id !== tagId));
      return;
    }
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

  if (isLoadingTags || (!pendingMode && isLoadingEntityTags)) {
    return (
      <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md"></div>
    );
  }

  const exactMatch = allTags.find(
    (t) => t.name.toLowerCase() === searchTerm.trim().toLowerCase(),
  );
  const isSelected = exactMatch ? selectedTagIds.has(exactMatch.id) : false;
  const canCreate = searchTerm.trim().length > 0 && !exactMatch;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entityTags.map((tag) => (
        <span
          key={tag.id}
          onClick={() => setViewingTag(tag)}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-[color:var(--color-border)] cursor-pointer hover:shadow-sm transition-shadow"
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
              className="z-[99999] w-[240px] rounded-lg p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  placeholder="Tìm thẻ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        disabled={updating}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-sm transition-colors"
                      >
                        {tag.color ? (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: tag.color }}
                          />
                        ) : (
                          <Package className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
                          {tag.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-sm py-4 text-slate-500 dark:text-slate-400">
                      <span>
                        {isSelected
                          ? "Thẻ này đã được thêm"
                          : "Không tìm thấy thẻ nào"}
                      </span>
                    </div>
                  )}

                  {canCreate && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleCreateNewTag(searchTerm)}
                      className="mt-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-md transition-colors w-full text-center"
                    >
                      Tạo mới "{searchTerm}"
                    </button>
                  )}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}

      {viewingTag && (
        <TagConnectionsDrawer
          open={!!viewingTag}
          onClose={() => setViewingTag(null)}
          tagId={viewingTag.id}
          tagName={viewingTag.name}
          tagColor={viewingTag.color}
        />
      )}
    </div>
  );
}

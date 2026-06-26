import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getEntityTags,
  updateEntityTags,
  getTagConnections,
} from "../api/tagsApi";

export function useTags() {
  return useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });
}

export function useEntityTags(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["sys-tags", "entity", entityType, entityId],
    queryFn: () => getEntityTags(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useTagConnections(tagId: string) {
  return useQuery({
    queryKey: ["sys-tags", "connections", tagId],
    queryFn: () => getTagConnections(tagId),
    enabled: !!tagId,
  });
}

export function useTagsMutations() {
  const queryClient = useQueryClient();

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-tags"] });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateTag>[1];
    }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-tags"] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-tags"] });
    },
  });

  const updateEntityTagsMutation = useMutation({
    mutationFn: ({
      entityType,
      entityId,
      tagIds,
    }: {
      entityType: string;
      entityId: string;
      tagIds: string[];
    }) => updateEntityTags(entityType, entityId, tagIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "sys-tags",
          "entity",
          variables.entityType,
          variables.entityId,
        ],
      });
    },
  });

  return {
    createTag: createTagMutation.mutateAsync,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    updateEntityTags: updateEntityTagsMutation.mutateAsync,
  };
}

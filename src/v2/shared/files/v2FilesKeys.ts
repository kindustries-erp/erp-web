export const v2FilesKeys = {
  all: ["v2-owner-files"] as const,
  list: (basePath: string) => [...v2FilesKeys.all, basePath] as const,
};

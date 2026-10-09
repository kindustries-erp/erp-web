import type {
  V2FileValidationOptions,
  V2RejectedFile,
} from "./V2FileUpload.type";

const matchesAccept = (file: File, accept: string[]): boolean => {
  const name = file.name.toLowerCase();
  return accept.some((rule) => {
    const pattern = rule.trim().toLowerCase();
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    if (pattern.endsWith("/*")) {
      return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
    }
    return file.type.toLowerCase() === pattern;
  });
};

/** Tách tệp hợp lệ và tệp bị từ chối (sai loại, quá dung lượng, vượt số lượng) */
export const validateFiles = (
  files: File[],
  { accept, maxSizeBytes, maxFiles }: V2FileValidationOptions,
): { accepted: File[]; rejected: V2RejectedFile[] } => {
  const accepted: File[] = [];
  const rejected: V2RejectedFile[] = [];
  for (const file of files) {
    if (accept && accept.length > 0 && !matchesAccept(file, accept)) {
      rejected.push({ file, reason: "type" });
    } else if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
      rejected.push({ file, reason: "size" });
    } else if (maxFiles !== undefined && accepted.length >= maxFiles) {
      rejected.push({ file, reason: "count" });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
};

import type {
  V2FilePreviewFile,
  V2FilePreviewKind,
} from "./V2FilePreviewPanel.type";

const TEXT_EXTENSIONS = [".xml", ".json", ".txt", ".csv", ".log"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

const hasExtension = (name: string, extensions: string[]) =>
  extensions.some((ext) => name.toLowerCase().endsWith(ext));

/** Chọn cách hiển thị theo loại tệp; ưu tiên mime type, rồi tới đuôi tệp */
export const resolvePreviewKind = (
  file: V2FilePreviewFile,
): V2FilePreviewKind => {
  const mime = (file.mimeType ?? "").toLowerCase();
  if (mime === "application/pdf" || hasExtension(file.name, [".pdf"])) {
    return file.url ? "pdf" : "unsupported";
  }
  if (mime.startsWith("image/") || hasExtension(file.name, IMAGE_EXTENSIONS)) {
    return file.url ? "image" : "unsupported";
  }
  if (
    mime.startsWith("text/") ||
    mime.includes("xml") ||
    mime.includes("json") ||
    hasExtension(file.name, TEXT_EXTENSIONS)
  ) {
    return file.text !== undefined ? "text" : "unsupported";
  }
  return "unsupported";
};

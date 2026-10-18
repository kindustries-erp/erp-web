export function getPdfAttachments(attachments?: any[]) {
  return (attachments ?? []).filter(
    (a) => a.attachment?.mimeType === "application/pdf",
  );
}

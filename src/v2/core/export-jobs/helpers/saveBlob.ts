const CLEANUP_DELAY_MS = 2000;

/** Lưu blob xuống máy bằng thẻ <a> ẩn; dọn thẻ và URL sau 2 giây để trình duyệt kịp bắt đầu tải. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, CLEANUP_DELAY_MS);
}

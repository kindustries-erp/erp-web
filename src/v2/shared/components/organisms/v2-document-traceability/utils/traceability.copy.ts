/** Chép văn bản vào clipboard; trả về false khi trình duyệt không cho phép */
export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

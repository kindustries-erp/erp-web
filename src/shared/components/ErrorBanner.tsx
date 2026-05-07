/**
 * ErrorBanner — hiển thị thông báo lỗi trong Drawer / Form.
 */
export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
      {msg}
    </div>
  );
}

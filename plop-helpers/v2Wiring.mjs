/**
 * Chèn `snippet` ngay trước dòng chứa `marker`, giữ thụt lề của dòng marker.
 * Idempotent: nếu nội dung đã có tag `v2-module:<id>` thì không chèn lại.
 * Snippet phải tự chứa tag `// v2-module:<id>` để lần chạy sau nhận diện được.
 */
export function insertAtMarker(content, marker, snippet, id) {
  const tag = `v2-module:${id}`;
  if (content.includes(tag)) return { content, changed: false };

  const lines = content.split("\n");
  const index = lines.findIndex((line) => line.includes(marker));
  if (index === -1) throw new Error(`Thiếu marker "${marker}" trong file đích`);

  const indent = lines[index].match(/^\s*/)[0];
  // Giữ thụt lề tương đối trong snippet; chỉ cộng thêm thụt lề của dòng marker
  const block = snippet
    .split("\n")
    .map((line) => (line.trim() ? `${indent}${line}` : line));
  lines.splice(index, 0, ...block);
  return { content: lines.join("\n"), changed: true };
}

/** Các marker mà generator phụ thuộc; dùng trong test để phát hiện marker bị xóa nhầm */
export const V2_WIRING_FILES = {
  "src/v2/app/router/v2RouteConfig.ts": ["// plop:v2-routes"],
  "src/v2/app/layouts/v2-app-layout/v2Navigation.config.ts": ["// plop:v2-nav-items"],
  "src/v2/shared/locales/vi.ts": ["// plop:v2-nav-items"],
  "src/v2/shared/locales/en.ts": ["// plop:v2-nav-items"],
  "src/v2/app/router/v2PageRegistry.tsx": ["// plop:v2-page-imports", "// plop:v2-pages"],
};

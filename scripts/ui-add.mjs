import { execSync } from "node:child_process";
import { organizeUi } from "./ui-organize.mjs";

const args = process.argv.slice(2);
const componentName = args[0];

if (!componentName) {
  console.error("❌ Thiếu tên component!");
  console.log("Cách dùng: bun run ui:add <component-name>");
  console.log("Ví dụ: bun run ui:add dialog");
  console.log("       bun run ui:add popover");
  process.exit(1);
}

console.log(`🚀 Đang tải component "${componentName}" từ Shadcn registry...`);

try {
  // 1. Chạy lệnh shadcn add
  execSync(`bunx -y shadcn add ${componentName} --yes`, {
    stdio: "inherit",
  });

  // 2. Tự động tổ chức lại file vừa tải vào subfolder chuẩn
  console.log(`📦 Đang tổ chức lại "${componentName}" theo chuẩn Folder-per-Component...`);
  organizeUi();

  console.log(`✨ Hoàn tất thêm component: src/v2/shared/ui/${componentName}/!`);
} catch (error) {
  console.error(`❌ Thất bại khi thêm component "${componentName}":`, error);
  process.exit(1);
}

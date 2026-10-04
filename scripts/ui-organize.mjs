import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const UI_DIR = path.resolve(process.cwd(), "src/v2/shared/ui");
const MASTER_INDEX = path.join(UI_DIR, "index.ts");

function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export function organizeUi() {
  if (!fs.existsSync(UI_DIR)) {
    console.error(`Thư mục không tồn tại: ${UI_DIR}`);
    return;
  }

  const entries = fs.readdirSync(UI_DIR, { withFileTypes: true });
  const flatTsxFiles = entries.filter(
    (e) =>
      e.isFile() &&
      e.name.endsWith(".tsx") &&
      !e.name.endsWith(".test.tsx") &&
      !e.name.endsWith(".spec.tsx"),
  );

  if (flatTsxFiles.length === 0) {
    console.log(
      "✓ Không có component phẳng nào cần tổ chức lại trong src/v2/shared/ui/.",
    );
  }

  let masterIndexContent = fs.existsSync(MASTER_INDEX)
    ? fs.readFileSync(MASTER_INDEX, "utf-8")
    : "";

  for (const file of flatTsxFiles) {
    const componentName = file.name.replace(/\.tsx$/, "");
    const componentDir = path.join(UI_DIR, componentName);
    const oldFilePath = path.join(UI_DIR, file.name);
    const newFilePath = path.join(componentDir, `${componentName}.tsx`);
    const indexPath = path.join(componentDir, "index.ts");
    const testPath = path.join(componentDir, `${componentName}.test.tsx`);

    // 1. Tạo subfolder
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // 2. Di chuyển file .tsx vào subfolder
    fs.renameSync(oldFilePath, newFilePath);
    console.log(
      `✓ Đã di chuyển: ${file.name} ➔ ${componentName}/${componentName}.tsx`,
    );

    // Di chuyển test file cũ nếu có ở root
    const oldTestFile = path.join(UI_DIR, `${componentName}.test.tsx`);
    if (fs.existsSync(oldTestFile)) {
      fs.renameSync(oldTestFile, testPath);
      console.log(
        `✓ Đã di chuyển test: ${componentName}.test.tsx ➔ ${componentName}/`,
      );
    }

    // 3. Tạo index.ts
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(
        indexPath,
        `export * from "./${componentName}";\n`,
        "utf-8",
      );
      console.log(`✓ Đã tạo index: ${componentName}/index.ts`);
    }

    // 4. Tạo test mẫu nếu chưa có test
    if (!fs.existsSync(testPath)) {
      const pascal = toPascalCase(componentName);
      const testContent = `import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ${pascal} } from "./${componentName}";

describe("V2 ${pascal} Primitive", () => {
  it("renders without crashing", () => {
    const { container } = render(<${pascal} />);
    expect(container).toBeInTheDocument();
  });
});
`;
      fs.writeFileSync(testPath, testContent, "utf-8");
      console.log(
        `✓ Đã tạo test mẫu: ${componentName}/${componentName}.test.tsx`,
      );
    }

    // 5. Cập nhật master index.ts
    const exportLine = `export * from "./${componentName}";`;
    if (!masterIndexContent.includes(exportLine)) {
      masterIndexContent += `${exportLine}\n`;
      fs.writeFileSync(MASTER_INDEX, masterIndexContent, "utf-8");
      console.log(`✓ Đã đăng ký vào src/v2/shared/ui/index.ts: ${exportLine}`);
    }
  }

  // Định dạng lại code
  try {
    execSync(`bunx prettier --write "src/v2/shared/ui/**/*.{ts,tsx}"`, {
      stdio: "ignore",
    });
  } catch {
    // bỏ qua lỗi định dạng nếu có
  }
}

// Chạy trực tiếp nếu file được gọi từ CLI
if (process.argv[1]?.endsWith("ui-organize.mjs")) {
  organizeUi();
}

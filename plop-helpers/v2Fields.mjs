/** Kiểu trường hỗ trợ trong `fields` của generator `v2-module` */
export const V2_FIELD_TYPES = ["string", "text", "number", "date", "status"];

const NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;

/**
 * Đọc chuỗi `fields` dạng `name:type[:required],...`.
 * Ví dụ: `code:string:required,name:string:required,status:status,createdAt:date`.
 * Luôn có `createdAt` (kiểu date) để bảng và filter ngày hoạt động giống business-partners.
 */
export function parseFields(spec) {
  const items = String(spec ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const fields = items.map((item) => {
    const [name, type = "string", ...flags] = item.split(":");
    if (!NAME_PATTERN.test(name)) {
      throw new Error(`Tên trường không hợp lệ: "${name}" (camelCase, bắt đầu bằng chữ thường)`);
    }
    if (!V2_FIELD_TYPES.includes(type)) {
      throw new Error(`Kiểu không hợp lệ: "${type}" của trường "${name}". Chọn: ${V2_FIELD_TYPES.join(", ")}`);
    }
    return { name, type, required: flags.includes("required") };
  });

  if (!fields.some((field) => field.name === "createdAt")) {
    fields.push({ name: "createdAt", type: "date", required: false });
  }
  return fields;
}

export const hasStatusField = (fields) => fields.some((field) => field.type === "status");

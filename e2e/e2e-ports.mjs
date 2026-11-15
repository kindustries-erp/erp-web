// Suy E2E_API_URL và E2E_WEB_URL từ PORT trong erp/erp-api/.env (chỉ đọc PORT).
// Bảng PORT API ↔ Web: xem erp-web/.agents/skills/erp-e2e-playwright/SKILL.md (mục 1).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API_ENV_FILE = resolve(dirname(fileURLToPath(import.meta.url)), "../../erp-api/.env");

// Web port đi kèm theo PORT API (dùng chung với erp-api/test/smoke).
const WEB_PORT_BY_API_PORT = { 10001: 5171, 10002: 5172, 10003: 5173 };

function readApiPort() {
  let text;
  try {
    text = readFileSync(API_ENV_FILE, "utf8");
  } catch {
    throw new Error(`Không đọc được ${API_ENV_FILE}. Đặt E2E_API_URL và E2E_WEB_URL để chạy.`);
  }
  const m = text.match(/^PORT=(\d+)/m);
  if (!m) throw new Error("Thiếu PORT trong erp-api/.env. Đặt E2E_API_URL và E2E_WEB_URL để chạy.");
  return Number(m[1]);
}

// E2E_API_URL: biến môi trường nếu có, nếu không suy từ PORT API.
export function resolveApiUrl() {
  if (process.env.E2E_API_URL) return process.env.E2E_API_URL;
  return `http://localhost:${readApiPort()}`;
}

// E2E_WEB_URL: biến môi trường nếu có, nếu không suy từ PORT API theo bảng.
export function resolveWebUrl() {
  if (process.env.E2E_WEB_URL) return process.env.E2E_WEB_URL;
  const apiPort = readApiPort();
  const webPort = WEB_PORT_BY_API_PORT[apiPort];
  if (!webPort) {
    throw new Error(`PORT API ${apiPort} không nằm trong bảng 10001/10002/10003. Đặt E2E_WEB_URL để chạy.`);
  }
  return `http://127.0.0.1:${webPort}`;
}

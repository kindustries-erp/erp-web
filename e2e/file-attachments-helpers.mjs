// Helper dùng chung cho e2e file-attachments: đăng nhập UI/API, kiểm tra, ảnh chụp.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

export const WEB = resolveWebUrl();
export const API = resolveApiUrl();
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.E2E_PASSWORD;
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? "admin@liouni.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
export const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;

export const PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
);

export function requireEnv() {
  if (!PASSWORD) {
    console.error("Thiếu E2E_ADMIN_PASSWORD hoặc E2E_PASSWORD.");
    process.exit(2);
  }
  mkdirSync(SHOTS, { recursive: true });
}

export function makeChecker() {
  const state = { failed: 0 };
  const check = (step, pass, detail = "") => {
    if (!pass) state.failed++;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`,
    );
  };
  return { state, check };
}

export async function apiLogin() {
  const res = await fetch(`${API}/api/v2/auth-sessions/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`API login ${res.status}`);
  return (await res.json()).data.accessToken;
}

export const apiCall = (token) => async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body && !(body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

export async function uploadViaApi(call, invoiceId, name) {
  const form = new FormData();
  form.append("files", new Blob([PDF], { type: "application/pdf" }), name);
  form.append("category", "KHAC");
  const r = await call(
    "POST",
    `/api/v2/invoices/${invoiceId}/attachments`,
    form,
  );
  return r.body?.data?.[0];
}

export async function openBrowser() {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", ADMIN);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );
  return { browser, page };
}

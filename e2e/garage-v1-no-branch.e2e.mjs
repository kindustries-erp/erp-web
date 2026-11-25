// E2E chỉ đọc: các trang Garage V1 không còn phụ thuộc chi nhánh KGara.
// Kiểm: trang Vụ việc và Công nợ tải bảng có dòng; mọi request đọc `/api/v1/greenway/*` không gửi
// header `x-greenway-branch-id`/`x-kgara-branch-id` (trừ đồng bộ và 3 endpoint gọi thẳng KGara);
// tổng phiếu trên UI khớp API không header; không còn ô chọn chi nhánh KGara.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_TAO_EMAIL.
// Chạy: bun run e2e:garage-v1-no-branch
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (step, pass, detail = "") => {
  results.push(!!pass);
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 200) : ""}`,
  );
};

// Request được phép gửi chi nhánh KGara: đồng bộ và 3 endpoint gọi thẳng KGara.
const KGARA_LIVE = /\/greenway\/(sync|dashboard|reports\/gross-profit-detail)/;
const BRANCH_HEADERS = ["x-greenway-branch-id", "x-kgara-branch-id"];

const login = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await login.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const apiCases = await (
  await fetch(`${API}/api/v1/greenway/cases?page=1&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
).json();
const apiTotal = apiCases?.pagination?.total;
check("A1 API cases không header có tổng phiếu", apiTotal > 0, `${apiTotal}`);

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await (
  await browser.newContext({ viewport: { width: 1600, height: 1000 } })
).newPage();
page.setDefaultTimeout(30000);

const v1Requests = [];
page.on("request", (req) => {
  const url = req.url();
  if (!url.includes("/api/v1/greenway/")) return;
  const h = req.headers();
  v1Requests.push({
    url,
    branch: BRANCH_HEADERS.map((k) => h[k]).find((v) => v !== undefined),
  });
});
const casesTotals = [];
page.on("response", async (res) => {
  const url = res.url();
  if (!/\/api\/v1\/greenway\/cases\?/.test(url)) return;
  try {
    const body = await res.json();
    if (body?.pagination?.total !== undefined)
      casesTotals.push(body.pagination.total);
  } catch {
    /* bỏ qua phản hồi không phải JSON */
  }
});

try {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );

  // B. Trang Vụ việc
  await page.goto(`${WEB}/garage-cases?tab=cases`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("table tbody tr", { timeout: 45000 });
  await page.waitForTimeout(2500);
  const caseRows = await page.locator("table tbody tr").count();
  check("B1 trang Vụ việc có dòng", caseRows > 0, `${caseRows} dòng`);
  const sawAll = casesTotals.includes(apiTotal);
  check(
    "B2 danh sách vụ việc trả đủ phiếu như API không header",
    sawAll,
    `UI ${casesTotals.join(",")} / API ${apiTotal}`,
  );
  const kgaraSelect = await page
    .getByText("Chọn chi nhánh KGara", { exact: false })
    .count();
  check("B3 không còn ô chọn chi nhánh KGara", kgaraSelect === 0);
  await page
    .screenshot({ path: `${SHOTS}garage-v1-cases.png` })
    .catch(() => {});

  // C. Trang Công nợ
  await page.goto(`${WEB}/garage-debts`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("table tbody tr", { timeout: 45000 });
  await page.waitForTimeout(2500);
  const debtRows = await page.locator("table tbody tr").count();
  check("C1 trang Công nợ có dòng", debtRows > 0, `${debtRows} dòng`);
  await page
    .screenshot({ path: `${SHOTS}garage-v1-debts.png` })
    .catch(() => {});

  // D. Header chi nhánh KGara
  const reads = v1Requests.filter((r) => !KGARA_LIVE.test(r.url));
  const leaked = reads.filter((r) => r.branch !== undefined);
  check("D1 có request đọc V1", reads.length > 0, `${reads.length} request`);
  check(
    "D2 request đọc V1 không gửi header chi nhánh KGara",
    leaked.length === 0,
    leaked
      .slice(0, 3)
      .map((r) => r.url.replace(API, ""))
      .join(" | "),
  );
} catch (e) {
  check("Lỗi không mong đợi", false, e?.message);
  await page
    .screenshot({ path: `${SHOTS}garage-v1-error.png` })
    .catch(() => {});
} finally {
  await browser.close();
}

const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);

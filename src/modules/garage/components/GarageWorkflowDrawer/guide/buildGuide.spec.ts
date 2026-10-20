import { describe, expect, it } from "vitest";

import { GARAGE_WORKFLOW_CANVASES } from "../garageWorkflowData";
import { buildGuide, flattenGuide } from "./buildGuide";
import type { GuideBlock } from "./guideTypes";

const t = (_key: string, fallback: string) => fallback;

const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
const dev = GARAGE_WORKFLOW_CANVASES.dev;

const blocksOf = (
  document: ReturnType<typeof buildGuide>,
  id: string,
): GuideBlock[] =>
  document.sections.find((section) => section.id === id)?.blocks ?? [];

describe("buildGuide: người dùng cuối", () => {
  const doc = buildGuide(endUser, t);

  it("có đủ các mục theo thứ tự", () => {
    expect(doc.sections.map((section) => section.id)).toEqual([
      "purpose",
      "howToRead",
      "steps",
      "money",
      "flows",
      "rules",
    ]);
  });

  it("Các bước vận hành khớp từng thẻ có số thứ tự trên sơ đồ, đúng một lần và tăng dần", () => {
    const steps = blocksOf(doc, "steps").find(
      (block) => block.type === "steps",
    );
    const expected = endUser.nodes
      .filter((node) => node.step !== undefined)
      .sort((a, b) => a.step! - b.step!)
      .map((node) => String(node.step));

    expect(
      steps && steps.type === "steps"
        ? steps.items.map((item) => item.badge)
        : [],
    ).toEqual(expected);
  });

  it("Giải thích các khoản tiền nêu đủ Dự thu, Thực thu, Dự chi, Thực chi, HHBH, Vật tư tiêu hao", () => {
    const money = blocksOf(doc, "money")[0];
    const terms =
      money.type === "definitions"
        ? money.items.map((item) => item.term).join(" | ")
        : "";

    [
      "Dự thu",
      "Thực thu",
      "Dự chi",
      "Thực chi",
      "HHBH",
      "Vật tư tiêu hao",
    ].forEach((term) => expect(terms, term).toContain(term));
  });

  it("Các luồng tự động liệt kê đủ bước của từng luồng", () => {
    const groups = blocksOf(doc, "flows").filter(
      (block) => block.type === "group",
    );

    (endUser.flows ?? []).forEach((flow) => {
      const count = endUser.edges.filter(
        (edge) => edge.steps?.[flow.id] !== undefined,
      ).length;
      const group = groups.find(
        (candidate) =>
          candidate.type === "group" &&
          candidate.title.startsWith(`${flow.letter}.`),
      );
      expect(
        group && group.type === "group" ? group.steps.length : 0,
        flow.id,
      ).toBe(count);
    });
  });
});

describe("buildGuide: kỹ thuật (Dev)", () => {
  const doc = buildGuide(dev, t);

  it("có đủ các mục theo thứ tự", () => {
    expect(doc.sections.map((section) => section.id)).toEqual([
      "overview",
      "modules",
      "flows",
      "tables",
      "mechanisms",
      "verify",
      "codeRefs",
    ]);
  });

  it("Bốn module liệt kê khung và các thẻ nằm trong khung", () => {
    const modules = blocksOf(doc, "modules").find(
      (block) => block.type === "definitions",
    );
    const items =
      modules && modules.type === "definitions" ? modules.items : [];

    expect(items).toHaveLength(dev.lanes.length);
    const cashflow = items.find((item) => item.term === "Thu chi");
    expect(cashflow?.text).toContain("GarageCashflowTransactionService");
    expect(cashflow?.text).toContain("kgara_cashflow_vouchers");
  });

  it("luồng kỹ thuật ghi thêm cơ chế gọi của từng bước", () => {
    const flows = blocksOf(doc, "flows").filter(
      (block) => block.type === "group",
    );
    const texts = flows.flatMap((block) =>
      block.type === "group" ? block.steps.map((step) => step.text) : [],
    );

    expect(texts.some((text) => text.includes("cron"))).toBe(true);
    expect(texts.some((text) => text.includes("fire-and-forget"))).toBe(true);
  });
});

describe("flattenGuide", () => {
  const units = flattenGuide(buildGuide(endUser, t));
  const numbered = units.flatMap((unit) =>
    unit.content.kind === "numbered" ? [unit.content] : [],
  );

  it("bắt đầu bằng tiêu đề tài liệu rồi mục lục; tiêu đề mục và tiêu đề mục lục đi cùng đơn vị sau", () => {
    expect(units[0].content.kind).toBe("docTitle");
    expect(units[1].content.kind).toBe("tocTitle");
    units
      .filter((unit) =>
        ["sectionTitle", "tocTitle"].includes(unit.content.kind),
      )
      .forEach((unit) => expect(unit.keepWithNext).toBe(true));
    expect(new Set(units.map((unit) => unit.id)).size).toBe(units.length);
  });

  it("đánh số mục 1, 1.1, 1.1.1 tăng dần và không trùng", () => {
    const numbers = units.flatMap((unit) =>
      unit.content.kind === "sectionTitle" || unit.content.kind === "numbered"
        ? [unit.content.number]
        : [],
    );
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(numbers.slice(0, 4)).toEqual(["1", "2", "2.1", "2.2"]);
    expect(numbered.some((item) => /^\d+\.\d+\.\d+$/.test(item.number))).toBe(
      true,
    );
  });

  it("mỗi bước vận hành là một mục cấp 2, mỗi bước của luồng là một mục cấp 3", () => {
    const stepNodes = endUser.nodes.filter(
      (node) => node.step !== undefined,
    ).length;
    const flowSteps = endUser.edges.reduce(
      (sum, edge) => sum + Object.keys(edge.steps ?? {}).length,
      0,
    );
    const withBadge = numbered.filter((item) => item.badge);

    expect(withBadge).toHaveLength(stepNodes + flowSteps);
    expect(withBadge.filter((item) => item.level === 3)).toHaveLength(
      flowSteps,
    );
  });

  it("mục lục có một dòng cho mỗi mục cấp 1 và trỏ tới đơn vị tồn tại", () => {
    const ids = new Set(units.map((unit) => unit.id));
    const entries = units.flatMap((unit) =>
      unit.content.kind === "tocEntry" ? [unit.content] : [],
    );
    const sections = units.filter(
      (unit) => unit.content.kind === "sectionTitle",
    );

    expect(entries.filter((entry) => entry.level === 1)).toHaveLength(
      sections.length,
    );
    entries.forEach((entry) => expect(ids.has(entry.targetId)).toBe(true));
  });
});

describe("flattenGuide: ví dụ cho từng mục", () => {
  it.each([
    ["người dùng cuối", endUser],
    ["kỹ thuật (Dev)", dev],
  ])(
    "mọi mục cấp 2 của tài liệu %s đều có khối ví dụ ngay sau nội dung của nó",
    (_name, canvas) => {
      const units = flattenGuide(buildGuide(canvas, t));
      const missing: string[] = [];

      units.forEach((unit, index) => {
        const content = unit.content;
        if (content.kind !== "numbered" || content.level !== 2) return;
        let next = index + 1;
        while (
          units[next]?.content.kind === "numbered" &&
          (units[next].content as { level: number }).level === 3
        ) {
          next += 1;
        }
        if (units[next]?.content.kind !== "example") {
          missing.push(`${content.number} ${content.title ?? content.text}`);
        }
      });

      expect(missing).toEqual([]);
    },
  );
});

import type {
  WorkflowCanvasDefinition,
  WorkflowCanvasText,
} from "../workflowTypes";
import type {
  GeneratedGuideSection,
  GuideBlock,
  GuideDocument,
  GuideSection,
  GuideSource,
  StaticGuideBlock,
  StaticGuideSection,
} from "./guideTypes";

export type Translate = (key: string, fallback: string) => string;

const tr = (t: Translate, text: WorkflowCanvasText) =>
  t(text.key, text.fallback);

/** Lời giải thích / ví dụ viết thêm cho một mục, tra theo key (nếu có). */
const detail = (
  source: GuideSource,
  t: Translate,
  key: string,
): string | undefined => {
  const text = source.details[key];
  return text ? t(text.key, text.fallback) : undefined;
};

const isDev = (canvas: WorkflowCanvasDefinition) => canvas.audience === "dev";

const docPrefix = (canvas: WorkflowCanvasDefinition) =>
  isDev(canvas) ? "dev" : "endUser";

function translateBlock(
  source: GuideSource,
  t: Translate,
  block: StaticGuideBlock,
): GuideBlock {
  switch (block.type) {
    case "paragraph":
      return { type: "paragraph", text: tr(t, block.text) };
    case "bullets":
      return {
        type: "bullets",
        items: block.items.map((item) => ({
          text: tr(t, item),
          example: detail(source, t, `${item.key}ex`),
        })),
      };
    case "definitions":
      return {
        type: "definitions",
        items: block.items.map((item) => ({
          term: tr(t, item.term),
          text: tr(t, item.text),
          example: detail(
            source,
            t,
            item.term.key.replace(/\.term$/, ".example"),
          ),
        })),
      };
  }
}

const nodeTitle = (
  canvas: WorkflowCanvasDefinition,
  t: Translate,
  id: string,
): string => {
  const node = canvas.nodes.find((candidate) => candidate.id === id);
  return node ? tr(t, node.title) : id;
};

/** "Các bước vận hành": mỗi thẻ có `step`, theo thứ tự số, gồm tiêu đề thẻ và các badge. */
function buildSteps(
  source: GuideSource,
  canvas: WorkflowCanvasDefinition,
  t: Translate,
): GuideBlock[] {
  const items = canvas.nodes
    .filter((node) => node.step !== undefined)
    .sort((a, b) => a.step! - b.step!)
    .map((node) => ({
      badge: String(node.step),
      title: tr(t, node.title),
      text:
        detail(
          source,
          t,
          `workflow.guide.${docPrefix(canvas)}.node.${node.id}.explain`,
        ) ?? "",
      details: (node.badges ?? []).map((badge) => tr(t, badge)),
      example: detail(
        source,
        t,
        `workflow.guide.${docPrefix(canvas)}.node.${node.id}.example`,
      ),
    }));
  return items.length > 0 ? [{ type: "steps", items }] : [];
}

/**
 * Luồng tự động: tên và mô tả luồng, rồi các mũi tên của luồng theo số thứ tự.
 * Bản kỹ thuật (Dev) ghi thêm cơ chế gọi của từng mũi tên.
 */
function buildFlows(
  source: GuideSource,
  canvas: WorkflowCanvasDefinition,
  t: Translate,
  detailed: boolean,
): GuideBlock[] {
  const blocks: GuideBlock[] = [];

  (canvas.flows ?? []).forEach((flow) => {
    const steps = canvas.edges
      .filter((edge) => edge.steps?.[flow.id] !== undefined)
      .sort((a, b) => a.steps![flow.id] - b.steps![flow.id])
      .map((edge) => {
        const label = edge.label ? tr(t, edge.label) : "";
        return {
          badge: `${flow.letter}${edge.steps![flow.id]}`,
          title: `${nodeTitle(canvas, t, edge.source)} → ${nodeTitle(canvas, t, edge.target)}`,
          text:
            detailed && edge.mechanism ? `${label} (${edge.mechanism})` : label,
        };
      });
    blocks.push({
      type: "group",
      title: `${flow.letter}. ${tr(t, flow.title)}`,
      description: tr(t, flow.description),
      example: detail(
        source,
        t,
        `workflow.guide.${docPrefix(canvas)}.flowExample.${flow.id}`,
      ),
      steps,
    });
  });

  return blocks;
}

/** "Bốn module": mỗi khung (lane) và danh sách thẻ nằm trong khung đó. */
function buildModules(
  source: GuideSource,
  canvas: WorkflowCanvasDefinition,
  t: Translate,
): GuideBlock[] {
  const items = canvas.lanes.map((lane) => ({
    example: detail(source, t, `workflow.guide.dev.moduleExample.${lane.id}`),
    term: tr(t, lane.title),
    text: canvas.nodes
      .filter(
        (node) =>
          node.x + 1 >= lane.x &&
          node.x + 1 < lane.x + lane.width &&
          node.y + 1 >= lane.y &&
          node.y + 1 < lane.y + lane.height,
      )
      .map((node) => tr(t, node.title))
      .join(", "),
  }));
  return items.length > 0 ? [{ type: "definitions", items }] : [];
}

function buildSection(
  source: GuideSource,
  canvas: WorkflowCanvasDefinition,
  t: Translate,
  section: StaticGuideSection | GeneratedGuideSection,
): GuideSection {
  if (section.kind === "static") {
    return {
      id: section.id,
      title: tr(t, section.title),
      blocks: section.blocks.map((block) => translateBlock(source, t, block)),
    };
  }

  const intro: GuideBlock[] = section.intro
    ? [{ type: "paragraph", text: tr(t, section.intro) }]
    : [];
  const generated =
    section.kind === "steps"
      ? buildSteps(source, canvas, t)
      : section.kind === "modules"
        ? buildModules(source, canvas, t)
        : buildFlows(source, canvas, t, isDev(canvas));

  return {
    id: section.id,
    title: tr(t, section.title),
    blocks: [...intro, ...generated],
  };
}

/**
 * Tài liệu hướng dẫn của một sơ đồ: phần viết tay (do host cấp qua `source`) ghép với phần sinh từ dữ liệu sơ đồ.
 * Trả `null` khi host không có tài liệu cho sơ đồ này.
 */
export function buildGuide(
  canvas: WorkflowCanvasDefinition,
  t: Translate,
  source: GuideSource,
): GuideDocument | null {
  const content = source.contentFor(canvas);
  if (!content) return null;
  return {
    title: tr(t, content.title),
    subtitle: tr(t, content.subtitle),
    tocTitle: tr(t, source.tocLabel),
    exampleLabel: tr(t, source.exampleLabel),
    sections: content.sections.map((section) =>
      buildSection(source, canvas, t, section),
    ),
  };
}

export { flattenGuide } from "./flattenGuide";

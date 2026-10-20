import type {
  GarageWorkflowCanvasDefinition,
  GarageWorkflowText,
} from "../garageWorkflowTypes";
import {
  DEV_GUIDE,
  END_USER_GUIDE,
  GUIDE_TOC_LABEL,
  type GeneratedGuideSection,
  type GuideContent,
  type StaticGuideBlock,
  type StaticGuideSection,
} from "./guideContent";
import { GUIDE_DETAILS, GUIDE_EXAMPLE_LABEL } from "./guideDetails";
import type {
  GuideBlock,
  GuideDocument,
  GuideSection,
  GuideUnit,
  GuideUnitContent,
} from "./guideTypes";

export type Translate = (key: string, fallback: string) => string;

const tr = (t: Translate, text: GarageWorkflowText) =>
  t(text.key, text.fallback);

/** Lời giải thích / ví dụ viết thêm cho một mục, tra theo key (nếu có). */
const detail = (t: Translate, key: string): string | undefined => {
  const text = GUIDE_DETAILS[key];
  return text ? t(text.key, text.fallback) : undefined;
};

const docPrefix = (canvas: GarageWorkflowCanvasDefinition) =>
  canvas.id === "dev" ? "dev" : "endUser";

function translateBlock(t: Translate, block: StaticGuideBlock): GuideBlock {
  switch (block.type) {
    case "paragraph":
      return { type: "paragraph", text: tr(t, block.text) };
    case "bullets":
      return {
        type: "bullets",
        items: block.items.map((item) => ({
          text: tr(t, item),
          example: detail(t, `${item.key}ex`),
        })),
      };
    case "definitions":
      return {
        type: "definitions",
        items: block.items.map((item) => ({
          term: tr(t, item.term),
          text: tr(t, item.text),
          example: detail(t, item.term.key.replace(/\.term$/, ".example")),
        })),
      };
  }
}

const nodeTitle = (
  canvas: GarageWorkflowCanvasDefinition,
  t: Translate,
  id: string,
): string => {
  const node = canvas.nodes.find((candidate) => candidate.id === id);
  return node ? tr(t, node.title) : id;
};

/** "Các bước vận hành": mỗi thẻ có `step`, theo thứ tự số, gồm tiêu đề thẻ và các badge. */
function buildSteps(
  canvas: GarageWorkflowCanvasDefinition,
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
          t,
          `workflow.guide.${docPrefix(canvas)}.node.${node.id}.explain`,
        ) ?? "",
      details: (node.badges ?? []).map((badge) => tr(t, badge)),
      example: detail(
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
  canvas: GarageWorkflowCanvasDefinition,
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
  canvas: GarageWorkflowCanvasDefinition,
  t: Translate,
): GuideBlock[] {
  const items = canvas.lanes.map((lane) => ({
    example: detail(t, `workflow.guide.dev.moduleExample.${lane.id}`),
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
  canvas: GarageWorkflowCanvasDefinition,
  t: Translate,
  section: StaticGuideSection | GeneratedGuideSection,
): GuideSection {
  if (section.kind === "static") {
    return {
      id: section.id,
      title: tr(t, section.title),
      blocks: section.blocks.map((block) => translateBlock(t, block)),
    };
  }

  const intro: GuideBlock[] = section.intro
    ? [{ type: "paragraph", text: tr(t, section.intro) }]
    : [];
  const generated =
    section.kind === "steps"
      ? buildSteps(canvas, t)
      : section.kind === "modules"
        ? buildModules(canvas, t)
        : buildFlows(canvas, t, canvas.id === "dev");

  return {
    id: section.id,
    title: tr(t, section.title),
    blocks: [...intro, ...generated],
  };
}

/** Tài liệu hướng dẫn của một sơ đồ: phần viết tay ghép với phần sinh từ dữ liệu sơ đồ. */
export function buildGuide(
  canvas: GarageWorkflowCanvasDefinition,
  t: Translate,
): GuideDocument {
  const content: GuideContent =
    canvas.id === "dev" ? DEV_GUIDE : END_USER_GUIDE;
  return {
    title: tr(t, content.title),
    subtitle: tr(t, content.subtitle),
    tocTitle: tr(t, GUIDE_TOC_LABEL),
    exampleLabel: tr(t, GUIDE_EXAMPLE_LABEL),
    sections: content.sections.map((section) =>
      buildSection(canvas, t, section),
    ),
  };
}

/**
 * Tách tài liệu thành các đơn vị nhỏ nhất để xếp trang, đánh số mục 1, 1.1, 1.1.1 và dựng mục lục
 * (cấp 1 và các mục cấp 2 có tiêu đề). Tiêu đề luôn đi cùng đơn vị sau nó.
 */
export function flattenGuide(document: GuideDocument): GuideUnit[] {
  const body: GuideUnit[] = [];
  const toc: GuideUnitContent[] = [];
  const push = (unit: Omit<GuideUnit, "id">): string => {
    const id = `unit-${body.length}`;
    body.push({ ...unit, id });
    return id;
  };

  document.sections.forEach((section, sectionIndex) => {
    const sectionNumber = String(sectionIndex + 1);
    let itemCount = 0;

    const sectionId = push({
      keepWithNext: true,
      content: {
        kind: "sectionTitle",
        number: sectionNumber,
        text: section.title,
      },
    });
    toc.push({
      kind: "tocEntry",
      level: 1,
      number: sectionNumber,
      text: section.title,
      targetId: sectionId,
    });

    /** Mục cấp 2: tự tăng số, vào mục lục nếu có tiêu đề. Trả về số mục để đánh số cấp 3. */
    const pushItem = (
      content: { badge?: string; title?: string; text?: string },
      keepWithNext = false,
    ): string => {
      itemCount += 1;
      const number = `${sectionNumber}.${itemCount}`;
      const id = push({
        keepWithNext,
        content: { kind: "numbered", level: 2, number, ...content },
      });
      if (content.title) {
        toc.push({
          kind: "tocEntry",
          level: 2,
          number,
          text: content.title,
          targetId: id,
        });
      }
      return number;
    };

    const pushExample = (example?: string) => {
      if (!example) return;
      push({
        keepWithNext: false,
        content: {
          kind: "example",
          label: document.exampleLabel,
          text: example,
        },
      });
    };

    const pushDetails = (
      parent: string,
      items: { badge?: string; title?: string; text?: string }[],
      keepLast = false,
    ) =>
      items.forEach((item, index) =>
        push({
          keepWithNext: keepLast && index === items.length - 1,
          content: {
            kind: "numbered",
            level: 3,
            number: `${parent}.${index + 1}`,
            ...item,
          },
        }),
      );

    section.blocks.forEach((block) => {
      switch (block.type) {
        case "paragraph":
          push({
            keepWithNext: false,
            content: { kind: "paragraph", text: block.text },
          });
          break;
        case "bullets":
          block.items.forEach((item) => {
            pushItem({ text: item.text }, Boolean(item.example));
            pushExample(item.example);
          });
          break;
        case "definitions":
          block.items.forEach((item) => {
            pushItem(
              { title: item.term, text: item.text },
              Boolean(item.example),
            );
            pushExample(item.example);
          });
          break;
        case "steps":
          block.items.forEach((item) => {
            const details = item.details ?? [];
            const parent = pushItem(
              {
                badge: item.badge,
                title: item.title,
                text: item.text || undefined,
              },
              details.length > 0 || Boolean(item.example),
            );
            pushDetails(
              parent,
              details.map((text) => ({ text })),
              Boolean(item.example),
            );
            pushExample(item.example);
          });
          break;
        case "group": {
          const parent = pushItem(
            { title: block.title, text: block.description },
            block.steps.length > 0 || Boolean(block.example),
          );
          pushDetails(
            parent,
            block.steps.map((step) => ({
              badge: step.badge,
              title: step.title,
              text: step.text || undefined,
            })),
            Boolean(block.example),
          );
          pushExample(block.example);
          break;
        }
      }
    });
  });

  const head: GuideUnit[] = [
    {
      id: "doc-title",
      keepWithNext: false,
      content: {
        kind: "docTitle",
        title: document.title,
        subtitle: document.subtitle,
      },
    },
    {
      id: "toc-title",
      keepWithNext: true,
      content: { kind: "tocTitle", text: document.tocTitle },
    },
    ...toc.map((content, index) => ({
      id: `toc-${index}`,
      keepWithNext: false,
      content,
    })),
  ];

  return [...head, ...body];
}

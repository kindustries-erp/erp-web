import { describe, expect, it } from "vitest";

import { garageEn } from "@/modules/garage/locales/en";
import { garageVi } from "@/modules/garage/locales/vi";

import {
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import type { GarageWorkflowText } from "./garageWorkflowTypes";
import {
  DEV_GUIDE,
  END_USER_GUIDE,
  GUIDE_PAGE_LABEL,
  GUIDE_TOC_LABEL,
} from "./guide/guideContent";
import { GUIDE_DETAILS, GUIDE_EXAMPLE_LABEL } from "./guide/guideDetails";

function collectGuideKeys(add: (text: GarageWorkflowText) => void) {
  add(GUIDE_PAGE_LABEL);
  add(GUIDE_TOC_LABEL);
  add(GUIDE_EXAMPLE_LABEL);
  Object.values(GUIDE_DETAILS).forEach(add);
  [END_USER_GUIDE, DEV_GUIDE].forEach((guide) => {
    add(guide.title);
    add(guide.subtitle);
    guide.sections.forEach((section) => {
      add(section.title);
      if (section.kind !== "static") {
        if (section.intro) add(section.intro);
        return;
      }
      section.blocks.forEach((block) => {
        if (block.type === "paragraph") add(block.text);
        if (block.type === "bullets") block.items.forEach(add);
        if (block.type === "definitions") {
          block.items.forEach((item) => {
            add(item.term);
            add(item.text);
          });
        }
      });
    });
  });
}

function collectWorkflowKeys(): string[] {
  const keys = new Set<string>();
  const add = (text: GarageWorkflowText) => keys.add(text.key);

  GARAGE_WORKFLOW_CANVAS_ORDER.forEach((id) => {
    const canvas = GARAGE_WORKFLOW_CANVASES[id];
    add(canvas.title);
    add(canvas.description);
    canvas.flows?.forEach((flow) => {
      add(flow.title);
      add(flow.description);
    });
    if (canvas.corner) add(canvas.corner.title);
    canvas.lanes.forEach((lane) => add(lane.title));
    canvas.columns.forEach((column) => add(column.title));
    canvas.nodes.forEach((node) => {
      add(node.title);
      if (node.group) add(node.group);
      (node.badges ?? []).forEach(add);
    });
    canvas.edges.forEach((edge) => {
      if (edge.label) add(edge.label);
    });
  });

  collectGuideKeys(add);

  keys.add("workflow.drawer.title");
  keys.add("workflow.drawer.subtitle");
  keys.add("workflow.drawer.exportPng");
  keys.add("workflow.drawer.exportPdf");
  keys.add("workflow.drawer.tab.endUser");
  keys.add("workflow.drawer.tab.dev");
  [
    "zoomIn",
    "zoomOut",
    "fit",
    "enterFullscreen",
    "exitFullscreen",
    "showRead",
    "hideRead",
    "flowsLabel",
    "flowAll",
    "flowAllHint",
    "canvasLabel",
    "clearSelection",
  ].forEach((name) => keys.add(`workflow.toolbar.${name}`));
  [
    "step",
    "solidArrow",
    "dashedArrow",
    "readArrow",
    "completed",
    "cancelled",
  ].forEach((name) => keys.add(`workflow.legend.${name}`));

  return [...keys];
}

function resolve(source: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function flatten(node: unknown, prefix = ""): string[] {
  if (typeof node === "string") return [prefix];
  if (!node || typeof node !== "object") return [];
  return Object.entries(node as Record<string, unknown>).flatMap(
    ([segment, child]) =>
      flatten(child, prefix ? `${prefix}.${segment}` : segment),
  );
}

describe("garageWorkflowLocales", () => {
  const keys = collectWorkflowKeys();

  it("mọi key của sơ đồ đều có chuỗi ở vi", () => {
    keys.forEach((key) => {
      expect(typeof resolve(garageVi, key), key).toBe("string");
    });
  });

  it("mọi key của sơ đồ đều có chuỗi ở en", () => {
    keys.forEach((key) => {
      expect(typeof resolve(garageEn, key), key).toBe("string");
    });
  });

  it("vi và en có cùng bộ key cho nhánh workflow", () => {
    const viKeys = flatten(
      (garageVi as Record<string, unknown>).workflow,
      "workflow",
    ).sort();
    const enKeys = flatten(
      (garageEn as Record<string, unknown>).workflow,
      "workflow",
    ).sort();
    expect(enKeys).toEqual(viKeys);
  });

  it("không còn key thừa so với dữ liệu sơ đồ", () => {
    const viKeys = flatten(
      (garageVi as Record<string, unknown>).workflow,
      "workflow",
    ).sort();
    expect(viKeys).toEqual([...keys].sort());
  });
});

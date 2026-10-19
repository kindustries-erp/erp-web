import { describe, expect, it } from "vitest";

import {
  GARAGE_STATUS_CODES,
  GARAGE_WORKFLOW_CANVASES,
  GARAGE_WORKFLOW_CANVAS_ORDER,
} from "./garageWorkflowData";
import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type GarageWorkflowCanvasDefinition,
  type GarageWorkflowRect,
} from "./garageWorkflowTypes";

const canvases = GARAGE_WORKFLOW_CANVAS_ORDER.map(
  (id) => GARAGE_WORKFLOW_CANVASES[id],
);

/** Chiều cao xấp xỉ của thẻ: tiêu đề + mỗi badge một dòng. */
const estimateHeight = (badgeCount: number) =>
  Math.max(WORKFLOW_CARD_MIN_HEIGHT, 56 + badgeCount * 18);

const contains = (outer: GarageWorkflowRect, x: number, y: number) =>
  x >= outer.x &&
  y >= outer.y &&
  x < outer.x + outer.width &&
  y < outer.y + outer.height;

const overlaps = (a: GarageWorkflowRect, b: GarageWorkflowRect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

describe("garageWorkflowData", () => {
  it("khai báo đúng 2 canvas: end-user trước, dev sau", () => {
    expect(GARAGE_WORKFLOW_CANVAS_ORDER).toEqual(["end-user", "dev"]);
    canvases.forEach((canvas) => expect(canvas.id).toBeDefined());
  });

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: id lane, cột, node không trùng và edge trỏ tới node có thật",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const nodeIds = canvas.nodes.map((node) => node.id);
      expect(new Set(nodeIds).size).toBe(nodeIds.length);

      const laneIds = canvas.lanes.map((lane) => lane.id);
      expect(new Set(laneIds).size).toBe(laneIds.length);

      canvas.edges.forEach((edge) => {
        expect(nodeIds).toContain(edge.source);
        expect(nodeIds).toContain(edge.target);
      });
    },
  );

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: mọi text có key thuộc namespace workflow",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const texts = [
        canvas.title,
        ...canvas.lanes.map((lane) => lane.title),
        ...canvas.columns.map((column) => column.title),
        ...canvas.nodes.flatMap((node) => [node.title, ...(node.badges ?? [])]),
        ...canvas.edges.flatMap((edge) => (edge.label ? [edge.label] : [])),
      ];

      texts.forEach((text) => {
        expect(text.key.startsWith("workflow.")).toBe(true);
        expect(text.fallback.trim().length).toBeGreaterThan(0);
      });
    },
  );

  it.each(canvases.map((canvas) => [canvas.id, canvas] as const))(
    "canvas %s: node nằm trong ít nhất một lane hoặc cột và không chồng lên node khác",
    (_id, canvas: GarageWorkflowCanvasDefinition) => {
      const boxes = canvas.nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        width: WORKFLOW_NODE_WIDTH,
        height: estimateHeight(node.badges?.length ?? 0),
      }));

      boxes.forEach((box) => {
        const inside = [...canvas.lanes, ...canvas.columns].some((area) =>
          contains(area, box.x + 1, box.y + 1),
        );
        expect(inside, box.id).toBe(true);
      });

      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          expect(
            overlaps(boxes[i], boxes[j]),
            `${boxes[i].id} chồng ${boxes[j].id}`,
          ).toBe(false);
        }
      }
    },
  );

  it("end-user là lưới 7 hàng bộ phận × 5 cột giai đoạn", () => {
    const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
    expect(endUser.lanes).toHaveLength(7);
    expect(endUser.columns).toHaveLength(5);
    endUser.lanes.forEach((lane) =>
      expect(lane.width).toBeGreaterThan(lane.height),
    );
  });

  it("dev chia 4 khung module và 1 dải lớp chỉ đọc, không còn cột", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    expect(dev.columns).toHaveLength(0);
    expect(dev.lanes.map((lane) => lane.id)).toEqual([
      "activity",
      "hub",
      "cashflow",
      "opex",
      "read",
    ]);
    expect(
      dev.lanes.filter((lane) => lane.layer === "read").map((lane) => lane.id),
    ).toEqual(["read"]);
  });

  it("dev: Hoạt động trái, Garage Hub giữa, Thu chi và OPEX bên phải", () => {
    const lanes = new Map(
      GARAGE_WORKFLOW_CANVASES.dev.lanes.map((lane) => [lane.id, lane]),
    );
    const activity = lanes.get("activity")!;
    const hub = lanes.get("hub")!;
    const cashflow = lanes.get("cashflow")!;
    const opex = lanes.get("opex")!;

    expect(activity.x + activity.width).toBeLessThanOrEqual(hub.x);
    expect(hub.x + hub.width).toBeLessThanOrEqual(cashflow.x);
    expect(cashflow.x).toBe(opex.x);
    expect(cashflow.y + cashflow.height).toBeLessThanOrEqual(opex.y);
  });

  it("dev: thẻ lớp đọc nằm trong dải đọc, mũi tên đọc luôn nối với thẻ lớp đọc", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const readLane = dev.lanes.find((lane) => lane.id === "read")!;
    const byId = new Map(dev.nodes.map((node) => [node.id, node]));

    dev.nodes
      .filter((node) => node.layer === "read")
      .forEach((node) =>
        expect(contains(readLane, node.x + 1, node.y + 1), node.id).toBe(true),
      );

    dev.edges
      .filter((edge) => edge.kind === "read")
      .forEach((edge) => {
        const ends = [byId.get(edge.source)!, byId.get(edge.target)!];
        expect(
          ends.some((node) => node.layer === "read"),
          edge.id,
        ).toBe(true);
      });
  });

  it("dev: có 4 luồng tự động A–D và luồng thủ công, mỗi luồng đánh số liên tục từ 1", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const flows = dev.flows ?? [];
    expect(flows.map((flow) => flow.letter)).toEqual(["A", "B", "C", "D", "M"]);

    flows.forEach((flow) => {
      const steps = dev.edges
        .filter((edge) => edge.flows?.includes(flow.id))
        .map((edge) => edge.steps![flow.id])
        .sort((a, b) => a - b);
      expect(steps.length, flow.id).toBeGreaterThanOrEqual(3);
      expect(steps, flow.id).toEqual(steps.map((_, index) => index + 1));
    });
  });

  it("dev: mọi mũi tên chính thuộc ít nhất một luồng và chỉ nhắc luồng có thật", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const flowIds = new Set((dev.flows ?? []).map((flow) => flow.id));

    dev.edges
      .filter((edge) => edge.kind !== "read")
      .forEach((edge) => {
        expect(edge.flows?.length, edge.id).toBeGreaterThan(0);
        edge.flows!.forEach((id) =>
          expect(flowIds.has(id), edge.id).toBe(true),
        );
      });
  });

  it("end-user: số thứ tự (step) trên thẻ liên tục từ 1 và canvas có description", () => {
    const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
    expect(endUser.description.key.startsWith("workflow.")).toBe(true);

    const steps = endUser.nodes
      .map((node) => node.step)
      .filter((step): step is number => step !== undefined)
      .sort((a, b) => a - b);
    expect(steps).toEqual(steps.map((_, index) => index + 1));
  });

  it("dev có description", () => {
    expect(
      GARAGE_WORKFLOW_CANVASES.dev.description.key.startsWith("workflow."),
    ).toBe(true);
  });

  it("chỉ gắn statusCode cho mã đã xác minh trong code", () => {
    const verified = new Set<number>([
      GARAGE_STATUS_CODES.COMPLETED,
      GARAGE_STATUS_CODES.CANCELLED,
    ]);

    canvases.forEach((canvas) => {
      canvas.nodes.forEach((node) => {
        if (node.statusCode !== undefined) {
          expect(verified.has(node.statusCode)).toBe(true);
        }
      });
    });
  });
});

describe("end-user: các khoản tiền được nêu rõ", () => {
  const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
  const titleOf = (id: string) =>
    endUser.nodes.find((node) => node.id === id)?.title.fallback ?? "";
  const badgesOf = (id: string) =>
    (endUser.nodes.find((node) => node.id === id)?.badges ?? []).map(
      (badge) => badge.fallback,
    );

  it("có thẻ riêng cho Dự thu, Thực thu, Dự chi, Thực chi, HHBH và Vật tư tiêu hao", () => {
    expect(titleOf("dt")).toContain("Dự thu");
    expect(titleOf("t1")).toContain("Thực thu");
    expect(titleOf("dc")).toContain("Dự chi");
    expect(titleOf("p1")).toContain("Thực chi");
    expect(titleOf("hh")).toContain("HHBH");
    expect(titleOf("vt")).toContain("Vật tư tiêu hao");
  });

  it("HHBH và Vật tư tiêu hao đều ghi rõ không trừ công nợ và ghi OPEX", () => {
    ["hh", "vt"].forEach((id) => {
      const badges = badgesOf(id).join(" | ");
      expect(badges, id).toContain("Không trừ công nợ");
      expect(badges, id).toContain("ghi OPEX");
    });
  });

  it("HHBH và Vật tư tiêu hao nối tới thẻ OPEX", () => {
    ["hh", "vt"].forEach((id) => {
      expect(
        endUser.edges.some(
          (edge) => edge.source === id && edge.target === "p2",
        ),
        id,
      ).toBe(true);
    });
  });
});

describe("end-user: luồng tự động dùng chung với canvas Dev", () => {
  const endUser = GARAGE_WORKFLOW_CANVASES["end-user"];
  const dev = GARAGE_WORKFLOW_CANVASES.dev;

  it("có đủ luồng A, B, C, D và M, trùng định nghĩa với Dev", () => {
    expect((endUser.flows ?? []).map((flow) => flow.letter)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "M",
    ]);
    expect(endUser.flows).toEqual(dev.flows);
  });

  it("mỗi luồng đánh số liên tục từ 1", () => {
    (endUser.flows ?? []).forEach((flow) => {
      const steps = endUser.edges
        .filter((edge) => edge.flows?.includes(flow.id))
        .map((edge) => edge.steps![flow.id])
        .sort((a, b) => a - b);
      expect(steps.length, flow.id).toBeGreaterThan(0);
      expect(steps, flow.id).toEqual(steps.map((_, index) => index + 1));
    });
  });

  it("mũi tên chính thuộc ít nhất một luồng, mũi tên đọc không thuộc luồng nào", () => {
    endUser.edges.forEach((edge) => {
      if (edge.kind === "read") {
        expect(edge.flows, edge.id).toBeUndefined();
      } else {
        expect(edge.flows?.length, edge.id).toBeGreaterThan(0);
      }
    });
  });

  it("luồng B nối HHBH và Vật tư tiêu hao tới OPEX, luồng A đi qua bước sinh Dự thu", () => {
    const sourcesOf = (flowId: string) =>
      endUser.edges
        .filter((edge) => edge.flows?.includes(flowId))
        .map((edge) => `${edge.source}>${edge.target}`);

    expect(sourcesOf("opex")).toEqual(
      expect.arrayContaining(["hh>p2", "vt>p2"]),
    );
    expect(sourcesOf("forecast")).toEqual(
      expect.arrayContaining(["e3>s3", "s3>dt"]),
    );
  });
});

describe("dev: khung OPEX thoáng", () => {
  const lanes = new Map(
    GARAGE_WORKFLOW_CANVASES.dev.lanes.map((lane) => [lane.id, lane]),
  );

  it("khe giữa khung Thu chi và OPEX đủ rộng làm kênh cho mũi tên và nhãn", () => {
    const cashflow = lanes.get("cashflow")!;
    const opex = lanes.get("opex")!;

    expect(opex.y - (cashflow.y + cashflow.height)).toBeGreaterThanOrEqual(100);
  });

  it("đáy các khung Hoạt động, Garage Hub và OPEX thẳng hàng", () => {
    const bottom = (id: string) => lanes.get(id)!.y + lanes.get(id)!.height;

    expect(bottom("activity")).toBe(bottom("opex"));
    expect(bottom("hub")).toBe(bottom("opex"));
  });

  it("OPEX có hai hàng thẻ và hoa hồng thẳng hàng với bảng operating_expenses", () => {
    const dev = GARAGE_WORKFLOW_CANVASES.dev;
    const y = (id: string) => dev.nodes.find((node) => node.id === id)!.y;

    expect(y("opexSvc")).toBeGreaterThan(y("tOpex"));
    expect(y("pnlCommission")).toBe(y("tOpex"));
    expect(y("pnlSvc")).toBe(y("tOpex"));
  });
});

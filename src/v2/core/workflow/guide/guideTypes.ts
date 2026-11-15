import type {
  WorkflowCanvasDefinition,
  WorkflowCanvasText,
} from "../workflowTypes";

/** Khối nội dung của tài liệu hướng dẫn (chuỗi đã được dịch). */
export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: { text: string; example?: string }[] }
  | {
      type: "definitions";
      items: { term: string; text: string; example?: string }[];
    }
  | {
      type: "steps";
      items: {
        badge: string;
        title: string;
        text: string;
        details?: string[];
        example?: string;
      }[];
    }
  | {
      type: "group";
      title: string;
      description: string;
      example?: string;
      steps: { badge: string; title: string; text: string }[];
    };

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export interface GuideDocument {
  title: string;
  subtitle: string;
  tocTitle: string;
  exampleLabel: string;
  sections: GuideSection[];
}

/**
 * Đơn vị nhỏ nhất khi xếp trang: tài liệu được tách thành các đơn vị này để không bao giờ
 * cắt giữa một đoạn hay một mục.
 */
export type GuideUnitContent =
  | { kind: "docTitle"; title: string; subtitle: string }
  | { kind: "tocTitle"; text: string }
  | {
      kind: "tocEntry";
      level: 1 | 2;
      number: string;
      text: string;
      /** Id của đơn vị mà mục lục trỏ tới, dùng để tra số trang. */
      targetId: string;
    }
  | { kind: "sectionTitle"; number: string; text: string }
  | { kind: "paragraph"; text: string }
  /** Khối ví dụ / use case cụ thể, nằm ngay dưới mục mà nó minh họa. */
  | { kind: "example"; label: string; text: string }
  /** Mục đánh số cấp 2 (1.1) hoặc cấp 3 (1.1.1). */
  | {
      kind: "numbered";
      level: 2 | 3;
      number: string;
      badge?: string;
      title?: string;
      text?: string;
    };

export interface GuideUnit {
  id: string;
  /** Đơn vị này phải nằm cùng trang với đơn vị liền sau (tiêu đề không đứng cuối trang). */
  keepWithNext: boolean;
  content: GuideUnitContent;
}

/** Khối nội dung viết tay (chưa dịch): mỗi chuỗi có key i18n và bản tiếng Việt mặc định. */
export type StaticGuideBlock =
  | { type: "paragraph"; text: WorkflowCanvasText }
  | { type: "bullets"; items: WorkflowCanvasText[] }
  | {
      type: "definitions";
      items: { term: WorkflowCanvasText; text: WorkflowCanvasText }[];
    };

export interface StaticGuideSection {
  kind: "static";
  id: string;
  title: WorkflowCanvasText;
  blocks: StaticGuideBlock[];
}

/** Mục sinh tự động từ dữ liệu sơ đồ nên luôn khớp với hình. */
export interface GeneratedGuideSection {
  kind: "steps" | "flows" | "modules";
  id: string;
  title: WorkflowCanvasText;
  intro?: WorkflowCanvasText;
}

export interface GuideContent {
  title: WorkflowCanvasText;
  subtitle: WorkflowCanvasText;
  sections: (StaticGuideSection | GeneratedGuideSection)[];
}

/**
 * Nguồn nội dung tài liệu hướng dẫn do host cấp (engine không chứa chữ nghiệp vụ nào).
 * Host không cung cấp thì xuất PDF chỉ có sơ đồ.
 */
export interface GuideSource {
  /** Nội dung viết tay của một sơ đồ; `undefined` nếu sơ đồ đó không có tài liệu. */
  contentFor: (canvas: WorkflowCanvasDefinition) => GuideContent | undefined;
  /** Lời giải thích và ví dụ viết thêm, tra theo key. */
  details: Record<string, WorkflowCanvasText>;
  exampleLabel: WorkflowCanvasText;
  tocLabel: WorkflowCanvasText;
  pageLabel: WorkflowCanvasText;
}

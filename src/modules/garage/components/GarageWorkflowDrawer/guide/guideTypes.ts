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

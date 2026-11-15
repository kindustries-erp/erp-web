import type { GuideDocument, GuideUnit, GuideUnitContent } from "./guideTypes";

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

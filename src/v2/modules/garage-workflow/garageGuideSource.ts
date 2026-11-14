import type { GuideSource } from "@/v2/core/workflow";

import {
  DEV_GUIDE,
  END_USER_GUIDE,
  GUIDE_PAGE_LABEL,
  GUIDE_TOC_LABEL,
} from "./guide/guideContent.data";
import { GUIDE_DETAILS, GUIDE_EXAMPLE_LABEL } from "./guide/guideDetails.data";

/** Tài liệu hướng dẫn kèm PDF của Garage Hub: người dùng cuối và kỹ thuật. */
export const GARAGE_GUIDE: GuideSource = {
  contentFor: (canvas) =>
    canvas.audience === "dev" ? DEV_GUIDE : END_USER_GUIDE,
  details: GUIDE_DETAILS,
  exampleLabel: GUIDE_EXAMPLE_LABEL,
  tocLabel: GUIDE_TOC_LABEL,
  pageLabel: GUIDE_PAGE_LABEL,
};

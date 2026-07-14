import "@testing-library/jest-dom";
import { vi } from "vitest";

import React from "react";

// Global mock for react-pdf to avoid DOMMatrix error in jsdom
vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: "" } },
  Document: ({ children }: any) =>
    React.createElement("div", { "data-testid": "pdf-document" }, children),
  Page: () => React.createElement("div", { "data-testid": "pdf-page" }),
}));

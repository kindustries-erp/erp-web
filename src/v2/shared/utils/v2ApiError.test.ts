import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import {
  extractV2ApiError,
  isDocumentInUseError,
  readDocumentDependencies,
} from "./v2ApiError";

const httpError = (data: unknown) =>
  new AxiosError("request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data,
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: { headers: {} } as never,
  });

describe("extractV2ApiError", () => {
  it("returns the server message as-is", () => {
    expect(
      extractV2ApiError(httpError({ message: "Mã đã tồn tại" }), "x"),
    ).toBe("Mã đã tồn tại");
  });

  it("joins validation messages returned as an array", () => {
    expect(
      extractV2ApiError(httpError({ message: ["a sai", "b thiếu"] }), "x"),
    ).toBe("a sai; b thiếu");
  });

  it("falls back when there is no server message or no response", () => {
    expect(extractV2ApiError(httpError({}), "Không thể lưu")).toBe(
      "Không thể lưu",
    );
    expect(extractV2ApiError(new Error("network"), "Không thể lưu")).toBe(
      "Không thể lưu",
    );
  });
});

describe("document dependency errors", () => {
  const conflict = (data: unknown) =>
    new AxiosError("conflict", "ERR_BAD_REQUEST", undefined, undefined, {
      data,
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: { headers: {} } as never,
    } as never);

  it("recognises DOCUMENT_IN_USE and reads its dependencies", () => {
    const error = conflict({
      code: "DOCUMENT_IN_USE",
      message: "Đối tác đang được sử dụng",
      dependencies: ["PO-001"],
    });

    expect(isDocumentInUseError(error)).toBe(true);
    expect(readDocumentDependencies(error)).toEqual({
      message: "Đối tác đang được sử dụng",
      dependencies: ["PO-001"],
    });
  });

  it("ignores other 409 conflicts", () => {
    expect(isDocumentInUseError(conflict({ code: "DUPLICATE" }))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { mergeDeep } from "./merge";

describe("merge", () => {
  it("should merge options correctly", () => {
    // create a test for deepmerge

    const options = mergeDeep(
      { headers: { "Content-Type": "application/json" } },
      { headers: { Authorization: "Bearer token" } }
    );

    expect(options).toEqual({
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });
  });
});

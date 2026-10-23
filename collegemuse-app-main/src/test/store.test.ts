import { describe, it, expect } from "vitest";
import { validateTitle } from "@/lib/store";

describe("validateTitle", () => {
  it("rejects blank titles", () => {
    expect(validateTitle("   ")).toBe("Please enter a title.");
  });
  it("accepts a normal title", () => {
    expect(validateTitle("Revise maths")).toBeNull();
  });
});

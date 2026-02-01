import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    const result = cn("px-2 py-1", "px-4");
    // tailwind-merge should resolve px-2 to px-4
    expect(result).toContain("px-4");
    expect(result).toContain("py-1");
  });
});

import { describe, expect, it } from "vitest";
import { clampRating } from "@/lib/types";
describe("rating", () => {
  it("rounds to half steps between 0.5 and 5", () => {
    expect(clampRating(3.3)).toBe(3.5);
    expect(clampRating(0)).toBe(0.5);
    expect(clampRating(7)).toBe(5);
  });
});

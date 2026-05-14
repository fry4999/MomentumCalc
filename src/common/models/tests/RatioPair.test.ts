import RatioPairList from "common/models/RatioPair";
import { describe, expect, test } from "vitest";

describe("RatioPairList", () => {
  test("replaces a pair by exact stage index", () => {
    const pairs = new RatioPairList([
      [1, 1],
      [1, 1],
      [2, 3],
    ]);

    expect(pairs.replaceAt(1, [4, 5]).pairs).toEqual([
      [1, 1],
      [4, 5],
      [2, 3],
    ]);
  });

  test("removes stages while keeping at least one stage", () => {
    const pairs = new RatioPairList([
      [18, 72],
      [24, 48],
    ]);

    expect(pairs.removeAt(1).pairs).toEqual([[18, 72]]);
    expect(pairs.removeAt(1).removeAt(0).pairs).toEqual([[18, 72]]);
  });
});

import { describe, expect, it } from "vitest";
import { useInfiniteVisibleItems } from "../../src/hooks/useInfiniteVisibleItems";
import { act, renderHook } from "../utils/render";

describe("useInfiniteVisibleItems", () => {
  it("returns the first page and loads more items without exceeding the list length", () => {
    const items = [1, 2, 3, 4, 5];
    const { result } = renderHook(() => useInfiniteVisibleItems(items, 2));

    expect(result.current.visibleItems).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleItems).toEqual([1, 2, 3, 4]);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleItems).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);
  });

  it("resets visible items when the input list changes", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useInfiniteVisibleItems(items, 2),
      { initialProps: { items: [1, 2, 3, 4] } }
    );

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleItems).toEqual([1, 2, 3, 4]);

    rerender({ items: [9, 10, 11] });

    expect(result.current.visibleItems).toEqual([9, 10]);
  });
});

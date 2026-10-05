import { describe, expect, it } from "vitest";
import { Skeleton } from "../../../../src/components/ui/Skeleton/Skeleton";
import { render } from "../../../utils/render";

describe("Skeleton", () => {
  it("renders an aria-hidden placeholder with variant, custom class and dimensions", () => {
    const { container } = render(
      <Skeleton
        variant="circle"
        className="avatar-loader"
        width={48}
        height="3rem"
        style={{ marginTop: 8 }}
      />
    );

    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("skeleton", "skeleton--circle", "avatar-loader");
    expect(skeleton).toHaveStyle({
      width: "48px",
      height: "3rem",
      marginTop: "8px",
    });
  });
});

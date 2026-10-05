import { describe, expect, it, vi } from "vitest";
import TagBadge from "../../../../src/components/ui/TagBadge/TagBadge";
import { render, screen, userEvent } from "../../../utils/render";

describe("TagBadge", () => {
  it("renders parent and child variants from the tag parentId", () => {
    const { rerender } = render(
      <TagBadge tag={{ id: 1, name: "Material", parentId: null }} />
    );

    expect(screen.getByText("Material")).toHaveClass("tag-badge--parent");

    rerender(<TagBadge tag={{ id: 4, name: "Calculo", parentId: 2 }} />);

    expect(screen.getByText("Calculo")).toHaveClass("tag-badge--child");
  });

  it("calls onClick with the tag when clicked or activated with keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const tag = { id: 8, name: "Programacion", parentId: 2 };

    render(<TagBadge tag={tag} onClick={onClick} />);

    const badge = screen.getByRole("button", { name: "Programacion" });

    await user.click(badge);
    badge.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onClick).toHaveBeenCalledWith(tag);
  });
});

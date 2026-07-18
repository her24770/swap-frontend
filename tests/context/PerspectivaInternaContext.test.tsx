import { describe, expect, it } from "vitest";
import {
  PerspectivaInternaProvider,
  usePerspectivaInterna,
} from "../../src/context/PerspectivaInternaContext";
import { render, screen } from "../utils/render";

function PerspectivaProbe() {
  const perspectiva = usePerspectivaInterna();

  return (
    <dl>
      <dt>profileView</dt>
      <dd>{perspectiva.profileView}</dd>
      <dt>canEditProfile</dt>
      <dd>{String(perspectiva.canEditProfile)}</dd>
      <dt>canCreatePublication</dt>
      <dd>{String(perspectiva.canCreatePublication)}</dd>
      <dt>canViewCommentsSection</dt>
      <dd>{String(perspectiva.canViewCommentsSection)}</dd>
    </dl>
  );
}

describe("PerspectivaInternaProvider", () => {
  it("provides read-only defaults outside an internal profile", () => {
    render(<PerspectivaProbe />);

    expect(screen.getByText("externo")).toBeInTheDocument();
    expect(screen.getAllByText("false")).toHaveLength(3);
  });

  it("enables internal owner permissions for editable profile modes", () => {
    render(
      <PerspectivaInternaProvider isOwnProfile activeProfileMode="vendedor">
        <PerspectivaProbe />
      </PerspectivaInternaProvider>
    );

    expect(screen.getByText("interno")).toBeInTheDocument();
    expect(screen.getAllByText("true")).toHaveLength(3);
  });

  it("does not allow publication creation for consumer mode", () => {
    render(
      <PerspectivaInternaProvider isOwnProfile activeProfileMode="consumidor">
        <PerspectivaProbe />
      </PerspectivaInternaProvider>
    );

    expect(screen.getByText("interno")).toBeInTheDocument();
    expect(screen.getAllByText("true")).toHaveLength(2);
    expect(screen.getByText("false")).toBeInTheDocument();
  });
});

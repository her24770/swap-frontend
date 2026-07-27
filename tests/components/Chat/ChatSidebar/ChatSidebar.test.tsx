import { describe, expect, it, vi } from "vitest";
import ChatSidebar from "../../../../src/components/Chat/ChatSidebar/chatsidebar";
import { fireEvent, render, screen } from "../../../utils/render";

describe("ChatSidebar", () => {
  it("filters conversations by name or message without case or accent differences", () => {
    render(
      <ChatSidebar
        conversaciones={[
          { id_conversacion: 1, nombre: "María López", preview: "Libro disponible" },
          { id_conversacion: 2, nombre: "Carlos Ruiz", preview: "Tutoría de cálculo" },
        ]}
        selectedId={null}
        tab="todas"
        onTabChange={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("placeholder"), {
      target: { value: "CALCULO" },
    });

    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(screen.queryByText("María López")).not.toBeInTheDocument();
  });
});

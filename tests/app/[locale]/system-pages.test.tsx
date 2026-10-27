import { expect, it, vi } from "vitest";
import { render, screen, userEvent } from "../../utils/render";
import ErrorPage from "../../../src/app/[locale]/error";
import LoadingPage from "../../../src/app/[locale]/loading";

vi.mock("../../../src/i18n/routing", () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));

it("muestra el error de Swap y permite reintentar", async () => {
  const reset = vi.fn();
  const user = userEvent.setup();
  render(<ErrorPage error={new Error("fallo de prueba")} reset={reset} />);

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "error.title" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "retry" }));
  expect(reset).toHaveBeenCalledTimes(1);
});

it("muestra un estado de carga accesible", () => {
  render(<LoadingPage />);
  expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
});

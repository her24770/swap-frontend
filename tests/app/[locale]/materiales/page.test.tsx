import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../utils/render";
import MaterialesPage from "../../../../src/app/[locale]/materiales/page";

const pageMocks = vi.hoisted(() => ({
  publicacionesList: vi.fn(),
  usePublicaciones: vi.fn(),
  handleDetallesClick: vi.fn(),
}));

vi.mock("../../../../src/components/pages/PublicacionesList/PublicacionesList", () => ({
  default: (props: any) => {
    pageMocks.publicacionesList(props);
    return <section>{props.title}</section>;
  },
}));

vi.mock("../../../../src/hooks/fetch/usePublicaciones", () => ({
  usePublicaciones: pageMocks.usePublicaciones,
}));

vi.mock("../../../../src/hooks/useDetallePublicacion", () => ({
  useDetallePublicacion: () => ({
    selectedPublicacion: null,
    loadingDetalle: false,
    handleDetallesClick: pageMocks.handleDetallesClick,
    handleClose: vi.fn(),
  }),
}));

describe("materiales page", () => {
  beforeEach(() => {
    pageMocks.publicacionesList.mockClear();
    pageMocks.usePublicaciones.mockReturnValue({
      data: [],
      total: 0,
      loading: false,
      error: null,
    });
  });

  it("requests material publications and passes material props", () => {
    render(<MaterialesPage />);

    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "material",
      all: true,
      limit: 12,
      page: 1,
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "material",
      limit: 12,
      sort: "fecha",
    });
    expect(pageMocks.usePublicaciones).toHaveBeenCalledWith({
      tipo: "material",
      recommended: true,
    });
    expect(pageMocks.publicacionesList).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "title",
        tipo: "material",
        Ads: [],
      })
    );
  });
});

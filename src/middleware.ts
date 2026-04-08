import { NextRequest, NextResponse } from "next/server";

// Rutas que no requieren autenticación
const rutasPublicas = ["/login", "/registro"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("swap-token")?.value;

  const esRutaPublica = rutasPublicas.some((ruta) => pathname.startsWith(ruta));

  // Si no hay token y la ruta es protegida → redirige a login
  if (!token && !esRutaPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si hay token y está intentando ir a login → redirige al home
  if (token && esRutaPublica) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Define en qué rutas aplica el middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

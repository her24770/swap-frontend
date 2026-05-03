import { NextRequest, NextResponse } from "next/server";

// Rutas que no requieren autenticación (sin el prefijo del idioma)
const rutasPublicas = ["/login", "/registro"];
const locales = ["es", "en", "fr"]; 
const defaultLocale = "es";

export function checkAuth(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("swap-token")?.value;

    // 1. Detectar si la URL ya tiene un locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // 2. Extraer el path real ignorando el idioma para poder validarlo contra tus rutas
    const pathSinLocale = pathnameIsMissingLocale
        ? pathname
        : pathname.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/";

    const esRutaPublica = rutasPublicas.some((ruta) => pathSinLocale.startsWith(ruta));

    // 3. Determinar el locale actual para mantener al usuario en su idioma al redirigir
    const currentLocale = pathnameIsMissingLocale
        ? defaultLocale
        : pathname.split("/")[1];

    // Si no hay token y la ruta es protegida → redirige a login (respetando el idioma)
    if (!token && !esRutaPublica) {
        return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }

    // Si hay token y está intentando ir a login/registro → redirige al home
    if (token && esRutaPublica) {
        return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
    }

    // Si no hay que hacer nada, retornamos null
    return null;
}
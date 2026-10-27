import { NextRequest, NextResponse } from "next/server";

// Rutas que no requieren autenticación (sin el prefijo del idioma)
const rutasPublicas = ["/login", "/registro", "/forgot-password", "/moderacion/login"];
// Registrar aquí cada página protegida nueva para conservar el control de acceso.
// Las rutas que no existen siguen libres para que Next pueda responder con 404.
const rutasProtegidas = new Set([
    "/", "/descubre", "/tutorias", "/materiales", "/negocios", "/Chat",
    "/perfil", "/perfil/historial", "/moderacion", "/moderacion/descubre",
    "/moderacion/publicaciones", "/moderacion/palabras", "/moderacion/reportes",
    "/moderacion/usuarios", "/moderacion/moderadores",
]);
const locales = ["es", "en", "fr"];
const defaultLocale = "es";

// NOTA: este middleware corre en el edge y solo verifica que exista la
// cookie "swap-token" — no decodifica el JWT, asi que no puede distinguir
// aca si el token es de un Usuario o de un Moderador (ni su nivel). Esa
// verificacion de rol queda del lado del cliente (ver useModeradorSesion),
// que llama a GET /api/moderador/me y recibe 403 si el rol no corresponde.
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

    const esRutaDeModeracion = pathSinLocale.startsWith("/moderacion");
    const esRutaPublica = rutasPublicas.includes(pathSinLocale);
    const esRutaProtegida = rutasProtegidas.has(pathSinLocale)
        || /^\/perfil\/[^/]+$/.test(pathSinLocale)
        || /^\/moderacion\/perfil\/[^/]+$/.test(pathSinLocale);

    // Las rutas desconocidas deben llegar al 404 de Next, aun sin sesión.
    if (!esRutaPublica && !esRutaProtegida) return null;

    // 3. Determinar el locale actual para mantener al usuario en su idioma al redirigir
    const currentLocale = pathnameIsMissingLocale
        ? defaultLocale
        : pathname.split("/")[1];

    // El home de cada "app" difiere: la de moderador vive bajo /moderacion,
    // la de usuario en la raiz del locale.
    const destinoLogin = esRutaDeModeracion ? "/moderacion/login" : "/login";
    const destinoHome = esRutaDeModeracion ? "/moderacion" : "";

    // Si no hay token y la ruta es protegida → redirige a login (respetando el idioma)
    if (!token && esRutaProtegida) {
        return NextResponse.redirect(new URL(`/${currentLocale}${destinoLogin}`, request.url));
    }

    // Si hay token y está intentando ir a login/registro → redirige al home correspondiente
    if (token && esRutaPublica) {
        return NextResponse.redirect(new URL(`/${currentLocale}${destinoHome}`, request.url));
    }

    // Si no hay que hacer nada, retornamos null
    return null;
}

import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { checkAuth } from "./proxy/authProxy";
import { API_URL } from "./lib/config";


const intlMiddleware = createIntlMiddleware({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
  localeCookie: {
    secure: true,
  },
});

const apiUrl = API_URL;
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl;
const toWsUrl = (url: string) => url.replace(/^http/, "ws");
const imageHosts = ["https://i.pravatar.cc", "https://*.r2.dev"];

// el nonce se genera por request, en next.config.js solo emite cabeceras estaticas.
function buildCsp(nonce: string) {
  const connectHosts = Array.from(
    new Set([apiUrl, socketUrl, toWsUrl(apiUrl), toWsUrl(socketUrl)])
  );

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
    // style-src usa nonce igual en desarrollo y produccion. Los style={{}} de React (tour, panel de notificaciones,
    // toast, slider) se aplican por CSSOM en el cliente, que el CSP no bloquea.
    `style-src 'self' 'nonce-${nonce}'`,
    // next/image con `fill` emite style="" en el HTML del servidor; solo se permite en atributos, no en <style>.
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: ${imageHosts.join(" ")} ${apiUrl}`,
    `connect-src 'self' ${connectHosts.join(" ")}`,
    `frame-src 'self' ${apiUrl} https://*.r2.dev blob: data:`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  request.headers.set("x-nonce", nonce);
  const locale = request.nextUrl.pathname.split("/")[1];
  request.headers.set("x-swap-locale", ["es", "en", "fr"].includes(locale) ? locale : "es");

  const authRedirect = checkAuth(request);
  const response = authRedirect ?? intlMiddleware(request);

  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  // Solo se excluyen archivos estaticos por extension al final de la ruta. Antes se excluia cualquier ruta con un
  // punto, y rutas como /es/...uvg.jpg&w=640 quedaban sin CSP (alerta de ZAP).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|map|txt|xml|woff2?|ttf|otf)$).*)",
  ],
};




  


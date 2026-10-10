import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { checkAuth } from "./proxy/authProxy";


const intlMiddleware = createIntlMiddleware({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl;

// el nonce se genera por request, en next.config.js solo emite cabeceras estaticas.
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https: blob:",
    `connect-src 'self' ${apiUrl} ${socketUrl} wss: https:`,
    `frame-src 'self' ${apiUrl} https://*.r2.dev blob: data:`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const authRedirect = checkAuth(request);
  const response = authRedirect ?? intlMiddleware(request);

  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};




  


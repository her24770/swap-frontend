import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { checkAuth } from "./proxy/authProxy";


const intlMiddleware = createIntlMiddleware({
  locales: ["es", "en", "fr"], 
  defaultLocale: "es",
});


export function proxy(request: NextRequest) {
  
  const authRedirect = checkAuth(request);
  if (authRedirect) {
    return authRedirect;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};




  


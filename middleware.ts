//middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PREVIEW_COOKIE_NAME = "credifer_preview_access";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/i.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const previewEnabled = process.env.SITE_PREVIEW_ENABLED === "true";

  if (!previewEnabled) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/acceso") ||
    pathname.startsWith("/api") ||
    isPublicAsset(pathname)
  ) {
    return NextResponse.next();
  }

  const hasPreviewAccess =
    request.cookies.get(PREVIEW_COOKIE_NAME)?.value === "ok";

  if (hasPreviewAccess) {
    return NextResponse.next();
  }

  const accessUrl = request.nextUrl.clone();
  accessUrl.pathname = "/acceso";
  accessUrl.search = "";
  accessUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/:path*"],
};

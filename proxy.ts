import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/templates/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};

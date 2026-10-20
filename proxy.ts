import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};

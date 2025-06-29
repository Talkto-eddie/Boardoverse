import { authMiddleware } from "@civic/auth-web3/nextjs/middleware"

export default authMiddleware();

export const config = {
    // include the paths you wish to secure here
    matcher: [
        /*
         * Match all request paths except:
         * - _next directory (Next.js static files)
         * - favicon.ico, sitemap.xml, robots.txt
         * - image files
         * - dashboard routes (handled by client-side auth)
         */
        '/((?!_next|favicon.ico|how-to-play|sitemap.xml|robots.txt|dashboard|.*\.jpg|.*\.png|.*\.svg|.*\.gif).*)',
    ],
}
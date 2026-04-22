import { clerkMiddleware } from '@clerk/nextjs/server'

/**
 * Phase 0 / Phase 1 scaffolding.
 *
 * Clerk middleware is wired but no routes are protected yet — the placeholder
 * home page is public. Once Phase 1 introduces /auth/sign-in and /auth/sign-up
 * pages, swap this for a `createRouteMatcher`-based protection block that
 * calls `redirectToSignIn` for everything outside the auth bucket.
 */
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/api/invitations/(.*)/accept',
])

/**
 * Dev-only bypass for the E2E harness. When the process is started with
 * `E2E_TESTING=1`, the proxy lets every route through so Playwright can
 * exercise dashboard shells without a live Clerk session. The flag is
 * ignored when NODE_ENV is `production` so prod never runs unprotected.
 */
const isE2ETestingBypass =
  process.env.E2E_TESTING === '1' && process.env.NODE_ENV !== 'production'

export default clerkMiddleware(async (auth, req) => {
  if (isE2ETestingBypass) return
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

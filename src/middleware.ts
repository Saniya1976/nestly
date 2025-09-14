import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/:username', // Profile pages are public
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
  ];

  const { pathname } = req.nextUrl;

  // Check if current path is public
  const isPublic = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path.replace('(.*)', ''))
  );

  if (!isPublic) {
    // For protected routes, use the new API
    const session = await auth();
    if (!session.userId) {
      // Handle unauthorized access
      return Response.redirect(new URL('/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
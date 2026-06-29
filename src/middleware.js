import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/api/send/sms(.*)",
  "/api/send/email(.*)",
  "/api/schedule(.*)",
  "/api/contacts(.*)",
  "/api/templates(.*)",
  "/api/logs(.*)",
  "/api/apps(.*)",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
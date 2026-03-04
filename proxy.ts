import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/auth(.*)",
  "/onboarding",
  "/api/webhooks(.*)",
  "/.well-known/assetlinks.json",
  "/regulamin.pdf",
  "/polityka-prywatnosci.pdf",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const onboardingCompleted = req.cookies.get("onboarding_completed");

  if (userId && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!userId && !isPublicRoute(req)) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    await auth.protect();
  }

  if (!userId && req.nextUrl.pathname === "/") {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.redirect(new URL("/auth/sign-up", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

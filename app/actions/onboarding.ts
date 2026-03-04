"use server";

import { cookies } from "next/headers";

export async function completeOnboardingAction() {
  const cookieStore = await cookies();
  cookieStore.set("onboarding_completed", "true", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

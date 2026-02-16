"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import EnterPassword from "./enter-password";
import SetPassword from "./set-password";
import SignIn from "./sign-in";
import SignUp from "./sign-up";
import VerifyEmail from "./verify-email";
import Welcome from "./welcome";

interface AuthClientProps {
  step: string;
}

export default function AuthClient({ step }: AuthClientProps) {
  switch (step) {
    case "sign-up":
      return <SignUp />;
    case "sign-in":
      return <SignIn />;
    case "verify-email":
      return <VerifyEmail />;
    case "set-password":
      return <SetPassword />;
    case "welcome":
      return <Welcome />;
    case "enter-password":
      return <EnterPassword />;
    case "sso-callback":
      return <AuthenticateWithRedirectCallback />;
    default:
      return <SignUp />;
  }
}

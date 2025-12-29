import BgPhotos from "./_components/bg-photos";
import { OnboardingClient } from "./_components/onboarding-client";

export default function OnboardingPage() {
  return (
    <div className="overflow-y-hidden">
      <BgPhotos />
      <OnboardingClient />
    </div>
  );
}

import { SignOutButton, UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="h-screen w-full pb-18">
      <UserProfile />
      <SignOutButton />
    </div>
  );
}

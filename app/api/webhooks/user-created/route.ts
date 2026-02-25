import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const client = await clerkClient();
  const user = await client.users.getUser((await req.json()).data.id);

  await prisma.user.create({
    data: {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      name:
        user.firstName ||
        user.username ||
        user.emailAddresses[0].emailAddress.split("@")[0],
      avatarUrl: user.imageUrl,
    },
  });

  return new Response("OK");
}

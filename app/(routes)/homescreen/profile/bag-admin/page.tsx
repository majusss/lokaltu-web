import { amIAdmin } from "@/app/actions/admin";
import { notFound } from "next/navigation";
import AdminBagPoolClient from "./_components/admin-bag-pool-client";

export default async function AdminBagPoolPage() {
  const admin = await amIAdmin();
  if (!admin) {
    notFound();
  }

  return <AdminBagPoolClient />;
}

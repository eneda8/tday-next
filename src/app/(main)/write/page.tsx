import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WriteForm from "@/components/WriteForm";

export default async function WritePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <WriteForm />;
}

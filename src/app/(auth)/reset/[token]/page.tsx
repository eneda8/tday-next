import { validateResetToken } from "@/app/actions/password-reset";
import { notFound } from "next/navigation";
import ResetForm from "./ResetForm";

interface ResetPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPage({ params }: ResetPageProps) {
  const { token } = await params;

  const { valid } = await validateResetToken(token);

  if (!valid) {
    notFound();
  }

  return <ResetForm token={token} />;
}

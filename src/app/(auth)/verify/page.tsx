import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import ResendVerification from "./ResendVerification";

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;

  // If a token is provided, try to verify
  if (token) {
    await dbConnect();

    const user = await User.findOne({
      verifyEmailToken: token,
      verifyTokenExpires: { $gt: Date.now() },
    });

    if (user) {
      user.isVerified = true;
      user.verifyEmailToken = undefined as any;
      user.verifyTokenExpires = undefined as any;
      await user.save();

      return (
        <div className="flex min-h-screen items-center justify-center paper-bg px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/" className="font-logo text-4xl text-gold hover:text-gold-hover">
                t&apos;day
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
              <i className="fas fa-check-circle text-4xl text-forest mb-4 block" />
              <h1 className="text-lg font-semibold text-warm-brown mb-2">
                Email verified!
              </h1>
              <p className="text-sm text-warm-gray mb-6">
                Your account is now active. You can start using t&apos;day.
              </p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-hover text-cream-light font-medium rounded-xl transition-colors text-sm"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Invalid or expired token
    return (
      <div className="flex min-h-screen items-center justify-center paper-bg px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-logo text-4xl text-gold hover:text-gold-hover">
              t&apos;day
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
            <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4 block" />
            <h1 className="text-lg font-semibold text-warm-brown mb-2">
              Invalid or expired link
            </h1>
            <p className="text-sm text-warm-gray mb-6">
              This verification link is no longer valid. Please request a new one.
            </p>
            <ResendVerification />
          </div>
        </div>
      </div>
    );
  }

  // No token — show the "check your email" page with resend option
  return (
    <div className="flex min-h-screen items-center justify-center paper-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-logo text-4xl text-gold hover:text-gold-hover">
            t&apos;day
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-8 text-center">
          <i className="fas fa-envelope text-4xl text-forest/60 mb-4 block" />
          <h1 className="text-lg font-semibold text-warm-brown mb-2">
            Verify your email
          </h1>
          <p className="text-sm text-warm-gray mb-6">
            We&apos;ve sent a verification link to your email address.
            Please check your inbox and click the link to activate your account.
          </p>
          <ResendVerification />
          <div className="mt-4">
            <Link
              href="/login"
              className="text-sm text-warm-gray hover:text-forest transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GalleryVerticalEnd,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";

type VerifyState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setState("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const response = await api.api.authControllerVerifyEmail({ token });
        setState("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (error: unknown) {
        setState("error");
        const apiError = error as { error?: { message?: string } };
        setMessage(
          apiError?.error?.message ||
            "Failed to verify email. The link may have expired."
        );
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-4 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="size-12 animate-spin text-muted-foreground" />
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="size-12 text-green-500" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="size-12 text-destructive" />
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </>
        )}
      </div>

      {state !== "loading" && (
        <Field>
          <Button asChild>
            <Link href="/auth/login">
              {state === "success" ? "Continue to Login" : "Back to Login"}
            </Link>
          </Button>
          {state === "error" && (
            <FieldDescription className="text-center">
              Need a new verification link?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Sign in to request one
              </Link>
            </FieldDescription>
          )}
        </Field>
      )}
    </FieldGroup>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            betracked.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="size-12 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              }
            >
              <VerifyEmailContent />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block" />
    </div>
  );
}

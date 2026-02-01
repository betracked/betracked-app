"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    // Validate form
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      await api.api.authControllerForgotPassword({ email });

      // Always show success to prevent email enumeration
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch {
      // Still show success for security (prevent email enumeration)
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;

    setIsLoading(true);
    try {
      await api.api.authControllerForgotPassword({ email: submittedEmail });
      toast.success("Reset link sent again!");
    } catch {
      toast.success("Reset link sent again!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="size-12 text-green-500" />
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a password reset link to{" "}
              <strong className="text-foreground">{submittedEmail}</strong>
            </p>
          </div>
          <Field>
            <Button asChild>
              <Link href="/auth/login">
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </Button>
            <FieldDescription className="text-center">
              Didn&apos;t receive the email?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {isLoading ? "Sending..." : "Click to resend"}
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            disabled={isLoading}
            required
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
          <FieldDescription className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 underline underline-offset-4"
            >
              <ArrowLeft className="size-3" />
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

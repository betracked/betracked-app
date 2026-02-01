"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = {
  password?: string;
  confirmPassword?: string;
};

function ResetPasswordFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordFormData>({});

  // No token provided
  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-12 text-destructive" />
            <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground text-sm">
              The password reset link is missing or invalid.
            </p>
          </div>
          <Field>
            <Button asChild>
              <Link href="/auth/forgot-password">Request new link</Link>
            </Button>
          </Field>
        </FieldGroup>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate form
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: ResetPasswordFormData = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ResetPasswordFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await api.api.authControllerResetPassword({
        token,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to login after short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      const apiError = error as { error?: { message?: string } };
      const message =
        apiError?.error?.message ||
        "Failed to reset password. The link may have expired.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="size-12 text-green-500" />
            <h1 className="text-2xl font-bold">Password Reset!</h1>
            <p className="text-muted-foreground text-sm">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
          <Field>
            <Button asChild>
              <Link href="/auth/login">Continue to Login</Link>
            </Button>
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
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your new password below
          </p>
        </div>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            required
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
          <FieldDescription>
            Must be at least 8 characters long
          </FieldDescription>
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            required
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword}</FieldError>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
          <FieldDescription className="text-center">
            Remember your password?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ResetPasswordFormContent className={className} {...props} />
    </Suspense>
  );
}

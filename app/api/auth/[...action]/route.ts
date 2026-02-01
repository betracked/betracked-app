import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "betracked_access_token";
const REFRESH_TOKEN_COOKIE = "betracked_refresh_token";

// Cookie options for security
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params;
  const actionPath = action.join("/");

  // Set tokens in cookies
  if (actionPath === "set-tokens") {
    try {
      const { accessToken, refreshToken } = await request.json();
      const cookieStore = await cookies();

      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...cookieOptions,
        maxAge: 60 * 5, // 5 minutes for access token
      });

      cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
      });

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to set tokens" },
        { status: 400 }
      );
    }
  }

  // Clear tokens from cookies
  if (actionPath === "clear-tokens") {
    const cookieStore = await cookies();

    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params;
  const actionPath = action.join("/");

  // Get tokens from cookies
  if (actionPath === "tokens") {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;

    return NextResponse.json({ accessToken, refreshToken });
  }

  // Check if user has valid tokens (for middleware)
  if (actionPath === "check") {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    return NextResponse.json({
      authenticated: !!(accessToken || refreshToken),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

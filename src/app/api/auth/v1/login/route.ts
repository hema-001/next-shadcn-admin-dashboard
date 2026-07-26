import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAME, findUserByCredentials } from "@/lib/auth";

const loginRequestSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().optional(),
});

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }

  const parsedPayload = loginRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const message = parsedPayload.error.issues[0]?.message ?? "Invalid login request.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const user = findUserByCredentials(parsedPayload.data.email, parsedPayload.data.password);

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, user.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(parsedPayload.data.remember ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
  });

  return response;
}

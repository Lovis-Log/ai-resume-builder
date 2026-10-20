import { NextResponse } from "next/server";
import { AppError, InternalError, ValidationError } from "@/lib/errors";

export function getRequestId(): string {
  return crypto.randomUUID();
}

export function errorResponse(error: unknown, requestId: string) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId,
          details: error.details ?? null,
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof Error && error.name === "ZodError") {
    const validation = new ValidationError("Invalid input");
    return NextResponse.json(
      {
        error: {
          code: validation.code,
          message: validation.message,
          requestId,
          details: null,
        },
      },
      { status: validation.status },
    );
  }

  const internal = new InternalError();
  if (process.env.NODE_ENV !== "production") {
    console.error("[api] unhandled error", { requestId, error });
  }
  return NextResponse.json(
    {
      error: {
        code: internal.code,
        message: internal.message,
        requestId,
        details: null,
      },
    },
    { status: 500 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ValidationError("Expected application/json");
  }
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
}

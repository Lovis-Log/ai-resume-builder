export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONSENT_REQUIRED"
  | "LIMIT_REACHED"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "PROVIDER_ERROR"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in to continue") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: unknown) {
    super("VALIDATION", message, 422, details);
  }
}

export class ConsentRequiredError extends AppError {
  constructor() {
    super("CONSENT_REQUIRED", "Accept the AI data processing notice to use AI features", 403);
  }
}

export class LimitReachedError extends AppError {
  readonly limit: "ai" | "pdf" | "resume";

  constructor(limit: "ai" | "pdf" | "resume", message?: string) {
    super(
      "LIMIT_REACHED",
      message ??
        (limit === "resume"
          ? "Your free plan includes one resume. Upgrade to create more."
          : limit === "pdf"
            ? "You have used all free PDF downloads. Upgrade for unlimited downloads."
            : "You have used all free AI actions. Upgrade for more."),
      402,
      { limit },
    );
    this.limit = limit;
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Try again shortly.") {
    super("RATE_LIMITED", message, 429);
  }
}

export class ConflictError extends AppError {
  constructor(message = "This resource changed in another session") {
    super("CONFLICT", message, 409);
  }
}

export class ProviderError extends AppError {
  constructor(message = "The AI provider is unavailable. Try again.") {
    super("PROVIDER_ERROR", message, 502);
  }
}

export class InternalError extends AppError {
  constructor(message = "Something went wrong") {
    super("INTERNAL", message, 500);
  }
}

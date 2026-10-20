"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>The application hit an unexpected error.</p>
        <button onClick={() => retry()}>Try again</button>
      </body>
    </html>
  );
}

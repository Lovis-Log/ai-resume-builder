import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Resume Builder — AI resumes for new grads";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f766e",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>
          Resume Builder
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 950,
            }}
          >
            A resume that gets past the bots.
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>
            Free score · AI writing · Job tailoring · ATS-safe PDF
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>
          Built for early-career candidates and new grads.
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lume — AI resumes for new grads";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          background: "linear-gradient(135deg, #6f9dd9 0%, #8d91dc 55%, #c6cdf1 100%)",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -120,
            width: 520,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Lume
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2.5,
              maxWidth: 980,
            }}
          >
            <div>Built to be read.</div>
            <div style={{ opacity: 0.76 }}>Written to be remembered.</div>
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>
            Free score · AI writing · Job tailoring · ATS-safe PDF
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", fontSize: 24, opacity: 0.72 }}>
          Built for early-career candidates and new grads.
        </div>
      </div>
    ),
    size,
  );
}

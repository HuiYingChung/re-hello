import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(212,142,97,0.30), transparent 28%), radial-gradient(circle at top right, rgba(95,138,105,0.18), transparent 24%), linear-gradient(180deg, #fbf5ee 0%, #f4ebdf 100%)",
          color: "#2f241c",
          padding: "68px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "Georgia, serif",
            fontSize: 38,
          }}
        >
          <span style={{ color: "#b16e46" }}>Re</span>
          <span style={{ color: "#b16e46", transform: "translateY(-4px)" }}>·</span>
          <span>hello</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 840 }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 74,
              lineHeight: 1.02,
            }}
          >
            GPT-5.6 turns messy memories into easier next conversations.
          </div>
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 28,
              lineHeight: 1.45,
              color: "#7e6a5c",
              maxWidth: 760,
            }}
          >
            Drop in a rough note. Rehello shapes a recall card with who they are, what mattered, and what to ask next.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
            color: "#b16e46",
          }}
        >
          <span>Powered by GPT-5.6</span>
          <span>Remember</span>
          <span>Recall</span>
        </div>
      </div>
    ),
    size
  );
}

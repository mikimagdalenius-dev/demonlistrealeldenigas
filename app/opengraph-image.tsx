import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#ecebe6",
          letterSpacing: "-2px",
          textAlign: "center",
        }}
      >
        DEMONLIST ELDENIGAS
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#e0352b",
          fontWeight: 600,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        Private Demonlist
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 18,
          color: "#8d8c88",
          fontWeight: 500,
        }}
      >
        demonlist-eldenigas.vercel.app
      </div>
    </div>,
    { ...size }
  );
}

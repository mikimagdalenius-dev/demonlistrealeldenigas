import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#1f2430",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0",
        fontSize: 104,
        fontWeight: 800,
        letterSpacing: "-4px",
      }}
    >
      D
    </div>,
    { ...size }
  );
}

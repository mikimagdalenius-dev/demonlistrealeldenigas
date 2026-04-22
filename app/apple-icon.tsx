import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1f2430",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 32,
            background:
              "linear-gradient(135deg, #8fc4ea 0%, #4a8ac9 55%, #3b5ea8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0b1220",
            fontSize: 82,
            fontWeight: 900,
            letterSpacing: -3,
          }}
        >
          D
        </div>
      </div>
    ),
    { ...size },
  );
}

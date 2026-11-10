import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { youtubeThumbnail } from "@/lib/youtube";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Demonlist Eldenigas";
// Se regenera como las páginas públicas: así el #01 de la imagen sigue al de la lista.
export const revalidate = 60;

const CODE = ["#7a7a7a", "#5b8cff", "#e8b923", "#e0352b", "#ecebe6"];

export default async function OgImage() {
  let top: { name: string; thumb: string } | null = null;
  try {
    const d = await prisma.demon.findFirst({
      orderBy: { position: "asc" },
      select: { name: true, videoUrl: true, thumbnailVideoUrl: true },
    });
    if (d) top = { name: d.name, thumb: youtubeThumbnail(d.thumbnailVideoUrl || d.videoUrl).replace("hqdefault", "mqdefault") };
  } catch (err) {
    console.error("[opengraph-image] fallo cargando el #01", err);
  }

  return new ImageResponse(
    <div style={{ background: "#0a0a0a", width: "100%", height: "100%", display: "flex", padding: 56, gap: 48 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 26, letterSpacing: 8, color: "#ecebe6", fontWeight: 600 }}>DEMONLIST ELDENIGAS</div>
          <div style={{ display: "flex", gap: 8 }}>
            {CODE.map((c) => (
              <div key={c} style={{ width: 40, height: 14, background: c }} />
            ))}
          </div>
        </div>
        {top ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 150, lineHeight: 1, color: "#e0352b", fontWeight: 300 }}>#01</div>
            <div style={{ fontSize: 44, letterSpacing: 4, color: "#ecebe6", fontWeight: 600 }}>{top.name.toUpperCase()}</div>
          </div>
        ) : (
          <div style={{ fontSize: 40, color: "#e0352b", letterSpacing: 4 }}>PRIVATE DEMONLIST</div>
        )}
      </div>
      {top && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={top.thumb} width={600} height={338} style={{ alignSelf: "center", border: "1px solid #444" }} />
      )}
    </div>,
    { ...size }
  );
}

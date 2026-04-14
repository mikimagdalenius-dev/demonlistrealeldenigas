import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  logoutAction,
  deleteDemonAction,
  deleteCompletionAction,
  deleteProgressAction,
} from "./actions";
import { safeHref } from "@/lib/url";
import { LoginForm } from "./login-form";
import { DemonDragList } from "./demon-drag-list";
import { ConfirmDeleteBtn } from "./confirm-delete-btn";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthed();

  if (!authed) {
    return <LoginForm />;
  }

  const [demons, completions, progresses] = await Promise.all([
    prisma.demon.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: { select: { completions: true } },
      },
    }),
    prisma.completion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        demon: { select: { name: true, position: true } },
        player: { select: { name: true } },
      },
    }),
    prisma.progress.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        demon: { select: { name: true, position: true } },
        player: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#1f2430" }}>
          Panel de Admin
        </div>
        <form action={logoutAction}>
          <button type="submit" className="pc-btn pc-btn-secondary" style={{ fontSize: 13 }}>
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* ── Demons ── */}
      <section>
        <div style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, color: "#2f3440" }}>
          Demonios ({demons.length})
        </div>
        <DemonDragList
          initialDemons={demons.map((d) => ({
            id: d.id,
            position: d.position,
            name: d.name,
            publisherName: d.publisherName,
            completionCount: d._count.completions,
          }))}
          deleteAction={deleteDemonAction}
        />
      </section>

      {/* ── Completions ── */}
      <section>
        <div style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, color: "#2f3440" }}>
          Completaciones ({completions.length})
        </div>

        <div className="pc-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #d4d4d4", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Demonio</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Jugador</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Vídeo</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", width: 100 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {completions.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px dashed #e8e8e8" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                      #{c.demon.position} — {c.demon.name}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4b5563" }}>{c.player.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {c.videoUrl ? (
                        <a href={safeHref(c.videoUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                          Ver vídeo
                        </a>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: 13 }}>Sin vídeo</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <ConfirmDeleteBtn
                        action={deleteCompletionAction.bind(null, c.id)}
                        confirmMsg={`¿Borrar la completación de ${c.player.name} en ${c.demon.name}?`}
                      />
                    </td>
                  </tr>
              ))}
              {completions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 12px", color: "#6b7280", textAlign: "center" }}>
                    No hay completaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Progress ── */}
      <section>
        <div style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, color: "#2f3440" }}>
          Progreso ({progresses.length})
        </div>

        <div className="pc-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #d4d4d4", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Demonio</th>
                <th style={{ padding: "10px 12px", fontWeight: 700 }}>Jugador</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center", width: 80 }}>%</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", width: 100 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {progresses.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px dashed #e8e8e8" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                      #{p.demon.position} — {p.demon.name}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4b5563" }}>{p.player.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>
                      {p.percentage}%
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <ConfirmDeleteBtn
                        action={deleteProgressAction.bind(null, p.id)}
                        confirmMsg={`¿Borrar el progreso de ${p.player.name} en ${p.demon.name}?`}
                      />
                    </td>
                  </tr>
              ))}
              {progresses.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 12px", color: "#6b7280", textAlign: "center" }}>
                    No hay registros de progreso.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

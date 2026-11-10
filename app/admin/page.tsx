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
        <h1 className="pc-demon-title">Panel de Admin</h1>
        <form action={logoutAction}>
          <button type="submit" className="pc-btn pc-btn-secondary pc-btn-small">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* ── Demons ── */}
      <section>
        <div className="pc-section-head pc-caps">
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
        <div className="pc-section-head pc-caps">
          Completaciones ({completions.length})
        </div>

        <div className="pc-card" style={{ overflowX: "auto" }}>
          <table className="pc-table">
            <thead>
              <tr>
                <th>Demonio</th>
                <th>Jugador</th>
                <th>Vídeo</th>
                <th className="is-right" style={{ width: 100 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {completions.map((c) => (
                  <tr key={c.id}>
                    <td className="is-strong">
                      #{c.demon.position} — {c.demon.name}
                    </td>
                    <td className="is-muted">{c.player.name}</td>
                    <td>
                      {c.videoUrl ? (
                        <a href={safeHref(c.videoUrl)} target="_blank" rel="noreferrer">
                          Ver vídeo
                        </a>
                      ) : (
                        <span className="is-muted">Sin vídeo</span>
                      )}
                    </td>
                    <td className="is-right">
                      <ConfirmDeleteBtn
                        action={deleteCompletionAction.bind(null, c.id)}
                        confirmMsg={`¿Borrar la completación de ${c.player.name} en ${c.demon.name}?`}
                      />
                    </td>
                  </tr>
              ))}
              {completions.length === 0 && (
                <tr>
                  <td colSpan={4} className="pc-empty">
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
        <div className="pc-section-head pc-caps">
          Progreso ({progresses.length})
        </div>

        <div className="pc-card" style={{ overflowX: "auto" }}>
          <table className="pc-table">
            <thead>
              <tr>
                <th>Demonio</th>
                <th>Jugador</th>
                <th className="is-center" style={{ width: 80 }}>%</th>
                <th className="is-right" style={{ width: 100 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {progresses.map((p) => (
                  <tr key={p.id}>
                    <td className="is-strong">
                      #{p.demon.position} — {p.demon.name}
                    </td>
                    <td className="is-muted">{p.player.name}</td>
                    <td className="is-center pc-pct">
                      {p.percentage}%
                    </td>
                    <td className="is-right">
                      <ConfirmDeleteBtn
                        action={deleteProgressAction.bind(null, p.id)}
                        confirmMsg={`¿Borrar el progreso de ${p.player.name} en ${p.demon.name}?`}
                      />
                    </td>
                  </tr>
              ))}
              {progresses.length === 0 && (
                <tr>
                  <td colSpan={4} className="pc-empty">
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

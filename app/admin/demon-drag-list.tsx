"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderDemonsAction } from "./actions";

type Demon = {
  id: number;
  position: number;
  name: string;
  publisherName: string;
  completionCount: number;
};

type AdminResult = { ok: true } | { ok: false; error: string };

function SortableRow({
  demon,
  onDelete,
  disabled,
}: {
  demon: Demon;
  onDelete: (id: number) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: demon.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "var(--raise)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="is-muted pc-num">
        {demon.position}
      </td>
      <td style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/*
          Render como <button> para que el KeyboardSensor de dnd-kit lo
          enfoque con Tab. Tras enfocarlo, Espacio activa el drag y las
          flechas mueven el item; Espacio otra vez confirma o Esc cancela.
        */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar ${demon.name}`}
          title="Arrastrar o pulsar Espacio + flechas para reordenar"
          className="pc-drag-handle"
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" /><circle cx="9" cy="13" r="1.5" />
          </svg>
        </button>
      </td>
      <td className="is-strong">{demon.name}</td>
      <td className="is-muted">{demon.publisherName}</td>
      <td className="is-center is-muted pc-num">
        {demon.completionCount}
      </td>
      <td className="is-right">
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Link
            href={`/admin/demon/${demon.id}`}
            className="pc-btn pc-btn-secondary pc-btn-small"
          >
            Editar
          </Link>
          <button
            onClick={() => {
              if (window.confirm(`¿Borrar "${demon.name}" y todas sus completaciones?`)) {
                onDelete(demon.id);
              }
            }}
            className="pc-btn pc-btn-danger pc-btn-small"
          >
            Borrar
          </button>
        </div>
      </td>
    </tr>
  );
}

export function DemonDragList({
  initialDemons,
  deleteAction,
}: {
  initialDemons: Demon[];
  deleteAction: (id: number) => Promise<AdminResult>;
}) {
  const [demons, setDemons] = useState(initialDemons);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    // Si hay un reorden/delete en vuelo, ignorar drags nuevos — evita que
    // el índice local se desincronice del servidor al arrastrar rápido.
    if (isPending) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = demons;
    const oldIndex = demons.findIndex((d) => d.id === active.id);
    const newIndex = demons.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(demons, oldIndex, newIndex).map((d, i) => ({
      ...d,
      position: i + 1,
    }));

    setDemons(reordered);
    startTransition(async () => {
      const result = await reorderDemonsAction(reordered.map((d) => d.id));
      if (!result.ok) {
        // Revertir el orden local si el servidor rechazó el cambio (sesión
        // expirada, fallo de DB, etc.).
        setDemons(previous);
        window.alert(result.error);
      }
    });
  }

  function handleDelete(id: number) {
    const previous = demons;
    startTransition(async () => {
      const result = await deleteAction(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      setDemons(
        previous.filter((d) => d.id !== id).map((d, i) => ({ ...d, position: i + 1 })),
      );
    });
  }

  return (
    <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
      <div className="pc-card" style={{ overflowX: "auto" }}>
        <table className="pc-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th style={{ width: 36 }} />
              <th>Nombre</th>
              <th>Publisher</th>
              <th className="is-center" style={{ width: 90 }}>Completes</th>
              <th className="is-right" style={{ width: 180 }}>Acciones</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={demons.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {demons.map((demon) => (
                  <SortableRow
                    key={demon.id}
                    demon={demon}
                    onDelete={handleDelete}
                    disabled={isPending}
                  />
                ))}
                {demons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="pc-empty">
                      No hay demonios.
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}

"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
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

function SortableRow({
  demon,
  onDelete,
}: {
  demon: Demon;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: demon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "var(--drag-bg, #eef1f4)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={{ ...style, borderBottom: "1px dashed #e8e8e8" }}>
      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#4b5563" }}>
        {demon.position}
      </td>
      <td style={{ padding: "10px 0 10px 4px" }}>
        <span
          {...attributes}
          {...listeners}
          title="Arrastrar para reordenar"
          style={{
            cursor: "grab",
            fontSize: 16,
            color: "#9ca3af",
            padding: "0 8px",
            userSelect: "none",
            display: "inline-block",
          }}
        >
          ⠿
        </span>
      </td>
      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{demon.name}</td>
      <td style={{ padding: "10px 12px", color: "#4b5563" }}>{demon.publisherName}</td>
      <td style={{ padding: "10px 12px", textAlign: "center", color: "#4b5563" }}>
        {demon.completionCount}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Link
            href={`/admin/demon/${demon.id}`}
            className="pc-btn pc-btn-secondary"
            style={{ padding: "5px 10px", fontSize: 13, display: "inline-block" }}
          >
            Editar
          </Link>
          <button
            onClick={() => {
              if (window.confirm(`¿Borrar "${demon.name}" y todas sus completaciones?`)) {
                onDelete(demon.id);
              }
            }}
            style={{
              border: "1px dashed #c0392b",
              background: "#e74c3c",
              color: "#fff",
              fontWeight: 700,
              padding: "5px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
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
  deleteAction: (id: number) => Promise<void>;
}) {
  const [demons, setDemons] = useState(initialDemons);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = demons.findIndex((d) => d.id === active.id);
    const newIndex = demons.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(demons, oldIndex, newIndex).map((d, i) => ({
      ...d,
      position: i + 1,
    }));

    setDemons(reordered);
    startTransition(async () => {
      await reorderDemonsAction(reordered.map((d) => d.id));
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAction(id);
      setDemons((prev) => {
        const filtered = prev.filter((d) => d.id !== id);
        return filtered.map((d, i) => ({ ...d, position: i + 1 }));
      });
    });
  }

  return (
    <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
      <div className="pc-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #d4d4d4", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", fontWeight: 700, width: 50 }}>#</th>
              <th style={{ width: 36 }} />
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>Nombre</th>
              <th style={{ padding: "10px 12px", fontWeight: 700 }}>Publisher</th>
              <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center", width: 90 }}>Completes</th>
              <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", width: 180 }}>Acciones</th>
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
                  />
                ))}
                {demons.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px 12px", color: "#6b7280", textAlign: "center" }}>
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

// Validadores de inputs de formulario compartidos entre las server actions
// públicas (submit/) y privadas (admin/). Mantenerlos aquí evita drift cuando
// se cambian los límites — antes había una copia en cada actions.ts.

export const MAX_NAME_LEN = 100;
export const MAX_URL_LEN = 500;

export function toPositiveInt(
  value: FormDataEntryValue | null,
  fieldName: string,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

export function toPercentInt(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error("Percentage must be between 1 and 100");
  }
  return parsed;
}

// El select del form usa el sentinel "__new__" cuando el usuario quiere
// crear un jugador nuevo. En ese caso el valor real está en `newPlayerName`.
export function resolvePlayerName(
  selectedPlayer: string,
  newPlayerName: string,
): string {
  return selectedPlayer === "__new__"
    ? newPlayerName.trim()
    : selectedPlayer.trim();
}

import type { ReactNode } from "react";

export const CONTROL_CLASS =
  "mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 py-2 aria-[invalid=true]:border-2 aria-[invalid=true]:border-error";

export interface ControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Nhận các thuộc tính cần gắn vào ô nhập để label, gợi ý và lỗi nối đúng. */
  children: (control: ControlProps) => ReactNode;
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <p id={hintId} className="mt-1 text-[15px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-error">
          {error}
        </p>
      )}
    </div>
  );
}

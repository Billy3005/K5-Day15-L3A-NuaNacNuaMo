import type { ReactNode } from "react";

export const CONTROL_CLASS =
  "mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[16px] text-ink placeholder:text-faint transition-colors hover:border-faint focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-soft/40 aria-[invalid=true]:focus:ring-error/15";

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
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={errorId} className="mt-1.5 text-[15px] font-semibold text-error">
          {error}
        </p>
      ) : null}
      {hint && (
        <p id={hintId} className="mt-1.5 text-[14px] leading-snug text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

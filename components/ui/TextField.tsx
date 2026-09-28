import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-xs tracking-wide uppercase" style={{ color: "var(--astralia-lilac)" }}>
        {label}
      </span>
      <input
        ref={ref}
        id={inputId}
        className={`rounded-2xl px-4 py-3 text-sm outline-none ${className}`}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${error ? "var(--astralia-alert)" : "rgba(255,255,255,0.2)"}`,
          color: "var(--astralia-text)",
        }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: "var(--astralia-alert)" }}>
          {error}
        </span>
      )}
    </label>
  );
});

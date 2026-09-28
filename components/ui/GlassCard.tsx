import type { HTMLAttributes } from "react";

export function GlassCard({ className = "", style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl p-6 backdrop-blur-md ${className}`}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(232,217,181,0.35)",
        ...style,
      }}
      {...props}
    />
  );
}

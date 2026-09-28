import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function GoldButton({ variant = "primary", className = "", style, disabled, ...props }: Props) {
  const base = "rounded-full font-bold text-sm px-6 py-4 transition-opacity disabled:opacity-50";

  const variantStyle =
    variant === "primary"
      ? {
          background: "linear-gradient(135deg,#E8D9B5,#C9A86B)",
          color: "#241A3D",
        }
      : {
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "var(--astralia-text)",
        };

  return (
    <button
      className={`${base} ${className}`}
      style={{ ...variantStyle, ...style }}
      disabled={disabled}
      {...props}
    />
  );
}

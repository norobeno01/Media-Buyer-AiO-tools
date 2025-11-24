"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Button({
  variant = "secondary",
  size = "sm",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 font-medium";
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500 shadow-sm hover:shadow",
    secondary:
      "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 focus:ring-zinc-400",
    ghost:
      "bg-transparent text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 focus:ring-zinc-400",
    destructive:
      "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500 shadow-sm hover:shadow",
  };
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-3",
  };
  const disabledStyle = disabled || loading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      className={[base, variants[variant], sizes[size], disabledStyle, className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
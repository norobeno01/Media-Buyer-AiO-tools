"use client";

import React from "react";

type CardProps = React.PropsWithChildren<{
  title?: string;
  className?: string;
  variant?: "default" | "gradient" | "elevated" | "modern" | "glass";
  icon?: string;
}>;

export default function Card({ title, className = "", variant = "default", icon, children }: CardProps) {
  const baseClasses = "rounded-3xl transition-all duration-300 ease-in-out overflow-hidden";
  
  const variantClasses = {
    default: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-modern hover:shadow-modern-lg",
    gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-modern-lg hover:shadow-glow",
    elevated: "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-modern-lg hover:shadow-glow",
    modern: "bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-modern hover:shadow-modern-lg",
    glass: "bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 shadow-modern-lg hover:shadow-glow",
  };

  const titleClasses = {
    default: "text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3",
    gradient: "text-2xl font-bold text-white mb-6 flex items-center gap-3",
    elevated: "text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3",
    modern: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3",
    glass: "text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent mb-6 flex items-center gap-3",
  };

  return (
    <section className={[baseClasses, variantClasses[variant], className].join(" ")}> 
      <div className="p-8">
        {title && (
          <h2 className={titleClasses[variant]}>
            {icon && <span className="text-3xl">{icon}</span>}
            {title}
          </h2>
        )}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
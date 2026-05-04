"use client";

import { useParallax } from "@/hooks/useParallax";

import type { CSSProperties } from "react";

interface HeroParallaxProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
}

export function HeroParallax({ children, className, intensity = 15, style }: HeroParallaxProps) {
  const { ref, transform } = useParallax({ intensity });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}
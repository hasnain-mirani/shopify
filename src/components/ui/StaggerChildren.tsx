"use client";

import { ReactNode, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  animationClass?: string;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
  baseDelay = 0,
  animationClass = "animate-fade-slide-up",
}: StaggerChildrenProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className={cn(className)}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const delay = baseDelay + index * staggerDelay;

        return cloneElement(child as React.ReactElement, {
          style: {
            ...(child.props.style || {}),
            animationDelay: `${delay}s`,
          },
          className: cn(animationClass, child.props.className),
        });
      })}
    </div>
  );
}
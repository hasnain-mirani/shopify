"use client";

import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  intensity?: number;
  disabled?: boolean;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { intensity = 20, disabled = false } = options;
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Calculate normalized values (-1 to 1)
      const normalizedX = mouseX / (window.innerWidth / 2);
      const normalizedY = mouseY / (window.innerHeight / 2);

      // Apply intensity
      const targetX = normalizedX * intensity;
      const targetY = normalizedY * intensity;

      // Smooth animation using requestAnimationFrame
      const animate = () => {
        setTransform((prev) => ({
          x: prev.x + (targetX - prev.x) * 0.1,
          y: prev.y + (targetY - prev.y) * 0.1,
        }));
        requestRef.current = requestAnimationFrame(animate);
      };

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Smooth return to center
      const animateBack = () => {
        setTransform((prev) => ({
          x: prev.x * 0.9,
          y: prev.y * 0.9,
        }));
        if (Math.abs(transform.x) > 0.1 || Math.abs(transform.y) > 0.1) {
          requestRef.current = requestAnimationFrame(animateBack);
        }
      };
      requestRef.current = requestAnimationFrame(animateBack);
    };

    window.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [intensity, disabled]);

  return { ref, transform };
}
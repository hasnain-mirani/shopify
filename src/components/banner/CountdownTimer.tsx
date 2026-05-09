"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function parseFlashSaleEndMs(): number {
  const raw = process.env.NEXT_PUBLIC_FLASH_SALE_END?.trim();
  if (raw) {
    const t = Date.parse(raw);
    if (!Number.isNaN(t)) return t;
  }
  return Date.now() + 24 * 60 * 60 * 1000;
}

function CountdownUnit({
  value,
  label,
  flipped,
  reduceMotion,
}: {
  value: number;
  label: string;
  flipped: boolean;
  reduceMotion: boolean;
}) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-0.5 md:gap-1">
      <div
        className={cn(
          "rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-1.5 tabular-nums backdrop-blur-md [perspective:400px] md:px-[18px] md:py-2.5",
          !reduceMotion && flipped && "flash-sale-digit-flip",
        )}
      >
        <span className="inline-block text-xl font-bold leading-none text-[#f5a623] md:text-[26px]">
          {str}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ reduceMotion }: { reduceMotion: boolean }) {
  const endMs = useRef(parseFlashSaleEndMs());
  const [now, setNow] = useState(() => Date.now());
  const [colonOn, setColonOn] = useState(true);
  const prevHRef = useRef<number | null>(null);
  const prevMRef = useRef<number | null>(null);
  const prevSRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setColonOn((c) => !c), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Math.max(0, endMs.current - now);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  const hFlipped =
    !reduceMotion && prevHRef.current !== null && prevHRef.current !== h;
  const mFlipped =
    !reduceMotion && prevMRef.current !== null && prevMRef.current !== m;
  const sFlipped =
    !reduceMotion && prevSRef.current !== null && prevSRef.current !== s;

  prevHRef.current = h;
  prevMRef.current = m;
  prevSRef.current = s;

  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5 [perspective:500px] md:justify-start md:gap-2">
      <CountdownUnit
        value={h}
        label="Hours"
        flipped={hFlipped}
        reduceMotion={reduceMotion}
      />
      <span
        className={cn(
          "mb-5 px-0.5 text-lg font-bold text-[#f5a623] md:mb-8 md:text-2xl",
          colonOn ? "opacity-100" : "opacity-35",
        )}
      >
        :
      </span>
      <CountdownUnit
        value={m}
        label="Mins"
        flipped={mFlipped}
        reduceMotion={reduceMotion}
      />
      <span
        className={cn(
          "mb-5 px-0.5 text-lg font-bold text-[#f5a623] md:mb-8 md:text-2xl",
          colonOn ? "opacity-100" : "opacity-35",
        )}
      >
        :
      </span>
      <CountdownUnit
        value={s}
        label="Secs"
        flipped={sFlipped}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

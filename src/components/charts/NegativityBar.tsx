import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface NegativityBarProps {
  score: number;              // score untuk negativity (pakai lowest)
  maxScore: number;           // skor tertinggi semua komponen
  gender?: "male" | "female"; // untuk header image
  animated?: boolean;
  className?: string;
}

export const NegativityBar = ({
  score,
  maxScore,
  gender = "female",
  animated = true,
  className,
}: NegativityBarProps) => {

  // Prevent divide-by-zero
  const safeMax = Math.max(maxScore, 1);

  // Normalize score: 0 → 0 | highest → 1.0
  const normalized = Math.min(score / safeMax, 1);

  // Position of dot:
  // normalized = 1.0 → position = 0% (Normal zone)
  // normalized = 0.0 → position = 75% (High zone)
  const targetPos = (1 - normalized) * 75;

  const [displayPosition, setDisplayPosition] = useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayPosition(targetPos);
      return;
    }
    const t = setTimeout(() => setDisplayPosition(targetPos), 120);
    return () => clearTimeout(t);
  }, [targetPos, animated]);

  // Gender-based image
  const imgSrc =
    gender === "male"
      ? "/assets/wellness-male.png"
      : "/assets/wellness-female.png";

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)}>

      {/* Header Image */}
      <div className="overflow-hidden rounded-2xl">
        <img
          src={imgSrc}
          alt="Session Illustration"
          className="w-full h-auto object-cover opacity-95"
        />
      </div>

      {/* Title */}
      <h3 className="text-base font-medium text-foreground tracking-tight">
        Negativity Level
      </h3>

      {/* Bar + Indicator */}
      <div className="relative pt-6 pb-1">

        {/* Dot indicator */}
        <div
          className={cn(
            "absolute -top-1 -translate-x-1/2 z-10 transition-all duration-700 ease-out"
          )}
          style={{ left: `${displayPosition}%` }}
        >
          <div className="w-5 h-5 rounded-full bg-background border-2 border-white shadow-lg ring-2 ring-white/30 flex items-center justify-center">
            {/* inner dot */}
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-foreground/40 to-foreground/70" />
          </div>
          <div className="w-px h-2 bg-foreground/20 mx-auto" />
        </div>

        {/* Gradient Bar */}
        <div className="rounded-full bg-card shadow-sm border border-border/40 p-[3px]">
          <div
            className={cn(
              "w-full h-[8px] rounded-full bg-gradient-to-r",
              "from-[#4ade80]",
              "via-[#facc15] via-40%",
              "via-[#fb923c] via-70%",
              "to-[#ef4444]",
              "relative overflow-hidden"
            )}
          >
            {/* glossy highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2" />
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs text-muted-foreground text-center">
        Higher score = healthier
      </p>
    </div>
  );
};

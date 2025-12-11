import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Only JPEG images — clean & safe for Vercel
import maleImg from "@/assets/wellness-male.jpeg";
import femaleImg from "@/assets/wellness-female.jpeg";

export interface NegativityBarProps {
  score: number;        // lowest component score
  maxScore?: number;    // highest component score
  gender?: "male" | "female";
  animated?: boolean;
  showImage?: boolean;
  className?: string;
}

export const NegativityBar = ({
  score,
  maxScore,
  gender = "female",
  animated = true,
  showImage = true,
  className,
}: NegativityBarProps) => {

  // --- AUTO SCALE ---
  const safeMax = Math.max(maxScore ?? score, 1);
  const normalized = Math.min(score / safeMax, 1);

  // Max score → NORMAL area (25%)
  // Min score → HIGH area   (100%)
  const targetPosition = 25 + (1 - normalized) * 75;

  const [displayPosition, setDisplayPosition] = useState(
    animated ? 0 : targetPosition
  );

  useEffect(() => {
    if (!animated) {
      setDisplayPosition(targetPosition);
      return;
    }
    const timer = setTimeout(() => setDisplayPosition(targetPosition), 150);
    return () => clearTimeout(timer);
  }, [targetPosition, animated]);

  // CLEAN IMAGE PICKER — no PNG
  const imgSrc = gender === "male" ? maleImg : femaleImg;

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)}>

      {/* === YOUR LEVEL (always top layer) === */}
      <div
        className="relative z-[9999] flex justify-center pointer-events-none"
      >
        <div
          className="absolute -top-6 -translate-x-1/2 text-xs font-medium text-foreground select-none"
          style={{ left: `${displayPosition}%` }}
        >
          Your Level
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-medium text-foreground tracking-tight px-1 text-center">
        Inner Challenge Level
      </h3>

      {/* Header Image */}
      {showImage && (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imgSrc}
            alt="Wellness illustration"
            className="w-full h-auto object-cover opacity-90"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 px-1">

        {/* --- BAR AREA --- */}
        <div className="relative h-4">

          {/* Background bar */}
          <div className="absolute inset-0 bg-card shadow-sm border border-border/50 rounded-full p-0.5">
            <div
              className="w-full h-full rounded-full shadow-inner bg-gradient-to-r 
                from-[#4ade80]
                via-[#facc15] via-40%
                via-[#fb923c] via-70%
                to-[#ef4444]
                relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2" />
            </div>
          </div>

          {/* Dot */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20",
              animated && "transition-all duration-700 ease-out"
            )}
            style={{ left: `${displayPosition}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-white border-2 border-white shadow-lg ring-1 ring-black/10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-3 text-xs text-muted-foreground select-none">
          <span>low</span>
          <span>normal</span>
          <span>medium</span>
          <span>high</span>
        </div>
      </div>
    </div>
  );
};

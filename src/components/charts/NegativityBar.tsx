import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface NegativityBarProps {
  score: number;
  maxScore: number;
  gender?: "male" | "female";
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
  // Normalization
  const safeMax = Math.max(maxScore, 1);
  const normalized = Math.min(score / safeMax, 1);

  // Dot cap at Normal zone (75%)
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

  // Gender-based image import
  const imgSrc =
    gender === "male"
      ? "/assets/wellness-male.jpeg"
      : "/assets/wellness-female.jpeg";

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)}>

      {/* Header image */}
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
      <div className="relative pt-10 pb-2">

        {/* === YOUR LEVEL LABEL ABOVE DOT === */}
        <div
          className="absolute -top-8 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap"
          style={{ left: `${displayPosition}%` }}
        >
          Your Level
        </div>

        {/* Vertical line */}
        <div
          className="absolute -top-3 -translate-x-1/2 text-foreground"
          style={{ left: `${displayPosition}%` }}
        >
          |
        </div>

        {/* Dot indicator */}
        <div
          className={cn(
            "absolute -top-1 -translate-x-1/2 z-10 transition-all duration-700 ease-out"
          )}
          style={{ left: `${displayPosition}%` }}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-lg border border-white/60 flex items-center justify-center">
            {/* inner white dot */}
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Gradient bar */}
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
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2" />
          </div>
        </div>

      </div>

      {/* === LEVEL LABELS UNDER BAR === */}
      <div className="flex justify-between text-[11px] text-muted-foreground px-1 select-none">
        <span>Low</span>
        <span>Normal</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
};

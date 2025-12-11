import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import maleImg from "@/assets/wellness-male.jpg";
import femaleImg from "@/assets/wellness-female.jpg";

export interface NegativityBarProps {
  score: number;
  maxScore?: number;
  gender?: "male" | "female"; // optional now
  animated?: boolean;
  showImage?: boolean;
  className?: string;
}

export const NegativityBar = ({
  score,
  maxScore,
  gender,
  animated = true,
  showImage = true,
  className,
}: NegativityBarProps) => {

  // ----------------------------
  // GET GENDER FROM SESSION STORAGE
  // ----------------------------
  const storedGender = sessionStorage.getItem("gender") as "male" | "female" | null;

  // Priority:
  // 1. Prop gender (if provided)
  // 2. SessionStorage gender
  // 3. Default to "female"
  const finalGender =
    gender ??
    storedGender ??
    "female";

  // ----------------------------
  // AUTO SCALE LOGIC
  // ----------------------------
  const safeMax = Math.max(maxScore ?? score, 1);
  const normalized = Math.min(score / safeMax, 1);
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

  // ----------------------------
  // IMAGE BASED ON GENDER
  // ----------------------------
  const imgSrc = finalGender === "male" ? maleImg : femaleImg;

  // Prevent capsule hitting edges
  const clampedLabelPos = Math.max(5, Math.min(displayPosition, 95));

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)}>

      {/* Title */}
      <h3 className="text-base font-medium text-foreground tracking-tight px-1 text-center">
        Inner Challenge Level
      </h3>

      {/* Header Image */}
      {showImage && (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imgSrc}
            alt="User Profile Mood"
            className="w-full h-auto object-cover opacity-90"
          />
        </div>
      )}

      {/* Bar Section */}
      <div className="px-1 mt-1">

        <div className="relative pt-8 pb-2">

          {/* Capsule */}
          <div
            className="absolute -top-5 -translate-x-1/2 z-[999]"
            style={{ left: `${clampedLabelPos}%` }}
          >
            <div className="
              bg-card/95
              backdrop-blur-sm
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              border
              border-border
              shadow
              whitespace-nowrap
              min-w-[70px]
              text-center
            ">
              Your Level
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
            <div className="
              w-6 h-6 rounded-full bg-white border-2 border-white shadow-lg
              ring-1 ring-black/10 flex items-center justify-center
            ">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Bar */}
          <div className="absolute inset-x-0 top-3 h-4">
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
          </div>

        </div>

        {/* Level Labels */}
        <div className="flex justify-between mt-5 text-xs text-muted-foreground select-none">
          <span>low</span>
          <span>normal</span>
          <span>medium</span>
          <span>high</span>
        </div>
      </div>

    </div>
  );
};

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import maleImg from "@/assets/wellness-male.jpg";
import femaleImg from "@/assets/wellness-female.jpg";

export interface NegativityBarProps {
  score: number;
  maxScore?: number;
  gender?: "male" | "female";
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

  // ==============================
  // SAFE GENDER SOURCE
  // ==============================
  const [finalGender, setFinalGender] = useState<"male" | "female">("female");

  useEffect(() => {
    const stored = sessionStorage.getItem("gender") as "male" | "female" | null;

    if (gender) {
      setFinalGender(gender);
    } else if (stored) {
      setFinalGender(stored);
    }
  }, [gender]);

  // ==============================
  // BAR POSITION LOGIC
  // ==============================
  const safeMax = Math.max(maxScore ?? score, 1);
  const normalized = Math.min(score / safeMax, 1);

  // Normal zone = 25%
  const targetPosition = 25 + (1 - normalized) * 75;

  const [displayPosition, setDisplayPosition] = useState(
    animated ? 0 : targetPosition
  );

  useEffect(() => {
    if (!animated) {
      setDisplayPosition(targetPosition);
      return;
    }
    const t = setTimeout(() => setDisplayPosition(targetPosition), 150);
    return () => clearTimeout(t);
  }, [targetPosition, animated]);

  const imgSrc = finalGender === "male" ? maleImg : femaleImg;

  // Safe position for capsule
  const clampedLabelPos = Math.max(5, Math.min(displayPosition, 95));

  // ==============================
  // DETERMINE LEVEL TEXT
  // ==============================
  let levelTitle = "";
  let levelBody = "";

  if (displayPosition <= 35) {
    levelTitle = "Normal Level";
    levelBody =
      "Your mind is currently stable, handling everyday challenges smoothly. Let’s take a closer look at the key components shaping this stability and uncover your potential.";
  } else if (displayPosition <= 70) {
    levelTitle = "Medium Level";
    levelBody =
      "You experience some inner tension that might slow you down, but your strengths help you cope. Let’s see which components are supporting you and which ones create the most friction.";
  } else {
    levelTitle = "High Level";
    levelBody =
      "Your inner landscape is heavily challenged, signaling areas ripe for meaningful development. Let’s find the components that support you and the key growth opportunity that will make the biggest impact.";
  }

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)}>

      {/* TITLE */}
      <h3 className="text-base font-medium text-foreground text-center px-1">
        Inner Challenge Level
      </h3>

      {/* IMAGE */}
      {showImage && (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={imgSrc}
            alt="Profile"
            className="w-full h-auto object-cover opacity-90"
          />
        </div>
      )}

      {/* ==== BAR AREA ==== */}
      <div className="px-1 mt-1">
        <div className="relative pt-8 pb-2">

          {/* CAPSULE (Your Level) */}
          <div
            className="absolute -top-5 -translate-x-1/2 z-[999]"
            style={{ left: `${clampedLabelPos}%` }}
          >
            <div className="bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-border shadow whitespace-nowrap min-w-[70px] text-center">
              Your Level
            </div>
          </div>

          {/* DOT */}
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

          {/* GRADIENT BAR */}
          <div className="absolute inset-x-0 top-3 h-4">
            <div className="absolute inset-0 bg-card border border-border/50 rounded-full p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-gradient-to-r 
                  from-[#4ade80]
                  via-[#facc15] via-40%
                  via-[#fb923c] via-70%
                  to-[#ef4444]
                  shadow-inner relative overflow-hidden
                ">
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2" />
              </div>
            </div>
          </div>

        </div>

        {/* LABELS */}
        <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground select-none">
          <span>Low</span>
          <span>Normal</span>
          <span>Medium</span>
          <span>High</span>
        </div>

        {/* ==== LEVEL DESCRIPTION BOX ==== */}
        <div className="mt-4 px-1">
          <div className="bg-card/70 border border-border/40 rounded-xl p-4 shadow-sm space-y-1">
            <p className="text-foreground font-semibold text-sm">{levelTitle}</p>
            <p className="text-foreground text-xs leading-relaxed">
              {levelBody}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

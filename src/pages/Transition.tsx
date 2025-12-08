import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";

/**
 * Gentle S-Curve Growth Chart
 * - No marker dots
 * - Moving dot with animation
 * - Enlarged Goal marker + "Goal" label
 * - Area under curve
 * - Milestone labels only (0 / 15 / 30 / 45 / 60)
 * - Footnote
 * - Fully self-contained
 */
const GrowthCurve = ({ width = 520, height = 200 }: { width?: number; height?: number }) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pathLength = path.getTotalLength();

    /** Stroke draw animation */
    if (!reduce) {
      path.style.strokeDasharray = String(pathLength);
      path.style.strokeDashoffset = String(pathLength);

      const drawDuration = 900;
      const drawStart = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const animatePath = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - drawStart) / drawDuration));
        path.style.strokeDashoffset = String(pathLength * (1 - ease(t)));
        if (t < 1) requestAnimationFrame(animatePath);
      };
      requestAnimationFrame(animatePath);
    } else {
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
    }

    /** Dot movement */
    if (!reduce) {
      const dotDuration = 1200;
      const dotStart = performance.now() + 200;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const animateDot = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - dotStart) / dotDuration));
        const eased = ease(t);
        const point = path.getPointAtLength(eased * pathLength);

        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));

        // glow near end
        const glow = Math.max(0, (eased - 0.8) / 0.2);
        dot.style.filter = `drop-shadow(0 6px ${10 * glow}px rgba(16,124,116,${0.16 * glow}))`;

        if (t < 1) requestAnimationFrame(animateDot);
      };
      requestAnimationFrame(animateDot);
    } else {
      const final = path.getPointAtLength(pathLength);
      dot.setAttribute("cx", String(final.x));
      dot.setAttribute("cy", String(final.y));
    }
  }, []);

  /** Gentle S-curve — smooth, upward, no dips */
  const pathD =
    "M20 130 C110 55, 230 65, 310 95 C360 115, 440 75, 500 55";

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 520 200"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="growthGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="hsl(12 76% 61%)" />
            <stop offset="50%" stopColor="hsl(174 62% 35%)" />
            <stop offset="100%" stopColor="hsl(158 64% 40%)" />
          </linearGradient>

          <linearGradient id="areaGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="hsl(12 76% 61% / 0.10)" />
            <stop offset="50%" stopColor="hsl(174 62% 35% / 0.08)" />
            <stop offset="100%" stopColor="hsl(158 64% 40% / 0.06)" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`${pathD} L 520 180 L 0 180 Z`}
          fill="url(#areaGradient)"
          opacity="0.9"
        />

        {/* Background faint path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth={6}
        />

        {/* Main animated path */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#growthGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
        />

        {/* Milestone labels */}
        <g
          fontSize="12"
          textAnchor="middle"
          fill="rgba(0,0,0,0.45)"
          fontFamily="DM Sans, sans-serif"
        >
          <text x="20" y="195">0</text>
          <text x="140" y="195">15</text>
          <text x="260" y="195">30</text>
          <text x="380" y="195">45</text>
          <text x="500" y="195">60</text>
        </g>

        {/* Moving dot */}
        <circle
          ref={dotRef}
          cx="20"
          cy="130"
          r="8"
          fill="white"
          stroke="hsl(174 62% 35%)"
          strokeWidth={2.5}
        />
        <circle cx="20" cy="130" r="4.5" fill="url(#growthGradient)" />

        {/* Goal marker */}
        <g transform="translate(500,55)">
          <circle
            r="12"
            fill="white"
            stroke="hsl(158 64% 40%)"
            strokeWidth="3"
            filter="drop-shadow(0 4px 12px rgba(16,124,116,0.22))"
          />
          {/* inner pulse ring */}
          <circle r="6" fill="hsl(158 64% 40%)" opacity="0.15">
            <animate
              attributeName="r"
              values="6;12;6"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0;0.3"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* star */}
          <text
            x="18"
            y="4"
            fontSize="12"
            fill="hsl(158 64% 40%)"
            fontFamily="DM Sans, sans-serif"
          >
            Goal
          </text>

          <path
            d="M0 -3 L1 -1 L3 -1 L1 1 L1.5 3 L0 2 L-1.5 3 L-1 1 L-3 -1 L-1 -1 Z"
            fill="hsl(158 64% 40%)"
            transform="scale(2)"
          />
        </g>
      </svg>

      <p className="mt-3 text-sm text-muted-foreground text-center">
        Projected trajectory • 60 days • goal in sight
      </p>

      <p className="mt-2 text-xs text-muted-foreground text-center opacity-70">
        The chart is a non-customized illustration and results may vary
      </p>
    </div>
  );
};

const Transition = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">
            MindProfile
          </span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8 fade-up">
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              A personalized path built around your strengths and key challenge.
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
              Your profile shows clear potential to elevate your personal
              performance and break past your usual limits within the next 60 days.
            </p>
          </div>

          <div className="mb-10 fade-up" style={{ animationDelay: "0.12s" }}>
            <GrowthCurve />
          </div>

          <div className="text-center fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/offer">
              <Button variant="hero" size="xl" className="min-w-[220px]">
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MindProfile. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Transition;

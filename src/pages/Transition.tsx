import { ArrowRight, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";

const GrowthCurve = () => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pathLength = path.getTotalLength();

    // Stroke animation
    if (!reduce) {
      path.style.strokeDasharray = String(pathLength);
      path.style.strokeDashoffset = String(pathLength);
      const duration = 950;
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        path.style.strokeDashoffset = String(pathLength * (1 - ease(t)));
        if (t < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else {
      path.style.strokeDashoffset = "0";
    }

    // Dot movement
    if (!reduce) {
      const duration = 1300;
      const delay = 180;
      const start = performance.now() + delay;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const moveDot = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = ease(t);
        const pt = path.getPointAtLength(eased * pathLength);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));

        const glow = Math.max(0, (eased - 0.75) / 0.25);
        dot.style.filter = `drop-shadow(0 6px ${12 * glow}px rgba(16,124,116,${
          0.15 * glow
        }))`;

        if (t < 1) requestAnimationFrame(moveDot);
      };
      requestAnimationFrame(moveDot);
    } else {
      const pt = path.getPointAtLength(pathLength);
      dot.setAttribute("cx", String(pt.x));
      dot.setAttribute("cy", String(pt.y));
    }
  }, []);

  const pathD = "M20 150 C120 65, 240 60, 310 100 C360 130, 440 75, 500 40";

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 520 220"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main stroke gradient */}
          <linearGradient id="growthStroke" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#FF4D4D" />       {/* Merah */}
            <stop offset="33%" stopColor="#FF8A2B" />      {/* Oranye */}
            <stop offset="66%" stopColor="#FFD93D" />      {/* Kuning */}
            <stop offset="100%" stopColor="#3BB273" />     {/* Hijau */}
          </linearGradient>

          {/* Area fill */}
          <linearGradient id="growthFill" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#FF4D4D20" />
            <stop offset="33%" stopColor="#FF8A2B18" />
            <stop offset="66%" stopColor="#FFD93D12" />
            <stop offset="100%" stopColor="#3BB27310" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path d={`${pathD} L 520 220 L 0 220 Z`} fill="url(#growthFill)" />

        {/* Background subtle line */}
        <path d={pathD} stroke="rgba(0,0,0,0.05)" strokeWidth={7} fill="none" />

        {/* Animated stroke */}
        <path
          ref={pathRef}
          d={pathD}
          stroke="url(#growthStroke)"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Day marks */}
        <g
          fontSize="12"
          textAnchor="middle"
          fill="rgba(0,0,0,0.48)"
          fontFamily="DM Sans, sans-serif"
        >
          <text x="20" y="210">0</text>
          <text x="140" y="210">15</text>
          <text x="260" y="210">30</text>
          <text x="380" y="210">45</text>
          <text x="500" y="210">60</text>
        </g>

        {/* Moving dot */}
        <circle
          ref={dotRef}
          cx="20"
          cy="150"
          r="9"
          fill="white"
          stroke="#3BB273"
          strokeWidth="2.5"
        />
        <circle cx="20" cy="150" r="5" fill="url(#growthStroke)" />

        {/* Goal marker */}
        <g transform="translate(500,40)">
          <circle
            r="14"
            fill="white"
            stroke="#3BB273"
            strokeWidth="3"
            filter="drop-shadow(0 6px 16px rgba(16,124,116,0.22))"
          />

          <circle r="7" fill="#3BB273" opacity="0.18">
            <animate attributeName="r" values="7;14;7" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="1.8s" repeatCount="indefinite" />
          </circle>

          <path
            d="M0 -2.6 L1 -1 L3 -1 L1 1 L1.5 3 L0 2 L-1.5 3 L-1 1 L-3 -1 L-1 -1 Z"
            fill="#3BB273"
            transform="scale(2.3)"
          />
        </g>

        <text
          x="95%"
          y="45"
          fontSize="14"
          fill="#2F8F68"
          fontFamily="DM Sans, sans-serif"
          textAnchor="end"
          style={{ fontWeight: 600 }}
        >
          Goal
        </text>
      </svg>

      <p className="mt-3 text-sm text-muted-foreground text-center">
        Projected trajectory • 60 days • goal in sight
      </p>

      <p className="mt-1 text-xs text-muted-foreground text-center opacity-70">
        The chart is a non-customized illustration and results may vary
      </p>
    </div>
  );
};

const Transition = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 select-none">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">
            MindProfile
          </span>
        </div>
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
              <Button
                variant="hero"
                size="lg"
                className="min-w-[200px] text-sm md:text-base py-3 md:py-4 flex items-center gap-2"
              >
                View My Personalized Plan
                <ArrowRight className="h-5 w-5" />
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

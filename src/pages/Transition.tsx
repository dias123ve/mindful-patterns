import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";

/**
 * JourneyPath - SVG animated gradient path
 *
 * - Draws path (stroke draw)
 * - Moves dot along path using JS (getPointAtLength)
 * - Shows goal star on completion
 *
 * Lightweight, no external libs, works well on Vercel/GitHub static hosting.
 */
const JourneyPath = ({ width = 520, height = 180 }: { width?: number; height?: number }) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const starRef = useRef<SVGElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const star = starRef.current;
    if (!path || !dot || !star) return;

    const pathLength = path.getTotalLength();
    // initial stroke setup
    path.style.strokeDasharray = String(pathLength);
    path.style.strokeDashoffset = String(pathLength);

    // animation timings (ms)
    const drawDuration = 900;
    const drawDelay = 0;
    const dotDuration = 1100;
    const dotDelay = 200;
    const starDelayAfterDot = 1400; // show star after dot arrives
    const start = performance.now();

    // easing function
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // Animate path drawing (strokeDashoffset)
    const animatePath = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start - drawDelay) / drawDuration));
      const eased = easeOutCubic(t);
      path.style.strokeDashoffset = String(Math.round(pathLength * (1 - eased)));
      if (t < 1) {
        requestAnimationFrame(animatePath);
      }
    };
    requestAnimationFrame(animatePath);

    // Animate dot along path
    const dotStartTime = start + dotDelay;
    const dotEndTime = dotStartTime + dotDuration;

    const animateDot = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - dotStartTime) / dotDuration));
      const eased = easeOutCubic(t);
      const point = path.getPointAtLength(eased * pathLength);
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      // subtle pulsing glow near goal
      const glow = Math.max(0, (eased - 0.8) / 0.2); // 0..1 when near end
      dot.style.filter = `drop-shadow(0 6px ${8 * glow}px rgba(16,124,116,${0.18 * glow}))`;
      if (now < dotEndTime) {
        requestAnimationFrame(animateDot);
      } else {
        // ensure final position
        const finalPoint = path.getPointAtLength(pathLength);
        dot.setAttribute("cx", String(finalPoint.x));
        dot.setAttribute("cy", String(finalPoint.y));
      }
    };
    requestAnimationFrame(animateDot);

    // Show star after dot completes
    const showStarTimeout = window.setTimeout(() => {
      star.style.transition = "opacity 420ms ease-out, transform 420ms cubic-bezier(.2,.9,.2,1)";
      star.style.opacity = "1";
      star.style.transform = "translateY(0) scale(1)";
    }, starDelayAfterDot);

    // cleanup
    return () => {
      window.clearTimeout(showStarTimeout);
    };
  }, []);

  // SVG path (smooth organic curve)
  // Feel free to tweak the path "d" for shape changes.
  const pathD = "M22 120 C120 40, 260 40, 360 80 C420 110, 480 60, 500 40";
  // The coordinates scale inside viewBox; width/height control the rendered size.

  return (
    <div className="w-full flex justify-center items-center">
      <svg
        viewBox="0 0 520 180"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        role="img"
      >
        <defs>
          <linearGradient id="journeyGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="hsl(12 76% 61%)" />    {/* coral - start */}
            <stop offset="52%" stopColor="hsl(174 62% 35%)" />  {/* teal - mid */}
            <stop offset="100%" stopColor="hsl(158 64% 40%)" /> {/* green - goal */}
          </linearGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="normal" />
          </filter>
        </defs>

        {/* Background subtle path (light stroke for context) */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth={6}
          strokeLinecap="round"
          transform="translate(0,0)"
        />

        {/* Animated gradient stroke path (top) */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#journeyGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "stroke-dashoffset 0.9s ease-out",
            // initial values will be set by JS
          }}
        />

        {/* Moving dot */}
        <circle
          ref={dotRef}
          cx="22"
          cy="120"
          r="7"
          fill="white"
          stroke="hsl(174 62% 35%)"
          strokeWidth={2.5}
          style={{
            transformOrigin: "center",
            // start slightly hidden and then visible via JS movement
            transition: "filter 160ms linear",
            filter: "drop-shadow(0 6px 0 rgba(0,0,0,0))",
          }}
        />

        {/* Dot inner fill with gradient to match path */}
        <circle
          cx="22"
          cy="120"
          r="4"
          fill="url(#journeyGradient)"
          style={{ pointerEvents: "none" }}
        />

        {/* Goal star (initially hidden) */}
        <g
          ref={starRef as any}
          transform="translate(500,36)"
          style={{
            opacity: 0,
            transform: "translateY(6px) scale(0.86)",
            transformOrigin: "center",
            filter: "drop-shadow(0 8px 20px rgba(16,124,116,0.12))",
          }}
        >
          {/* small star icon */}
          <path
            d="M0 -6 L1.9 -1.9 L6 -1.2 L3 2 L3.8 6.8 L0 4 L-3.8 6.8 L-3 2 L-6 -1.2 L-1.9 -1.9 Z"
            fill="hsl(158 64% 40%)"
            transform="scale(3.2)"
          />
        </g>

        {/* subtle goal ring */}
        <circle cx="500" cy="40" r="12" fill="none" stroke="rgba(16,124,116,0.08)" strokeWidth={2} />
      </svg>
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
          
          {/* MAIN TEXT */}
          <div className="text-center mb-8 fade-up">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 leading-relaxed">
              A personalized path built around your strengths and key challenge.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Your profile shows clear potential to elevate your personal performance 
              and break past your usual limits within the next 60 days.
            </p>
          </div>

          {/* SVG ILLUSTRATION (Gradient Journey Line) */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.12s" }}>
            <JourneyPath />
            <div className="mt-3 text-center text-sm text-muted-foreground">
              <span>Projected trajectory • 75 days • goal in sight</span>
            </div>
          </div>

          {/* CONTINUE BUTTON */}
          <div
            className="text-center fade-up"
            style={{ animationDelay: "0.30s" }}
          >
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
          <p>© {new Date().getFullYear()} MindProfile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Transition;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";

/**
 * Enhanced JourneyPath for Transition:
 * - area under curve (soft fill)
 * - 5 milestone markers (0,15,30,45,75 days)
 * - subtle baseline ticks / labels
 * - moving dot (JS) + gentle glow
 * - pulsing goal ring (SMIL inside SVG)
 * - respects prefers-reduced-motion
 */
const EnhancedJourneyPath = ({ width = 520, height = 180 }: { width?: number; height?: number }) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pathLength = path.getTotalLength();

    // Stroke draw
    if (!reduce) {
      path.style.strokeDasharray = String(pathLength);
      path.style.strokeDashoffset = String(pathLength);
      const drawDuration = 900;
      const drawStart = performance.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animatePath = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - drawStart) / drawDuration));
        const eased = easeOutCubic(t);
        path.style.strokeDashoffset = String(Math.round(pathLength * (1 - eased)));
        if (t < 1) requestAnimationFrame(animatePath);
      };
      requestAnimationFrame(animatePath);
    } else {
      // reduced motion -> show full stroke immediately
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
    }

    // Dot movement
    if (!reduce) {
      const dotDuration = 1100;
      const dotStart = performance.now() + 200;
      const dotEnd = dotStart + dotDuration;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animateDot = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - dotStart) / dotDuration));
        const eased = easeOutCubic(t);
        const pt = path.getPointAtLength(eased * pathLength);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));

        // glow near end (subtle)
        const glow = Math.max(0, (eased - 0.8) / 0.2);
        dot.style.filter = `drop-shadow(0 6px ${8 * glow}px rgba(16,124,116,${0.14 * glow}))`;

        if (now < dotEnd) requestAnimationFrame(animateDot);
        else {
          const final = path.getPointAtLength(pathLength);
          dot.setAttribute("cx", String(final.x));
          dot.setAttribute("cy", String(final.y));
        }
      };
      requestAnimationFrame(animateDot);
    } else {
      // reduced motion -> place dot at end
      const final = path.getPointAtLength(pathLength);
      dot.setAttribute("cx", String(final.x));
      dot.setAttribute("cy", String(final.y));
    }

    // cleanup: nothing to cancel besides rAF which stops naturally
  }, []);

  // Path definition (tune as needed)
  const pathD = "M22 120 C120 40, 260 40, 360 80 C420 110, 480 60, 500 40";

  // compute marker fractions & labels (0,15,30,45,75)
  // We'll compute positions inside render using SVG getPointAtLength via a small trick: render invisible path first.
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 520 180" width={width} height={height} xmlns="http://www.w3.org/2000/svg" aria-hidden role="img">
        <defs>
          <linearGradient id="journeyGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="hsl(12 76% 61%)" />
            <stop offset="52%" stopColor="hsl(174 62% 35%)" />
            <stop offset="100%" stopColor="hsl(158 64% 40%)" />
          </linearGradient>

          <linearGradient id="areaGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="hsl(12 76% 61% / 0.12)" />
            <stop offset="60%" stopColor="hsl(174 62% 35% / 0.08)" />
            <stop offset="100%" stopColor="hsl(158 64% 40% / 0.06)" />
          </linearGradient>

          <filter id="subtle" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="normal" />
          </filter>
        </defs>

        {/* baseline ticks (subtle) */}
        <g transform="translate(0, 148)" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1">
          {/* 5 ticks across same as markers */}
          <line x1="22" x2="22" y1="0" y2="6" />
          <line x1="140" x2="140" y1="0" y2="6" />
          <line x1="260" x2="260" y1="0" y2="6" />
          <line x1="380" x2="380" y1="0" y2="6" />
          <line x1="500" x2="500" y1="0" y2="6" />
        </g>

        {/* subtle area under curve */}
        <path
          d={`${pathD} L 520 160 L 0 160 Z`}
          fill="url(#areaGradient)"
          opacity="0.95"
        />

        {/* faint guide path for context */}
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={6} strokeLinecap="round" />

        {/* animated main path (gradient stroke) */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#journeyGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
        />

        {/* milestone markers - compute approx positions by fractional lengths (we approximate positions at these x coordinates,
            but to be precise we will position labels near approximate x values matching typical path shape) */}
        {/* If you want exact positions based on path length, we can compute via JS; for clarity we use fixed-ish x coords that match this path */}
        <g>
          {/* markers: small circles */}
          <circle cx="22" cy="120" r="4.5" fill="hsl(12 76% 61%)" stroke="white" strokeWidth="1" />
          <circle cx="140" cy="92" r="4.5" fill="hsl(20 80% 55%)" stroke="white" strokeWidth="1" />
          <circle cx="260" cy="72" r="4.5" fill="hsl(174 62% 35%)" stroke="white" strokeWidth="1" />
          <circle cx="380" cy="96" r="4.5" fill="hsl(86 40% 45%)" stroke="white" strokeWidth="1" />
          <circle cx="500" cy="40" r="4.5" fill="hsl(158 64% 40%)" stroke="white" strokeWidth="1" />
        </g>

        {/* milestone labels (days) */}
        <g fontSize="11" textAnchor="middle" fill="rgba(0,0,0,0.45)" fontFamily="DM Sans, sans-serif">
          <text x="22" y="162">0</text>
          <text x="140" y="162">15</text>
          <text x="260" y="162">30</text>
          <text x="380" y="162">45</text>
          <text x="500" y="162">75</text>
        </g>

        {/* moving main dot (JS-controlled) */}
        <circle
          ref={dotRef}
          cx="22"
          cy="120"
          r="8"
          fill="white"
          stroke="hsl(174 62% 35%)"
          strokeWidth={2.5}
          style={{ transition: "filter 140ms linear" }}
        />
        <circle cx="22" cy="120" r="4.5" fill="url(#journeyGradient)" />

        {/* goal pulsing ring using SVG SMIL animate (works in modern browsers) */}
        <g transform="translate(500,40)" aria-hidden>
          <circle cx="0" cy="0" r="12" fill="none" stroke="hsl(158 64% 40%)" strokeWidth="2" opacity="0.18" />
          <circle cx="0" cy="0" r="0" fill="none" stroke="hsl(158 64% 40%)" strokeWidth="2" opacity="0.22">
            <animate attributeName="r" values="6;18" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.36;0" dur="1.6s" repeatCount="indefinite" />
          </circle>

          {/* static inner ring */}
          <circle cx="0" cy="0" r="6.4" fill="white" stroke="hsl(158 64% 40%)" strokeWidth="2.2" />
          {/* star */}
          <path
            d="M0 -2.6 L0.9 -0.8 L2.9 -0.6 L1.4 0.7 L1.7 2.9 L0 1.6 L-1.7 2.9 L-1.4 0.7 L-2.9 -0.6 L-0.9 -0.8 Z"
            fill="hsl(158 64% 40%)"
            transform="scale(1.8)"
          />
        </g>
      </svg>

      <div className="mt-3 text-center text-sm text-muted-foreground">
        <span>Projected trajectory • 75 days • goal in sight</span>
      </div>
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

          {/* ENHANCED SVG ILLUSTRATION */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.12s" }}>
            <EnhancedJourneyPath />
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

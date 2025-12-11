import { ArrowRight } from "lucide-react";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

interface NowToGoalVisualProps {
  positiveComponents: ComponentData[];
  negativeComponent: ComponentData | null;
  componentScores: Record<string, number>;
}

const MAX_SCORE = 50;

const NowToGoalVisual = ({
  positiveComponents,
  negativeComponent,
  componentScores,
}: NowToGoalVisualProps) => {
  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  // FIX: jpeg extension
  const personNowSrc = `/images/${gender}_now.jpeg`;
  const personGoalSrc = `/images/${gender}_goal.jpeg`;

  const getStrongPos = (score: number) => Math.max((score / MAX_SCORE) * 85, 30);
  const getLowPos = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-soft border border-border fade-up max-w-[760px] mx-auto">

      {/* MOBILE = 2 columns | DESKTOP = 3 columns */}
      <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* LEFT — NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <img
            src={personNowSrc}
            className="w-[130px] sm:w-[180px] md:w-[200px] h-auto object-contain mx-auto mb-2"
          />

          <div className="space-y-6">
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1">

                  {/* LABEL MOBILE = VERTICAL */}
                  <div className="flex flex-col sm:flex-row sm:justify-between w-[85%] mx-auto text-center sm:text-left gap-0.5">
                    <span className="text-[13px] sm:text-[15px] font-semibold">
                      {comp.name}
                    </span>
                    <span className="text-[11px] sm:text-[13px] opacity-60">
                      (Normal)
                    </span>
                  </div>

                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[85%] mx-auto">
                    <div
                      className="absolute h-2 rounded-full"
                      style={{ width: `${pos}%`, backgroundColor: "#FFB74D" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* LOW */}
            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const pos = getLowPos(score);

              return (
                <div className="space-y-1">

                  <div className="flex flex-col sm:flex-row sm:justify-between w-[85%] mx-auto text-center sm:text-left gap-0.5">
                    <span className="text-[13px] sm:text-[15px] font-semibold">
                      {negativeComponent.name}
                    </span>
                    <span className="text-[11px] sm:text-[13px] opacity-60">
                      (Low)
                    </span>
                  </div>

                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[85%] mx-auto">
                    <div
                      className="absolute h-2 rounded-full"
                      style={{ width: `${pos}%`, backgroundColor: "#E57373" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#C62828", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* CENTER — ARROW (hidden on mobile, lowered on desktop) */}
        <div
          className="arrow-container hidden md:flex justify-center items-start"
          style={{ transform: "translateX(-20px)" }}
        >
          <svg
            className="arrow-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
            <polyline points="15 18 21 12 15 6"></polyline>
          </svg>

          <style>{`
            .arrow-container {
              padding-top: 20px; /* mobile (even though arrow hidden) */
              padding-bottom: 20px;
            }

            /* DESKTOP → lower arrow significantly */
            @media (min-width: 768px) {
              .arrow-container {
                padding-top: 120px;
              }
            }

            .arrow-icon {
              width: 70px;
              height: 120px;
              color: #d1d5db;
              animation: slideSmooth 4s ease-in-out infinite;
            }

            @keyframes slideSmooth {
              0% { transform: translateX(0); opacity: 0; }
              2% { opacity: 0.3; }
              10% { opacity: 1; }
              70% { transform: translateX(40px); opacity: 1; }
              72% { opacity: 0.5; }
              74% { opacity: 0; }
              100% { transform: translateX(0); opacity: 0; }
            }
          `}</style>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3">
            Future You
          </h3>

          <img
            src={personGoalSrc}
            className="w-[130px] sm:w-[180px] md:w-[200px] h-auto object-contain mx-auto mb-2"
          />

          <div className="space-y-6">
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">

                <div className="flex flex-col sm:flex-row sm:justify-between w-[85%] mx-auto text-center sm:text-left gap-0.5">
                  <span className="text-[13px] sm:text-[15px] font-semibold">{comp.name}</span>
                  <span className="text-[11px] sm:text-[13px] opacity-60">(Elevated)</span>
                </div>

                <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[85%] mx-auto">
                  <div
                    className="absolute h-2 rounded-full bg-emerald-500"
                    style={{ width: "85%" }}
                  />
                  <div
                    className="absolute -top-[4px] h-3 w-3 bg-emerald-600 rounded-full shadow"
                    style={{ left: "85%" }}
                  />
                </div>

              </div>
            ))}

            {negativeComponent && (
              <div className="space-y-1">

                <div className="flex flex-col sm:flex-row sm:justify-between w-[85%] mx-auto text-center sm:text-left gap-0.5">
                  <span className="text-[13px] sm:text-[15px] font-semibold">
                    {negativeComponent.name}
                  </span>
                  <span className="text-[11px] sm:text-[13px] opacity-60">(Steady)</span>
                </div>

                <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[85%] mx-auto">
                  <div
                    className="absolute h-2 rounded-full"
                    style={{ width: "70%", backgroundColor: "#FFD54F" }}
                  />
                  <div
                    className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                    style={{ backgroundColor: "#FBC02D", left: "65%" }}
                  />
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NowToGoalVisual;

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
  componentScores
}: NowToGoalVisualProps) => {

  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  const personNowSrc = `/images/${gender}_now.png`;
  const personGoalSrc = `/images/${gender}_goal.png`;

  const getStrongPos = (score: number) => Math.max((score / MAX_SCORE) * 85, 30);
  const getLowPos = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[760px] mx-auto">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* LEFT NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <img src={personNowSrc} className="w-[200px] h-auto object-contain mx-auto mb-2" />

          <div className="space-y-6">

            {/* STRONG components */}
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1">

                  <div className="flex justify-between w-[75%] mx-auto">
                    <span className="text-[15px] font-semibold">{comp.name}</span>
                    <span className="text-[13px] opacity-60">(Strong)</span>
                  </div>

                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[75%] mx-auto">
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

                  <div className="flex justify-between w-[75%] mx-auto">
                    <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                    <span className="text-[13px] opacity-60">(Low)</span>
                  </div>

                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[75%] mx-auto">
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

        {/* CENTER ARROW */}
  <div className="arrow-container">
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
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 40px;
      padding-bottom: 20px;
    }

    .arrow-icon {
      width: 90px;
      height: 90px;
      color: #d1d5db; /* gray-300 */
      animation: slideSmooth 4s ease-in-out infinite;
    }

    @keyframes slideSmooth {
      /* muncul pelan */
      0% {
        transform: translateX(0);
        opacity: 0;
      }
      2% {
        opacity: 0.4;
      }
      5% {
        opacity: 1;
        }

      /* gerak ke kanan */
      70% {
        transform: translateX(40px);
        opacity: 1;
      }

      /* mulai hilang pelan */
      71% {
        opacity: 0;
      
      }

      /* reset posisi tapi tetap invisible */
      100% {
        transform: translateX(0);
        opacity: 0;
      }
    }
  `}</style>
</div>



        {/* RIGHT — FUTURE YOU */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3">
            Future You
          </h3>

          <img src={personGoalSrc} className="w-[200px] h-auto object-contain mx-auto mb-2" />

          <div className="space-y-6">

            {/* Elevated */}
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">

                <div className="flex justify-between w-[75%] mx-auto">
                  <span className="text-[15px] font-semibold">{comp.name}</span>
                  <span className="text-[13px] opacity-60">(Elevated)</span>
                </div>

                {/* TRACK ABU */}
                <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[75%] mx-auto">

                  {/* BAR shorter than track */}
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

            {/* Steady */}
            {negativeComponent && (
              <div className="space-y-1">

                <div className="flex justify-between w-[75%] mx-auto">
                  <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                  <span className="text-[13px] opacity-60">(Steady)</span>
                </div>

                <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[75%] mx-auto">

                  <div
                    className="absolute h-2 rounded-full"
                    style={{ backgroundColor: "#FFD54F", width: "70%" }}
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

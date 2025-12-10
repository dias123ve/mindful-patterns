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
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[820px] mx-auto">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-start">

        {/* LEFT — NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <img src={personNowSrc} className="w-[220px] h-auto object-contain mx-auto mb-3" />

          <div className="space-y-5">

            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1">

                  <div className="flex justify-between px-1 w-[60%] mx-auto">
                    <span className="text-[15px] font-semibold">{comp.name}</span>
                    <span className="text-[13px] opacity-70">(Strong)</span>
                  </div>

                  {/* SCALE (visible) */}
                  <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[60%] mx-auto">

                    {/* INDICATOR (thin, visible) */}
                    <div
                      className="absolute h-2 rounded-full"
                      style={{
                        width: `${pos}%`,
                        backgroundColor: "#FFB74D"
                      }}
                    />

                    {/* DOT */}
                    <div
                      className="absolute -top-[4px] h-3 w-3 bg-[#F57C00] rounded-full shadow"
                      style={{ left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const pos = getLowPos(score);

              return (
                <div className="space-y-1">
                  <div className="flex justify-between px-1 w-[60%] mx-auto">
                    <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                    <span className="text-[13px] opacity-70">(Low)</span>
                  </div>

                  <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[60%] mx-auto">
                    <div
                      className="absolute h-2 rounded-full"
                      style={{
                        width: `${pos}%`,
                        backgroundColor: "#E57373"
                      }}
                    />

                    <div
                      className="absolute -top-[4px] h-3 w-3 bg-[#D32F2F] rounded-full shadow"
                      style={{ left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* MIDDLE ARROW */}
        <div className="flex justify-center items-center pt-10">
          <div className="text-gray-400 text-2xl select-none">➜</div>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3">
            Future You
          </h3>

          <img src={personGoalSrc} className="w-[220px] h-auto object-contain mx-auto mb-3" />

          <div className="space-y-5">

            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">

                <div className="flex justify-between px-1 w-[60%] mx-auto">
                  <span className="text-[15px] font-semibold">{comp.name}</span>
                  <span className="text-[13px] opacity-70">(Elevated)</span>
                </div>

                <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[60%] mx-auto">
                  <div
                    className="absolute h-2 bg-emerald-500 rounded-full"
                    style={{ width: "100%" }}
                  />

                  <div
                    className="absolute -top-[4px] h-3 w-3 bg-emerald-600 rounded-full shadow"
                    style={{ left: "92%" }}
                  />
                </div>
              </div>
            ))}

            {negativeComponent && (
              <div className="space-y-1">
                <div className="flex justify-between px-1 w-[60%] mx-auto">
                  <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                  <span className="text-[13px] opacity-70">(Steady)</span>
                </div>

                <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[60%] mx-auto">
                  <div
                    className="absolute h-2 rounded-full"
                    style={{
                      backgroundColor: "#FFD54F",
                      width: "100%"
                    }}
                  />

                  <div
                    className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                    style={{ backgroundColor: "#FBC02D", left: "82%" }}
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

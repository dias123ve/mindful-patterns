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

  const getStrongPos = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowPos = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[820px] mx-auto">

      <div className="grid md:grid-cols-2 gap-4 items-start">

        {/* LEFT — NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <div className="flex justify-center mb-3">
            <img src={personNowSrc} className="w-[220px] h-auto object-contain" />
          </div>

          <div className="space-y-5">

            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1">

                  {/* LABEL */}
                  <div className="flex justify-between px-1 w-[58%] mx-auto">
                    <span className="text-[15px] font-semibold text-black">{comp.name}</span>
                    <span className="text-[13px] text-black opacity-80">(Strong)</span>
                  </div>

                  {/* BAR */}
                  <div className="relative h-2 rounded-full bg-[#E5E7EB] w-[58%] mx-auto">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#FFB74D", width: "100%" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: `${pos}%` }}
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

                  <div className="flex justify-between px-1 w-[58%] mx-auto">
                    <span className="text-[15px] font-semibold text-black">
                      {negativeComponent.name}
                    </span>
                    <span className="text-[13px] text-black opacity-80">(Low)</span>
                  </div>

                  <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[58%] mx-auto">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#E57373", width: "100%" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#D32F2F", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3">
            Future You
          </h3>

          <div className="flex justify-center mb-3">
            <img src={personGoalSrc} className="w-[220px] h-auto object-contain" />
          </div>

          <div className="space-y-5">

            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">
                
                <div className="flex justify-between px-1 w-[58%] mx-auto">
                  <span className="text-[15px] font-semibold text-black">{comp.name}</span>
                  <span className="text-[13px] text-black opacity-80">(Elevated)</span>
                </div>

                <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[58%] mx-auto">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
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

                <div className="flex justify-between px-1 w-[58%] mx-auto">
                  <span className="text-[15px] font-semibold text-black">{negativeComponent.name}</span>
                  <span className="text-[13px] text-black opacity-80">(Steady)</span>
                </div>

                <div className="relative h-2 bg-[#E5E7EB] rounded-full w-[58%] mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#FFD54F", width: "100%" }}
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

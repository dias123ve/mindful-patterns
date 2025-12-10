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

  // posisi indikator dot
  const getStrongPos = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowPos = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[880px] mx-auto">

      <div className="grid md:grid-cols-2 gap-4 items-start">

        {/* LEFT — NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <div className="flex justify-center mb-4">
            <img src={personNowSrc} className="w-[240px] h-auto object-contain" />
          </div>

          <div className="space-y-7">

            {/* STRONG COMPONENTS */}
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1.5">

                  {/* LABEL */}
                  <div className="flex justify-between px-1 w-[55%] mx-auto">
                    <span className="font-semibold text-black text-[15px]">
                      {comp.name}
                    </span>
                    <span className="font-semibold text-black text-[15px]">
                      Strong
                    </span>
                  </div>

                  {/* BAR */}
                  <div className="relative h-2 rounded-full bg-slate-200 w-[55%] mx-auto">

                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#FFB74D", width: "100%" }}
                    />

                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* LOW COMPONENT */}
            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const pos = getLowPos(score);

              return (
                <div className="space-y-1.5">

                  <div className="flex justify-between px-1 w-[55%] mx-auto">
                    <span className="font-semibold text-black text-[15px]">
                      {negativeComponent.name}
                    </span>
                    <span className="font-semibold text-black text-[15px]">
                      Low
                    </span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full w-[55%] mx-auto">

                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#E57373", width: "100%" }}
                    />

                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
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

          <div className="flex justify-center mb-4">
            <img src={personGoalSrc} className="w-[240px] h-auto object-contain" />
          </div>

          <div className="space-y-7">

            {/* ELEVATED */}
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1.5">

                <div className="flex justify-between px-1 w-[55%] mx-auto">
                  <span className="font-semibold text-black text-[15px]">{comp.name}</span>
                  <span className="font-semibold text-black text-[15px]">Elevated</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full w-[55%] mx-auto">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                  <div
                    className="absolute -top-[4px] h-3.5 w-3.5 bg-emerald-600 rounded-full shadow"
                    style={{ left: "92%" }}
                  />
                </div>

              </div>
            ))}

            {/* STEADY */}
            {negativeComponent && (
              <div className="space-y-1.5">

                <div className="flex justify-between px-1 w-[55%] mx-auto">
                  <span className="font-semibold text-black text-[15px]">{negativeComponent.name}</span>
                  <span className="font-semibold text-black text-[15px]">Steady</span>
                </div>

                <div className="relative h-2 bg-yellow-100 rounded-full w-[55%] mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#FFD54F", width: "100%" }}
                  />
                  <div
                    className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
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

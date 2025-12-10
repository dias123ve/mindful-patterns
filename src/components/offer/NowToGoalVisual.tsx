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

  const getStrongWidth = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowWidth = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[900px] mx-auto">
      
      <div className="grid md:grid-cols-2 gap-6 items-start">

        {/* LEFT — NOW */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Now
          </h3>

          <div className="flex justify-center mb-4">
            <img
              src={personNowSrc}
              className="w-[220px] h-auto object-contain"
            />
          </div>

          <div className="space-y-7">

            {/* STRONG COMPONENTS */}
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const w = getStrongWidth(score);

              return (
                <div key={comp.id} className="space-y-2">
                  
                  {/* LABEL ABOVE BAR */}
                  <div className="flex justify-between px-1">
                    <span className="text-[15px] font-semibold text-black">{comp.name}</span>
                    <span className="text-[15px] font-semibold text-black">Strong</span>
                  </div>

                  {/* BAR */}
                  <div className="relative h-2 bg-slate-200 rounded-full w-[65%] mx-auto">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#FFB74D", width: `${w}%` }}
                    />
                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: `${w}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* LOW COMPONENT */}
            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const w = getLowWidth(score);

              return (
                <div className="space-y-2">
                  
                  <div className="flex justify-between px-1">
                    <span className="text-[15px] font-semibold text-black">
                      {negativeComponent.name}
                    </span>
                    <span className="text-[15px] font-semibold text-black">Low</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full w-[65%] mx-auto">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#E57373", width: `${w}%` }}
                    />
                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
                      style={{ backgroundColor: "#D32F2F", left: `${w}%` }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-4">
            Future You
          </h3>

          <div className="flex justify-center mb-4">
            <img
              src={personGoalSrc}
              className="w-[220px] h-auto object-contain"
            />
          </div>

          <div className="space-y-7">

            {/* ELEVATED */}
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-2">
                
                <div className="flex justify-between px-1">
                  <span className="text-[15px] font-semibold text-black">{comp.name}</span>
                  <span className="text-[15px] font-semibold text-black">Elevated</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full w-[65%] mx-auto">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
                  <div
                    className="absolute -top-[4px] h-3.5 w-3.5 bg-emerald-600 rounded-full shadow"
                    style={{ left: "90%" }}
                  />
                </div>
              </div>
            ))}

            {/* STEADY */}
            {negativeComponent && (
              <div className="space-y-2">
                
                <div className="flex justify-between px-1">
                  <span className="text-[15px] font-semibold text-black">{negativeComponent.name}</span>
                  <span className="text-[15px] font-semibold text-black">Steady</span>
                </div>

                <div className="relative h-2 bg-yellow-100 rounded-full w-[65%] mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#FFD54F", width: "82%" }}
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

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

  // Width calculation
  const getStrongWidth = (score: number) => Math.max((score / MAX_SCORE) * 90, 45);
  const getLowWidth = (score: number) => Math.max((score / MAX_SCORE) * 55, 22);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[880px] mx-auto">

      <div className="grid md:grid-cols-2 gap-4 items-start">

        {/* LEFT – NOW */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 self-start">
            Now
          </h3>

          {/* Image */}
          <img src={personNowSrc} className="w-[230px] mb-4" />

          <div className="w-full space-y-6">

            {/* STRONG COMPONENTS */}
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const w = getStrongWidth(score);

              return (
                <div key={comp.id} className="space-y-1">

                  {/* LABEL */}
                  <div className="flex justify-between text-gray-600 text-[14px] px-2">
                    <span>{comp.name}</span>
                    <span>Strong</span>
                  </div>

                  {/* BAR */}
                  <div className="relative h-2 rounded-full bg-gray-200 w-[75%] mx-auto">
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
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-600 text-[14px] px-2">
                    <span>{negativeComponent.name}</span>
                    <span>Low</span>
                  </div>

                  <div className="relative h-2 rounded-full bg-gray-200 w-[75%] mx-auto">
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

        {/* RIGHT – FUTURE YOU */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3 self-start">
            Future You
          </h3>

          <img src={personGoalSrc} className="w-[230px] mb-4" />

          <div className="w-full space-y-6">

            {/* ELEVATED */}
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">

                <div className="flex justify-between text-gray-600 text-[14px] px-2">
                  <span>{comp.name}</span>
                  <span>Elevated</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full w-[75%] mx-auto">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                  <div
                    className="absolute -top-[4px] h-3.5 w-3.5 bg-emerald-600 rounded-full shadow"
                    style={{ left: "92%" }}
                  />
                </div>
              </div>
            ))}

            {/* STEADY */}
            {negativeComponent && (
              <div className="space-y-1">
                <div className="flex justify-between text-gray-600 text-[14px] px-2">
                  <span>{negativeComponent.name}</span>
                  <span>Steady</span>
                </div>

                <div className="relative h-2 bg-yellow-100 rounded-full w-[75%] mx-auto">
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

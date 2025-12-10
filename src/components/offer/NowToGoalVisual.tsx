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

  const getModerateWidth = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowWidth = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">
      
      <div className="grid md:grid-cols-2 gap-12 items-start">

        {/* LEFT — NOW */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Now
          </h3>

          {/* BIG IMAGE */}
          <div className="flex justify-center mb-6">
            <img
              src={personNowSrc}
              alt="Now avatar"
              className="w-[260px] h-auto object-contain"
            />
          </div>

          <div className="space-y-5">

            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const width = getModerateWidth(score);

              return (
                <div key={comp.id} className="max-w-[260px]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-muted-foreground">Moderate</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full overflow-visible max-w-[240px]">
                    <div
                      className="h-full bg-slate-400/50 rounded-full"
                      style={{ width: width + "%" }}
                    />
                    <div
                      className="absolute -top-[3px] h-3 w-3 bg-slate-500 rounded-full shadow"
                      style={{ left: width + "%" }}
                    />
                  </div>
                </div>
              );
            })}

            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const width = getLowWidth(score);

              return (
                <div className="max-w-[260px]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{negativeComponent.name}</span>
                    <span className="text-muted-foreground">Low</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full overflow-visible max-w-[240px]">
                    <div
                      className="h-full bg-amber-400/70 rounded-full"
                      style={{ width: width + "%" }}
                    />
                    <div
                      className="absolute -top-[3px] h-3 w-3 bg-amber-600 rounded-full shadow"
                      style={{ left: width + "%" }}
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

          {/* BIG IMAGE */}
          <div className="flex justify-center mb-6">
            <img
              src={personGoalSrc}
              alt="Goal avatar"
              className="w-[260px] h-auto object-contain"
            />
          </div>

          <div className="space-y-5">

            {positiveComponents.map((comp) => (
              <div key={comp.id} className="max-w-[260px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{comp.name}</span>
                  <span className="text-success">Higher</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible max-w-[260px]">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "90%" }}
                  />
                  <div
                    className="absolute -top-[3px] h-3 w-3 bg-emerald-600 rounded-full shadow"
                    style={{ left: "90%" }}
                  />
                </div>
              </div>
            ))}

            {negativeComponent && (
              <div className="max-w-[260px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{negativeComponent.name}</span>
                  <span className="text-success">Stronger</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible max-w-[260px]">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "82%" }}
                  />
                  <div
                    className="absolute -top-[3px] h-3 w-3 bg-emerald-600 rounded-full shadow"
                    style={{ left: "82%" }}
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

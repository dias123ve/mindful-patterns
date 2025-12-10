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

  // width kalkulasi
  const getStrongWidth = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowWidth = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[1100px] mx-auto">
      
      <div className="grid md:grid-cols-2 gap-6 items-start">

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
              const width = getStrongWidth(score);

              return (
                <div key={comp.id}>
                  <div className="flex justify-between text-sm mb-1 px-2">
                    <span className="font-medium text-black">{comp.name}</span>
                    <span className="font-medium text-black">Strong</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full w-[70%] mx-auto overflow-visible">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#FFB74D", width: width + "%" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: width + "%" }}
                    />
                  </div>
                </div>
              );
            })}

            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const width = getLowWidth(score);

              return (
                <div>
                  <div className="flex justify-between text-sm mb-1 px-2">
                    <span className="font-medium text-black">{negativeComponent.name}</span>
                    <span className="font-medium text-black">Low</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full w-[70%] mx-auto overflow-visible">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#E57373", width: width + "%" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3.5 w-3.5 rounded-full shadow"
                      style={{ backgroundColor: "#D32F2F", left: width + "%" }}
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

          {/* IMAGE */}
          <div className="flex justify-center mb-6">
            <img
              src={personGoalSrc}
              alt="Goal avatar"
              className="w-[260px] h-auto object-contain"
            />
          </div>

          <div className="space-y-5">

            {/* Elevated (was Higher) */}
            {positiveComponents.map((comp) => (
              <div key={comp.id}>
                <div className="flex justify-between text-sm mb-1 px-2">
                  <span className="font-medium text-black">{comp.name}</span>
                  <span className="font-medium text-black">Elevated</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full w-[70%] mx-auto overflow-visible">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: "90%" }}
                  />
                  <div
                    className="absolute -top-[4px] h-3.5 w-3.5 bg-emerald-600 rounded-full shadow"
                    style={{ left: "90%" }}
                  />
                </div>
              </div>
            ))}

            {/* Steady (was Stronger) */}
            {negativeComponent && (
              <div>
                <div className="flex justify-between text-sm mb-1 px-2">
                  <span className="font-medium text-black">{negativeComponent.name}</span>
                  <span className="font-medium text-black">Steady</span>
                </div>

                <div className="relative h-2 bg-yellow-100 rounded-full w-[70%] mx-auto overflow-visible">
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

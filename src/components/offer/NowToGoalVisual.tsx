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

// Label & color constants
const COLOR_STRONG = "#FFB74D";
const COLOR_LOW = "#E57373";
const COLOR_LOW_DOT = "#D32F2F";
const COLOR_STEADY = "#FFD54F"; // future negative label color

const NowToGoalVisual = ({
  positiveComponents,
  negativeComponent,
  componentScores
}: NowToGoalVisualProps) => {

  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  const personNowSrc = `/images/${gender}_now.png`;
  const personGoalSrc = `/images/${gender}_goal.png`;

  // width formulas
  const getStrongWidth = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowWidth = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">
      
      <div className="grid md:grid-cols-2 gap-6 items-start">

        {/* LEFT — NOW */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 self-start">
            Now
          </h3>

          {/* BIG IMAGE */}
          <img
            src={personNowSrc}
            alt="Now avatar"
            className="w-[300px] h-auto object-contain mb-6"
          />

          <div className="space-y-5 w-full max-w-md mx-auto">

            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const width = getStrongWidth(score);

              return (
                <div key={comp.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{comp.name}</span>
                    <span className="font-semibold" style={{ color: COLOR_STRONG }}>Strong</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full overflow-visible">
                    <div
                      className="h-full rounded-full"
                      style={{ width: width + "%", backgroundColor: "#B0BEC5" }}
                    />
                    <div
                      className="absolute -top-[3px] h-3 w-3 rounded-full shadow"
                      style={{
                        left: width + "%",
                        backgroundColor: "#78909C"
                      }}
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
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{negativeComponent.name}</span>
                    <span className="font-semibold" style={{ color: COLOR_LOW }}>Low</span>
                  </div>

                  <div className="relative h-2 bg-slate-200 rounded-full overflow-visible">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: width + "%",
                        backgroundColor: COLOR_LOW
                      }}
                    />
                    <div
                      className="absolute -top-[3px] h-3 w-3 rounded-full shadow"
                      style={{
                        left: width + "%",
                        backgroundColor: COLOR_LOW_DOT
                      }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-4 self-start">
            Future You
          </h3>

          <img
            src={personGoalSrc}
            alt="Goal avatar"
            className="w-[300px] h-auto object-contain mb-6"
          />

          <div className="space-y-5 w-full max-w-md mx-auto">

            {positiveComponents.map((comp) => (
              <div key={comp.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{comp.name}</span>
                  <span className="font-semibold" style={{ color: COLOR_STRONG }}>Elevated</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible">
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
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{negativeComponent.name}</span>
                  <span className="font-semibold" style={{ color: COLOR_STEADY }}>Steady</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible">
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
